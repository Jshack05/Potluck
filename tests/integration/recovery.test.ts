import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "./completed-onboarding.fixture.ts";

test("accounts and arrangements survive a database restart, and sign-out revokes the session", async () => {
  const dir = await mkdtemp(join(tmpdir(), "potluck-test-"));
  let app = await createApp({ database: dir, mode: "local" });
  try {
    const account = (
      await app.inject({
        method: "POST",
        url: "/v1/local/accounts",
        payload: {
          name: "Host",
          email: "host@example.test",
          password: "long-development-password",
        },
      })
    ).json();
    const headers = {
      authorization: "Bearer " + account.token,
      "idempotency-key": "persistent-circle",
    };
    const created = await app.inject({
      method: "POST",
      url: "/v1/circles",
      headers,
      payload: { name: "Family" },
    });
    assert.equal(created.statusCode, 201, created.body);
    const circle = created.json();
    await app.close();
    app = await createApp({ database: dir, mode: "local" });
    const restored = await app.inject({ url: "/v1/circles", headers });
    assert.equal(restored.json().items[0].id, circle.id);
    assert.equal(
      (await app.inject({ method: "POST", url: "/v1/sign-out", headers }))
        .statusCode,
      200,
    );
    assert.equal(
      (await app.inject({ url: "/v1/circles", headers })).statusCode,
      401,
    );
    const signin = await app.inject({
      method: "POST",
      url: "/v1/local/session",
      payload: {
        email: "host@example.test",
        password: "long-development-password",
      },
    });
    assert.equal(signin.statusCode, 200);
  } finally {
    await app.close();
    await rm(dir, { recursive: true, force: true });
  }
});
