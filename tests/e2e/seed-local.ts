// Disposable local-development records only. This utility refuses a nonlocal API.
import { randomUUID } from "node:crypto";
const base = "http://127.0.0.1:4100";
const health = await fetch(base + "/health").then((r) => r.json());
if (health.mode !== "local") throw new Error("Local mode is required");
async function call(path: string, body?: object, token?: string) {
  const r = await fetch(base + "/v1" + path, {
    method: body ? "POST" : "GET",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: "Bearer " + token } : {}),
      "idempotency-key": randomUUID(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const value = await r.json();
  if (!r.ok) throw new Error(value.error?.code ?? String(r.status));
  return value;
}
const password = "LocalOnly-Potluck-QA-2026";
async function account(name: string, email: string) {
  try {
    return await call("/local/accounts", { name, email, password });
  } catch (e) {
    if ((e as Error).message !== "CONFLICT") throw e;
    return call("/local/session", { email, password });
  }
}
const host = await account("QA Maya", "qa-maya@potluck.test"),
  guest = await account("QA Jordan", "qa-jordan@potluck.test");
const h = (path: string, body?: object) => call(path, body, host.token);
const existing = await h("/my-listings");
if (!existing.items.length) {
  const listing = await h("/listings", {
    title: "Netflix Premium · QA household",
    brand: "Netflix",
    category: "subscriptions",
    description:
      "Local test listing for an eligible household. Discuss access and the current provider terms before agreeing.",
    shareMinor: 1000,
    totalMinor: 4000,
    capacity: 4,
    filled: 3,
  });
  await h("/listings/" + listing.id + "/publish", { expectedVersion: 1 });
}
const circles = await h("/circles");
if (!circles.items.length) {
  const circle = await h("/circles", {
    name: "QA Movie Circle",
    description: "Local test Circle for the complete app journey.",
  });
  await h("/circles/" + circle.id + "/invitations", {
    email: "qa-jordan@potluck.test",
  });
  const card = await h("/cards", {
    name: "QA Shared essentials",
    circleId: circle.id,
    design: "aurora",
  });
  await h("/bills", {
    name: "QA Internet",
    circleId: circle.id,
    cardId: card.id,
    amountMinor: 6000,
    firstDueDate: "2026-11-01",
    participants: [host.user.id],
  });
}
console.log(
  "Local QA records ready. Accounts: qa-maya@potluck.test and qa-jordan@potluck.test. No financial provider is called.",
);
