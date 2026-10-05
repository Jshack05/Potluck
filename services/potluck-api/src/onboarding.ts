import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AppError, demand } from "./lib.ts";

/** Read only: the future provider adapter must persist verified, actor-bound proof.
 * Neither a client callback nor an account flag is sufficient evidence. */
export type BankOnboardingReader = {
  readConfirmation: (actorId: string) => Promise<unknown>;
};
const confirmation = z.strictObject({
  actorId: z.uuid(),
  providerReference: z.string().trim().min(1).max(200),
  confirmedAt: z.iso.datetime(),
});
export function registerOnboarding(
  app: FastifyInstance,
  bank?: BankOnboardingReader,
) {
  async function status(actorId: string) {
    if (!bank)
      return {
        access: "bank_required",
        bankConnection: "unavailable",
      } as const;
    let result: unknown;
    try {
      result = await bank.readConfirmation(actorId);
    } catch {
      throw new AppError(
        503,
        "BANK_STATUS_UNAVAILABLE",
        "We couldn't confirm your bank connection. Please try again.",
      );
    }
    if (result === null)
      return {
        access: "bank_required",
        bankConnection: "not_connected",
      } as const;
    const proof = confirmation.safeParse(result);
    demand(
      proof.success &&
        proof.data.actorId === actorId &&
        Date.parse(proof.data.confirmedAt) <= Date.now(),
      503,
      "BANK_STATUS_UNAVAILABLE",
      "We couldn't confirm your bank connection. Please try again.",
    );
    return { access: "ready", bankConnection: "confirmed" } as const;
  }
  const entryRoutes = new Set([
    "/health",
    "/v1/capabilities",
    "/v1/local/accounts",
    "/v1/local/session",
    "/v1/me",
    "/v1/sign-out",
    "/v1/onboarding",
  ]);
  app.addHook("preHandler", async (req) => {
    const path = req.routeOptions.url;
    if (!path || entryRoutes.has(path)) return;
    demand(req.actor, 401, "SIGN_IN_REQUIRED", "Sign in to continue.");
    // Account-only social scopes. New or financial scopes retain the bank gate.
    if (
      /^\/v1\/(circles|circle-transfers|invitations|brands|listings|my-listings|profiles|requests|conversations|blocks|saved|notifications)(\/|$)/.test(
        path,
      )
    )
      return;
    const result = await status(req.actor.id);
    demand(
      result.access === "ready",
      403,
      "BANK_CONNECTION_REQUIRED",
      "Connect your bank account to use Cards and Bills.",
    );
  });
  app.get("/v1/onboarding", async (req) => {
    demand(req.actor, 401, "SIGN_IN_REQUIRED", "Sign in to continue.");
    return status(req.actor.id);
  });
}
