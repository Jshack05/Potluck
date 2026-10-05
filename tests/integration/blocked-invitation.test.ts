import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./completed-onboarding.fixture.ts";
test("blocking a person also prevents direct Circle invitations and accepting an old invitation", async () => {
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
    const host = await make("host"),
      person = await make("person");
    let n = 0;
    const call = (u: any, path: string, payload: object) =>
      app.inject({
        method: "POST",
        url: "/v1" + path,
        payload,
        headers: {
          authorization: "Bearer " + u.token,
          "idempotency-key": "blocked-invite-" + ++n,
        },
      });
    const first = (
        await call(host, "/circles", { name: "First Circle" })
      ).json(),
      second = (await call(host, "/circles", { name: "Second Circle" })).json();
    const invitation = (
      await call(host, "/circles/" + first.id + "/invitations", {
        email: "person@example.test",
      })
    ).json();
    await call(person, "/blocks", { userId: host.user.id });
    assert.equal(
      (
        await call(host, "/circles/" + second.id + "/invitations", {
          email: "person@example.test",
        })
      ).statusCode,
      403,
    );
    assert.equal(
      (
        await call(person, "/invitations/" + invitation.id + "/accept", {
          expectedVersion: 1,
        })
      ).statusCode,
      403,
    );
  } finally {
    await app.close();
  }
});
