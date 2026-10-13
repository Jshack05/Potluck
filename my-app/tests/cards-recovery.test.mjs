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

test("Card route resets controlled selection through its background action and keeps opening cards", () => {
  let selection = null;
  const visits = [],
    resource = {
      data: {
        items: [
          { id: "one", name: "One" },
          { id: "two", name: "Two" },
        ],
      },
    };
  const { default: Cards } = load("../src/app/cards.tsx", {
    react: {
      useState: () => [
        selection,
        (value) => {
          selection = value;
        },
      ],
    },
    "react-native": { View: "View" },
    "expo-router": { useLocalSearchParams: () => ({}) },
    "@/features/potluck/card-closure-notice": {
      CardClosureNotice: "ClosureNotice",
    },
    "@/design/system": {
      ...Object.fromEntries(
        ["Shell", "AuthGate", "Title", "Muted", "Row", "ResourceState"].map(
          (x) => [x, x],
        ),
      ),
      go: (path) => visits.push(path),
    },
    "@/services/client": {
      useClient: () => ({ user: { id: "host" } }),
      useResource: () => resource,
    },
    "@/features/potluck/card-stack": { CardStack: "CardStack" },
    "@/features/potluck/home-empty-state": { HomeEmptyState: "Empty" },
  });
  const stack = (n) => {
    if (!n?.props) return;
    if (n?.type === "CardStack") return n;
    return [n?.props?.children].flat(Infinity).map(stack).find(Boolean);
  };
  const initial = Cards();
  assert.equal(initial.props.onBackgroundPress, undefined);
  stack(initial).props.onSelect("one");
  assert.equal(stack(Cards()).props.selectedId, "one");
  assert.equal(typeof Cards().props.onBackgroundPress, "function");
  Cards().props.onBackgroundPress();
  assert.equal(stack(Cards()).props.selectedId, null);
  stack(Cards()).props.onSelect("two");
  stack(Cards()).props.onOpen("two");
  assert.deepEqual(visits, ["/card/two"]);
  resource.data.items = [];
  Cards();
  assert.equal(selection, null, "a removed Card must not remain selected");
});

test("people search and results share the constrained scroll body and selection still works", () => {
  let selected;
  const { AddCirclePeople } = load("../src/features/potluck/circle-ui.tsx", {
    react: {
      ...React,
      useState: (value) => [value, () => {}],
      useRef: (value) => ({ current: value }),
      useEffect() {},
    },
    "react-native": {
      ScrollView: "ScrollView",
      TextInput: "TextInput",
      View: "View",
      Pressable: "Pressable",
      StyleSheet: { create: (value) => value },
    },
    "expo-image": { Image: "Image" },
    "@/design/sheet": { SheetSurface: "SheetSurface" },
    "@/design/system": {
      Label: "Label",
      Muted: "Muted",
      ResourceState: "ResourceState",
      theme: {},
    },
    "@/services/client": {
      useClient: () => ({ user: { id: "host" } }),
      useResource: () => ({
        data: { items: [{ id: "friend", name: "Maya" }] },
        loading: false,
      }),
    },
    "./circle-model": load("../src/features/potluck/circle-model.ts", {}),
  });
  const tree = AddCirclePeople({
    visible: true,
    people: [],
    onChange: (value) => {
      selected = value;
    },
    onClose() {},
  });
  const body = tree.props.children;
  assert.equal(
    body.type,
    "ScrollView",
    "fixed headings must not crowd out results in a short keyboard viewport",
  );
  const descendants = [];
  function visit(value) {
    if (!value || typeof value !== "object") return;
    descendants.push(value);
    [value.props?.children].flat(Infinity).forEach(visit);
  }
  visit(body);
  assert.ok(descendants.some((item) => item.type === "TextInput"));
  descendants
    .find((item) => item.props?.accessibilityLabel === "Add Maya")
    .props.onPress();
  assert.deepEqual(selected, [{ id: "friend", name: "Maya" }]);
});

test("review edits return directly to review, retain other choices, and cancel restores the prior selection", () => {
  const accounts = [
    { id: "one", name: "Personal checking", last4: "4821", state: "simulated" },
  ];
  const f = form({ step: 3, beta: true, betaAccountId: "one", accounts });
  const action = () => f.tree().find((n) => n.type === "Action");
  assert.equal(f.find("Just for you").props.icon, "person");
  assert.equal(typeof f.find("Just for you").props.onPress, "function");
  f.find("Just for you").props.onPress();
  assert.equal(f.draft.fields.step, 2);
  action().props.onPress();
  assert.equal(f.draft.fields.step, 3);
  f.find("Personal checking").props.onPress();
  assert.equal(f.draft.fields.step, 4);
  action().props.onPress();
  assert.equal(f.draft.fields.step, 3);
  f.tree()
    .find(
      (n) => n.props?.accessibilityLabel === "Edit card name and appearance",
    )
    .props.onPress();
  assert.equal(f.draft.fields.step, 0);
  f.tree()
    .find((n) => n.type === "Field")
    .props.onChangeText("Changed name");
  f.tree()
    .find((n) => n.type === "Shell")
    .props.onBack();
  assert.equal(f.draft.fields.name, "My card");
  assert.equal(f.draft.fields.step, 3);
  assert.equal(f.draft.fields.betaAccountId, "one");
  assert.equal(f.draft.fields.design, "aurora");
});

test("pending submission review cannot edit sharing, appearance or banking", () => {
  const f = form({
    step: 3,
    locked: true,
    resuming: true,
    beta: true,
    betaAccountId: "one",
    accounts: [{ id: "one", name: "Personal checking", last4: "4821" }],
  });
  assert.equal(f.find("Just for you").props.onPress, undefined);
  assert.equal(f.find("Personal checking").props.onPress, undefined);
  assert.ok(
    !f
      .tree()
      .some(
        (n) => n.props?.accessibilityLabel === "Edit card name and appearance",
      ),
  );
});
function form({
  circleId = null,
  step = 2,
  locked = false,
  resuming = false,
  circles = [],
  fresh = false,
  name = "My card",
  design = "aurora",
  beta = false,
  betaAccountId,
  accounts = [],
  bankError = "",
  capabilitiesError = "",
  capabilitiesLoading = false,
  connectError = false,
} = {}) {
  const visits = [],
    sends = [];
  const draft = {
    fields: {
      name,
      design,
      circleId,
      step,
      ...(betaAccountId ? { betaAccountId } : {}),
    },
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
      theme: { teal: "#006D67", muted: "#697472" },
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
      useClient: () => ({
        user: { id: "host", name: "Alexandra María van der Linden" },
      }),
      useCommand: () => async (path) => {
        if (path === "/beta/bank-accounts/connect") {
          if (connectError) throw new Error("Connect failed");
          accounts = [
            {
              id: "sample",
              name: "Personal checking",
              last4: "4821",
              state: "simulated",
            },
          ];
          return { items: accounts };
        }
        return { id: "saved-card" };
      },
      useAction: () => ({ run: async (fn) => fn(), busy: false }),
      useResource: (path) =>
        path === "/capabilities"
          ? {
              data:
                capabilitiesError || capabilitiesLoading
                  ? null
                  : { betaBankLinking: beta },
              loading: capabilitiesLoading,
              error: capabilitiesError,
              reload: async () => {},
            }
          : path === "/beta/bank-accounts"
            ? {
                data: bankError ? null : { items: accounts },
                loading: false,
                error: bankError,
                reload: async () => {},
              }
            : { data: { items: circles }, loading: false },
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
  imports["@/features/potluck/card-bank-step"] = load(
    "../src/features/potluck/card-bank-step.tsx",
    imports,
  );
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

test("beta Card flow connects, selects, reviews and saves an account while Back preserves the whole draft", async () => {
  const f = form({ beta: true });
  const footer = () => f.tree().find((n) => n.type === "Action");
  const back = () =>
    f
      .tree()
      .find((n) => n.type === "Shell")
      .props.onBack();
  f.find("No Circle — just for me").props.onPress();
  assert.equal(f.draft.fields.step, 4);
  assert.equal(footer().props.label, "Connect bank account");
  await footer().props.onPress();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(f.draft.fields.betaAccountId, "sample");
  assert.equal(footer().props.label, "Continue");
  assert.equal(footer().props.disabled, false);
  footer().props.onPress();
  assert.ok(f.find("Just for you"));
  back();
  assert.equal(f.draft.fields.step, 4);
  assert.equal(
    f.tree().find((n) => n.props?.accessibilityRole === "radio").props
      .accessibilityState.checked,
    true,
  );
  back();
  assert.equal(f.draft.fields.step, 2);
  f.find("No Circle — just for me").props.onPress();
  footer().props.onPress();
  footer().props.onPress();
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(f.sends, [
    {
      name: "My card",
      design: "aurora",
      circleId: null,
      betaAccountId: "sample",
    },
  ]);
});

test("beta existing accounts require a current choice and stale review drafts return to bank selection", () => {
  const accounts = [
    { id: "one", name: "Personal checking", last4: "4821", state: "simulated" },
    {
      id: "two",
      name: "Household checking",
      last4: "7390",
      state: "simulated",
    },
  ];
  const f = form({ beta: true, step: 3, accounts, betaAccountId: "removed" });
  const footer = () => f.tree().find((n) => n.type === "Action");
  assert.equal(
    f.tree().find((n) => n.type === "Shell").props.title,
    "Bank account",
  );
  assert.equal(footer().props.disabled, true);
  f.tree()
    .find((n) => n.props?.accessibilityLabel?.includes("Household checking,"))
    .props.onPress();
  assert.equal(f.draft.fields.betaAccountId, "two");
  assert.equal(
    f.tree().find((n) => n.type === "Shell").props.title,
    "Bank account",
  );
  assert.equal(footer().props.disabled, false);
  footer().props.onPress();
  assert.ok(f.find("Just for you"));
});

test("unknown capability and failed account loads cannot skip the beta step", () => {
  for (const options of [
    { capabilitiesError: "Offline" },
    { capabilitiesLoading: true },
    { beta: true, step: 4, bankError: "Offline" },
  ]) {
    const f = form(options);
    assert.equal(
      f.tree().find((n) => n.type === "Action").props.disabled,
      true,
    );
  }
  const resume = form({ beta: true, step: 3, resuming: true, locked: true });
  assert.equal(
    resume.tree().find((n) => n.type === "Shell").props.title,
    "Review card",
  );
  assert.equal(
    resume.tree().find((n) => n.type === "Action").props.disabled,
    false,
  );
});

test("pending beta submissions retain their disclosure when account or capability reads fail", () => {
  for (const failure of [
    { bankError: "Offline" },
    { capabilitiesError: "Offline" },
    { capabilitiesLoading: true },
  ]) {
    const f = form({
      beta: true,
      step: 3,
      resuming: true,
      locked: true,
      betaAccountId: "persisted-sample",
      ...failure,
    });
    const hints = f
      .tree()
      .filter((n) => n.type === "CardHint")
      .map((n) => n.props.children);
    assert.ok(
      hints.includes(
        "Beta · Simulated accounts only. No bank login or money movement.",
      ),
    );
    assert.equal(
      f.find("Saved sample account").props.subtitle,
      "Details unavailable",
    );
    assert.equal(
      f.tree().find((n) => n.type === "Action").props.disabled,
      false,
    );
  }
});

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
    ocean_artwork: "Ocean",
    sunset_artwork: "Sunset",
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
    cobalt_gradient: "Cobalt",
    tidal_gradient: "Tidal",
    ember_gradient: "Ember",
    iris_gradient: "Iris",
    evergreen_twotone: "Evergreen",
    clay_twotone: "Clay",
    indigo_twotone: "Indigo",
    slate_twotone: "Slate",
    navy_solid: "Navy",
    plum_solid: "Plum",
    sage_solid: "Sage",
    sand_solid: "Sand",
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
      f
        .tree()
        .find(
          (n) =>
            n.props?.accessibilityLabel === label &&
            n.props?.children?.[0]?.props?.design === design,
        );
    for (const category of [
      "Finishes",
      "Artwork",
      "Gradients",
      "Two tone",
      "Solid colors",
    ])
      f.tree()
        .find((n) => n.props?.accessibilityLabel === "See all " + category)
        .props.onPress();
    assert.equal(
      f.tree().filter((n) => n.props?.accessibilityRole === "radio").length,
      33,
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

test("creation and review get the signed-in full name and host role without storing identity in the draft", () => {
  for (const step of [0, 3]) {
    const f = form({ step });
    const previews = f.tree().filter((n) => n.type === "Preview");
    assert.ok(previews.length > 0);
    for (const p of previews)
      assert.deepEqual(p.props.creationIdentity, {
        fullName: "Alexandra María van der Linden",
        role: "host",
      });
    assert.equal(f.draft.fields.creationIdentity, undefined);
  }
});

test("the category order matches Figma and expansion links use dark green without changing selection", () => {
  const f = form({ step: 0 });
  assert.deepEqual(
    f
      .tree()
      .filter((n) => n.props?.accessibilityLabel?.startsWith("See all "))
      .map((n) => n.props.accessibilityLabel),
    [
      "See all Finishes",
      "See all Artwork",
      "See all Gradients",
      "See all Two tone",
      "See all Solid colors",
    ],
  );
  const button = (label) =>
    f.tree().find((n) => n.props?.accessibilityLabel === label);
  for (const category of [
    "Finishes",
    "Gradients",
    "Two tone",
    "Artwork",
    "Solid colors",
  ]) {
    const expand = button("See all " + category);
    assert.ok(expand, category);
    assert.equal(expand.props.children.props.style.color, "#006D67");
    expand.props.onPress();
    const collapse = button("See less " + category);
    assert.equal(collapse.props.children.props.style.color, "#006D67");
    collapse.props.onPress();
    assert.equal(f.draft.fields.design, "aurora");
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
  const catalog = load(
    "../src/features/potluck/card-appearance-catalog.ts",
    {},
  );
  const { CardPreview } = load("../src/features/potluck/card-preview.tsx", {
    "./card-artwork": load("../src/features/potluck/card-artwork.tsx", {
      "./card-appearance-catalog": catalog,
      "react-native": { View: node, StyleSheet: { absoluteFill: {} } },
      "expo-image": { Image: () => null },
    }),
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
