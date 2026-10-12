import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../../services/potluck-api/src/app.ts";
import { openDatabase } from "../../services/potluck-api/src/db.ts";
import {
  connectBetaBankAccounts,
  listBetaBankAccounts,
} from "../../services/potluck-api/src/application/beta-bank-accounts.ts";
import { createCard } from "../../services/potluck-api/src/application/core.ts";
import { uuid } from "../../services/potluck-api/src/lib.ts";

test("beta account simulation is denied outside local mode before any database access", async () => {
  const unused = {
    query: async () => {
      throw new Error("Database must not be reached");
    },
    exec: async () => {
      throw new Error("Database must not be reached");
    },
  };
  const user = uuid(),
    context = { body: {}, resourceId: "", requestId: uuid() };
  const denied = { code: "BETA_UNAVAILABLE", status: 404 };
  await assert.rejects(listBetaBankAccounts(unused, user, false), denied);
  await assert.rejects(
    connectBetaBankAccounts(unused, user, context, false),
    denied,
  );
  await assert.rejects(
    createCard(unused, user, {
      ...context,
      body: { name: "Rejected", betaAccountId: uuid() },
    }),
    denied,
  );
});

test("synthetic accounts and selection audit are transactional, unique and ownership-constrained", async () => {
  const db = await openDatabase(":memory:");
  try {
    const host = uuid(),
      other = uuid();
    for (const [id, name] of [
      [host, "Host"],
      [other, "Other"],
    ])
      await db.query(
        "INSERT INTO users(id,name,email,identity) VALUES($1,$2,$3,'local')",
        [id, name, name + "@beta.test"],
      );
    const context = { body: {}, resourceId: "", requestId: uuid() };
    const connect = () =>
      db.transaction((tx) => connectBetaBankAccounts(tx, host, context, true));
    const accounts = (await connect()).items;
    await connect();
    assert.equal(
      (
        await db.query(
          "SELECT id FROM audit_events WHERE action='beta.account_connected'",
        )
      ).rows.length,
      3,
    );
    const body = {
      name: "Navy",
      design: "navy_solid",
      betaAccountId: accounts[0].id,
    };
    await assert.rejects(
      db.transaction(async (tx) => {
        await createCard(tx, host, { ...context, body }, true);
        throw new Error("rollback");
      }),
      /rollback/,
    );
    assert.equal((await db.query("SELECT id FROM cards")).rows.length, 0);
    assert.equal(
      (
        await db.query(
          "SELECT id FROM audit_events WHERE action='card.beta_account_selected'",
        )
      ).rows.length,
      0,
    );
    const card = await db.transaction((tx) =>
      createCard(tx, host, { ...context, body }, true),
    );
    assert.equal(card.betaAccountId, accounts[0].id);
    const audit = (
      await db.query(
        "SELECT * FROM audit_events WHERE action='card.beta_account_selected'",
      )
    ).rows;
    assert.equal(audit.length, 1);
    assert.equal(audit[0].actor_id, host);
    assert.equal(audit[0].resource_id, card.id);
    assert.deepEqual(audit[0].metadata, {
      betaAccountId: accounts[0].id,
      simulated: true,
    });
    await assert.rejects(
      db.query(
        "INSERT INTO cards(id,host_id,name,design,beta_account_id) VALUES($1,$2,$3,$4,$5)",
        [uuid(), other, "Forbidden", "teal", accounts[0].id],
      ),
      { code: "23503" },
    );
    await assert.rejects(
      db.query("UPDATE beta_bank_accounts SET state='confirmed' WHERE id=$1", [
        accounts[0].id,
      ]),
      { code: "23514" },
    );
    await assert.rejects(
      db.query("UPDATE beta_bank_accounts SET last4='1234' WHERE id=$1", [
        accounts[0].id,
      ]),
      { code: "23514" },
    );
  } finally {
    await db.close();
  }
});

test("beta accounts are private, repeatable setup fixtures and never confirm real banking", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    const register = async (name: string) =>
      (
        await app.inject({
          method: "POST",
          url: "/v1/local/accounts",
          payload: {
            name,
            email: name + "@beta-bank.test",
            password: "local-beta-test-password",
          },
        })
      ).json();
    const host = await register("host"),
      stranger = await register("stranger");
    const headers = { authorization: "Bearer " + host.token };
    const other = { authorization: "Bearer " + stranger.token };
    assert.equal(
      (await app.inject({ url: "/v1/capabilities" })).json().betaBankLinking,
      true,
    );
    assert.equal(
      (await app.inject({ url: "/v1/beta/bank-accounts" })).statusCode,
      401,
    );
    assert.deepEqual(
      (await app.inject({ url: "/v1/beta/bank-accounts", headers })).json()
        .items,
      [],
    );
    const connect = {
      method: "POST" as const,
      url: "/v1/beta/bank-accounts/connect",
      headers: { ...headers, "idempotency-key": "beta-connect" },
      payload: {},
    };
    const response = await app.inject(connect);
    assert.equal(response.statusCode, 201, response.body);
    const accounts = response.json().items;
    assert.equal(accounts.length, 3);
    assert.ok(
      accounts.every((a: { state: string }) => a.state === "simulated"),
    );
    assert.deepEqual((await app.inject(connect)).json().items, accounts);
    assert.deepEqual(
      (
        await app.inject({
          ...connect,
          headers: { ...headers, "idempotency-key": "beta-reconnect" },
        })
      ).json().items,
      accounts,
    );
    assert.deepEqual(
      (
        await app.inject({ url: "/v1/beta/bank-accounts", headers: other })
      ).json().items,
      [],
    );
    const create = {
      method: "POST" as const,
      url: "/v1/cards",
      headers: { ...headers, "idempotency-key": "beta-card" },
      payload: {
        name: "Beta Card",
        design: "navy_solid",
        betaAccountId: accounts[1].id,
      },
    };
    const created = await app.inject(create);
    assert.equal(created.statusCode, 201, created.body);
    const card = created.json();
    assert.equal(card.betaAccountId, accounts[1].id);
    assert.equal(card.status, "setup_required");
    assert.equal((await app.inject(create)).json().id, card.id);
    const detail = (
      await app.inject({ url: "/v1/cards/" + card.id, headers })
    ).json();
    assert.equal(detail.betaAccountId, accounts[1].id);
    assert.equal(detail.availableMinor, null);
    assert.equal(
      (
        await app.inject({
          ...create,
          headers: { ...other, "idempotency-key": "stolen-bank" },
        })
      ).statusCode,
      404,
    );
    assert.equal(
      (
        await app.inject({
          ...create,
          headers: { ...headers, "idempotency-key": "missing-bank" },
          payload: {
            ...create.payload,
            betaAccountId: "00000000-0000-4000-8000-000000000000",
          },
        })
      ).statusCode,
      404,
    );
    assert.equal(
      (
        await app.inject({
          ...connect,
          headers: { ...headers, "idempotency-key": "raw-bank-data" },
          payload: { accountNumber: "rejected" },
        })
      ).statusCode,
      400,
    );
    assert.equal(
      (await app.inject({ url: "/v1/onboarding", headers })).json()
        .bankConnection,
      "unavailable",
    );
    assert.deepEqual(
      (await app.inject({ url: "/v1/capabilities" })).json().financial,
      { issuance: false, funding: false, spending: false },
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/v1/cards/" + card.id + "/activate",
          headers: { ...headers, "idempotency-key": "no-activation" },
          payload: {},
        })
      ).statusCode,
      403,
    );
  } finally {
    await app.close();
  }
});
