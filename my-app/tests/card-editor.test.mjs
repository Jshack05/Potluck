import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compileFunction } from "node:vm";
import { createRequire } from "node:module";
import React from "react";
import ts from "typescript";
const require = createRequire(import.meta.url);
function editor({ fail = false } = {}) {
  let nativeBack;
  let cursor = 0,
    busy = false,
    error = "";
  const hooks = [],
    calls = [],
    visits = [],
    effects = [];
  const state = (initial) => {
    const i = cursor++;
    if (!(i in hooks))
      hooks[i] = typeof initial === "function" ? initial() : initial;
    return [
      hooks[i],
      (v) => {
        hooks[i] = typeof v === "function" ? v(hooks[i]) : v;
      },
    ];
  };
  const mocks = {
    react: {
      ...React,
      useState: state,
      useRef: (v) => state(() => ({ current: v }))[0],
      useEffect: (fn) => effects.push(fn),
    },
    "react-native": {
      View: "View",
      Pressable: "Pressable",
      Keyboard: { dismiss() {} },
    },
    "expo-router": {
      router: { dismissTo: (p) => visits.push(p) },
      useNavigation: () => ({ dispatch: (a) => visits.push(a) }),
    },
    "expo-router/react-navigation": {
      usePreventRemove(enabled, callback) {
        nativeBack = enabled ? callback : undefined;
      },
    },
    "@/design/system": {
      Shell: "Shell",
      Action: "Action",
      Field: "Field",
      ErrorText: "Error",
      Label: "Label",
      theme: { teal: "#006D67" },
    },
    "./card-ui": { CardHeading: "Heading", CardHint: "Hint" },
    "./card-creation-steps": { CardAppearancePicker: "Picker" },
    "@/services/client": {
      useCommand: () => async (path, body) => {
        calls.push([path, body]);
        if (fail) {
          fail = false;
          throw new Error("Offline");
        }
        return { ...body, version: 5 };
      },
      useAction: () => ({
        busy,
        error,
        setError: (v) => {
          error = v;
        },
        run: async (fn) => {
          if (busy) return;
          busy = true;
          error = "";
          try {
            await fn();
          } catch (e) {
            error = e.message;
          } finally {
            busy = false;
          }
        },
      }),
    },
  };
  const code = ts.transpileModule(
    readFileSync(
      new URL("../src/features/potluck/card-editor.tsx", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  const mod = { exports: {} };
  compileFunction(code, ["require", "module", "exports"])(
    (id) => mocks[id] ?? require(id),
    mod,
    mod.exports,
  );
  function render() {
    cursor = 0;
    effects.length = 0;
    const tree = mod.exports.CardEditor({
      card: {
        id: "card-1",
        name: "Original",
        design: "ocean_artwork",
        version: 4,
      },
      user: { id: "host", name: "Jordan Taylor" },
    });
    for (const fn of effects) fn();
    const nodes = [];
    const visit = (n) => {
      if (Array.isArray(n)) return n.forEach(visit);
      if (!n?.props) return;
      nodes.push(n);
      visit(n.props.children);
      visit(n.props.footer);
      visit(n.props.headerAccessory);
    };
    visit(tree);
    return nodes;
  }
  return {
    nativeBack: () => nativeBack?.({ data: { action: { type: "GO_BACK" } } }),
    calls,
    visits,
    get: (type) => render().find((n) => n.type === type),
    render,
  };
}
test("Edit card starts with saved appearance, saves same Card and retains failed changes for retry", async () => {
  const s = editor({ fail: true });
  assert.equal(s.get("Field").props.value, "Original");
  assert.equal(s.get("Picker").props.design, "ocean_artwork");
  assert.equal(s.get("Picker").props.identity.fullName, "Jordan Taylor");
  assert.equal(s.get("Action").props.disabled, true);
  s.get("Field").props.onChangeText("  Apartment  ");
  s.get("Picker").props.onSelect("sage_solid");
  await s.get("Action").props.onPress();
  assert.equal(s.get("Field").props.value, "  Apartment  ");
  assert.equal(s.get("Error").props.text, "Offline");
  assert.deepEqual(s.visits, []);
  await s.get("Action").props.onPress();
  s.render();
  assert.deepEqual(s.calls[0], [
    "/cards/card-1/appearance",
    { name: "Apartment", design: "sage_solid", expectedVersion: 4 },
  ]);
  assert.deepEqual(s.calls[0], s.calls[1]);
  assert.deepEqual(s.visits, ["/card/card-1"]);
});
test("Cancel and Back discard edits; invalid name cannot save", () => {
  for (const cancel of [true, false]) {
    const s = editor();
    s.get("Field").props.onChangeText(" ");
    assert.equal(s.get("Action").props.disabled, true);
    if (cancel) s.get("Pressable").props.onPress();
    else s.get("Shell").props.onBack();
    s.render();
    assert.deepEqual(s.calls, []);
    assert.deepEqual(s.visits, ["/card/card-1"]);
  }
});
test("native Back from unrelated history returns to the edited Card without saving", () => {
  const s = editor();
  s.get("Field").props.onChangeText("Unsaved");
  s.nativeBack();
  s.render();
  assert.deepEqual(s.visits, ["/card/card-1"]);
  assert.deepEqual(s.calls, []);
});
