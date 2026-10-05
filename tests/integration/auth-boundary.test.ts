import test from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { registerAuth } from "../../services/potluck-api/src/auth.ts";
import { openDatabase } from "../../services/potluck-api/src/db.ts";
import { AppError } from "../../services/potluck-api/src/lib.ts";
test("unconfigured hosted session revocation cannot report a successful sign-out", async (context) => {
  const db = await openDatabase(":memory:"),
    app = Fastify();
  context.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(
        JSON.stringify({
          id: "bc0c4a09-1aab-47ab-95cb-58f96f8cc132",
          email: "fixture@example.test",
          email_confirmed_at: "2026-10-04",
          user_metadata: { name: "Test" },
        }),
        { status: 200 },
      ),
  );
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError)
      reply.code(error.status).send({ code: error.code });
    else reply.code(500).send({ code: "UNEXPECTED" });
  });
  registerAuth(app, db, {
    mode: "production",
    supabaseUrl: "https://fixture.invalid",
    supabaseKey: "public-fixture-key",
  });
  try {
    const result = await app.inject({
      method: "POST",
      url: "/v1/sign-out",
      headers: { authorization: "Bearer fixture-only" },
    });
    assert.equal(result.statusCode, 501, result.body);
    assert.equal(result.json().code, "AUTH_CONFIGURATION_REQUIRED");
  } finally {
    await app.close();
    await db.close();
  }
});
