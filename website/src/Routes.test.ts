// @vitest-environment node
import { preview, type PreviewServer } from "vite";
import { afterAll, beforeAll, expect, test } from "vitest";

let server: PreviewServer;
let base: string;
beforeAll(async () => {
  server = await preview({
    preview: { host: "127.0.0.1", port: 0, strictPort: true },
  });
  const address = server.httpServer.address();
  if (!address || typeof address === "string")
    throw new Error("Missing preview port");
  base = `http://127.0.0.1:${address.port}`;
});
afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.httpServer.close((error) => (error ? reject(error) : resolve())),
  );
});

test("direct feature requests with and without a trailing slash return their own HTML", async () => {
  for (const path of [
    "splitfinder",
    "cards",
    "bills",
    "circles",
    "credits",
    "contact",
  ]) {
    for (const suffix of ["", "/"]) {
      const response = await fetch(`${base}/${path}${suffix}`);
      expect(response.status).toBe(200);
      expect(await response.text()).toContain(
        `href="https://getpotluck.app/${path}/"`,
      );
    }
  }
});
test("unknown paths return 404 instead of the homepage with mismatched hydration", async () => {
  const response = await fetch(`${base}/missing-page/`);
  expect(response.status).toBe(404);
});
