import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./completed-onboarding.fixture.ts";
test("percentage proposals retain exact cents, calculation method and separately agreed caps", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    const make = async (name: string) =>
      (
        await app.inject({
          method: "POST",
          url: "/v1/local/accounts",
          payload: {
            name,
            email: name + "@percent.test",
            password: "local-test-password-long",
          },
        })
      ).json();
    const a = await make("Host"),
      b = await make("Member");
    let n = 0;
    const post = (path: string, body: object) =>
      app.inject({
        method: "POST",
        url: "/v1" + path,
        payload: body,
        headers: {
          authorization: "Bearer " + a.token,
          "idempotency-key": "percentage-" + ++n,
        },
      });
    const body = {
      name: "Utility",
      kind: "flexible",
      amountMinor: 10000,
      maximumMinor: 15000,
      firstDueDate: "2026-11-01",
      participants: [a.user.id, b.user.id],
      percentages: { [a.user.id]: 7000, [b.user.id]: 3000 },
      personalCaps: { [a.user.id]: 10000, [b.user.id]: 4000 },
    };
    const result = await post("/bills", body);
    assert.equal(result.statusCode, 201, result.body);
    const offer = result
      .json()
      .agreements.find((x: any) => x.participantId === b.user.id);
    assert.equal(offer.amountMinor, 3000);
    assert.equal(offer.maximumMinor, 4000);
    assert.equal(offer.terms.calculation.numerator, 3000);
    assert.equal(offer.terms.calculation.denominator, 10000);
    assert.equal(
      (
        await post("/bills", {
          ...body,
          percentages: { [a.user.id]: 7000, [b.user.id]: 2000 },
        })
      ).statusCode,
      400,
    );
    assert.equal(
      (
        await post("/bills", {
          ...body,
          personalCaps: { [a.user.id]: 10000, [b.user.id]: 2000 },
        })
      ).statusCode,
      400,
    );
  } finally {
    await app.close();
  }
});
