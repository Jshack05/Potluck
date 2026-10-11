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
  fresh = false,
  name = "My card",
  design = "aurora",
} = {}) {
  const visits = [],
    sends = [];
  const draft = {
    fields: { name, design, circleId, step },
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
  let stateCursor = 0;
  const state = [];
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
  const imports = {
    react: {
      ...React,
      useState: (initial) => {
        const i = stateCursor++;
        if (!(i in state)) state[i] = initial;
        return [
          state[i],
          (value) => {
            state[i] = typeof value === "function" ? value(state[i]) : value;
          },
        ];
      },
    },
    "react-native": {
      View: element("View"),
      Pressable: element("Pressable"),
      Keyboard: { dismiss() {} },
    },
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
    "@/services/creation-draft": {
      useCreationDraft: (_key, seed) => {
        if (fresh) {
          draft.fields = { ...seed };
          fresh = false;
        }
        return draft;
      },
    },
    "@/services/client": {
      useClient: () => ({ user: { id: "host" } }),
      useCommand: () => async () => ({ id: "saved-card" }),
      useAction: () => ({ run: async (fn) => fn(), busy: false }),
      useResource: () => ({ data: { items: circles }, loading: false }),
    },
    "@/features/potluck/card-preview": {
      CardPreview: element("Preview"),
      cardLooks: {
        aurora: "Northern lights",
        aurora_gradient: "Aurora gradient",
        sunset: "Sunset gradient",
        teal: "Evergreen",
        coral: "Coral",
        ocean: "Ocean",
        berry: "Violet",
      },
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
  };
  imports["./card-appearance-catalog"] = load(
    "../src/features/potluck/card-appearance-catalog.ts",
    imports,
  );
  imports["./card-preview"] = imports["@/features/potluck/card-preview"];
  imports["./card-ui"] = imports["@/features/potluck/card-ui"];
  imports["@/features/potluck/card-creation-steps"] = load(
    "../src/features/potluck/card-creation-steps.tsx",
    imports,
  );
  const { default: Form } = load("../src/app/create/card.tsx", imports);
  function tree() {
    stateCursor = 0;
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

test("every appearance choice survives Circle review, Back, a name edit and submission", async () => {
  const options = {
    graphite: "Graphite",
    brushed_silver: "Brushed Silver",
    frosted_glass: "Frosted Glass",
    champagne: "Champagne",
    satin_teal: "Satin Teal",
    aurora: "Northern lights",
    ocean_artwork: "Ocean artwork",
    sunset_artwork: "Sunset artwork",
    botanical: "Botanical",
    midnight: "Midnight",
    terracotta: "Terracotta",
    alpine: "Alpine",
    prism: "Prism",
    orbit: "Orbit",
    lagoon: "Lagoon",
    aurora_gradient: "Aurora gradient",
    sunset: "Sunset gradient",
    teal: "Evergreen",
    coral: "Coral",
    ocean: "Ocean",
    berry: "Violet",
  };
  for (const [design, label] of Object.entries(options)) {
    const f = form({
      step: 1,
      circles: [
        {
          id: "crew",
          name: "Apartment crew",
          memberCount: 3,
          privacy: "normal",
        },
      ],
    });
    const back = () =>
      f
        .tree()
        .find((n) => n.type === "Shell")
        .props.onBack();
    const advance = () =>
      f
        .tree()
        .find((n) => n.type === "Action")
        .props.onPress();
    const preview = () => f.tree().find((n) => n.type === "Preview");
    const choice = () =>
      f.tree().find((n) => n.props?.accessibilityLabel === label);
    for (const category of ["Finishes", "Artwork"])
      f.tree()
        .find((n) => n.props?.accessibilityLabel === "See all " + category)
        .props.onPress();
    assert.equal(
      f.tree().filter((n) => n.props?.accessibilityRole === "radio").length,
      21,
    );
    choice().props.onPress();
    assert.equal(choice().props.accessibilityState.checked, true);
    assert.equal(preview().props.design, design);
    advance();
    f.find("Apartment crew").props.onPress();
    assert.equal(f.find("Apartment crew").props.selected, true);
    advance();
    assert.equal(preview().props.design, design);
    assert.equal(f.find("Apartment crew").type, "CardReviewRow");
    assert.ok(f.find("No invitations sent"));
    back();
    back();
    assert.equal(choice().props.accessibilityState.checked, true);
    f.tree()
      .find((n) => n.type === "Field")
      .props.onChangeText("Renamed card");
    assert.equal(preview().props.name, "Renamed card");
    advance();
    advance();
    advance();
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(f.sends, [
      { name: "Renamed card", design, circleId: "crew" },
    ]);
    assert.deepEqual(f.visits, ["/cards", "cleared"]);
  }
});

test("locked drafts disable every appearance and the review Circle action", () => {
  const appearance = form({ step: 1, locked: true });
  const choices = appearance
    .tree()
    .filter((n) => n.props?.accessibilityRole === "radio");
  assert.equal(choices.length, 10);
  assert.ok(choices.every((n) => n.props.disabled));
  const review = form({
    step: 3,
    circleId: "crew",
    locked: true,
    circles: [{ id: "crew", name: "Apartment crew", privacy: "normal" }],
  });
  assert.equal(review.find("Apartment crew").props.onPress, undefined);
});

test("Circle choices retain the privacy boundary and real member count", () => {
  const f = form({
    circles: [
      {
        id: "mine",
        name: "My private Circle",
        hostId: "host",
        privacy: "private",
        memberCount: 1,
      },
      {
        id: "normal",
        name: "Shared Circle",
        hostId: "another",
        privacy: "normal",
        memberCount: 3,
      },
      {
        id: "private",
        name: "Someone else's private Circle",
        hostId: "another",
        privacy: "private",
        memberCount: 8,
      },
    ],
  });
  assert.equal(f.find("My private Circle").props.subtitle, "1 member");
  assert.equal(f.find("Shared Circle").props.subtitle, "3 members");
  assert.equal(f.find("Someone else's private Circle"), undefined);
});

test("new drafts combine name and appearance with Graphite, then go straight to Circle", () => {
  const f = form({ fresh: true });
  assert.equal(
    f.tree().find((n) => n.type === "Preview").props.design,
    "graphite",
  );
  assert.equal(f.tree().find((n) => n.type === "Action").props.disabled, true);
  f.tree()
    .find((n) => n.type === "Field")
    .props.onChangeText("Apartment card");
  const preview = f.tree().find((n) => n.type === "Preview");
  assert.equal(preview.props.name, "Apartment card");
  assert.equal(preview.props.design, "graphite");
  assert.equal(
    f.tree().find((n) => n.type === "Shell").props.avoidKeyboard,
    false,
  );
  f.tree()
    .find((n) => n.type === "Action")
    .props.onPress();
  assert.equal(f.draft.fields.step, 2);
  assert.ok(f.find("No Circle — just for me"));
});

test("saved appearance-step drafts reopen the combined form without replacing Northern lights", () => {
  for (const step of [0, 1]) {
    const f = form({ step });
    assert.equal(
      f.tree().find((n) => n.type === "Shell").props.title,
      "Create card",
    );
    assert.equal(
      f.tree().find((n) => n.type === "Field").props.value,
      "My card",
    );
    assert.equal(
      f.tree().find((n) => n.type === "Preview").props.design,
      "aurora",
    );
  }
});

test("independent categories keep hidden selection and expansion across Circle Back", () => {
  const f = form({ step: 0 });
  const button = (label) =>
    f.tree().find((n) => n.props?.accessibilityLabel === label);
  button("See all Artwork").props.onPress();
  button("Lagoon").props.onPress();
  assert.equal(f.draft.fields.design, "lagoon");
  assert.equal(
    button("See all Finishes").props.accessibilityState.expanded,
    false,
  );
  button("See less Artwork").props.onPress();
  assert.equal(button("Lagoon"), undefined);
  assert.equal(f.draft.fields.design, "lagoon");
  assert.ok(f.tree().some((n) => n.props?.children === "Lagoon selected"));
  button("See all Finishes").props.onPress();
  f.tree()
    .find((n) => n.type === "Action")
    .props.onPress();
  f.tree()
    .find((n) => n.type === "Shell")
    .props.onBack();
  assert.equal(
    f.tree().find((n) => n.type === "Shell").props.title,
    "Create card",
  );
  assert.ok(button("See less Finishes"));
  assert.ok(button("See all Artwork"));
  assert.equal(
    f.tree().find((n) => n.type === "Preview").props.design,
    "lagoon",
  );
});

test("whitespace names block Continue and long names retain their exact draft value", () => {
  const f = form({ step: 0, name: "  " });
  assert.equal(f.tree().find((n) => n.type === "Action").props.disabled, true);
  const name = "A".repeat(80);
  f.tree()
    .find((n) => n.type === "Field")
    .props.onChangeText(name);
  assert.equal(f.tree().find((n) => n.type === "Preview").props.name, name);
  assert.equal(f.tree().find((n) => n.type === "Action").props.disabled, false);
});

test("confirmed zero is money, an unavailable balance is not, and the label precedes the amount", () => {
  const { CardPreview } = load("../src/features/potluck/card-preview.tsx", {
    "./card-appearance-catalog": load(
      "../src/features/potluck/card-appearance-catalog.ts",
      {},
    ),
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
