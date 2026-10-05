import { mkdir } from "node:fs/promises";
import { createApp } from "./app.ts";
const mode = process.env.POTLUCK_MODE ?? "local";
if (mode !== "production" && mode !== "local")
  throw new Error("POTLUCK_MODE must be local or production.");
if (process.env.NODE_ENV === "production" && mode !== "production")
  throw new Error("Production cannot use local identity.");
if (mode === "local") await mkdir(".local", { recursive: true });
const app = await createApp({
  mode,
  database: process.env.DATABASE_URL ?? ".local/potluck-db",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_PUBLISHABLE_KEY,
  origins: process.env.ALLOWED_ORIGINS?.split(","),
});
await app.listen({
  host: process.env.API_HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 4100),
});
console.log(
  "Potluck API ready on port " +
    (process.env.PORT ?? 4100) +
    " (" +
    mode +
    "). Financial execution is unavailable.",
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, async () => {
    await app.close();
    process.exit(0);
  });
