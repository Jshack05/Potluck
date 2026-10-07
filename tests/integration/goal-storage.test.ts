import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { openDatabase } from "../../services/potluck-api/src/db.ts";
import {
  createGoal,
  getGoals,
} from "../../services/potluck-api/src/application/goals.ts";

test("Goal plans persist atomically with audit history and no financial side effects", async () => {
  const db = await openDatabase(":memory:");
  try {
    const actor = randomUUID();
    await db.query(
      "INSERT INTO users(id,email,name,identity) VALUES($1,'goal@example.test','Goal host','local')",
      [actor],
    );
    const context = {
      body: {
        name: "Trip",
        kind: "target",
        targetMinor: 120000,
        firstContributionDate: "2026-11-01",
        plannedContributions: [{ personId: actor, amountMinor: 2910 }],
      },
      resourceId: "",
      requestId: randomUUID(),
    };
    const goal = await db.transaction((tx) => createGoal(tx, actor, context));
    assert.equal(goal.plannedContributions[0].amountMinor, 2910);
    assert.equal(
      (
        await db.query(
          "SELECT * FROM audit_events WHERE action='goal.draft_created'",
        )
      ).rows.length,
      1,
    );
    assert.equal((await db.query("SELECT * FROM agreements")).rows.length, 0);
    assert.equal((await db.query("SELECT * FROM outbox")).rows.length, 0);
    await assert.rejects(
      db.transaction(async (tx) => {
        await createGoal(tx, actor, context);
        throw new Error("abort");
      }),
    );
    assert.equal((await db.query("SELECT * FROM goals")).rows.length, 1);
    assert.equal(
      (await db.query("SELECT * FROM goal_planned_contributions")).rows.length,
      1,
    );
    await assert.rejects(
      db.query("UPDATE goals SET status='active' WHERE id=$1", [goal.id]),
    );
    await assert.rejects(
      db.query("UPDATE goals SET target_minor=-1 WHERE id=$1", [goal.id]),
    );
    await assert.rejects(
      db.query(
        "UPDATE goal_planned_contributions SET amount_minor=0 WHERE goal_id=$1",
        [goal.id],
      ),
    );
    await assert.rejects(
      db.query(
        "INSERT INTO goal_planned_contributions(goal_id,person_id,amount_minor) VALUES($1,$2,100)",
        [goal.id, actor],
      ),
    );
  } finally {
    await db.close();
  }
});

test("Goal pagination reaches every owned draft without exposing another host's plans", async () => {
  const db = await openDatabase(":memory:");
  try {
    const actor = randomUUID();
    const other = randomUUID();
    await db.query(
      "INSERT INTO users(id,email,name,identity) VALUES($1,'pages@example.test','Host','local'),($2,'other-pages@example.test','Other host','local')",
      [actor, other],
    );
    const expected = new Set<string>();
    await db.transaction(async (tx) => {
      for (let index = 0; index < 52; index++) {
        const id = randomUUID();
        if (index < 51) expected.add(id);
        await tx.query(
          "INSERT INTO goals(id,host_id,name,kind,target_minor,first_contribution_date,frequency) VALUES($1,$2,'Saved plan','target',10000,'2026-11-01','monthly')",
          [id, index < 51 ? actor : other],
        );
      }
    });
    const first = await getGoals(db, {
      actor: { id: actor },
      query: {},
      resourceId: "",
    });
    assert.equal(first.items.length, 50);
    assert.equal(first.nextOffset, 50);
    const second = await getGoals(db, {
      actor: { id: actor },
      query: { offset: first.nextOffset },
      resourceId: "",
    });
    assert.equal(second.items.length, 1);
    assert.equal(second.nextOffset, null);
    assert.deepEqual(
      new Set([...first.items, ...second.items].map((goal) => goal.id)),
      expected,
    );
  } finally {
    await db.close();
  }
});
