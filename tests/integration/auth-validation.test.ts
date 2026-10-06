import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../../services/potluck-api/src/app.ts";

test("invalid account entries identify fields without echoing credentials or creating an account", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    for (const url of ["/v1/local/accounts", "/v1/local/session"]) {
      const response = await app.inject({
        method: "POST",
        url,
        payload: {
          email: "screenshot@gm",
          password: "secret",
          ...(url.endsWith("accounts") ? { name: " " } : {}),
        },
      });
      assert.equal(response.statusCode, 400);
      const error = response.json().error;
      assert.equal(error.code, "INVALID_INPUT");
      assert.match(error.fields?.email ?? "", /email/i);
      assert.match(error.fields?.password ?? "", /12/);
      if (url.endsWith("accounts"))
        assert.match(error.fields?.name ?? "", /name/i);
      assert.doesNotMatch(response.body, /screenshot@gm|secret|highlighted/);
      assert.match(error.message, /email/i);
    }
    const me = await app.inject({ method: "GET", url: "/v1/me" });
    assert.equal(me.statusCode, 401);
  } finally {
    await app.close();
  }
});

test("corrected registration and repeat sign-in open social access while financial access stays gated", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    const credentials = {
      email: "auth-test@example.test",
      password: "fixture-password-123",
    };
    const created = await app.inject({
      method: "POST",
      url: "/v1/local/accounts",
      payload: { ...credentials, name: "Auth Test" },
    });
    assert.equal(created.statusCode, 201, created.body);
    const userId = created.json().user.id;
    const headers = { authorization: "Bearer " + created.json().token };
    assert.equal(
      (await app.inject({ method: "GET", url: "/v1/circles", headers }))
        .statusCode,
      200,
    );
    assert.equal(
      (await app.inject({ method: "GET", url: "/v1/cards", headers })).json()
        .error.code,
      "BANK_CONNECTION_REQUIRED",
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/v1/sign-out",
          headers,
          payload: {},
        })
      ).statusCode,
      200,
    );
    assert.equal(
      (await app.inject({ method: "GET", url: "/v1/me", headers })).statusCode,
      401,
    );
    const wrong = await app.inject({
      method: "POST",
      url: "/v1/local/session",
      payload: { ...credentials, password: "incorrect-password" },
    });
    assert.equal(wrong.statusCode, 401);
    assert.equal(wrong.json().error.code, "SIGN_IN_FAILED");
    assert.equal(wrong.json().error.fields, undefined);
    const signedIn = await app.inject({
      method: "POST",
      url: "/v1/local/session",
      payload: credentials,
    });
    assert.equal(signedIn.statusCode, 200, signedIn.body);
    assert.equal(signedIn.json().user.id, userId);
    const duplicate = await app.inject({
      method: "POST",
      url: "/v1/local/accounts",
      payload: { ...credentials, name: "Duplicate" },
    });
    assert.equal(duplicate.statusCode, 409);
    assert.doesNotMatch(
      duplicate.body,
      /password_hash|INSERT|fixture-password/,
    );
  } finally {
    await app.close();
  }
});
