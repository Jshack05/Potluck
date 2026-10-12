import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../../services/potluck-api/src/app.ts";

test("all approved appearances persist without issuance, duplicate Cards or wider access", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    const register = async (name: string) => {
      const response = await app.inject({
        method: "POST",
        url: "/v1/local/accounts",
        payload: {
          name,
          email: `${name}@appearance.test`,
          password: "local-appearance-test-password",
        },
      });
      assert.equal(response.statusCode, 201, response.body);
      return response.json();
    };
    const host = await register("host"),
      stranger = await register("stranger");
    const headers = { authorization: "Bearer " + host.token };
    const designs = [
      "teal",
      "graphite",
      "aurora",
      "aurora_gradient",
      "sunset",
      "coral",
      "ocean",
      "berry",
      "brushed_silver",
      "frosted_glass",
      "champagne",
      "satin_teal",
      "ocean_artwork",
      "sunset_artwork",
      "botanical",
      "midnight",
      "terracotta",
      "alpine",
      "prism",
      "orbit",
      "lagoon",
      "cobalt_gradient",
      "tidal_gradient",
      "ember_gradient",
      "iris_gradient",
      "evergreen_twotone",
      "clay_twotone",
      "indigo_twotone",
      "slate_twotone",
    ];
    for (const design of designs) {
      const request = {
        method: "POST" as const,
        url: "/v1/cards",
        headers: { ...headers, "idempotency-key": "appearance-" + design },
        payload: { name: "Household", design },
      };
      const response = await app.inject(request);
      assert.equal(response.statusCode, 201, design + ": " + response.body);
      const card = response.json();
      assert.equal(card.design, design);
      assert.equal(card.status, "setup_required");
      assert.equal((await app.inject(request)).json().id, card.id);
      const detail = await app.inject({ url: "/v1/cards/" + card.id, headers });
      assert.equal(detail.statusCode, 200);
      assert.equal(detail.json().design, design);
      assert.equal(detail.json().availableMinor, null);
      assert.equal(detail.json().reservedMinor, null);
      assert.deepEqual(detail.json().spenders, []);
      assert.equal(
        (
          await app.inject({
            url: "/v1/cards/" + card.id,
            remoteAddress: "127.0.0.2",
            headers: { authorization: "Bearer " + stranger.token },
          })
        ).statusCode,
        404,
      );
      assert.equal(
        (
          await app.inject({
            url: "/v1/cards/" + card.id,
            remoteAddress: "127.0.0.3",
          })
        ).statusCode,
        401,
      );
    }
    assert.equal(
      (await app.inject({ url: "/v1/cards", headers })).json().items.length,
      29,
    );
    const invalid = await app.inject({
      method: "POST",
      url: "/v1/cards",
      headers: { ...headers, "idempotency-key": "invalid-appearance" },
      payload: { name: "Invalid", design: "unknown_art" },
    });
    assert.equal(invalid.statusCode, 400);
    const legacy = await app.inject({
      method: "POST",
      url: "/v1/cards",
      headers: { ...headers, "idempotency-key": "legacy-appearance" },
      payload: { name: "Legacy client" },
    });
    assert.equal(legacy.statusCode, 201, legacy.body);
    assert.equal(legacy.json().design, "teal");
  } finally {
    await app.close();
  }
});
