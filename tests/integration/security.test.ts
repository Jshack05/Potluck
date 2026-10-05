import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../../services/potluck-api/src/app.ts";

test("private routes require sessions and local authentication is unavailable in production", async () => {
  const app = await createApp({ database: ":memory:", mode: "local" });
  try {
    assert.equal((await app.inject("/v1/circles")).statusCode, 401);
    assert.equal(
      (
        await app.inject({
          url: "/v1/bills",
          headers: { authorization: "Bearer forged" },
        })
      ).statusCode,
      401,
    );
  } finally {
    await app.close();
  }
  await assert.rejects(
    () => createApp({ database: ":memory:", mode: "production" }),
    /configuration/i,
  );
});

test("a duplicate mutation key cannot change the operation and invalid input rolls back", async () => {
  const app = await createApp({ database: ":memory:", mode: "local" });
  try {
    const signup = await app.inject({
      method: "POST",
      url: "/v1/local/accounts",
      payload: {
        name: "Host",
        email: "host@example.test",
        password: "long-development-password",
      },
    });
    assert.equal(signup.statusCode, 201, signup.body);
    const { token, user } = signup.json();
    const headers = {
      authorization: "Bearer " + token,
      "idempotency-key": "stable-request-key",
    };
    const first = await app.inject({
      method: "POST",
      url: "/v1/circles",
      headers,
      payload: { name: "Family" },
    });
    assert.equal(first.statusCode, 201);
    const changed = await app.inject({
      method: "POST",
      url: "/v1/circles",
      headers,
      payload: { name: "Other" },
    });
    assert.equal(changed.statusCode, 409);
    const invalid = await app.inject({
      method: "POST",
      url: "/v1/bills",
      headers: { ...headers, "idempotency-key": "invalid-bill" },
      payload: {
        name: "Bad",
        amountMinor: 1000,
        firstDueDate: "2026-02-30",
        participants: [user.id],
      },
    });
    assert.equal(invalid.statusCode, 400);
    assert.equal(
      (await app.inject({ url: "/v1/bills", headers })).json().items.length,
      0,
    );
    const missingKey = await app.inject({
      method: "POST",
      url: "/v1/cards",
      headers: { authorization: "Bearer " + token },
      payload: { name: "Card" },
    });
    assert.equal(missingKey.statusCode, 400);
    assert.equal(
      (await app.inject({ url: "/v1/cards", headers })).json().items.length,
      0,
    );
  } finally {
    await app.close();
  }
});
