import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { compileFunction } from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
async function policy() {
  return import("../src/design/loading-delay.ts");
}

test("quick content loads never reveal an indicator or wait for a minimum display time", async (t) => {
  const { scheduleLoadingFeedback } = await policy();
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let visible = false;
  const cancel = scheduleLoadingFeedback(() => {
    visible = true;
  });
  t.mock.timers.tick(499);
  assert.equal(visible, false);
  cancel();
  t.mock.timers.tick(1000);
  assert.equal(visible, false);
});

test("a still-pending request reveals feedback at 500 ms", async (t) => {
  const { scheduleLoadingFeedback } = await policy();
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let announcements = 0;
  const cancel = scheduleLoadingFeedback(() => {
    announcements++;
  });
  t.mock.timers.tick(499);
  assert.equal(announcements, 0);
  t.mock.timers.tick(1);
  assert.equal(announcements, 1);
  t.mock.timers.tick(2000);
  assert.equal(announcements, 1);
  cancel();
});

test("leaving a request cancels its feedback and the next request gets its own delay", async (t) => {
  const { scheduleLoadingFeedback } = await policy();
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const seen = [];
  const cancelFirst = scheduleLoadingFeedback(() => seen.push("first"));
  t.mock.timers.tick(400);
  cancelFirst();
  const cancelNext = scheduleLoadingFeedback(() => seen.push("next"));
  t.mock.timers.tick(100);
  assert.deepEqual(seen, []);
  t.mock.timers.tick(400);
  assert.deepEqual(seen, ["next"]);
  cancelNext();
});

test("the actual loading component renders no shapes, text or spinner on its initial paint", () => {
  const source = readFileSync(
    new URL("../src/design/loading.tsx", import.meta.url),
    "utf8",
  );
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const node = ({ children }) => React.createElement("div", null, children);
  const imports = {
    "react-native": {
      View: node,
      StyleSheet: { create: (styles) => styles },
      ActivityIndicator: () => React.createElement("span", null, "spinner"),
    },
    "./primitives": { Label: node, theme: {} },
    "./loading-delay": { scheduleLoadingFeedback: () => () => {} },
  };
  const module = { exports: {} };
  compileFunction(js, ["require", "module", "exports"])(
    (id) => imports[id] ?? require(id),
    module,
    module.exports,
  );
  assert.equal(typeof module.exports.LoadingFeedback, "function");
  assert.equal(
    renderToStaticMarkup(React.createElement(module.exports.LoadingFeedback)),
    "",
  );
});
