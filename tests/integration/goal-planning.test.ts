import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../../services/potluck-api/src/app.ts";

test("Goal planning is owned, idempotent, validated and does not activate funding", async () => {
  const app = await createApp({ database: ":memory:", mode: "local" });
  try {
    const account = async (name: string) =>
      (
        await app.inject({
          method: "POST",
          url: "/v1/local/accounts",
          payload: {
            name,
            email: name + "@example.test",
            password: "local-test-long-password",
          },
        })
      ).json();
    const host = await account("GoalHost"),
      other = await account("GoalOther");
    let serial = 0;
    const call = (
      token: string,
      method: "GET" | "POST",
      url: string,
      payload?: object,
      key = "goal-planning-" + ++serial,
    ) =>
      app.inject({
        method,
        url,
        payload,
        headers: { authorization: "Bearer " + token, "idempotency-key": key },
      });
    const body = {
      name: "Road trip fund",
      kind: "target",
      targetMinor: 120000,
      endDate: null,
      frequency: "monthly",
      firstContributionDate: "2026-11-01",
      plannedContributions: [{ personId: host.user.id, amountMinor: 5000 }],
      lockFundsRequested: true,
      showContributions: false,
    };
    const created = await call(
      host.token,
      "POST",
      "/v1/goals",
      body,
      "goal-create",
    );
    assert.equal(created.statusCode, 201, created.body);
    const goal = created.json();
    assert.equal(goal.status, "draft");
    assert.equal(goal.currency, "USD");
    assert.equal(goal.fundedMinor, null);
    assert.equal(goal.lockFundsRequested, true);
    assert.equal(
      (await call(host.token, "POST", "/v1/goals", body, "goal-create")).json()
        .id,
      goal.id,
    );
    assert.equal(
      (
        await call(
          host.token,
          "POST",
          "/v1/goals",
          { ...body, name: "Changed" },
          "goal-create",
        )
      ).statusCode,
      409,
    );
    assert.equal(
      (await call(other.token, "GET", "/v1/goals/" + goal.id)).statusCode,
      404,
    );
    assert.equal(
      (await call(other.token, "GET", "/v1/goals")).json().items.length,
      0,
    );
    assert.equal(
      (await app.inject({ method: "GET", url: "/v1/goals/" + goal.id }))
        .statusCode,
      401,
    );
    const detail = (
      await call(host.token, "GET", "/v1/goals/" + goal.id)
    ).json();
    assert.equal(detail.plannedContributions[0].name, host.user.name);
    assert.equal(detail.plannedContributions[0].amountMinor, 5000);
    assert.equal(
      (await call(host.token, "GET", "/v1/goals")).json().items.length,
      1,
    );
    assert.equal(detail.fundingStatus, "not_authorized");
    assert.equal(detail.invitationStatus, "not_sent");
    for (const invalid of [
      { ...body, targetMinor: 0 },
      { ...body, targetMinor: 1.5 },
      { ...body, firstContributionDate: "2026-02-30" },
      { ...body, kind: "time_based", targetMinor: null, endDate: "2026-10-01" },
      {
        ...body,
        plannedContributions: [{ personId: other.user.id, amountMinor: 5000 }],
      },
      {
        ...body,
        plannedContributions: [
          body.plannedContributions[0],
          body.plannedContributions[0],
        ],
      },
    ])
      assert.ok(
        (await call(host.token, "POST", "/v1/goals", invalid)).statusCode >=
          400,
      );
    const circleResponse = await call(host.token, "POST", "/v1/circles", {
      name: "Private",
      privacy: "anonymous",
    });
    assert.equal(circleResponse.statusCode, 201, circleResponse.body);
    const circle = circleResponse.json();
    assert.equal(
      (
        await call(host.token, "POST", "/v1/goals", {
          ...body,
          circleId: circle.id,
          showContributions: true,
        })
      ).statusCode,
      409,
    );
    assert.equal(
      (
        await call(other.token, "POST", "/v1/goals", {
          ...body,
          circleId: circle.id,
          plannedContributions: [],
        })
      ).statusCode,
      404,
    );
    const indefinite = await call(host.token, "POST", "/v1/goals", {
      ...body,
      kind: "time_based",
      targetMinor: null,
      endDate: null,
      frequency: "weekly",
    });
    assert.equal(indefinite.statusCode, 201, indefinite.body);
    const card = (
      await call(host.token, "POST", "/v1/cards", { name: "Trip Card" })
    ).json();
    assert.equal(
      (
        await call(other.token, "POST", "/v1/goals", {
          ...body,
          cardId: card.id,
          plannedContributions: [],
        })
      ).statusCode,
      404,
    );
  } finally {
    await app.close();
  }
});
