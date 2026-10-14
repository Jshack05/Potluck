import {
  authorizeCardAppearance,
  saveCardAppearance,
} from "../application/card-appearance.ts";
import type { ModuleContext } from "./context.ts";

export function registerCardAppearance({
  app,
  param,
  mutation,
}: ModuleContext) {
  app.post("/v1/cards/:id/appearance", (req, reply) =>
    mutation(
      req,
      reply,
      200,
      (tx, user) =>
        saveCardAppearance(tx, user, {
          body: req.body,
          resourceId: param(req),
          requestId: req.id,
        }),
      async (tx, user) => {
        await authorizeCardAppearance(tx, user, param(req));
      },
    ),
  );
}
