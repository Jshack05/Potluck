import { createHash, randomUUID } from "node:crypto";
import type { Queryable, Row } from "./db.ts";
export class AppError extends Error {
  code: string;
  status: number;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
export function demand(
  ok: unknown,
  status: number,
  code: string,
  message: string,
): asserts ok {
  if (!ok) throw new AppError(status, code, message);
}
export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const uuid = randomUUID;
export function api(row: Row): Row {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()),
      value instanceof Date ? value.toISOString() : value,
    ]),
  );
}
export async function one(
  tx: Queryable,
  sql: string,
  values: unknown[] = [],
): Promise<Row> {
  const row = (await tx.query(sql, values)).rows[0];
  demand(row, 404, "NOT_FOUND", "This item is not available.");
  return row;
}
export async function audit(
  tx: Queryable,
  actor: string,
  action: string,
  resource: string,
  requestId: string,
  metadata: Row = {},
) {
  await tx.query(
    "INSERT INTO audit_events(id,actor_id,action,resource_id,request_id,metadata) VALUES($1,$2,$3,$4,$5,$6)",
    [uuid(), actor, action, resource, requestId, JSON.stringify(metadata)],
  );
}
export async function notify(
  tx: Queryable,
  recipient: string,
  kind: string,
  resource: string,
) {
  await tx.query(
    "INSERT INTO outbox(id,recipient_id,kind,resource_id) VALUES($1,$2,$3,$4)",
    [uuid(), recipient, kind, resource],
  );
}
export async function member(
  tx: Queryable,
  circleId: string,
  userId: string,
  lock = false,
): Promise<Row> {
  return one(
    tx,
    "SELECT c.* FROM circles c JOIN memberships m ON m.circle_id=c.id WHERE c.id=$1 AND m.user_id=$2 AND m.status='accepted' AND c.status='active'" +
      (lock ? " FOR UPDATE OF c,m" : ""),
    [circleId, userId],
  );
}
export async function attachable(
  tx: Queryable,
  circleId: string | null,
  actor: string,
) {
  if (!circleId) return;
  const circle = await member(tx, circleId, actor, true);
  demand(
    circle.privacy === "normal" || circle.host_id === actor,
    403,
    "FORBIDDEN",
    "Only the Circle Host can attach an item here.",
  );
}
export async function unblocked(tx: Queryable, a: string, b: string) {
  const blocked = await tx.query(
    "SELECT 1 FROM blocks WHERE (user_id=$1 AND blocked_id=$2) OR (user_id=$2 AND blocked_id=$1)",
    [a, b],
  );
  demand(
    !blocked.rows.length,
    403,
    "UNAVAILABLE",
    "This interaction is unavailable.",
  );
}
