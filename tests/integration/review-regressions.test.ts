import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./completed-onboarding.fixture.ts";
async function fixture() {
  const app = await createApp({ mode: "local", database: ":memory:" });
  const make = async (name: string) =>
    (
      await app.inject({
        method: "POST",
        url: "/v1/local/accounts",
        payload: {
          name,
          email: name + "@example.test",
          password: "local-only-long-password",
        },
      })
    ).json();
  const host = await make("host"),
    person = await make("person");
  let sequence = 0;
  const call = (actor: any, path: string, payload?: object) =>
    app.inject({
      method: payload ? "POST" : "GET",
      url: "/v1" + path,
      payload,
      headers: {
        authorization: "Bearer " + actor.token,
        "idempotency-key": "review-regression-" + ++sequence,
      },
    });
  const body = {
    name: "Shared utility",
    amountMinor: 10000,
    participants: [host.user.id, person.user.id],
    firstDueDate: "2026-11-01",
  };
  return { app, host, person, call, body };
}
test("a stale terms editor cannot overwrite a newer Bill connection", async () => {
  const { app, host, call, body } = await fixture();
  try {
    const a = (await call(host, "/cards", { name: "Card A" })).json();
    const b = (await call(host, "/cards", { name: "Card B" })).json();
    const bill = (await call(host, "/bills", { ...body, cardId: a.id })).json();
    const changed = await call(host, "/bills/" + bill.id + "/connection", {
      expectedVersion: 1,
      expectedConnectionVersion: 1,
      circleId: null,
      cardId: b.id,
    });
    assert.equal(changed.statusCode, 200, changed.body);
    const stale = await call(host, "/bills/" + bill.id + "/revise", {
      ...body,
      cardId: a.id,
      expectedVersion: 1,
      expectedConnectionVersion: 1,
    });
    assert.equal(stale.statusCode, 409, stale.body);
    assert.equal((await call(host, "/bills/" + bill.id)).json().cardId, b.id);
    const fresh = await call(host, "/bills/" + bill.id + "/revise", {
      ...body,
      cardId: a.id,
      expectedVersion: 1,
      expectedConnectionVersion: 2,
    });
    assert.equal(fresh.statusCode, 200, fresh.body);
    assert.equal(fresh.json().connectionVersion, 3);
  } finally {
    await app.close();
  }
});
test("Card-only Bill is classified as shared without exposing the Card to contributors", async () => {
  const { app, host, person, call, body } = await fixture();
  try {
    const card = (
      await call(host, "/cards", { name: "Private Card setup" })
    ).json();
    const bill = (
      await call(host, "/bills", { ...body, cardId: card.id })
    ).json();
    const view = (await call(person, "/bills/" + bill.id)).json();
    assert.equal(view.isShared, true);
    assert.equal("cardId" in view, false);
    const list = (await call(person, "/bills")).json();
    assert.equal(list.items.find((b: any) => b.id === bill.id).isShared, true);
  } finally {
    await app.close();
  }
});
test("blocking stops new Bill offers but preserves existing agreement access and cancellation", async () => {
  const { app, host, person, call, body } = await fixture();
  try {
    const bill = (await call(host, "/bills", body)).json();
    const agreement = bill.agreements.find(
      (a: any) => a.participantId === person.user.id,
    );
    assert.equal(
      (
        await call(person, "/agreements/" + agreement.id + "/accept", {
          termsVersion: 1,
          accepted: true,
        })
      ).statusCode,
      200,
    );
    assert.equal(
      (await call(person, "/blocks", { userId: host.user.id })).statusCode,
      200,
    );
    assert.equal((await call(host, "/bills", body)).statusCode, 403);
    assert.equal(
      (
        await call(host, "/bills/" + bill.id + "/revise", {
          ...body,
          expectedVersion: 1,
          expectedConnectionVersion: 1,
        })
      ).statusCode,
      403,
    );
    assert.equal(
      (await call(person, "/agreements/" + agreement.id)).json().status,
      "accepted",
    );
    assert.equal(
      (
        await call(person, "/agreements/" + agreement.id + "/cancel", {
          termsVersion: 1,
        })
      ).statusCode,
      200,
    );
    const unchanged = (await call(host, "/bills/" + bill.id)).json();
    assert.equal(unchanged.version, 1);
  } finally {
    await app.close();
  }
});
test("Flexible Bill proposals record a stop-if-exceeded cap, not permission for a partial charge", async () => {
  const { app, host, call, body } = await fixture();
  try {
    const response = await call(host, "/bills", {
      ...body,
      kind: "flexible",
      maximumMinor: 20000,
    });
    assert.equal(response.statusCode, 201, response.body);
    for (const agreement of response.json().agreements) {
      assert.equal(agreement.terms.capBehavior, "stop_if_exceeded");
      assert.equal(agreement.terms.fundingAuthorization, "none");
    }
  } finally {
    await app.close();
  }
});
test("a contributor chooses a lower hard cap and reviews current terms separately from a new proposal", async () => {
  const { app, host, person, call, body } = await fixture();
  try {
    const input = { ...body, kind: "flexible", maximumMinor: 20000 };
    const bill = (await call(host, "/bills", input)).json();
    const a = bill.agreements.find(
      (value: any) => value.participantId === person.user.id,
    );
    const accepted = await call(person, "/agreements/" + a.id + "/accept", {
      termsVersion: 1,
      accepted: true,
      personalMaximumMinor: 4000,
    });
    assert.equal(accepted.statusCode, 200, accepted.body);
    assert.equal(accepted.json().maximumMinor, 4000);
    assert.equal(accepted.json().terms.maximumMinor, 4000);
    assert.equal(accepted.json().terms.proposedMaximumMinor, 10000);
    const revised = await call(host, "/bills/" + bill.id + "/revise", {
      ...input,
      frequency: "weekly",
      reasonForChange: "Moving to a weekly schedule",
      expectedVersion: 1,
      expectedConnectionVersion: 1,
    });
    assert.equal(revised.statusCode, 200, revised.body);
    const offer = revised
      .json()
      .agreements.find(
        (value: any) =>
          value.participantId === person.user.id && value.status === "offered",
      );
    const review = (await call(person, "/agreements/" + offer.id)).json();
    assert.equal(review.currentAgreement.id, a.id);
    assert.equal(review.currentAgreement.terms.frequency, "monthly");
    assert.equal(review.currentAgreement.maximumMinor, 4000);
    assert.equal(review.terms.reasonForChange, "Moving to a weekly schedule");
    assert.equal(
      (
        await call(host, "/agreements/" + offer.id + "/accept", {
          termsVersion: 2,
          accepted: true,
          personalMaximumMinor: 7000,
        })
      ).statusCode,
      404,
    );
    assert.equal(
      (
        await call(person, "/agreements/" + offer.id + "/accept", {
          termsVersion: 2,
          accepted: true,
          personalMaximumMinor: 10001,
        })
      ).statusCode,
      400,
    );
    await call(person, "/agreements/" + offer.id + "/decline", {
      termsVersion: 2,
    });
    assert.equal(
      (await call(person, "/agreements/" + a.id)).json().maximumMinor,
      4000,
    );
    assert.equal(
      (await call(person, "/agreements/" + a.id)).json().status,
      "accepted",
    );
  } finally {
    await app.close();
  }
});
test("message history can be paged without losing older messages when a new message arrives", async () => {
  const { app, host, person, call } = await fixture();
  try {
    const listing = (
      await call(host, "/listings", {
        title: "Shared plan",
        brand: "Example",
        category: "subscriptions",
        description: "Discuss sharing eligibility together",
        shareMinor: 1000,
        capacity: 4,
      })
    ).json();
    await call(host, "/listings/" + listing.id + "/publish", {
      expectedVersion: 1,
    });
    const request = (
      await call(person, "/listings/" + listing.id + "/requests", {
        listingVersion: 2,
        message: "Hello",
        acceptedRules: true,
        rulesVersion: "2026-10-04",
      })
    ).json();
    const conversation = (
      await call(host, "/requests/" + request.id + "/accept", {
        expectedVersion: 1,
      })
    ).json();
    for (let i = 0; i < 55; i++) {
      const sent = await call(
        person,
        "/conversations/" + conversation.id + "/messages",
        { text: "Message " + i },
      );
      assert.equal(sent.statusCode, 201, sent.body);
    }
    const latest = (
      await call(host, "/conversations/" + conversation.id)
    ).json();
    assert.equal(latest.messages.length, 50);
    assert.ok(latest.nextBefore);
    await call(person, "/conversations/" + conversation.id + "/messages", {
      text: "New arrival",
    });
    const older = (
      await call(
        host,
        "/conversations/" + conversation.id + "?before=" + latest.nextBefore,
      )
    ).json();
    assert.equal(older.messages.length, 6);
    assert.equal(older.nextBefore, null);
    assert.equal(
      new Set([...older.messages, ...latest.messages].map((m) => m.id)).size,
      56,
    );
    const invalid = await call(
      host,
      "/conversations/" +
        conversation.id +
        "?before=bc0c4a09-1aab-47ab-95cb-58f96f8cc132",
    );
    assert.equal(invalid.statusCode, 404);
  } finally {
    await app.close();
  }
});
