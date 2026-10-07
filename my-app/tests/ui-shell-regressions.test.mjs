import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { compileFunction } from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const {
  setWindowSoftInputModeMode,
} = require("@expo/config-plugins/build/android/WindowSoftInputMode.js");

test("Android keeps the home dock out of the keyboard's resized viewport", () => {
  const { expo } = JSON.parse(
    readFileSync(new URL("../app.json", import.meta.url)),
  );
  const manifest = {
    manifest: {
      application: [{ activity: [{ $: { "android:name": ".MainActivity" } }] }],
    },
  };
  setWindowSoftInputModeMode(expo, manifest);
  assert.equal(
    manifest.manifest.application[0].activity[0].$[
      "android:windowSoftInputMode"
    ],
    "adjustPan",
  );
});

// Render the real summary with an inert native-view adapter and controlled
// resource responses. This exercises pending/failure branches, not source text.
function renderSummary(resource) {
  const node = ({ children }) => React.createElement("div", null, children);
  const pressable = ({ children, accessibilityLabel, accessibilityRole }) =>
    React.createElement(
      "button",
      { "aria-label": accessibilityLabel, role: accessibilityRole },
      children,
    );
  const imports = {
    react: React,
    "react-native": { View: node, Pressable: pressable },
    "@/services/client": { useResource: () => resource },
    "@/design/loading": {
      ScreenSkeleton: () => React.createElement("div", { role: "progressbar" }),
    },
    "@/design/system": {
      Label: node,
      Muted: node,
      Link: node,
      ResourceState: ({ error }) =>
        error && React.createElement("div", { role: "alert" }, error),
      money: (minor) => "$" + (minor / 100).toFixed(2),
      dateLabel: (date) => date,
      styles: { row: {} },
      theme: {},
    },
  };
  const source = readFileSync(
    new URL("../src/features/potluck/bill-summary.tsx", import.meta.url),
    "utf8",
  );
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const module = { exports: {} };
  compileFunction(js, ["require", "module", "exports"])(
    (id) => imports[id] ?? require(id),
    module,
    module.exports,
  );
  return renderToStaticMarkup(
    React.createElement(module.exports.BillSummary, { scope: "all" }),
  );
}

for (const [name, resource] of [
  ["pending", { data: null, loading: true, error: "" }],
  [
    "failed",
    { data: null, loading: false, error: "Could not load this month" },
  ],
]) {
  test(`the summary keeps month and view controls during a ${name} month request`, () => {
    const html = renderSummary(resource);
    for (const control of [
      "Previous month",
      "Next month",
      "Overview",
      "By week",
    ])
      assert.ok(html.includes(control), `${control} must remain available`);
    assert.ok(
      !html.includes("$0.00"),
      "an unresolved month must not show a financial zero",
    );
    assert.ok(
      html.includes(resource.error ? 'role="alert"' : 'role="progressbar"'),
    );
  });
}

test("a failed summary refresh keeps its authorized total and shows the failure", () => {
  const html = renderSummary({
    data: { totalMinor: 12345, occurrences: [] },
    loading: false,
    error: "Could not refresh",
  });
  assert.ok(html.includes("$123.45"));
  assert.ok(html.includes("Could not refresh"));
  assert.ok(!html.includes('role="progressbar"'));
});
