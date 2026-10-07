import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../../services/potluck-api/src/app.ts";
test("profile edits affect only the actor and never mutate identity or credentials", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    const account = (
      await app.inject({
        method: "POST",
        url: "/v1/local/accounts",
        payload: {
          name: "Before",
          email: "profile@local.test",
          password: "test-password-long",
        },
      })
    ).json();
    const headers = {
      authorization: "Bearer " + account.token,
      "idempotency-key": "profile-update-one",
    };
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/v1/settings/profile",
          payload: { name: "Other" },
        })
      ).statusCode,
      401,
    );
    const update = () =>
      app.inject({
        method: "POST",
        url: "/v1/settings/profile",
        headers,
        payload: { name: "After" },
      });
    assert.equal((await update()).statusCode, 200);
    assert.equal((await update()).json().user.name, "After");
    const me = (await app.inject({ url: "/v1/me", headers })).json().user;
    assert.equal(me.name, "After");
    assert.equal(me.email, account.user.email);
    assert.equal(me.id, account.user.id);
    for (const body of [
      { name: "" },
      { name: "Forged", id: "other-user" },
      { name: "Forged", email: "other@local.test" },
    ])
      assert.equal(
        (
          await app.inject({
            method: "POST",
            url: "/v1/settings/profile",
            headers: {
              ...headers,
              "idempotency-key": "invalid-" + JSON.stringify(body),
            },
            payload: body,
          })
        ).statusCode,
        400,
      );
  } finally {
    await app.close();
  }
});
