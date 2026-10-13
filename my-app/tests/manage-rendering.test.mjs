import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { compileFunction } from "node:vm";
import React from "react";
import ts from "typescript";

const require = createRequire(import.meta.url);
function screen(type, owned, resource = {}) {
  const state = [],
    commands = [],
    visits = [];
  let cursor = 0;
  const item = {
    id: "item",
    name: "My arrangement",
    hostId: owned ? "me" : "other",
    version: 3,
    connectionVersion: 2,
    circleId: "circle",
    cardId: "card",
    status: "setup_required",
    design: "graphite",
  };
  const imports = {
    react: {
      ...React,
      useRef: (v) => ({ current: v }),
      useEffect: (fn) => fn(),
      useState(initial) {
        const i = cursor++;
        if (!(i in state)) state[i] = initial;
        return [
          state[i],
          (value) => {
            state[i] = value;
          },
        ];
      },
    },
    "expo-router": {
      useNavigation: () => ({
        dispatch() {},
        reset: (s) => visits.push("/cards?closed=" + s.routes[0].params.closed),
      }),
      useLocalSearchParams: () => ({ type, id: "item" }),
      router: {
        back: () => visits.push("back"),
        replace: (path) => visits.push(path),
      },
    },
    "expo-router/react-navigation": { usePreventRemove() {} },
    "react-native": { View: "View" },
    "@/services/route-return": {
      returnToRoute: (path) => visits.push(path),
      cardPeopleRoute: (id) => `/card/${id}/people`,
    },
    "./card-context": { CardContext: "CardContext" },
    "./card-ui": {
      CardHeading: "Text",
      CardActionRow: "CardActionRow",
      CardCircleChoice: "CardCircleChoice",
    },
    "@/design/system": Object.fromEntries([
      ...["Shell", "Row", "Action", "ResourceState", "ErrorText"].map(
        (name) => [name, name],
      ),
      ...["Title", "Label", "Muted", "Link"].map((name) => [name, "Text"]),
      ["AuthGate", React.Fragment],
      ["go", (path) => visits.push(path)],
    ]),
    "@/services/client": {
      useClient: () => ({ user: { id: "me" } }),
      useResource: (path) =>
        path === `/${type}/item`
          ? { data: item, reload() {}, ...resource }
          : { data: { items: [] } },
      useAction: () => ({
        busy: false,
        error: "",
        setError() {},
        run: (fn) => fn(),
      }),
      useCommand:
        () =>
        async (...args) =>
          commands.push(args),
    },
  };
  function load(file) {
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
      (id) => imports[id] ?? require(id),
      module,
      module.exports,
    );
    return module.exports;
  }
  imports["@/features/potluck/card-management"] = load(
    "../src/features/potluck/card-management.tsx",
  );
  const module = load("../src/app/manage/[type]/[id].tsx");
  function render() {
    cursor = 0;
    const root = module.default(),
      nodes = [],
      violations = [];
    function visit(node, inText = false) {
      if (node == null || typeof node === "boolean") return;
      if (Array.isArray(node))
        return node.forEach((child) => visit(child, inText));
      if (typeof node === "string" || typeof node === "number") {
        if (!inText) violations.push(node);
        return;
      }
      if (typeof node.type === "function")
        return visit(node.type(node.props), inText);
      nodes.push(node);
      const text =
        node.type === "Text" || (node.type === React.Fragment && inText);
      visit(node.props?.children, text);
      visit(node.props?.footer, false);
      visit(node.props?.right, false);
    }
    visit(root);
    return { nodes, violations };
  }
  return { render, commands, visits };
}

for (const type of ["cards", "bills", "circles"]) {
  for (const owned of [true, false]) {
    test(`Manage ${type}, owned=${owned}: native children contain no bare text`, () => {
      assert.deepEqual(screen(type, owned).render().violations, []);
      for (const resource of [
        { data: null, loading: true },
        { data: null, error: "Unavailable" },
        { data: null, loading: false },
      ]) {
        assert.deepEqual(screen(type, owned, resource).render().violations, []);
      }
    });
  }
}

test("Manage connection retains the original versioned payload and cancel behavior", async () => {
  const s = screen("bills", true);
  s.render()
    .nodes.find((n) => n.props.title === "Change connection")
    .props.onPress();
  assert.deepEqual(s.render().violations, []);
  s.render()
    .nodes.find((n) => n.props.label === "Keep as it is")
    .props.onPress();
  assert.equal(s.commands.length, 0);
  s.render()
    .nodes.find((n) => n.props.title === "Change connection")
    .props.onPress();
  await s
    .render()
    .nodes.find((n) => n.props.label === "Save connection")
    .props.onPress();
  assert.deepEqual(s.commands, [
    [
      "/bills/item/connection",
      {
        expectedVersion: 3,
        expectedConnectionVersion: 2,
        circleId: "circle",
        cardId: "card",
      },
    ],
  ]);
  assert.deepEqual(s.visits, ["back"]);
});

test("Manage end/leave confirmation preserves consent payload and destination", async () => {
  for (const [type, owned, label, endpoint] of [
    ["cards", true, "Close card", "close"],
    ["bills", true, "End this Bill", "end"],
    ["circles", false, "Leave this Circle", "leave"],
  ]) {
    const s = screen(type, owned);
    s.render()
      .nodes.find(
        (n) =>
          (n.type === "Text" && n.props.children === label) ||
          (n.type === "CardActionRow" && n.props.title === label),
      )
      .props.onPress();
    assert.deepEqual(s.render().violations, []);
    await s
      .render()
      .nodes.find((n) => n.type === "Action" && n.props.danger)
      .props.onPress();
    assert.deepEqual(s.commands, [
      [`/${type}/item/${endpoint}`, { expectedVersion: 3, acknowledged: true }],
    ]);
    s.render();
    assert.deepEqual(s.visits, [
      type === "cards" ? "/cards?closed=item" : `/${type}`,
    ]);
  }
});
