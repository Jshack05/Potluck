/** Organization is account-scoped; provider actions remain explicitly gated.
 * Route templates (not user URLs) are matched so new money-moving endpoints
 * cannot accidentally inherit permission from a broad /cards or /bills prefix. */
const planningReads = new Set([
  "/v1/cards",
  "/v1/cards/:id",
  "/v1/bills",
  "/v1/bills/:id",
  "/v1/agreements/:id",
  "/v1/bill-summary",
  "/v1/circle-arrangements/:id",
  "/v1/goals",
  "/v1/goals/:id",
  "/v1/people",
  "/v1/settings",
]);
const planningWrites = new Set([
  "/v1/cards",
  "/v1/cards/:id/connection",
  "/v1/cards/:id/close",
  "/v1/bills",
  "/v1/bills/:id/revise",
  "/v1/bills/:id/connection",
  "/v1/bills/:id/end",
  "/v1/agreements/:id/accept",
  "/v1/agreements/:id/decline",
  "/v1/agreements/:id/cancel",
  "/v1/goals",
  "/v1/settings",
  "/v1/settings/profile",
]);
export function accountPlanningRoute(method: string, route: string) {
  return method === "GET"
    ? planningReads.has(route)
    : method === "POST" && planningWrites.has(route);
}
