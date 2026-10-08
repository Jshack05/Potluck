import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { compileFunction } from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
function load(file, imports) {
  const js = ts.transpileModule(
    readFileSync(new URL(file, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  const module = { exports: {} };
  compileFunction(js, ["require", "module", "exports"])(
    (id) =>
      Object.hasOwn(imports, id)
        ? imports[id]
        : /\.(png|svg)$/.test(id)
          ? id
          : require(id),
    module,
    module.exports,
  );
  return module.exports;
}
const node = ({ children }) => React.createElement("div", null, children);
function form({
  circleId = null,
  step = 2,
  locked = false,
  resuming = false,
  circles = [],
} = {}) {
  const visits = [],
    sends = [];
  const draft = {
    fields: { name: "My card", design: "aurora", circleId, step },
    ready: true,
    locked,
    resuming,
    update: (key, value) => {
      if (!locked) draft.fields[key] = value;
    },
    submit: async (body, send) => {
      sends.push(body);
      return send(body, "same-draft");
    },
    clear: async () => {
      visits.push("cleared");
    },
  };
  const element = (name) =>
    function TestElement(props) {
      return React.createElement(name, props, props.children);
    };
  const system = Object.fromEntries(
    [
      "Shell",
      "AuthGate",
      "Title",
      "Muted",
      "Field",
      "Action",
      "ErrorText",
      "Link",
      "Label",
      "ResourceState",
      "Row",
    ].map((name) => [name, element(name)]),
  );
  const { default: Form } = load("../src/app/create/card.tsx", {
    "react-native": { View: element("View"), Pressable: element("Pressable") },
    "expo-router": {
      router: {
        replace: (path) => visits.push(path),
        back: () => visits.push("back"),
      },
      useLocalSearchParams: () => ({}),
    },
    "@/design/system": {
      ...system,
      theme: {},
      go: (path) => visits.push(path),
    },
    "@/services/creation-draft": { useCreationDraft: () => draft },
    "@/services/client": {
      useClient: () => ({ user: { id: "host" } }),
      useCommand: () => async () => ({ id: "saved-card" }),
      useAction: () => ({ run: async (fn) => fn(), busy: false }),
      useResource: () => ({ data: { items: circles }, loading: false }),
    },
    "@/features/potluck/card-preview": {
      CardPreview: element("Preview"),
      cardLooks: { aurora: "Northern lights" },
    },
    "@/features/potluck/planning-controls": {
      PlanningChoice: element("Choice"),
      Selection: element("Selection"),
    },
    "@/features/potluck/card-ui": Object.fromEntries(
      [
        "CardCircleChoice",
        "CardCreateCircle",
        "CardReviewRow",
        "CardSelection",
        "CardHeading",
        "CardHint",
      ].map((name) => [name, element(name)]),
    ),
  });
  function tree() {
    const all = [];
    function visit(value) {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.forEach(visit);
        return;
      }
      if (typeof value.type === "function") {
        visit(value.type(value.props));
        return;
      }
      all.push(value);
      visit(value.props?.children);
      visit(value.props?.footer);
    }
    visit(Form());
    return all;
  }
  return {
    draft,
    visits,
    sends,
    tree,
    find: (label) =>
      tree().find((n) => n.props?.title === label || n.props?.label === label),
  };
}

test("No Circle goes directly to its standalone review and Back retains the card draft", () => {
  const f = form({ circleId: "old" });
  f.find("No Circle — just for me").props.onPress();
  assert.equal(f.draft.fields.circleId, null);
  assert.equal(f.draft.fields.step, 3);
  assert.ok(f.find("Just for you"));
  assert.equal(f.find("Trusted Spender invitations"), undefined);
  f.tree()
    .find((n) => n.type === "Shell")
    .props.onBack();
  assert.equal(f.draft.fields.step, 2);
  assert.equal(f.draft.fields.design, "aurora");
  assert.equal(f.draft.fields.name, "My card");
});

test("creation and interrupted creation finish at Cards after the same saved-draft command", async () => {
  for (const resuming of [false, true]) {
    const f = form({ step: 3, resuming });
    await f
      .tree()
      .find((n) => n.type === "Action")
      .props.onPress();
    // onPress starts the existing async action without blocking the UI thread.
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(f.visits, ["/cards", "cleared"]);
    assert.equal(f.sends[0].circleId, null);
  }
});

test("a locked retry draft cannot change its Circle", () => {
  const f = form({ locked: true });
  assert.equal(f.find("No Circle — just for me").props.disabled, true);
  assert.equal(
    f.tree().find((n) => n.type === "CardCreateCircle").props.disabled,
    true,
  );
});

test("a Circle removed before review cannot be submitted as a fresh card", () => {
  const f = form({ circleId: "removed", step: 3 });
  assert.equal(f.tree().find((n) => n.type === "Action").props.disabled, true);
});

test("confirmed zero is money, an unavailable balance is not, and the label precedes the amount", () => {
  const { CardPreview } = load("../src/features/potluck/card-preview.tsx", {
    "react-native": { View: node, StyleSheet: { absoluteFillObject: {} } },
    "expo-image": { Image: () => null },
    "@/design/system": {
      Label: node,
      money: (value) => "$" + (value / 100).toFixed(2),
    },
  });
  const confirmed = renderToStaticMarkup(
    React.createElement(CardPreview, { name: "Card", availableMinor: 0 }),
  );
  assert.ok(
    confirmed.indexOf("Available to spend") < confirmed.indexOf("$0.00"),
  );
  const unavailable = renderToStaticMarkup(
    React.createElement(CardPreview, { name: "Card", availableMinor: null }),
  );
  assert.ok(!unavailable.includes("$0.00"));
  assert.ok(unavailable.includes("Not issued"));
});

test("spender detail retains its permission entry without host balances, funding, freeze, or goal actions", () => {
  const actions = [];
  const control = ({ label, disabled }) => {
    actions.push({ label, disabled });
    return React.createElement("button", { disabled }, label);
  };
  const { default: Detail } = load("../src/app/card/[id].tsx", {
    "react-native": {
      View: node,
      Pressable: ({ accessibilityLabel, disabled, onPress, children }) => {
        if (accessibilityLabel)
          actions.push({ label: accessibilityLabel, disabled, onPress });
        return React.createElement("div", null, children);
      },
    },
    "expo-image": { Image: () => null },
    "@/design/system": {
      Shell: node,
      AuthGate: node,
      Muted: node,
      Section: node,
      Label: node,
      ResourceState: () => null,
      Action: control,
      theme: {},
      money: String,
      go: () => {},
    },
    "@/services/client": { useResource: () => ({ data: null }) },
    "@/features/potluck/card-preview": { CardPreview: () => null },
    "@/features/potluck/card-scene": {
      useCard: () => ({
        id: "card",
        data: {
          id: "card",
          name: "Assigned card",
          role: "trusted_spender",
          status: "setup_required",
          bills: [],
        },
      }),
    },
    "@/features/potluck/card-ui": {
      CardAction: control,
      CardMenu: () => null,
      CardReviewRow: node,
    },
    "@/features/potluck/bill-ui": { billIcons: {} },
  });
  const html = renderToStaticMarkup(React.createElement(Detail));
  assert.ok(html.includes("Your spending permissions"));
  assert.ok(!html.includes("Create a Goal"));
  assert.ok(
    !actions.some((a) => a.label === "Fund card" || a.label === "Freeze"),
  );
  assert.equal(actions.find((a) => a.label === "Show details").disabled, true);
  assert.ok(
    !actions.some(
      (a) => a.label === "Balance details" && a.onPress && !a.disabled,
    ),
  );
});
