import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../../services/potluck-api/src/app.ts";

test("personal scheduled plans stay separate from consent and disappear when proposed or ended", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    const register = async (name: string) =>
      (
        await app.inject({
          method: "POST",
          url: "/v1/local/accounts",
          payload: {
            name,
            email: name + "@planning-summary.test",
            password: "local-test-password-123",
          },
        })
      ).json();
    const host = await register("host"),
      stranger = await register("stranger");
    let sequence = 0;
    async function call(actor: typeof host, path: string, payload?: object) {
      const response = await app.inject({
        method: payload ? "POST" : "GET",
        url: "/v1" + path,
        payload,
        headers: {
          authorization: "Bearer " + actor.token,
          "idempotency-key": "summary-" + ++sequence,
        },
      });
      assert.ok(response.statusCode < 300, response.body);
      return response.json();
    }
    const base = {
      name: "Monthly plan",
      amountMinor: 8400,
      frequency: "monthly",
      firstDueDate: "2026-10-31",
      participants: [host.user.id],
      planningOnly: true,
    };
    const monthly = await call(host, "/bills", base);
    const weekly = await call(host, "/bills", {
      ...base,
      name: "Flexible weekly plan",
      kind: "flexible",
      maximumMinor: 1500,
      amountMinor: 1001,
      frequency: "weekly",
      firstDueDate: "2026-11-03",
    });
    await call(host, "/bills", {
      ...base,
      name: "One-time plan",
      amountMinor: 499,
      frequency: "once",
      firstDueDate: "2026-11-05",
    });
    const card = await call(host, "/cards", { name: "Unissued setup" });
    const connected = await call(host, "/bills", {
      ...base,
      name: "Connected plan",
      amountMinor: 2000,
      cardId: card.id,
    });
    await call(stranger, "/bills", {
      ...base,
      name: "Private to stranger",
      amountMinor: 99999,
      participants: [stranger.user.id],
    });
    const summary = (scope = "all", month = "2026-11") =>
      call(host, "/bill-summary?scope=" + scope + "&month=" + month);
    const all = await summary();
    assert.equal(all.totalMinor, 0);
    assert.deepEqual(all.occurrences, []);
    assert.equal(all.planningTotalMinor, 14903);
    assert.equal(all.financialActivity, false);
    assert.equal(all.planningOccurrences.length, 7);
    assert.ok(
      all.planningOccurrences.every(
        (item: any) => item.status === "draft" && !item.agreementId,
      ),
    );
    assert.equal(
      all.planningOccurrences.find((item: any) => item.billId === monthly.id)
        .date,
      "2026-11-30",
    );
    assert.deepEqual(
      all.planningOccurrences
        .filter((item: any) => item.billId === weekly.id)
        .map((item: any) => [item.date, item.amountMinor, item.estimated]),
      [3, 10, 17, 24].map((day) => [
        "2026-11-" + String(day).padStart(2, "0"),
        1001,
        true,
      ]),
    );
    const shared = await summary("shared");
    assert.equal(shared.planningTotalMinor, 2000);
    assert.deepEqual(
      shared.planningOccurrences.map((item: any) => item.billId),
      [connected.id],
    );
    assert.equal((await summary("all", "2026-09")).planningTotalMinor, 0);
    assert.equal(
      (await call(stranger, "/bill-summary?scope=all&month=2026-11"))
        .planningTotalMinor,
      99999,
    );
    assert.equal(
      (await app.inject("/v1/bill-summary?scope=all&month=2026-11")).statusCode,
      401,
    );

    const proposed = await call(host, "/bills/" + monthly.id + "/revise", {
      ...base,
      planningOnly: false,
      expectedVersion: 1,
      expectedConnectionVersion: 1,
    });
    assert.equal((await summary()).planningTotalMinor, 6503);
    assert.equal((await summary()).totalMinor, 0);
    await call(host, "/agreements/" + proposed.agreements[0].id + "/accept", {
      termsVersion: 2,
      accepted: true,
    });
    const accepted = await summary();
    assert.equal(accepted.totalMinor, 8400);
    assert.equal(accepted.planningTotalMinor, 6503);
    assert.equal(accepted.occurrences.length, 1);
    assert.ok(
      accepted.planningOccurrences.every(
        (item: any) => item.billId !== monthly.id,
      ),
    );
    await call(host, "/bills/" + weekly.id + "/end", {
      expectedVersion: 1,
      acknowledged: true,
    });
    assert.equal((await summary()).planningTotalMinor, 2499);
  } finally {
    await app.close();
  }
});
