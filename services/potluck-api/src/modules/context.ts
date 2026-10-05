import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Database, Queryable, Row } from "../db.ts";
export type ModuleContext = {
  app: FastifyInstance;
  db: Database;
  actor: (req: FastifyRequest) => string;
  param: (req: FastifyRequest) => string;
  mutation: (
    req: FastifyRequest,
    reply: FastifyReply,
    status: number,
    fn: (tx: Queryable, actor: string) => Promise<Row>,
  ) => Promise<unknown>;
};
