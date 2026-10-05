import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../../services/potluck-api/src/app.ts";

test("two local accounts connect Circle, Bill and Card without implied financial permissions", async () => {
  const app = await createApp({ database: ":memory:", mode: "local" });
  try {
    const hostSession = await app.inject({
      method: "POST",
      url: "/v1/local/accounts",
      payload: {
        name: "Maya",
        email: "maya@example.test",
        password: "local-test-long-password",
      },
    });
    assert.equal(hostSession.statusCode, 201, hostSession.body);
    const memberSession = await app.inject({
      method: "POST",
      url: "/v1/local/accounts",
      payload: {
        name: "Jordan",
        email: "jordan@example.test",
        password: "local-test-long-password",
      },
    });
    assert.equal(memberSession.statusCode, 201);
    const host = hostSession.json(),
      member = memberSession.json();
    let counter = 0;
    const call = (
      token: string,
      method: "POST" | "GET" | "DELETE",
      url: string,
      payload?: unknown,
      key?: string,
    ) =>
      app.inject({
        method,
        url,
        payload: payload as object,
        headers: {
          authorization: "Bearer " + token,
          "idempotency-key": key ?? "journey-" + ++counter,
        },
      });
    const circleResponse = await call(
      host.token,
      "POST",
      "/v1/circles",
      { name: "Apartment crew" },
      "new-circle",
    );
    assert.equal(circleResponse.statusCode, 201, circleResponse.body);
    const circle = circleResponse.json();
    assert.equal(
      (
        await call(
          host.token,
          "POST",
          "/v1/circles",
          { name: "Apartment crew" },
          "new-circle",
        )
      ).json().id,
      circle.id,
    );
    const invite = (
      await call(
        host.token,
        "POST",
        "/v1/circles/" + circle.id + "/invitations",
        { email: member.user.email },
      )
    ).json();
    const accepted = await call(
      member.token,
      "POST",
      "/v1/invitations/" + invite.id + "/accept",
      { expectedVersion: 1 },
    );
    assert.equal(accepted.statusCode, 200, accepted.body);
    const card = (
      await call(host.token, "POST", "/v1/cards", {
        name: "Apartment card",
        circleId: circle.id,
      })
    ).json();
    assert.equal(card.status, "setup_required");
    assert.equal(
      (await call(member.token, "GET", "/v1/cards/" + card.id)).statusCode,
      404,
    );
    const billResponse = await call(host.token, "POST", "/v1/bills", {
      name: "Internet",
      circleId: circle.id,
      cardId: card.id,
      amountMinor: 8400,
      firstDueDate: "2026-11-01",
      participants: [host.user.id, member.user.id],
    });
    assert.equal(billResponse.statusCode, 201, billResponse.body);
    const bill = billResponse.json();
    const memberBill = (
      await call(member.token, "GET", "/v1/bills/" + bill.id)
    ).json();
    assert.equal(memberBill.cardId, undefined);
    assert.equal(memberBill.agreements.length, 1);
    assert.equal(memberBill.agreements[0].amountMinor, 4200);
    const agreement = memberBill.agreements[0];
    assert.equal(
      (
        await call(
          member.token,
          "POST",
          "/v1/agreements/" + agreement.id + "/accept",
          { termsVersion: 1, accepted: true },
        )
      ).statusCode,
      200,
    );
    const updated = (
      await call(member.token, "GET", "/v1/bills/" + bill.id)
    ).json();
    assert.equal(updated.agreements[0].status, "accepted");
    assert.equal(updated.agreements[0].fundingStatus, "not_authorized");
    assert.equal(
      (await call(member.token, "GET", "/v1/cards")).json().items.length,
      0,
    );
    assert.equal(
      (await call(host.token, "POST", "/v1/cards/" + card.id + "/activate", {}))
        .statusCode,
      409,
    );
    const overview = (
      await call(host.token, "GET", "/v1/circles/" + circle.id)
    ).json();
    assert.equal(overview.bills[0].id, bill.id);
    assert.equal(overview.cards[0].id, card.id);
  } finally {
    await app.close();
  }
});
