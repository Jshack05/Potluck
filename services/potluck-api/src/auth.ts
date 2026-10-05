import type { Actor } from "@potluck/contracts";
import type { FastifyInstance } from "fastify";
import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { z } from "zod";
import type { Database } from "./db.ts";
import { audit, demand, hash, uuid } from "./lib.ts";
const scrypt = promisify(scryptCallback);
const credentials = z.strictObject({
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(12).max(200),
});
const registration = credentials.extend({
  name: z.string().trim().min(1).max(80),
});
export type AuthOptions = {
  mode: "local" | "production";
  supabaseUrl?: string;
  supabaseKey?: string;
};
export function registerAuth(
  app: FastifyInstance,
  db: Database,
  options: AuthOptions,
) {
  app.decorateRequest("actor", null);
  app.addHook("preHandler", async (req) => {
    req.actor = null;
    const token = req.headers.authorization?.match(/^Bearer ([^ ]+)$/)?.[1];
    if (!token) return;
    if (options.mode === "local") {
      const result = await db.query(
        "SELECT u.id,u.name,u.email,u.identity FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires_at>now() AND NOT u.disabled",
        [hash(token)],
      );
      req.actor = (result.rows[0] as Actor) ?? null;
    } else {
      const response = await fetch(options.supabaseUrl + "/auth/v1/user", {
        headers: {
          apikey: options.supabaseKey!,
          Authorization: "Bearer " + token,
        },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) return;
      const user = (await response.json()) as {
        id?: string;
        email?: string;
        email_confirmed_at?: string;
        user_metadata?: { name?: string };
      };
      if (!user.email_confirmed_at || !user.id || !user.email) return;
      z.uuid().parse(user.id);
      const displayName =
        user.user_metadata?.name?.trim().slice(0, 80) ||
        user.email.split("@")[0];
      const result = await db.query(
        "INSERT INTO users(id,email,name,identity) VALUES($1,$2,$3,'supabase') ON CONFLICT(id) DO UPDATE SET email=EXCLUDED.email RETURNING id,email,name,identity,disabled",
        [user.id, user.email.toLowerCase(), displayName],
      );
      if (!result.rows[0].disabled) req.actor = result.rows[0] as Actor;
    }
  });
  const session = async (user: Actor) => {
    const token = randomBytes(32).toString("base64url");
    await db.query(
      "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '24 hours')",
      [hash(token), user.id],
    );
    return { token, user, mode: "local", expiresIn: 86400 };
  };
  if (options.mode === "local") {
    app.post(
      "/v1/local/accounts",
      { config: { rateLimit: { max: 8, timeWindow: "1 minute" } } },
      async (req, reply) => {
        const input = registration.parse(req.body);
        const salt = randomBytes(16).toString("hex");
        const digest = (await scrypt(input.password, salt, 64)) as Buffer;
        const actor: Actor = {
          id: uuid(),
          name: input.name,
          email: input.email,
          identity: "local",
        };
        await db.transaction(async (tx) => {
          await tx.query(
            "INSERT INTO users(id,email,name,identity,password_hash) VALUES($1,$2,$3,'local',$4)",
            [
              actor.id,
              actor.email,
              actor.name,
              salt + ":" + digest.toString("hex"),
            ],
          );
          await audit(tx, actor.id, "account.created", actor.id, req.id, {
            identity: "local",
          });
        });
        return reply.code(201).send(await session(actor));
      },
    );
    app.post(
      "/v1/local/session",
      { config: { rateLimit: { max: 8, timeWindow: "1 minute" } } },
      async (req) => {
        const input = credentials.parse(req.body);
        const user = (
          await db.query(
            "SELECT * FROM users WHERE email=$1 AND identity='local' AND NOT disabled",
            [input.email],
          )
        ).rows[0];
        const [salt, expected] = (
          user?.password_hash ??
          "00000000000000000000000000000000:" + "00".repeat(64)
        ).split(":");
        const digest = (await scrypt(input.password, salt, 64)) as Buffer;
        demand(
          user && timingSafeEqual(digest, Buffer.from(expected, "hex")),
          401,
          "SIGN_IN_FAILED",
          "Check your email and password.",
        );
        return session({
          id: user.id,
          name: user.name,
          email: user.email,
          identity: "local",
        });
      },
    );
  }
  app.get("/v1/me", async (req) => {
    demand(req.actor, 401, "SIGN_IN_REQUIRED", "Sign in to continue.");
    return { user: req.actor, mode: options.mode };
  });
  app.post("/v1/sign-out", async (req) => {
    demand(req.actor, 401, "SIGN_IN_REQUIRED", "Sign in to continue.");
    demand(
      options.mode === "local",
      501,
      "AUTH_CONFIGURATION_REQUIRED",
      "Hosted session revocation has not been configured. This session has not been revoked.",
    );
    if (options.mode === "local")
      await db.query("DELETE FROM sessions WHERE token_hash=$1", [
        hash(req.headers.authorization!.slice(7)),
      ]);
    return { signedOut: true };
  });
}
declare module "fastify" {
  interface FastifyRequest {
    actor: Actor | null;
  }
}
