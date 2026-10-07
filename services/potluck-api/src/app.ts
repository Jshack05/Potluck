import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { id } from "@potluck/contracts";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import { ZodError, z } from "zod";
import * as queries from "./application/core-queries.ts";
import * as commands from "./application/core.ts";
import { registerAuth, type AuthOptions } from "./auth.ts";
import { openDatabase, type Queryable, type Row } from "./db.ts";
import { AppError, demand, hash, uuid } from "./lib.ts";
import { registerCircleAdministration } from "./modules/circle-administration.ts";
import { registerDiscovery } from "./modules/discovery.ts";
import { registerLifecycle } from "./modules/lifecycle.ts";
import { registerGoals } from "./modules/goals.ts";
import { registerPeople } from "./modules/people.ts";
import { updateProfile } from "./application/account-profile.ts";
import { registerOnboarding, type BankOnboardingReader } from "./onboarding.ts";

export type Options = AuthOptions & {
  database: string;
  origins?: string[];
  bankOnboarding?: BankOnboardingReader;
};
export async function createApp(options: Options) {
  demand(
    options.mode === "local" ||
      (options.mode === "production" &&
        options.supabaseUrl?.startsWith("https://") &&
        options.supabaseKey &&
        /^postgres(ql)?:/.test(options.database)),
    500,
    "CONFIGURATION",
    "Production configuration requires external authentication and PostgreSQL.",
  );
  const db = await openDatabase(options.database);
  const app = Fastify({
    logger: false,
    bodyLimit: 65536,
    genReqId: () => uuid(),
  });
  app.addHook("onClose", () => db.close());
  await app.register(cors, {
    origin: options.origins ?? [
      "http://localhost:8081",
      "http://localhost:8082",
      "http://localhost:8083",
      "http://127.0.0.1:8081",
    ],
    allowedHeaders: ["content-type", "authorization", "idempotency-key"],
  });
  await app.register(rateLimit, { max: 120, timeWindow: "1 minute" });
  registerAuth(app, db, options);
  registerOnboarding(app, options.bankOnboarding);
  app.setErrorHandler((error, req, reply) => {
    const e = error as Error & { code?: string; statusCode?: number };
    const status =
      error instanceof AppError
        ? error.status
        : error instanceof ZodError
          ? 400
          : e.code === "23505"
            ? 409
            : [400, 413, 415, 429].includes(e.statusCode ?? 0)
              ? e.statusCode!
              : 500;
    const code =
      error instanceof AppError
        ? error.code
        : error instanceof ZodError
          ? "INVALID_INPUT"
          : status === 409
            ? "CONFLICT"
            : status === 400 || status === 415
              ? "INVALID_INPUT"
              : status === 413
                ? "REQUEST_TOO_LARGE"
                : status === 429
                  ? "RATE_LIMITED"
                  : "INTERNAL_ERROR";
    // Only public authentication fields receive hints. Never serialize Zod
    // issues, submitted values, or internal validation paths into API errors.
    const fields: Record<string, string> = {};
    if (
      error instanceof ZodError &&
      ["/v1/local/accounts", "/v1/local/session"].includes(
        req.routeOptions.url ?? "",
      )
    ) {
      const hints: Record<string, string> = {
        name: "Enter your name (1–80 characters).",
        email:
          "Enter a valid email address, such as you@example.com (up to 254 characters).",
        password: "Use a password with 12–200 characters.",
      };
      for (const issue of error.issues) {
        const field = String(issue.path[0]);
        if (Object.hasOwn(hints, field)) fields[field] = hints[field];
      }
    }
    const message =
      error instanceof AppError
        ? error.message
        : error instanceof ZodError
          ? Object.values(fields).join(" ") ||
            "Some details are invalid. Check your entries and try again."
          : status === 409
            ? "This action conflicts with an existing item."
            : status === 400 || status === 415
              ? "Check the request and try again."
              : status === 413
                ? "This request is too large."
                : status === 429
                  ? "Please wait before trying again."
                  : "Something went wrong. Please try again.";
    if (status === 500 && options.mode === "local")
      console.error(
        JSON.stringify({
          event: "request_failed",
          requestId: req.id,
          errorClass: e.name,
        }),
      );
    reply.code(status).send({
      error: {
        code,
        message,
        ...(Object.keys(fields).length ? { fields } : {}),
      },
      requestId: req.id,
    });
  });
  const actor = (req: FastifyRequest) => {
    demand(req.actor, 401, "SIGN_IN_REQUIRED", "Sign in to continue.");
    return req.actor.id;
  };
  const param = (req: FastifyRequest) =>
    id.parse((req.params as { id: string }).id);
  async function mutation(
    req: FastifyRequest,
    reply: FastifyReply,
    status: number,
    fn: (tx: Queryable, actor: string) => Promise<Row>,
  ) {
    const user = actor(req);
    const key = z
      .string()
      .min(8)
      .max(128)
      .parse(req.headers["idempotency-key"]);
    const fingerprint = hash(
      JSON.stringify([req.method, req.url, req.body ?? null]),
    );
    const result = await db.transaction(async (tx) => {
      await tx.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        user + "|" + key,
      ]);
      const prior = (
        await tx.query(
          "SELECT * FROM idempotency WHERE actor_id=$1 AND key=$2",
          [user, key],
        )
      ).rows[0];
      if (prior) {
        demand(
          prior.request_hash === fingerprint,
          409,
          "IDEMPOTENCY_CONFLICT",
          "This request key was already used for another action.",
        );
        return { status: prior.status_code, body: prior.response };
      }
      const body = await fn(tx, user);
      await tx.query(
        "INSERT INTO idempotency(actor_id,key,request_hash,response,status_code) VALUES($1,$2,$3,$4,$5)",
        [user, key, fingerprint, JSON.stringify(body), status],
      );
      return { status, body };
    });
    return reply.code(result.status).send(result.body);
  }
  app.get("/health", async () => ({ status: "ok", mode: options.mode }));
  app.get("/v1/capabilities", async () => ({
    mode: options.mode,
    financial: { issuance: false, funding: false, spending: false },
    housingVerification: false,
  }));
  app.get("/v1/circles", (req) =>
    queries.getCircles(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: "",
    }),
  );
  app.post("/v1/circles", async (req, reply) =>
    mutation(req, reply, 201, (tx, user) =>
      commands.createCircle(tx, user, {
        body: req.body,
        resourceId: "",
        requestId: req.id,
      }),
    ),
  );
  app.get("/v1/circles/:id", (req) =>
    queries.getCirclesDetail(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: param(req),
    }),
  );
  app.post("/v1/circles/:id/invitations", async (req, reply) =>
    mutation(req, reply, 201, (tx, user) =>
      commands.inviteToCircle(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  // Separate from the social /circles namespace: financial readiness is required.
  app.get("/v1/circle-arrangements/:id", (req) =>
    queries.getCircleArrangements(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: param(req),
    }),
  );
  app.get("/v1/invitations", (req) =>
    queries.getInvitations(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: "",
    }),
  );
  for (const action of ["accept", "decline", "revoke"] as const)
    app.post("/v1/invitations/:id/" + action, async (req, reply) =>
      mutation(req, reply, 200, (tx, user) =>
        commands.respondToInvitation(
          tx,
          user,
          { body: req.body, resourceId: param(req), requestId: req.id },
          action,
        ),
      ),
    );
  app.get("/v1/cards", (req) =>
    queries.getCards(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: "",
    }),
  );
  app.post("/v1/cards", async (req, reply) =>
    mutation(req, reply, 201, (tx, user) =>
      commands.createCard(tx, user, {
        body: req.body,
        resourceId: "",
        requestId: req.id,
      }),
    ),
  );
  app.get("/v1/cards/:id", (req) =>
    queries.getCardsDetail(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: param(req),
    }),
  );
  app.post("/v1/cards/:id/activate", async (req, reply) =>
    mutation(req, reply, 200, (tx, user) =>
      commands.activateCard(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  app.get("/v1/bills", (req) =>
    queries.getBills(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: "",
    }),
  );
  app.post("/v1/bills", async (req, reply) =>
    mutation(req, reply, 201, (tx, user) =>
      commands.createBill(tx, user, {
        body: req.body,
        resourceId: "",
        requestId: req.id,
      }),
    ),
  );
  app.get("/v1/bills/:id", (req) =>
    queries.getBillsDetail(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: param(req),
    }),
  );
  app.get("/v1/agreements/:id", (req) =>
    queries.getAgreementsDetail(db, {
      actor: req.actor ?? null,
      query: req.query,
      resourceId: param(req),
    }),
  );
  app.post("/v1/agreements/:id/accept", async (req, reply) =>
    mutation(req, reply, 200, (tx, user) =>
      commands.acceptAgreement(tx, user, {
        body: req.body,
        resourceId: param(req),
        requestId: req.id,
      }),
    ),
  );
  registerDiscovery({ app, db, actor, param, mutation });
  registerLifecycle({ app, db, actor, param, mutation });
  registerCircleAdministration({ app, db, actor, param, mutation });
  registerGoals({ app, db, actor, param, mutation });
  registerPeople({ app, db, actor, param, mutation });
  app.post("/v1/settings/profile", (req, reply) =>
    mutation(req, reply, 200, (tx, user) =>
      updateProfile(tx, user, {
        body: req.body,
        resourceId: "",
        requestId: req.id,
      }),
    ),
  );
  return app;
}
