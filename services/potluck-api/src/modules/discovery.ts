import * as queries from "../application/discovery-queries.ts";
import * as commands from "../application/discovery.ts";
import type { ModuleContext } from "./context.ts";
export function registerDiscovery({ app, db, param, mutation }: ModuleContext) {
  app.get("/v1/brands", (req) =>
    queries.getBrands(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: "",
    }),
  );
  app.get("/v1/listings", (req) =>
    queries.getListings(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: "",
    }),
  );
  app.get("/v1/my-listings", (req) =>
    queries.getMyListings(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: "",
    }),
  );
  app.get("/v1/profiles/:id", (req) =>
    queries.getProfilesDetail(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: param(req),
    }),
  );
  app.get("/v1/listings/:id", (req) =>
    queries.getListingsDetail(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: param(req),
    }),
  );
  app.post("/v1/listings", async (req, reply) =>
    mutation(req, reply, 201, (tx, user) =>
      commands.createListing(tx, user, {
        body: req.body,
        resourceId: "",
        requestId: req.id,
      }),
    ),
  );
  app.post("/v1/listings/:id/publish", async (req, reply) =>
    mutation(req, reply, 200, (tx, user) =>
      commands.publishListing(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  app.post("/v1/listings/:id/edit", async (req, reply) =>
    mutation(req, reply, 200, (tx, user) =>
      commands.editListing(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  app.post("/v1/listings/:id/close", async (req, reply) =>
    mutation(req, reply, 200, (tx, user) =>
      commands.closeListing(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  app.post("/v1/listings/:id/requests", async (req, reply) =>
    mutation(req, reply, 201, (tx, user) =>
      commands.requestListing(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  app.get("/v1/requests", (req) =>
    queries.getRequests(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: "",
    }),
  );
  for (const action of ["accept", "decline", "withdraw"] as const)
    app.post("/v1/requests/:id/" + action, async (req, reply) =>
      mutation(req, reply, 200, (tx, user) =>
        commands.respondToRequest(
          tx,
          user,
          { body: req.body, resourceId: param(req), requestId: req.id },
          action,
        ),
      ),
    );
  app.get("/v1/conversations", (req) =>
    queries.getConversations(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: "",
    }),
  );
  app.get("/v1/conversations/:id", (req) =>
    queries.getConversationsDetail(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: param(req),
    }),
  );
  app.post("/v1/conversations/:id/messages", async (req, reply) =>
    mutation(req, reply, 201, (tx, user) =>
      commands.sendMessage(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  app.post("/v1/conversations/:id/circle-invitation", async (req, reply) =>
    mutation(req, reply, 201, (tx, user) =>
      commands.inviteFromConversation(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  app.post("/v1/blocks", async (req, reply) =>
    mutation(req, reply, 200, (tx, user) =>
      commands.blockUser(tx, user, {
        body: req.body,
        resourceId: "",
        requestId: req.id,
      }),
    ),
  );
  app.post("/v1/listings/:id/report", async (req, reply) =>
    mutation(req, reply, 201, (tx, user) =>
      commands.reportListing(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  app.get("/v1/saved", (req) =>
    queries.getSaved(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: "",
    }),
  );
  app.post("/v1/listings/:id/save", async (req, reply) =>
    mutation(req, reply, 200, (tx, user) =>
      commands.saveListing(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  app.get("/v1/notifications", (req) =>
    queries.getNotifications(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: "",
    }),
  );
  app.post("/v1/notifications/:id/read", async (req, reply) =>
    mutation(req, reply, 200, (tx, user) =>
      commands.readNotification(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
}
