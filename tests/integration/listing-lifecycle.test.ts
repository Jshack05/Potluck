import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../../services/potluck-api/src/app.ts";
test("listing edits preserve ownership and version; public profiles omit private identity and blocked saves", async () => {
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
    const call = (account: any, path: string, payload?: object) =>
      app.inject({
        method: payload ? "POST" : "GET",
        url: "/v1" + path,
        payload,
        headers: {
          authorization: "Bearer " + account.token,
          "idempotency-key": "life-key-" + ++n,
        },
      });
    const body = {
      title: "Community music",
      brand: "Spotify",
      category: "subscriptions",
      description: "An eligible household arrangement",
      shareMinor: 600,
      capacity: 4,
    };
    const listing = (await call(host, "/listings", body)).json();
    const edit = await call(host, "/listings/" + listing.id + "/edit", {
      ...body,
      title: "Music for our household",
      expectedVersion: 1,
    });
    assert.equal(edit.statusCode, 200, edit.body);
    assert.equal(edit.json().version, 2);
    assert.equal(
      (
        await call(person, "/listings/" + listing.id + "/edit", {
          ...body,
          expectedVersion: 2,
        })
      ).statusCode,
      404,
    );
    assert.equal(
      (
        await call(host, "/listings/" + listing.id + "/edit", {
          ...body,
          expectedVersion: 1,
        })
      ).statusCode,
      409,
    );
    await call(host, "/listings/" + listing.id + "/publish", {
      expectedVersion: 2,
    });
    const profile = (await app.inject("/v1/profiles/" + host.user.id)).json();
    assert.equal(profile.name, "Host");
    assert.equal(profile.email, undefined);
    assert.equal(profile.password_hash, undefined);
    assert.equal(profile.listings.length, 1);
    await call(person, "/listings/" + listing.id + "/save", { saved: true });
    assert.equal((await call(person, "/saved")).json().items.length, 1);
    await call(person, "/blocks", { userId: host.user.id });
    assert.equal((await call(person, "/saved")).json().items.length, 0);
    assert.equal(
      (await call(person, "/profiles/" + host.user.id)).statusCode,
      403,
    );
  } finally {
    await app.close();
  }
});
