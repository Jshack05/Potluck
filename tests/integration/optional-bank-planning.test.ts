import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../../services/potluck-api/src/app.ts";

test("unbanked users organize their own Cards and manual Bills without funding consent", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    const register = async (name: string) =>
      (
        await app.inject({
          method: "POST",
          url: "/v1/local/accounts",
          payload: {
            name,
            email: name + "@optional-bank.test",
            password: "local-test-password-123",
          },
        })
      ).json();
    const host = await register("host"),
      stranger = await register("stranger");
    const headers = {
      authorization: "Bearer " + host.token,
      "idempotency-key": "manual-bill-key",
    };
    const payload = {
      name: "Internet",
      amountMinor: 8400,
      firstDueDate: "2026-11-01",
      participants: [host.user.id],
      planningOnly: true,
      icon: "internet",
      color: "teal",
    };
    const response = await app.inject({
      method: "POST",
      url: "/v1/bills",
      headers,
      payload,
    });
    assert.equal(response.statusCode, 201, response.body);
    const bill = response.json();
    assert.equal(bill.status, "draft");
    assert.equal(bill.circleId, null);
    assert.equal(bill.cardId, null);
    assert.equal(bill.icon, "internet");
    assert.deepEqual(bill.agreements, []);
    assert.equal(
      (
        await app.inject({ method: "POST", url: "/v1/bills", headers, payload })
      ).json().id,
      bill.id,
    );
    assert.equal(
      (
        await app.inject({
          url: "/v1/bills/" + bill.id,
          headers: { authorization: "Bearer " + stranger.token },
        })
      ).statusCode,
      404,
    );
    assert.equal((await app.inject("/v1/bills/" + bill.id)).statusCode, 401);
    const card = await app.inject({
      method: "POST",
      url: "/v1/cards",
      headers: { ...headers, "idempotency-key": "optional-card-key" },
      payload: { name: "Household" },
    });
    assert.equal(card.statusCode, 201, card.body);
    assert.equal(card.json().status, "setup_required");
    const detail = (
      await app.inject({ url: "/v1/cards/" + card.json().id, headers })
    ).json();
    assert.equal(detail.availableMinor, null);
    assert.deepEqual(detail.spenders, []);
    const activation = await app.inject({
      method: "POST",
      url: "/v1/cards/" + card.json().id + "/activate",
      headers: { ...headers, "idempotency-key": "must-not-activate" },
      payload: {},
    });
    assert.equal(activation.statusCode, 403);
    assert.equal(activation.json().error.code, "BANK_CONNECTION_REQUIRED");
    const invalid = await app.inject({
      method: "POST",
      url: "/v1/bills",
      headers: { ...headers, "idempotency-key": "reject-other-draft" },
      payload: { ...payload, participants: [stranger.user.id] },
    });
    assert.equal(invalid.statusCode, 400);
    assert.equal(
      (await app.inject({ url: "/v1/bills", headers })).json().items.length,
      1,
    );
  } finally {
    await app.close();
  }
});

test("bank outages do not disable organization, but activation still fails closed", async () => {
  let bankReads = 0;
  const app = await createApp({
    mode: "local",
    database: ":memory:",
    bankOnboarding: {
      readConfirmation: async () => {
        bankReads++;
        throw new Error("private outage");
      },
    },
  });
  try {
    const account = (
      await app.inject({
        method: "POST",
        url: "/v1/local/accounts",
        payload: {
          name: "Host",
          email: "host@outage.test",
          password: "local-test-password-123",
        },
      })
    ).json();
    const headers = {
      authorization: "Bearer " + account.token,
      "idempotency-key": "outage-card-key",
    };
    for (const url of [
      "/v1/cards",
      "/v1/bills",
      "/v1/bill-summary?scope=all&month=2026-11",
      "/v1/circles",
    ])
      assert.equal((await app.inject({ url, headers })).statusCode, 200, url);
    const card = (
      await app.inject({
        method: "POST",
        url: "/v1/cards",
        headers,
        payload: { name: "Saved setup" },
      })
    ).json();
    assert.equal(bankReads, 0);
    const blocked = await app.inject({
      method: "POST",
      url: "/v1/cards/" + card.id + "/activate",
      headers,
      payload: {},
    });
    assert.equal(blocked.statusCode, 503);
    assert.equal(blocked.body.includes("private outage"), false);
    assert.equal(bankReads, 1);
  } finally {
    await app.close();
  }
});
