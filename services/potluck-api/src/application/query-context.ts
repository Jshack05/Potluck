import { demand } from "../lib.ts";
export type QueryContext = {
  actor: { id: string } | null;
  query: unknown;
  resourceId: string;
};
export function requiredActor(actor: QueryContext["actor"]) {
  demand(actor, 401, "SIGN_IN_REQUIRED", "Sign in to continue.");
  return actor.id;
}
