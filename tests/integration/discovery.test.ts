import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../../services/potluck-api/src/app.ts";

test("listing acceptance opens a conversation, then a separately accepted Circle invitation", async () => {
  const app = await createApp({ database: ":memory:", mode: "local" });
  try {
    const make = async (name: string) =>
      (
        await app.inject({
          method: "POST",
          url: "/v1/local/accounts",
          payload: {
            name,
            email: name + "@example.test",
            password: "long-test-password-here",
          },
        })
      ).json();
    const a = await make("Maya"),
      b = await make("Jordan"),
      stranger = await make("Sam");
    let seq = 0;
    const call = (
      who: any,
      method: "GET" | "POST",
      url: string,
      payload?: unknown,
      key?: string,
    ) =>
      app.inject({
        method,
        url,
        payload: payload as object,
        headers: {
          authorization: "Bearer " + who.token,
          "idempotency-key": key ?? "request-" + ++seq,
        },
      });
    const listingResponse = await call(a, "POST", "/v1/listings", {
      title: "Netflix Premium",
      brand: "Netflix",
      category: "subscriptions",
      description:
        "A shared subscription arrangement. Discuss eligibility first.",
      shareMinor: 1000,
      totalMinor: 4000,
      capacity: 4,
    });
    assert.equal(listingResponse.statusCode, 201, listingResponse.body);
    const listing = listingResponse.json();
    assert.equal(
      (
        await call(a, "POST", "/v1/listings/" + listing.id + "/publish", {
          expectedVersion: 1,
        })
      ).statusCode,
      200,
    );
    const brands = (await call(b, "GET", "/v1/brands?q=Net")).json().items;
    assert.deepEqual(
      brands.map((x: any) => x.name),
      ["Netflix"],
    );
    const requested = await call(
      b,
      "POST",
      "/v1/listings/" + listing.id + "/requests",
      {
        message: "Is there a place?",
        acceptedRules: true,
        rulesVersion: "2026-10-04",
        listingVersion: 2,
      },
    );
    assert.equal(requested.statusCode, 201, requested.body);
    const request = requested.json();
    const accepted = await call(
      a,
      "POST",
      "/v1/requests/" + request.id + "/accept",
      { expectedVersion: 1 },
    );
    assert.equal(accepted.statusCode, 200, accepted.body);
    const conversation = accepted.json();
    assert.equal((await call(b, "GET", "/v1/circles")).json().items.length, 0);
    const message = await call(
      b,
      "POST",
      "/v1/conversations/" + conversation.id + "/messages",
      { text: "Let’s talk about the plan." },
      "same-message",
    );
    assert.equal(message.statusCode, 201);
    assert.equal(
      (
        await call(
          b,
          "POST",
          "/v1/conversations/" + conversation.id + "/messages",
          { text: "Let’s talk about the plan." },
          "same-message",
        )
      ).json().id,
      message.json().id,
    );
    assert.equal(
      (await call(a, "GET", "/v1/conversations/" + conversation.id)).json()
        .messages.length,
      2,
    );
    assert.equal(
      (await call(stranger, "GET", "/v1/conversations/" + conversation.id))
        .statusCode,
      404,
    );
    const circle = (
      await call(a, "POST", "/v1/circles", { name: "Movie Circle" })
    ).json();
    const invite = await call(
      a,
      "POST",
      "/v1/conversations/" + conversation.id + "/circle-invitation",
      { circleId: circle.id },
    );
    assert.equal(invite.statusCode, 201, invite.body);
    assert.equal((await call(b, "GET", "/v1/circles")).json().items.length, 0);
    await call(b, "POST", "/v1/invitations/" + invite.json().id + "/accept", {
      expectedVersion: 1,
    });
    assert.equal((await call(b, "GET", "/v1/circles")).json().items.length, 1);
    await call(b, "POST", "/v1/blocks", { userId: a.user.id });
    assert.equal(
      (
        await call(
          a,
          "POST",
          "/v1/conversations/" + conversation.id + "/messages",
          { text: "Another message" },
        )
      ).statusCode,
      403,
    );
  } finally {
    await app.close();
  }
});

test("housing publication preserves draft while verification is unavailable", async () => {
  const app = await createApp({ database: ":memory:", mode: "local" });
  try {
    const account = (
      await app.inject({
        method: "POST",
        url: "/v1/local/accounts",
        payload: {
          name: "Poster",
          email: "poster@example.test",
          password: "long-test-password-here",
        },
      })
    ).json();
    const headers = {
      authorization: "Bearer " + account.token,
      "idempotency-key": "housing-create",
    };
    const listing = (
      await app.inject({
        method: "POST",
        url: "/v1/listings",
        headers,
        payload: {
          title: "A place near campus",
          category: "housing",
          description: "Looking for a roommate near campus.",
          shareMinor: 90000,
          capacity: 2,
          moveIn: "2027-01-15",
        },
      })
    ).json();
    const result = await app.inject({
      method: "POST",
      url: "/v1/listings/" + listing.id + "/publish",
      headers: { ...headers, "idempotency-key": "housing-publish" },
      payload: { expectedVersion: 1 },
    });
    assert.equal(result.statusCode, 200, result.body);
    assert.equal(result.json().status, "verification_required");
    assert.equal(
      (await app.inject({ url: "/v1/listings", headers })).json().items.length,
      0,
    );
    assert.equal(
      (await app.inject({ url: "/v1/my-listings", headers })).json().items
        .length,
      1,
    );
  } finally {
    await app.close();
  }
});
