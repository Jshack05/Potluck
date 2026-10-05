import * as queries from "../application/lifecycle-queries.ts";
import * as commands from "../application/lifecycle.ts";
import type { ModuleContext } from "./context.ts";
export function registerLifecycle({ app, db, param, mutation }: ModuleContext) {
  app.get("/v1/bill-summary", (req) =>
    queries.getBillSummary(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: "",
    }),
  );
  app.post("/v1/bills/:id/revise", async (req, reply) =>
    mutation(req, reply, 200, (tx, user) =>
      commands.reviseBill(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  for (const action of ["decline", "cancel"] as const)
    app.post("/v1/agreements/:id/" + action, async (req, reply) =>
      mutation(req, reply, 200, (tx, user) =>
        commands.respondToAgreement(
          tx,
          user,
          { body: req.body, resourceId: param(req), requestId: req.id },
          action,
        ),
      ),
    );
  app.post("/v1/bills/:id/end", async (req, reply) =>
    mutation(req, reply, 200, (tx, user) =>
      commands.endBill(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  for (const action of ["leave", "remove"] as const)
    app.post("/v1/circles/:id/" + action, async (req, reply) =>
      mutation(req, reply, 200, (tx, user) =>
        commands.changeMembership(
          tx,
          user,
          { body: req.body, resourceId: param(req), requestId: req.id },
          action,
        ),
      ),
    );
  app.post("/v1/cards/:id/close", async (req, reply) =>
    mutation(req, reply, 200, (tx, user) =>
      commands.closeCard(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  for (const type of ["bills", "cards"] as const)
    app.post("/v1/" + type + "/:id/connection", async (req, reply) =>
      mutation(req, reply, 200, (tx, user) =>
        commands.changeConnection(
          tx,
          user,
          { body: req.body, resourceId: param(req), requestId: req.id },
          type,
        ),
      ),
    );
}
