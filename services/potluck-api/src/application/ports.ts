export type Row = Record<string, any>;
export interface Queryable {
  query<T extends Row = Row>(
    sql: string,
    values?: unknown[],
  ): Promise<{ rows: T[] }>;
  exec(sql: string): Promise<unknown>;
}
export interface Database extends Queryable {
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
export type CommandContext = {
  body: unknown;
  resourceId: string;
  requestId: string;
};
