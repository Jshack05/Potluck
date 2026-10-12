import {
  authorizeMerchantControls,
  getMerchantControls,
  saveMerchantControls,
} from "../application/card-merchant-controls.ts";
import type { ModuleContext } from "./context.ts";

export function registerCardMerchantControls({
  app,
  db,
  actor,
  param,
  mutation,
}: ModuleContext) {
  app.get("/v1/cards/:id/merchant-controls", (req) =>
    getMerchantControls(db, actor(req), param(req)),
  );
  app.post("/v1/cards/:id/merchant-controls", (req, reply) =>
    mutation(
      req,
      reply,
      200,
      (tx, user) =>
        saveMerchantControls(tx, user, {
          body: req.body,
          resourceId: param(req),
          requestId: req.id,
        }),
      // Run inside the transaction, even when a completed request is being replayed.
      (tx, user) => authorizeMerchantControls(tx, user, param(req), true),
    ),
  );
}
