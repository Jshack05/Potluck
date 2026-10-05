import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./completed-onboarding.fixture.ts";
test("brand directory filters by category, service type and price without suggesting plan names", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    const a = (
      await app.inject({
        method: "POST",
        url: "/v1/local/accounts",
        payload: {
          name: "Host",
          email: "host@filters.test",
          password: "local-test-long-password",
        },
      })
    ).json();
    let seq = 0;
    const post = (path: string, body: object) =>
      app.inject({
        method: "POST",
        url: "/v1" + path,
        payload: body,
        headers: {
          authorization: "Bearer " + a.token,
          "idempotency-key": "filters-" + ++seq,
        },
      });
    for (const [brand, serviceKind, price] of [
      ["Netflix", "tv", 1000],
      ["Spotify", "music", 600],
    ] as const) {
      const l = await post("/listings", {
        title: brand + " Premium",
        brand,
        serviceKind,
        category: "subscriptions",
        description: "An arrangement for eligible people.",
        shareMinor: price,
        capacity: 4,
      });
      assert.equal(l.statusCode, 201, l.body);
      await post("/listings/" + l.json().id + "/publish", {
        expectedVersion: 1,
      });
    }
    assert.deepEqual(
      (
        await app.inject({
          url: "/v1/brands?category=subscriptions&serviceKind=music",
          headers: { authorization: "Bearer " + a.token },
        })
      )
        .json()
        .items.map((x: any) => x.name),
      ["Spotify"],
    );
    assert.equal(
      (
        await app.inject({
          url: "/v1/brands?category=plans",
          headers: { authorization: "Bearer " + a.token },
        })
      ).json().items.length,
      0,
    );
    assert.deepEqual(
      (
        await app.inject({
          url: "/v1/brands?maxMinor=700",
          headers: { authorization: "Bearer " + a.token },
        })
      )
        .json()
        .items.map((x: any) => x.name),
      ["Spotify"],
    );
  } finally {
    await app.close();
  }
});
