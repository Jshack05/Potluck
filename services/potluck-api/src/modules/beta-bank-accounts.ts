import {
  connectBetaBankAccounts,
  listBetaBankAccounts,
  requireBetaBankMode,
} from "../application/beta-bank-accounts.ts";
import type { ModuleContext } from "./context.ts";

export function registerBetaBankAccounts(
  { app, db, actor, mutation }: ModuleContext,
  enabled: boolean,
) {
  app.get("/v1/beta/bank-accounts", (req) =>
    listBetaBankAccounts(db, actor(req), enabled),
  );
  app.post("/v1/beta/bank-accounts/connect", (req, reply) => {
    // Check before idempotency replay as well as inside the command.
    requireBetaBankMode(enabled);
    return mutation(req, reply, 201, (tx, user) =>
      connectBetaBankAccounts(
        tx,
        user,
        { body: req.body, resourceId: "", requestId: req.id },
        enabled,
      ),
    );
  });
}
