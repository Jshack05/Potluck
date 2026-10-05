import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../../services/potluck-api/src/app.ts";
test("malformed and oversized requests return safe client errors", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    const bad = await app.inject({
      method: "POST",
      url: "/v1/local/accounts",
      payload: "{",
      headers: { "content-type": "application/json" },
    });
    assert.equal(bad.statusCode, 400);
    assert.equal(bad.json().error.code, "INVALID_INPUT");
    const big = await app.inject({
      method: "POST",
      url: "/v1/local/accounts",
      payload: JSON.stringify({ name: "x".repeat(66000) }),
      headers: { "content-type": "application/json" },
    });
    assert.equal(big.statusCode, 413);
    assert.equal(big.json().error.code, "REQUEST_TOO_LARGE");
  } finally {
    await app.close();
  }
});
