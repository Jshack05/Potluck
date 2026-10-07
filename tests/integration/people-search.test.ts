import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../../services/potluck-api/src/app.ts";
test("people picker limits disclosure to known addresses and visible contacts and respects blocks", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    const register = async (name: string) =>
      (
        await app.inject({
          method: "POST",
          url: "/v1/local/accounts",
          payload: {
            name,
            email: name + "@people.test",
            password: "local-test-long-password",
          },
        })
      ).json();
    const host = await register("Host"),
      contact = await register("Contact"),
      hidden = await register("Hidden");
    let n = 0;
    const call = (token: string, url: string, payload?: object) =>
      app.inject({
        method: payload ? "POST" : "GET",
        url: "/v1" + url,
        payload,
        headers: {
          authorization: "Bearer " + token,
          "idempotency-key": "people-search-" + ++n,
        },
      });
    assert.equal((await app.inject("/v1/people?q=Contact")).statusCode, 401);
    assert.deepEqual(
      (await call(host.token, "/people?q=Contact")).json().items,
      [],
    );
    assert.deepEqual((await call(host.token, "/people?q=")).json().items, []);
    const exact = (
      await call(host.token, "/people?q=Contact%40people.test")
    ).json().items;
    assert.deepEqual(exact, [{ id: contact.user.id, name: "Contact" }]);
    const circle = (
      await call(host.token, "/circles", {
        name: "People test",
        invitedUserIds: [contact.user.id, hidden.user.id],
      })
    ).json();
    for (const user of [contact, hidden]) {
      const invite = (await call(user.token, "/invitations")).json().items[0];
      assert.equal(
        (
          await call(user.token, "/invitations/" + invite.id + "/accept", {
            expectedVersion: 1,
          })
        ).statusCode,
        200,
      );
    }
    assert.equal(
      (await call(host.token, "/people?q=Contact")).json().items.length,
      1,
    );
    assert.equal((await call(host.token, "/people?q=")).json().items.length, 2);
    assert.equal(
      (
        await call(host.token, "/circles/" + circle.id + "/edit", {
          name: "People test",
          privacy: "anonymous",
          expectedVersion: 1,
        })
      ).statusCode,
      200,
    );
    assert.deepEqual(
      (await call(contact.token, "/people?q=Hidden")).json().items,
      [],
    );
    assert.deepEqual((await call(contact.token, "/people?q=")).json().items, [
      { id: host.user.id, name: "Host" },
    ]);
    assert.equal(
      (await call(contact.token, "/people?q=Host")).json().items.length,
      1,
    );
    assert.equal(
      (await call(contact.token, "/blocks", { userId: host.user.id }))
        .statusCode,
      200,
    );
    assert.deepEqual(
      (await call(host.token, "/people?q=Contact%40people.test")).json().items,
      [],
    );
  } finally {
    await app.close();
  }
});
