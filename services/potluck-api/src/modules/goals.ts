import * as goals from "../application/goals.ts";
import type { ModuleContext } from "./context.ts";
export function registerGoals({ app, db, param, mutation }: ModuleContext) {
  app.get("/v1/goals", (req) =>
    goals.getGoals(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: "",
    }),
  );
  app.get("/v1/goals/:id", (req) =>
    goals.getGoal(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: param(req),
    }),
  );
  app.post("/v1/goals", (req, reply) =>
    mutation(req, reply, 201, (tx, actor) =>
      goals.createGoal(tx, actor, {
        body: req.body,
        resourceId: "",
        requestId: req.id,
      }),
    ),
  );
}
