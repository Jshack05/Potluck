import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { compileFunction } from "node:vm";
import React from "react";
import ts from "typescript";
import * as model from "../src/features/potluck/merchant-controls-model.ts";

const require = createRequire(import.meta.url),
  root = fileURLToPath(new URL("../src/", import.meta.url));
function loader(imports) {
  const cache = new Map();
  return function load(file) {
    const path = resolve(root, file);
    if (cache.has(path)) return cache.get(path);
    const js = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    const module = { exports: {} };
    compileFunction(js, ["require", "module", "exports"])(
      (id) => {
        if (Object.hasOwn(imports, id)) return imports[id];
        if (/\.(png|svg)$/.test(id)) return resolve(dirname(path), id);
        if (id.startsWith(".") || id.startsWith("@/")) {
          const base = id.startsWith("@/")
            ? resolve(root, id.slice(2))
            : resolve(dirname(path), id);
          return load(
            [base, base + ".tsx", base + ".ts"].find((p) => existsSync(p)),
          );
        }
        return require(id);
      },
      module,
      module.exports,
    );
    cache.set(path, module.exports);
    return module.exports;
  };
}
function descendants(root) {
  const result = [];
  function visit(node) {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node?.props) return;
    if (typeof node.type === "function") return visit(node.type(node.props));
    result.push(node);
    visit(node.props.children);
    visit(node.props.footer);
  }
  visit(root);
  return result;
}
const design = {
  theme: {
    teal: "#006D67",
    mint: "#E3F6F0",
    canvas: "#F3F2EF",
    ink: "#273432",
    muted: "#596562",
    line: "#D9E5E0",
  },
  Label: "Text",
  Muted: "Text",
  Shell: "Shell",
  Action: "Action",
  Field: "Field",
  ErrorText: "Error",
  ResourceState: "ResourceState",
  AuthGate: React.Fragment,
  money: (minor) => "$" + (minor / 100).toFixed(2),
};
const native = {
  View: "View",
  Pressable: "Pressable",
  TextInput: "TextInput",
  StyleSheet: {
    create: (s) => s,
    absoluteFill: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  },
};

test("industry checkboxes and amount modes expose checked state and use approved assets", () => {
  const actions = [];
  const load = loader({
    react: { ...React, useState: (v) => [v, () => {}] },
    "react-native": native,
    "expo-image": { Image: "Image" },
    "@/design/system": design,
    "@/design/primitives": design,
  });
  const { MerchantControlsForm, MerchantIndustryRow } = load(
    "features/potluck/merchant-controls-form.tsx",
  );
  for (const industry of model.filterMerchantIndustries("")) {
    const nodes = descendants(
      MerchantIndustryRow({
        industry,
        checked: true,
        onPress: () => actions.push(industry),
      }),
    );
    const row = nodes.find((n) => n.type === "Pressable");
    assert.equal(row.props["aria-checked"], true);
    row.props.onPress();
    assert.equal(actions.at(-1), industry);
    for (const img of nodes.filter((n) => n.type === "Image"))
      assert.ok(existsSync(img.props.source));
  }
  const nodes = descendants(
    MerchantControlsForm({
      card: { name: "Apartment", design: "graphite" },
      fullName: "Jordan Taylor",
      draft: { mode: "range", minimum: "10", maximum: "150", industries: [] },
      errors: { minimum: "Invalid minimum" },
      disabled: false,
      onChange: (a) => actions.push(a),
    }),
  );
  const range = nodes.find((n) => n.props.accessibilityLabel === "Range");
  assert.equal(range.props["aria-checked"], true);
  const fields = nodes.filter((n) => n.type === "Field");
  assert.equal(fields[0].props.error, "Invalid minimum");
  fields[1].props.onChangeText("$150.29");
  assert.deepEqual(actions.at(-1), {
    type: "amount",
    field: "maximum",
    value: "150.29",
  });
});

test("Card balance and Edit targets are siblings with independent actions", () => {
  const visits = [];
  const load = loader({
    react: { ...React, useState: (v) => [v, () => {}] },
    "react-native": native,
    "expo-image": { Image: "Image" },
    "@/design/system": design,
  });
  const { CardPreview } = load("features/potluck/card-preview.tsx");
  const nodes = descendants(
    CardPreview({
      name: "Apartment",
      onOpenBalance: () => visits.push("balance"),
      onEdit: () => visits.push("edit"),
    }),
  );
  const balance = nodes.find(
    (n) => n.props.accessibilityLabel === "Balance details",
  );
  assert.ok(balance);
  const edit = nodes.find((n) => n.props.accessibilityLabel === "Edit card");
  assert.equal(descendants(balance).includes(edit), false);
  balance.props.onPress();
  edit.props.onPress({ stopPropagation() {} });
  assert.deepEqual(visits, ["balance", "edit"]);
});

test("name-only thumbnail shares every appearance with full Cards and preserves native aspect ratio", () => {
  const load = loader({
    react: {
      ...React,
      useState: (v) => [typeof v === "function" ? v() : v, () => {}],
    },
    "react-native": native,
    "expo-image": { Image: "Image" },
    "@/design/primitives": design,
    "@/design/system": design,
  });
  const { CardThumbnail } = load("features/potluck/card-thumbnail.tsx");
  const { CardPreview } = load("features/potluck/card-preview.tsx");
  const { cardAppearances } = load(
    "features/potluck/card-appearance-catalog.ts",
  );
  for (const appearance of Object.values(cardAppearances)) {
    const mini = descendants(
      CardThumbnail({
        design: appearance.id,
        fullName: "Alexandra Montgomery",
      }),
    );
    const full = descendants(
      CardPreview({ name: "Apartment", design: appearance.id }),
    );
    assert.deepEqual(
      mini.filter((n) => n.type === "Image").map((n) => n.props.source),
      full.filter((n) => n.type === "Image").map((n) => n.props.source),
    );
    const name = mini.filter((n) => n.type === "Text");
    assert.equal(name.length, 1);
    assert.equal(name[0].props.children, "Alexandra Montgomery");
    assert.equal(name[0].props.style.fontSize, 10);
    assert.equal(name[0].props.style.fontFamily, "Inter_700Bold");
    assert.equal(name[0].props.style.color, appearance.foreground);
    assert.equal(mini[0].props.style.width, 104);
    assert.equal(mini[0].props.style.aspectRatio, 330 / 176);
  }
});

function editor({ failSave = false } = {}) {
  const hooks = [],
    calls = [],
    visits = [];
  let cursor = 0,
    error = "",
    busy = false,
    backGuard;
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
  const load = loader({
    react: {
      ...React,
      useState: state,
      useReducer: (reducer, arg, init) => {
        const [s, set] = state(() => (init ? init(arg) : arg));
        return [s, (a) => set((v) => reducer(v, a))];
      },
      useRef: (v) => state(() => ({ current: v }))[0],
      useEffect: (fn) => {
        fn();
      },
    },
    "react-native": native,
    "expo-router": {
      router: { dismissTo: (path) => visits.push(path) },
      useNavigation: () => ({ dispatch: (action) => visits.push(action) }),
    },
    "expo-router/react-navigation": {
      usePreventRemove: (enabled, fn) => {
        backGuard = enabled ? fn : undefined;
      },
    },
    "@/design/system": design,
    "@/services/client": {
      useAction: () => ({
        busy,
        error,
        setError: (value) => {
          error = value;
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
      useCommand: () => async (path, body) => {
        calls.push([path, body]);
        if (failSave) {
          failSave = false;
          throw new Error("Offline");
        }
        return {
          cardId: "card",
          version: 1,
          settings: body.settings,
          enforcement: "not_active",
        };
      },
    },
    "./merchant-controls-form": {
      MerchantControlsForm: "Form",
      MerchantIndustryPicker: "Picker",
    },
    "./merchant-controls-model": model,
  });
  const { MerchantControlsEditor } = load(
    "features/potluck/merchant-controls-editor.tsx",
  );
  function render() {
    cursor = 0;
    return descendants(
      MerchantControlsEditor({
        card: { id: "card", name: "My Card", design: "graphite" },
        user: { id: "host", name: "Jordan Taylor" },
        saved: {
          cardId: "card",
          version: 0,
          settings: null,
          enforcement: "not_active",
        },
      }),
    );
  }
  return {
    render,
    calls,
    visits,
    back: () => backGuard?.({ data: { action: { type: "GO_BACK" } } }),
    get: (type) => render().find((n) => n.type === type),
  };
}
test("controls editor validates, cancels picker edits, preserves a failed save and retries the same versioned payload", async () => {
  const s = editor({ failSave: true });
  assert.equal(s.get("Shell").props.title, "Spending controls");
  await s.get("Action").props.onPress();
  assert.ok(s.get("Form").props.errors.maximum);
  assert.equal(s.calls.length, 0);
  s.get("Form").props.onChange({
    type: "amount",
    field: "maximum",
    value: "150.29",
  });
  s.get("Form").props.onChange({ type: "edit-industries" });
  s.get("Picker").props.onToggle("groceries");
  s.back();
  assert.deepEqual(s.get("Form").props.draft.industries, []);
  s.get("Form").props.onChange({ type: "edit-industries" });
  s.get("Picker").props.onToggle("utilities");
  await s.get("Action").props.onPress();
  assert.equal(s.calls.length, 0, "Use industries is not a server save");
  await s.get("Action").props.onPress();
  assert.equal(s.get("Form").props.draft.maximum, "150.29");
  assert.ok(
    s.render().some((n) => n.type === "Error" && n.props.text === "Offline"),
  );
  assert.deepEqual(s.visits, []);
  await s.get("Action").props.onPress();
  assert.deepEqual(s.calls[0], s.calls[1]);
  assert.equal(s.calls[0][1].settings.maximumMinor, 15029);
  assert.deepEqual(s.visits, ["/card/card/setup"]);
});
test("editor Back discards the draft and returns to the current Card settings", () => {
  const s = editor();
  s.get("Shell").props.onBack();
  assert.deepEqual(s.visits, ["/card/card/setup"]);
  assert.equal(s.calls.length, 0);
});

test("route loads only the Host's eligible Card and isolates editors across identities", () => {
  let user = { id: "host", name: "Jordan Taylor" },
    card = { id: "card-a", role: "host", status: "setup_required" },
    ready = true,
    error = "";
  const paths = [];
  const load = loader({
    "@/design/system": design,
    "@/features/potluck/card-scene": {
      useCard: () => ({
        id: card.id,
        user,
        data: card,
        loading: false,
        error: "",
        reload() {},
      }),
    },
    "@/services/client": {
      useResource: (path) => {
        paths.push(path);
        return {
          data: ready
            ? {
                cardId: card.id,
                version: 0,
                settings: null,
                enforcement: "not_active",
              }
            : null,
          loading: !ready,
          error,
          reload() {},
        };
      },
    },
    "@/features/potluck/merchant-controls-editor": {
      MerchantControlsEditor: "Editor",
    },
  });
  const { default: Page } = load("app/card/[id]/merchant-controls.tsx");
  assert.equal(Page().key, "host:card-a");
  assert.equal(paths.at(-1), "/cards/card-a/merchant-controls");
  user = { ...user, id: "other" };
  card = { ...card, id: "card-b" };
  assert.equal(Page().key, "other:card-b");
  ready = false;
  error = "Could not load controls";
  const failed = descendants(Page());
  assert.ok(
    failed.some(
      (n) =>
        n.type === "ResourceState" &&
        n.props.error === error &&
        typeof n.props.retry === "function",
    ),
  );
  assert.equal(
    failed.some((n) => n.type === "Editor"),
    false,
  );
  for (const change of [
    { role: "trusted_spender", status: "setup_required" },
    { role: "host", status: "closed" },
  ]) {
    card = { ...card, ...change };
    assert.ok(descendants(Page()).some((n) => n.type === "Error"));
    assert.equal(paths.at(-1), null);
  }
});
