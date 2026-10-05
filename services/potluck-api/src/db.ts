import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import pg from "pg";
import type { Database } from "./application/ports.ts";
export type { Database, Queryable, Row } from "./application/ports.ts";
export async function openDatabase(path: string): Promise<Database> {
  let db: Database;
  if (/^postgres(ql)?:/.test(path)) {
    const pool = new pg.Pool({
      connectionString: path,
      max: 10,
      options: "-c search_path=potluck,public",
    });
    db = {
      query: (sql, values) => pool.query(sql, values),
      exec: (sql) => pool.query(sql),
      transaction: async (fn) => {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          const result = await fn({
            query: (sql, values) => client.query(sql, values),
            exec: (sql) => client.query(sql),
          });
          await client.query("COMMIT");
          return result;
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        } finally {
          client.release();
        }
      },
      close: () => pool.end(),
    };
  } else {
    const engine = new PGlite(path === ":memory:" ? undefined : path);
    await engine.waitReady;
    db = {
      query: (sql, values) => engine.query(sql, values),
      exec: (sql) => engine.exec(sql),
      transaction: (fn) => engine.transaction((tx) => fn(tx)),
      close: () => engine.close(),
    };
  }
  await db.query("CREATE SCHEMA IF NOT EXISTS potluck");
  await db.query("SET search_path = potluck, public");
  await db.query(
    "CREATE TABLE IF NOT EXISTS potluck.schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  const directory = fileURLToPath(
    new URL("../../../db/migrations/", import.meta.url),
  );
  for (const name of (await readdir(directory))
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    await db.transaction(async (tx) => {
      await tx.query("SELECT pg_advisory_xact_lock(73418)");
      if (
        (
          await tx.query(
            "SELECT name FROM potluck.schema_migrations WHERE name=$1",
            [name],
          )
        ).rows.length
      )
        return;
      const sql = await readFile(directory + name, "utf8");
      await tx.exec(sql);
      await tx.query("INSERT INTO potluck.schema_migrations(name) VALUES($1)", [
        name,
      ]);
    });
  }
  return db;
}
