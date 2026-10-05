import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../../services/potluck-api/src/app.ts";

test("only actor-bound provider confirmation opens the app; failures and forged proof fail closed", async () => {
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
    const headers = { authorization: "Bearer " + account.token };
    assert.equal(
      (await app.inject({ url: "/v1/cards", headers })).statusCode,
      403,
    );
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
      assert.equal(
        (await app.inject({ url: "/v1/cards", headers })).statusCode,
        503,
      );
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

test("full Potluck blocks guest discovery and account-only access without inventing a bank connection", async () => {
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
      "/v1/cards",
      "/v1/bills",
    ]) {
      const result = await app.inject({ url, headers });
      assert.equal(result.statusCode, 403, url);
      assert.equal(result.json().error.code, "BANK_CONNECTION_REQUIRED");
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
      payload: { name: "Cannot bypass" },
    });
    assert.equal(mutation.statusCode, 403);
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
