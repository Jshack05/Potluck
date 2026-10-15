import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const fromRouter = createRequire(require.resolve("expo-router/package.json"));
const fromDevtools = createRequire(
  require.resolve("react-devtools-core/package.json"),
);

test("shell quoting rejects line terminators after a comment token", () => {
  const { quote } = fromDevtools("shell-quote");
  for (const newline of ["\n", "\r", "\u2028", "\u2029"]) {
    assert.throws(
      () => quote(["echo", { comment: "note" }, `value${newline}suffix`]),
      TypeError,
    );
  }
});

test("router query parsing preserves return destinations, Unicode and arrays", () => {
  const query = fromRouter("query-string");
  const values = {
    returnTo: "/card/card-1/edit?from=settings",
    name: "José Smith + family",
    industry: ["groceries", "utilities"],
  };
  const encoded = query.stringify(values);
  assert.deepEqual({ ...query.parse(encoded) }, values);
  assert.equal(query.parse("name=Family+card").name, "Family card");
  assert.equal(query.parse("name=100%25").name, "100%");
});

test("router completes malformed decoding within a bounded worker", () => {
  const queryPath = fromRouter.resolve("query-string");
  // Run the actual consumer in a separate process so a regression cannot hang the suite.
  const result = spawnSync(
    process.execPath,
    [
      "-e",
      `
    const query = require(${JSON.stringify(queryPath)});
    const input = '%C0'.repeat(3000);
    const parsed = query.parse('value=' + input + '&returnTo=%2Fcards');
    if (parsed.returnTo !== '/cards' || typeof parsed.value !== 'string') process.exit(2);
  `,
    ],
    { timeout: 5000, encoding: "utf8" },
  );
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, result.stderr);
});

test("query-string compatibility patch is repeatable and rejects unexpected source", () => {
  const { patchQueryString } = require("../scripts/patch-query-string.cjs");
  const fixture = mkdtempSync(join(tmpdir(), "potluck-query-patch-"));
  try {
    const installed = dirname(fromRouter.resolve("query-string"));
    const original = readFileSync(join(installed, "index.js"), "utf8").replace(
      "require('decode-uri-component').default",
      "require('decode-uri-component')",
    );
    writeFileSync(
      join(fixture, "package.json"),
      JSON.stringify({ version: "7.1.3" }),
    );
    writeFileSync(join(fixture, "index.js"), original);
    assert.equal(patchQueryString(fixture), "patched");
    assert.equal(patchQueryString(fixture), "already patched");
    const changed = `${original}\n// unexpected upstream change\n`;
    writeFileSync(join(fixture, "index.js"), changed);
    assert.throws(
      () => patchQueryString(fixture),
      /Unexpected query-string source/,
    );
    assert.equal(readFileSync(join(fixture, "index.js"), "utf8"), changed);
    writeFileSync(
      join(fixture, "package.json"),
      JSON.stringify({ version: "7.1.4" }),
    );
    assert.throws(
      () => patchQueryString(fixture),
      /Unexpected query-string version/,
    );
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
