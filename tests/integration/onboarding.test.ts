import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../../services/potluck-api/src/app.ts";

test("Circle arrangements require resource permission but organization does not require banking", async () => {
  const confirmed = new Set<string>();
  let unavailable = false;
  const app = await createApp({
    mode: "local",
    database: ":memory:",
    bankOnboarding: {
      readConfirmation: async (actorId) => {
        if (unavailable) throw new Error("private provider error");
        return confirmed.has(actorId)
          ? {
              actorId,
              providerReference: "test-provider-proof",
              confirmedAt: "2026-01-01T00:00:00Z",
            }
          : null;
      },
    },
  });
  try {
    const make = async (name: string) =>
      (
        await app.inject({
          method: "POST",
          url: "/v1/local/accounts",
          payload: {
            name,
            email: name + "@projection.test",
            password: "local-test-long-password",
          },
        })
      ).json();
    const host = await make("Host"),
      member = await make("Member"),
      stranger = await make("Stranger");
    let sequence = 0;
    const call = (token: string, path: string, payload?: object) =>
      app.inject({
        method: payload ? "POST" : "GET",
        url: "/v1" + path,
        payload,
        headers: {
          authorization: "Bearer " + token,
          "idempotency-key": "projection-" + ++sequence,
        },
      });
    confirmed.add(host.user.id);
    const circle = (
      await call(host.token, "/circles", { name: "Connected" })
    ).json();
    const invite = (
      await call(host.token, "/circles/" + circle.id + "/invitations", {
        email: member.user.email,
      })
    ).json();
    assert.equal(
      (
        await call(member.token, "/invitations/" + invite.id + "/accept", {
          expectedVersion: 1,
        })
      ).statusCode,
      200,
    );
    const card = (
      await call(host.token, "/cards", {
        name: "Private card",
        circleId: circle.id,
      })
    ).json();
    const billResponse = await call(host.token, "/bills", {
      name: "Internet",
      circleId: circle.id,
      cardId: card.id,
      amountMinor: 8400,
      firstDueDate: "2026-11-01",
      participants: [host.user.id, member.user.id],
    });
    assert.equal(billResponse.statusCode, 201, billResponse.body);
    const bill = billResponse.json();
    const social = await call(member.token, "/circles/" + circle.id);
    assert.equal(social.statusCode, 200);
    assert.equal(social.json().people.length, 2);
    assert.deepEqual(social.json().bills, []);
    assert.deepEqual(social.json().cards, []);
    assert.equal(
      (await call(member.token, "/circle-arrangements/" + circle.id))
        .statusCode,
      200,
    );
    assert.equal(
      (await app.inject("/v1/circle-arrangements/" + circle.id)).statusCode,
      401,
    );
    const hostDetails = (
      await call(host.token, "/circle-arrangements/" + circle.id)
    ).json();
    assert.equal(hostDetails.cards[0].id, card.id);
    assert.equal(hostDetails.bills[0].id, bill.id);
    confirmed.add(member.user.id);
    const memberDetails = (
      await call(member.token, "/circle-arrangements/" + circle.id)
    ).json();
    assert.equal(memberDetails.bills[0].id, bill.id);
    assert.deepEqual(memberDetails.cards, []);
    confirmed.add(stranger.user.id);
    assert.equal(
      (await call(stranger.token, "/circle-arrangements/" + circle.id))
        .statusCode,
      404,
    );
    unavailable = true;
    assert.equal(
      (await call(host.token, "/circles/" + circle.id)).statusCode,
      200,
    );
    assert.equal(
      (await call(host.token, "/circle-arrangements/" + circle.id)).statusCode,
      200,
    );
  } finally {
    await app.close();
  }
});

test("only actor-bound provider confirmation permits activation checks; forged proof fails closed", async () => {
  let evidence: unknown = null;
  let failure = false;
  const app = await createApp({
    mode: "local",
    database: ":memory:",
    bankOnboarding: {
      readConfirmation: async () => {
        if (failure) throw new Error("private provider error");
        return evidence;
      },
    },
  });
  try {
    const account = (
      await app.inject({
        method: "POST",
        url: "/v1/local/accounts",
        payload: {
          name: "Confirmed",
          email: "confirmed@entry.test",
          password: "long-local-test-password",
        },
      })
    ).json();
    const headers = {
      authorization: "Bearer " + account.token,
      "idempotency-key": "bank-proof-test",
    };
    const card = (
      await app.inject({
        method: "POST",
        url: "/v1/cards",
        headers,
        payload: { name: "Unissued setup" },
      })
    ).json();
    const activate = () =>
      app.inject({
        method: "POST",
        url: "/v1/cards/" + card.id + "/activate",
        headers: { ...headers, "idempotency-key": "bank-proof-activate" },
        payload: {},
      });
    assert.equal((await activate()).statusCode, 403);
    const proof = {
      actorId: account.user.id,
      providerReference: "test-only-provider-reference",
      confirmedAt: "2026-01-01T00:00:00Z",
    };
    for (const invalid of [
      { ...proof, actorId: "11111111-1111-4111-8111-111111111111" },
      { ...proof, providerReference: "" },
      { ...proof, confirmedAt: "2099-01-01T00:00:00Z" },
      { access: "ready" },
    ]) {
      evidence = invalid;
      assert.equal(
        (await app.inject({ url: "/v1/onboarding", headers })).statusCode,
        503,
      );
      assert.equal((await activate()).statusCode, 503);
    }
    evidence = proof;
    assert.deepEqual(
      (await app.inject({ url: "/v1/onboarding", headers })).json(),
      { access: "ready", bankConnection: "confirmed" },
    );
    assert.equal(
      (await app.inject({ url: "/v1/cards", headers })).statusCode,
      200,
    );
    assert.equal((await app.inject("/v1/cards")).statusCode, 401);
    const unavailable = await activate();
    assert.equal(unavailable.statusCode, 409);
    assert.equal(unavailable.json().error.code, "PROGRAM_UNAVAILABLE");
    assert.equal(
      (await app.inject("/v1/capabilities")).json().financial.funding,
      false,
    );
    failure = true;
    const failed = await app.inject({ url: "/v1/onboarding", headers });
    assert.equal(failed.statusCode, 503);
    assert.equal(failed.body.includes("private provider error"), false);
    failure = false;
    assert.equal(
      (await app.inject({ url: "/v1/onboarding", headers })).statusCode,
      200,
    );
  } finally {
    await app.close();
  }
});

test("sign-in opens planning areas, with bank activation and resource permissions enforced separately", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    for (const url of [
      "/v1/brands",
      "/v1/listings",
      "/v1/circles",
      "/v1/cards",
      "/v1/bills",
    ])
      assert.equal((await app.inject(url)).statusCode, 401, url);
    const account = (
      await app.inject({
        method: "POST",
        url: "/v1/local/accounts",
        payload: {
          name: "First entry",
          email: "entry@example.test",
          password: "long-local-test-password",
        },
      })
    ).json();
    const headers = { authorization: "Bearer " + account.token };
    const status = await app.inject({ url: "/v1/onboarding", headers });
    assert.equal(status.statusCode, 200);
    assert.deepEqual(status.json(), {
      access: "bank_required",
      bankConnection: "unavailable",
    });
    for (const url of [
      "/v1/brands",
      "/v1/listings",
      "/v1/circles",
      "/v1/invitations",
      "/v1/conversations",
      "/v1/notifications",
      "/v1/saved",
      "/v1/my-listings",
      "/v1/circle-transfers",
      "/v1/cards",
      "/v1/bills",
      "/v1/bill-summary?scope=all&month=2026-11",
    ]) {
      assert.equal((await app.inject({ url, headers })).statusCode, 200, url);
    }
    for (const url of [
      "/v1/cards/11111111-1111-4111-8111-111111111111",
      "/v1/agreements/11111111-1111-4111-8111-111111111111",
    ]) {
      const result = await app.inject({ url, headers });
      assert.equal(result.statusCode, 404, url);
      assert.equal(result.json().error.code, "NOT_FOUND");
    }
    const spoof = await app.inject({
      method: "POST",
      url: "/v1/onboarding",
      headers,
      payload: { access: "ready", bankConnection: "confirmed" },
    });
    assert.notEqual(spoof.statusCode, 200);
    const mutation = await app.inject({
      method: "POST",
      url: "/v1/cards",
      headers: { ...headers, "idempotency-key": "entry-card-test" },
      payload: { name: "Unissued setup" },
    });
    assert.equal(mutation.statusCode, 201);
    assert.equal(mutation.json().status, "setup_required");
    for (const url of [
      "/v1/cards/11111111-1111-4111-8111-111111111111/activate",
    ]) {
      const denied = await app.inject({
        method: "POST",
        url,
        headers: { ...headers, "idempotency-key": "still-financial" },
        payload: {},
      });
      assert.equal(denied.statusCode, 403, url);
      assert.equal(denied.json().error.code, "BANK_CONNECTION_REQUIRED");
    }
    const circle = await app.inject({
      method: "POST",
      url: "/v1/circles",
      headers: { ...headers, "idempotency-key": "entry-circle-test" },
      payload: { name: "No bank needed" },
    });
    assert.equal(circle.statusCode, 201, circle.body);
    assert.equal(
      (await app.inject({ url: "/v1/circles/" + circle.json().id, headers }))
        .statusCode,
      200,
    );
    assert.equal(
      (await app.inject({ url: "/v1/me", headers })).statusCode,
      200,
    );
    assert.equal(
      (await app.inject({ method: "POST", url: "/v1/sign-out", headers }))
        .statusCode,
      200,
    );
    assert.equal(
      (await app.inject({ url: "/v1/onboarding", headers })).statusCode,
      401,
    );
  } finally {
    await app.close();
  }
});

test("a failing bank provider cannot block planning but activation still fails closed", async () => {
  let bankReads = 0;
  const app = await createApp({
    mode: "local",
    database: ":memory:",
    bankOnboarding: {
      readConfirmation: async () => {
        bankReads++;
        throw new Error("private provider error");
      },
    },
  });
  try {
    const account = (
      await app.inject({
        method: "POST",
        url: "/v1/local/accounts",
        payload: {
          name: "Social",
          email: "social@entry.test",
          password: "long-local-test-password",
        },
      })
    ).json();
    const headers = { authorization: "Bearer " + account.token };
    for (const url of [
      "/v1/circles",
      "/v1/listings",
      "/v1/brands",
      "/v1/notifications",
      "/v1/conversations",
      "/v1/cards",
      "/v1/bills",
    ]) {
      assert.equal((await app.inject({ url, headers })).statusCode, 200, url);
    }
    assert.equal(
      bankReads,
      0,
      "Social routes must not wait for the bank provider",
    );
    const denied = await app.inject({
      method: "POST",
      url: "/v1/cards/11111111-1111-4111-8111-111111111111/activate",
      headers: { ...headers, "idempotency-key": "outage-activation" },
      payload: {},
    });
    assert.equal(denied.statusCode, 503);
    assert.equal(denied.body.includes("private provider error"), false);
  } finally {
    await app.close();
  }
});
