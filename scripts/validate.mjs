import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
const root = process.cwd(),
  mobile = resolve(root, "my-app");
const steps = [
  [
    "Backend formatting",
    root,
    [
      "node_modules/prettier/bin/prettier.cjs",
      "--check",
      "packages",
      "services",
      "tests/domain",
      "tests/integration",
    ],
  ],
  [
    "Backend strict types",
    root,
    ["node_modules/typescript/bin/tsc", "--noEmit"],
  ],
  [
    "Domain and integration tests",
    root,
    [
      "--test",
      "--test-concurrency=1",
      "tests/integration/*.test.ts",
      "tests/domain/*.test.ts",
    ],
  ],
  [
    "Mobile lint",
    mobile,
    ["node_modules/eslint/bin/eslint.js", ".", "--max-warnings", "0"],
  ],
  [
    "Mobile strict types",
    mobile,
    ["node_modules/typescript/bin/tsc", "--noEmit"],
  ],
  ["Mobile tests", mobile, ["--test", "tests/*.test.mjs"]],
  [
    "iOS, Android and web export",
    mobile,
    ["node_modules/expo/bin/cli", "export", "--platform", "all"],
  ],
];
if (!process.argv.includes("--local")) {
  if (!process.env.npm_execpath)
    throw new Error(
      "Run the full gate with npm run validate so the npm audit command is available.",
    );
  steps.push(
    [
      "Backend dependency audit",
      root,
      [process.env.npm_execpath, "audit", "--audit-level=moderate"],
    ],
    [
      "Mobile dependency audit",
      mobile,
      [process.env.npm_execpath, "audit", "--audit-level=moderate"],
    ],
  );
}
const failed = [];
for (const [name, cwd, args] of steps) {
  console.log("\n" + name);
  const result = spawnSync(process.execPath, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, CI: "1" },
  });
  if (result.status !== 0) failed.push(name);
}
console.log(
  "\n" +
    (failed.length
      ? "Failed checks: " + failed.join(", ")
      : "All requested checks passed."),
);
if (process.argv.includes("--local"))
  console.log(
    "Local functional checks exclude dependency audits; npm run validate is the full release gate.",
  );
process.exitCode = failed.length ? 1 : 0;
