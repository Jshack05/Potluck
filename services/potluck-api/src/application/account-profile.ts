import { z } from "zod";
import { api, audit, one } from "../lib.ts";
import type { CommandContext, Queryable } from "./ports.ts";
export async function updateProfile(
  tx: Queryable,
  actor: string,
  context: CommandContext,
) {
  const input = z
    .strictObject({ name: z.string().trim().min(1).max(80) })
    .parse(context.body);
  const user = await one(
    tx,
    "UPDATE users SET name=$2 WHERE id=$1 AND NOT disabled RETURNING id,name,email,identity",
    [actor, input.name],
  );
  await audit(tx, actor, "account.profile_updated", actor, context.requestId, {
    fields: ["name"],
  });
  return { user: api(user) };
}
