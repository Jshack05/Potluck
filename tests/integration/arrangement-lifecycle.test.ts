import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./completed-onboarding.fixture.ts";
test("revised terms never replace consent until accepted; leaving Circle preserves independent Bill agreement", async () => {
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
            password: "long-test-local-password",
          },
        })
      ).json();
    const h = await make("Host"),
      p = await make("Person");
    let n = 0;
    const call = (u: any, path: string, payload?: object) =>
      app.inject({
        method: payload ? "POST" : "GET",
        url: "/v1" + path,
        payload,
        headers: {
          authorization: "Bearer " + u.token,
          "idempotency-key": "arrange-" + ++n,
        },
      });
    const circle = (await call(h, "/circles", { name: "People" })).json();
    const invite = (
      await call(h, "/circles/" + circle.id + "/invitations", {
        email: "Person@example.test".toLowerCase(),
      })
    ).json();
    await call(p, "/invitations/" + invite.id + "/accept", {
      expectedVersion: 1,
    });
    const body = {
      name: "Internet",
      circleId: circle.id,
      amountMinor: 10000,
      participants: [h.user.id, p.user.id],
      firstDueDate: "2026-11-01",
    };
    const bill = (await call(h, "/bills", body)).json();
    const a = bill.agreements.find((x: any) => x.participantId === p.user.id);
    await call(p, "/agreements/" + a.id + "/accept", {
      termsVersion: 1,
      accepted: true,
    });
    const revised = await call(h, "/bills/" + bill.id + "/revise", {
      ...body,
      amountMinor: 12000,
      expectedVersion: 1,
      expectedConnectionVersion: 1,
    });
    assert.equal(revised.statusCode, 200, revised.body);
    const next = revised
      .json()
      .agreements.find(
        (x: any) => x.participantId === p.user.id && x.status === "offered",
      );
    assert.equal(
      revised.json().agreements.find((x: any) => x.id === a.id).status,
      "accepted",
    );
    assert.equal(
      (
        await call(p, "/bills/" + bill.id + "/revise", {
          ...body,
          expectedVersion: 2,
          expectedConnectionVersion: 1,
        })
      ).statusCode,
      404,
    );
    const oldOffer = bill.agreements.find(
      (x: any) => x.participantId === h.user.id,
    );
    assert.equal(
      (
        await call(h, "/agreements/" + oldOffer.id + "/accept", {
          termsVersion: 1,
          accepted: true,
        })
      ).statusCode,
      409,
    );
    assert.equal(
      (
        await call(p, "/circles/" + circle.id + "/leave", {
          expectedVersion: 1,
          acknowledged: true,
        })
      ).statusCode,
      200,
    );
    assert.equal((await call(p, "/circles/" + circle.id)).statusCode, 404);
    assert.equal(
      (await call(p, "/agreements/" + a.id)).json().status,
      "accepted",
    );
    assert.equal(
      (
        await call(p, "/agreements/" + next.id + "/accept", {
          termsVersion: 2,
          accepted: true,
        })
      ).statusCode,
      200,
    );
    assert.equal(
      (await call(p, "/agreements/" + a.id)).json().status,
      "superseded",
    );
    assert.equal(
      (await call(p, "/agreements/" + next.id + "/cancel", { termsVersion: 2 }))
        .statusCode,
      200,
    );
    assert.equal(
      (
        await call(h, "/bills/" + bill.id + "/end", {
          expectedVersion: 2,
          acknowledged: true,
        })
      ).statusCode,
      200,
    );
    const ended = (await call(h, "/bills/" + bill.id)).json();
    assert.equal(ended.status, "ended");
    assert.equal(
      ended.agreements.some(
        (x: any) => x.status === "accepted" || x.status === "offered",
      ),
      false,
    );
  } finally {
    await app.close();
  }
});
