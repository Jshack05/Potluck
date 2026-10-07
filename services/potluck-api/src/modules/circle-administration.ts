import * as queries from "../application/circle-administration-queries.ts";
import * as commands from "../application/circle-administration.ts";
import { respondToInvitation } from "../application/circle-flows.ts";
import type { ModuleContext } from "./context.ts";
export function registerCircleAdministration({
  app,
  db,
  param,
  mutation,
}: ModuleContext) {
  app.get("/v1/circles/:id/invitations", (req) =>
    queries.getCircleInvitations(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: param(req),
    }),
  );
  app.get("/v1/circles/:id/transfers", (req) =>
    queries.getCircleTransferHistory(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: param(req),
    }),
  );
  app.get("/v1/invitations/:id", (req) =>
    queries.getInvitation(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: param(req),
    }),
  );
  app.get("/v1/circle-transfers/:id", (req) =>
    queries.getCircleTransfer(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: param(req),
    }),
  );
  app.post("/v1/invitations/:id/approve", async (req, reply) =>
    mutation(req, reply, 200, (tx, user) =>
      respondToInvitation(
        tx,
        user,
        { body: req.body, resourceId: param(req), requestId: req.id },
        "approve",
      ),
    ),
  );
  app.post("/v1/circles/:id/edit", async (req, reply) =>
    mutation(req, reply, 200, (tx, user) =>
      commands.editCircle(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  app.get("/v1/circle-transfers", (req) =>
    queries.getCircleTransfers(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: "",
    }),
  );
  app.post("/v1/circles/:id/transfer", async (req, reply) =>
    mutation(req, reply, 201, (tx, user) =>
      commands.proposeHosting(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  for (const action of ["accept", "decline", "revoke"] as const)
    app.post("/v1/circle-transfers/:id/" + action, async (req, reply) =>
      mutation(req, reply, 200, (tx, user) =>
        commands.respondToHosting(
          tx,
          user,
          { body: req.body, resourceId: param(req), requestId: req.id },
          action,
        ),
      ),
    );
  app.post("/v1/circles/:id/archive", async (req, reply) =>
    mutation(req, reply, 200, (tx, user) =>
      commands.archiveCircle(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
}
