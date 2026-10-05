import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./completed-onboarding.fixture.ts";
test("a changed listing cannot silently accept an old request, and a stale detail cannot send a request", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    const make = async (name: string) =>
      (
        await app.inject({
          method: "POST",
          url: "/v1/local/accounts",
          payload: {
            name,
            email: name + "@example.test",
            password: "safely-long-local-password",
          },
        })
      ).json();
    const host = await make("Host"),
      person = await make("Person");
    let n = 0;
    const call = (u: any, path: string, body: object) =>
      app.inject({
        method: "POST",
        url: "/v1" + path,
        payload: body,
        headers: {
          authorization: "Bearer " + u.token,
          "idempotency-key": "stale-request-" + ++n,
        },
      });
    const input = {
      title: "Household music",
      brand: "Spotify",
      category: "subscriptions",
      description: "Sharing within the eligible household",
      shareMinor: 600,
      capacity: 4,
    };
    const listing = (await call(host, "/listings", input)).json();
    const published = (
      await call(host, "/listings/" + listing.id + "/publish", {
        expectedVersion: 1,
      })
    ).json();
    const request = await call(
      person,
      "/listings/" + listing.id + "/requests",
      {
        message: "I would like to discuss this.",
        rulesVersion: "2026-10-04",
        acceptedRules: true,
        listingVersion: published.version,
      },
    );
    assert.equal(request.statusCode, 201, request.body);
    await call(host, "/listings/" + listing.id + "/edit", {
      ...input,
      shareMinor: 1200,
      expectedVersion: published.version,
    });
    await call(host, "/listings/" + listing.id + "/publish", {
      expectedVersion: published.version + 1,
    });
    const accept = await call(
      host,
      "/requests/" + request.json().id + "/accept",
      { expectedVersion: 1 },
    );
    assert.equal(accept.statusCode, 409, accept.body);
    assert.equal(accept.json().error.code, "LISTING_CHANGED");
    const stale = await call(person, "/listings/" + listing.id + "/requests", {
      message: "Still considering.",
      rulesVersion: "2026-10-04",
      acceptedRules: true,
      listingVersion: published.version,
    });
    assert.equal(stale.statusCode, 409, stale.body);
    assert.equal(stale.json().error.code, "LISTING_CHANGED");
  } finally {
    await app.close();
  }
});
