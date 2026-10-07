import { findPeople } from "../application/people.ts";
import type { ModuleContext } from "./context.ts";
export function registerPeople({ app, db }: ModuleContext) {
  app.get(
    "/v1/people",
    { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
    (req) =>
      findPeople(db, {
        actor: req.actor ?? null,
        query: req.query,
        resourceId: "",
      }),
  );
}
