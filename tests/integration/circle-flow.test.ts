import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./completed-onboarding.fixture.ts";

test("Circle creation invites selected people atomically and member suggestions need host approval and recipient consent", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    const account = async (name: string) =>
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
    const host = await account("host"),
      member = await account("member"),
      recipient = await account("recipient"),
      outsider = await account("outsider");
    let n = 0;
    const call = (who: any, path: string, payload?: object, key?: string) =>
      app.inject({
        method: payload ? "POST" : "GET",
        url: "/v1" + path,
        payload,
        headers: {
          authorization: "Bearer " + who.token,
          "idempotency-key": key ?? "circle-flow-" + ++n,
        },
      });
    const body = {
      name: "Movie night",
      icon: "circles",
      color: "lilac",
      membersCanInvite: true,
      requireHostApproval: true,
      invitedUserIds: [member.user.id],
    };
    const created = await call(
      host,
      "/circles",
      body,
      "create-circle-selection",
    );
    assert.equal(created.statusCode, 201, created.body);
    const circle = created.json();
    assert.equal(
      (await call(host, "/circles", body, "create-circle-selection")).json().id,
      circle.id,
    );
    assert.equal(
      (await call(host, "/circles/" + circle.id)).json().people.length,
      1,
    );
    const pending = (
      await call(host, "/circles/" + circle.id + "/invitations")
    ).json().items;
    assert.equal(pending.length, 1);
    assert.equal(pending[0].status, "pending");
    assert.equal(
      (
        await call(member, "/invitations/" + pending[0].id + "/accept", {
          expectedVersion: 1,
        })
      ).statusCode,
      200,
    );
    const suggestion = await call(
      member,
      "/circles/" + circle.id + "/invitations",
      { recipientId: recipient.user.id },
    );
    assert.equal(suggestion.statusCode, 201, suggestion.body);
    const invite = suggestion.json();
    assert.equal(invite.status, "awaiting_host_approval");
    assert.equal(
      (await call(recipient, "/invitations")).json().items.length,
      0,
    );
    assert.equal(
      (
        await call(recipient, "/invitations/" + invite.id + "/accept", {
          expectedVersion: 1,
        })
      ).statusCode,
      409,
    );
    assert.equal(
      (
        await call(member, "/invitations/" + invite.id + "/approve", {
          expectedVersion: 1,
        })
      ).statusCode,
      404,
    );
    assert.equal(
      (await call(outsider, "/invitations/" + invite.id)).statusCode,
      404,
    );
    assert.equal(
      (
        await call(host, "/invitations/" + invite.id + "/approve", {
          expectedVersion: 1,
        })
      ).statusCode,
      200,
    );
    assert.equal(
      (
        await call(recipient, "/invitations/" + invite.id + "/accept", {
          expectedVersion: 1,
        })
      ).statusCode,
      409,
    );
    assert.equal(
      (
        await call(recipient, "/invitations/" + invite.id + "/accept", {
          expectedVersion: 2,
        })
      ).statusCode,
      200,
    );
    assert.equal(
      (await call(host, "/circles/" + circle.id)).json().people.length,
      3,
    );
    assert.equal(
      (await call(host, "/invitations/" + invite.id)).json().status,
      "accepted",
    );
    const failed = await call(host, "/circles", {
      name: "Must roll back",
      invitedEmails: ["missing@example.test"],
    });
    assert.equal(failed.statusCode, 404);
    assert.equal((await call(host, "/circles")).json().items.length, 1);
    const privacy = await call(host, "/circles/" + circle.id + "/edit", {
      name: "Movie night",
      privacy: "anonymous",
      expectedVersion: 1,
    });
    assert.equal(privacy.statusCode, 200, privacy.body);
    const privateView = (await call(member, "/circles/" + circle.id)).json();
    assert.equal(privateView.memberCount, 3);
    assert.deepEqual(
      privateView.people.map((p: any) => p.id).sort(),
      [host.user.id, member.user.id].sort(),
    );
    assert.equal(
      privateView.membersCanInvite,
      true,
      "old edit clients preserve newly stored settings",
    );
    assert.equal(
      (
        await call(member, "/circles/" + circle.id + "/invitations", {
          recipientId: outsider.user.id,
        })
      ).statusCode,
      403,
    );
  } finally {
    await app.close();
  }
});

test("Circle invite cancellation and host handover outcomes remain visible only to involved actors", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    const account = async (name: string) =>
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
    const host = await account("host"),
      member = await account("member"),
      outsider = await account("outsider");
    let n = 0;
    const call = (who: any, path: string, payload?: object) =>
      app.inject({
        method: payload ? "POST" : "GET",
        url: "/v1" + path,
        payload,
        headers: {
          authorization: "Bearer " + who.token,
          "idempotency-key": "circle-outcomes-" + ++n,
        },
      });
    const circle = (
      await call(host, "/circles", {
        name: "Together",
        invitedEmails: ["member@example.test"],
      })
    ).json();
    const invite = (
      await call(host, "/circles/" + circle.id + "/invitations")
    ).json().items[0];
    assert.equal(
      (
        await call(host, "/invitations/" + invite.id + "/revoke", {
          expectedVersion: 1,
        })
      ).statusCode,
      200,
    );
    assert.equal(
      (await call(member, "/invitations/" + invite.id)).json().status,
      "revoked",
    );
    assert.equal(
      (
        await call(member, "/invitations/" + invite.id + "/accept", {
          expectedVersion: 2,
        })
      ).statusCode,
      409,
    );
    const again = (
      await call(host, "/circles/" + circle.id + "/invitations", {
        recipientId: member.user.id,
      })
    ).json();
    await call(member, "/invitations/" + again.id + "/accept", {
      expectedVersion: 1,
    });
    const denied = await call(
      member,
      "/circles/" + circle.id + "/invitations",
      { recipientId: outsider.user.id },
    );
    assert.equal(denied.statusCode, 403);
    const transfer = (
      await call(host, "/circles/" + circle.id + "/transfer", {
        userId: member.user.id,
        expectedVersion: 1,
      })
    ).json();
    assert.equal(
      (await call(host, "/circles/" + circle.id + "/transfers")).json().items
        .length,
      1,
    );
    assert.equal(
      (await call(outsider, "/circle-transfers/" + transfer.id)).statusCode,
      404,
    );
    assert.equal(
      (
        await call(host, "/circle-transfers/" + transfer.id + "/revoke", {
          expectedVersion: 1,
        })
      ).statusCode,
      200,
    );
    assert.equal(
      (await call(member, "/circle-transfers/" + transfer.id)).json().status,
      "revoked",
    );
    assert.equal(
      (
        await call(member, "/circle-transfers/" + transfer.id + "/accept", {
          expectedVersion: 2,
        })
      ).statusCode,
      409,
    );
    assert.equal(
      (await call(host, "/circles/" + circle.id)).json().hostId,
      host.user.id,
    );
  } finally {
    await app.close();
  }
});
