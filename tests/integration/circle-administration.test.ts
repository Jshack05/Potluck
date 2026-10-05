import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../../services/potluck-api/src/app.ts";
test("Circle hosting transfer needs target acceptance and never transfers Card ownership", async () => {
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
            password: "local-test-password-long",
          },
        })
      ).json();
    const h = await make("Host"),
      p = await make("Member");
    let n = 0;
    const call = (who: any, path: string, payload?: object) =>
      app.inject({
        method: payload ? "POST" : "GET",
        url: "/v1" + path,
        payload,
        headers: {
          authorization: "Bearer " + who.token,
          "idempotency-key": "circle-admin-" + ++n,
        },
      });
    const circle = (
        await call(h, "/circles", { name: "Together", privacy: "anonymous" })
      ).json(),
      card = (
        await call(h, "/cards", { name: "Host private", circleId: circle.id })
      ).json();
    const invite = (
      await call(h, "/circles/" + circle.id + "/invitations", {
        email: "member@example.test",
      })
    ).json();
    await call(p, "/invitations/" + invite.id + "/accept", {
      expectedVersion: 1,
    });
    assert.equal(
      (await call(p, "/circles/" + circle.id)).json().people.length,
      1,
    );
    const transfer = await call(h, "/circles/" + circle.id + "/transfer", {
      userId: p.user.id,
      expectedVersion: 1,
    });
    assert.equal(transfer.statusCode, 201, transfer.body);
    assert.equal(
      (await call(h, "/circles/" + circle.id)).json().hostId,
      h.user.id,
    );
    assert.equal(
      (
        await call(h, "/circle-transfers/" + transfer.json().id + "/accept", {
          expectedVersion: 1,
        })
      ).statusCode,
      404,
    );
    const accepted = await call(
      p,
      "/circle-transfers/" + transfer.json().id + "/accept",
      { expectedVersion: 1 },
    );
    assert.equal(accepted.statusCode, 200, accepted.body);
    assert.equal(
      (await call(p, "/circles/" + circle.id)).json().hostId,
      p.user.id,
    );
    assert.equal((await call(p, "/cards/" + card.id)).statusCode, 404);
    assert.equal((await call(h, "/cards/" + card.id)).statusCode, 200);
    assert.equal(
      (
        await call(h, "/circles/" + circle.id + "/leave", {
          expectedVersion: 2,
          acknowledged: true,
        })
      ).statusCode,
      200,
    );
    assert.equal(
      (
        await call(p, "/circles/" + circle.id + "/archive", {
          expectedVersion: 2,
          acknowledged: true,
        })
      ).statusCode,
      200,
    );
  } finally {
    await app.close();
  }
});
