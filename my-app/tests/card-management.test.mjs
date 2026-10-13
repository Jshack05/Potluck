import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { compileFunction } from "node:vm";
import React from "react";
import ts from "typescript";
import { StackRouter } from "expo-router/build/react-navigation/routers/StackRouter.js";

function screen({
  owned = true,
  status = "setup_required",
  circleId = "c1",
  circleUnavailable = false,
} = {}) {
  const stackRouter = StackRouter({});
  const stackOptions = {
    routeNames: ["card/[id]", "card/[id]/setup", "manage/[type]/[id]", "cards"],
    routeParamList: {},
    routeGetIdList: {},
  };
  let stack = stackRouter.getRehydratedState(
    {
      stale: true,
      routes: stackOptions.routeNames.slice(0, 3).map((name) => ({ name })),
    },
    stackOptions,
  );
  let cursor = 0,
    error = "",
    busy = false,
    failure = false,
    hold;
  const state = [],
    commands = [],
    visits = [],
    effects = [];
  const card = {
    id: "card",
    name: "Weekend",
    hostId: owned ? "me" : "other",
    status,
    circleId,
    version: 3,
    role: owned ? "host" : "trusted_spender",
    design: "graphite",
    bills: [],
  };
  let removal;
  const imports = {
    react: {
      ...React,
      useState: (initial) => {
        const i = cursor++;
        if (!(i in state))
          state[i] = typeof initial === "function" ? initial() : initial;
        return [
          state[i],
          (v) => (state[i] = typeof v === "function" ? v(state[i]) : v),
        ];
      },
      useRef: (initial) => {
        const i = cursor++;
        return (state[i] ??= { current: initial });
      },
      useEffect: (fn) => {
        effects.push(fn);
      },
    },
    "react-native": {
      View: "View",
      Pressable: "Pressable",
      StyleSheet: { create: (x) => x },
    },
    "expo-router": {
      useNavigation: () => ({
        dispatch: (a) => visits.push(a),
        reset: (payload) => {
          stack = stackRouter.getRehydratedState(
            stackRouter.getStateForAction(
              stack,
              { type: "RESET", payload },
              stackOptions,
            ),
            stackOptions,
          );
          visits.push("/cards?closed=" + payload.routes[0].params.closed);
        },
      }),
    },
    "expo-router/react-navigation": {
      usePreventRemove: (enabled, fn) => {
        removal = enabled ? fn : null;
      },
    },
    "@/design/system": {
      ...Object.fromEntries(
        [
          "Shell",
          "Action",
          "Link",
          "ResourceState",
          "ErrorText",
          "Label",
          "Muted",
        ].map((x) => [x, x]),
      ),
      AuthGate: React.Fragment,
      go: (p) => visits.push(p),
      theme: {},
    },
    "@/services/route-return": {
      returnToRoute: (p) => visits.push(p),
      cardPeopleRoute: (id, source) => `/card/${id}/people?source=${source}`,
    },
    "./card-context": { CardContext: "CardContext" },
    "./card-ui": Object.fromEntries(
      ["CardHeading", "CardCircleChoice", "CardActionRow"].map((x) => [x, x]),
    ),
    "@/services/client": {
      useClient: () => ({ user: { id: "me", name: "Joseph Shackelford" } }),
      useResource: (path) => ({
        data:
          path === "/cards/card"
            ? card
            : path === "/circles/c1"
              ? circleUnavailable
                ? null
                : { id: "c1", name: "Apartment", memberCount: 3 }
              : {
                  items: [
                    { id: "c1", name: "Apartment", memberCount: 3 },
                    { id: "c2", name: "Family", memberCount: 2 },
                  ],
                },
        loading: false,
        error:
          path === "/circles/c1" && circleUnavailable
            ? "Circle not available"
            : "",
        reload: async () => visits.push("reload"),
      }),
      useAction: () => ({
        busy,
        error,
        setError: (e) => (error = e),
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
        commands.push([path, body]);
        if (hold) await hold;
        if (failure)
          throw new Error("Changed elsewhere. Refresh and try again.");
        if (path.endsWith("connection")) {
          card.circleId = body.circleId;
          card.version++;
        } else {
          card.status = "closed";
          card.version++;
        }
      },
    },
  };
  const module = { exports: {} },
    require = createRequire(import.meta.url);
  const code = ts.transpileModule(
    readFileSync(
      new URL("../src/features/potluck/card-management.tsx", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  compileFunction(code, ["require", "module", "exports"])(
    (id) => imports[id] ?? require(id),
    module,
    module.exports,
  );
  function render() {
    cursor = 0;
    effects.length = 0;
    const nodes = [];
    function visit(n) {
      if (Array.isArray(n)) return n.forEach(visit);
      if (!n?.props) return;
      if (typeof n.type === "function") return visit(n.type(n.props));
      nodes.push(n);
      visit(n.props.children);
      visit(n.props.footer);
    }
    visit(module.exports.CardManagement({ id: "card" }));
    for (const fn of effects) fn();
    return nodes;
  }
  const button = (label) =>
    render().find(
      (n) =>
        typeof n.props.onPress === "function" &&
        (n.props.label === label ||
          n.props.title === label ||
          (n.type === "Link" && n.props.children === label)),
    );
  return {
    render,
    button,
    commands,
    visits,
    card,
    stack: () => stack,
    fail: (v) => (failure = v),
    hold: (v) => (hold = v),
    back: () =>
      render()
        .find((n) => n.type === "Shell")
        .props.onBack(),
    osBack: () => {
      render();
      removal?.({ data: { action: { type: "GO_BACK" } } });
    },
  };
}

test("saved connection is selected, Cancel and native Back discard edits, reopening starts fresh", () => {
  for (const circleId of ["c1", null]) {
    const s = screen({ circleId });
    assert.equal(
      s.render().find((n) => n.type === "Shell").props.active,
      "Cards",
    );
    s.button(circleId ? "Apartment" : "Just for you").props.onPress();
    assert.equal(
      s.button(circleId ? "Apartment" : "Just for you").props.selected,
      true,
    );
    s.button("Family").props.onPress();
    s.button("Cancel").props.onPress();
    s.button(circleId ? "Apartment" : "Just for you").props.onPress();
    assert.equal(s.button("Family").props.selected, false);
    s.osBack();
    assert.ok(s.button("Trusted Spenders"));
    s.back();
    assert.equal(s.visits.at(-1), "/card/card/setup");
  }
});

test("connection save preserves versioned draft on failure and refreshes only after success", async () => {
  const s = screen();
  s.button("Apartment").props.onPress();
  s.button("Family").props.onPress();
  s.fail(true);
  await s.button("Save connection").props.onPress();
  assert.equal(s.button("Family").props.selected, true);
  assert.ok(s.render().some((n) => n.type === "ErrorText" && n.props.text));
  s.card.version = 9; // Focus refresh must not silently upgrade a stale edit.
  s.fail(false);
  await s.button("Save connection").props.onPress();
  assert.deepEqual(s.commands[1], [
    "/cards/card/connection",
    { expectedVersion: 3, circleId: "c2" },
  ]);
  assert.ok(s.visits.includes("reload"));
  assert.ok(s.button("Trusted Spenders"));
});

test("closure waits for the server, keeps blocked confirmation, deduplicates taps and leaves completed routes", async () => {
  const s = screen();
  s.button("Close card").props.onPress();
  s.fail(true);
  await s.button("Close card").props.onPress();
  assert.ok(s.button("Keep card"));
  assert.equal(s.visits.includes("/cards"), false);
  let release;
  s.hold(new Promise((r) => (release = r)));
  s.fail(false);
  const close = s.button("Close card").props.onPress;
  const pending = close();
  await close();
  s.osBack();
  assert.ok(s.button("Keep card"));
  release();
  await pending;
  s.render();
  assert.equal(s.commands.length, 2);
  assert.deepEqual(s.commands[1], [
    "/cards/card/close",
    { expectedVersion: 3, acknowledged: true },
  ]);
  assert.equal(s.visits.at(-1), "/cards?closed=card");
  assert.deepEqual(
    s.stack().routes.map((r) => r.name),
    ["cards"],
  );
  assert.equal(stackHasBack(s.stack()), false);
});

function stackHasBack(state) {
  return state.index > 0;
}

test("an unreadable former Circle does not trap the owner in that connection", async () => {
  const s = screen({ circleUnavailable: true });
  assert.ok(s.button("Change Circle"));
  s.button("Change Circle").props.onPress();
  s.button("Just for you").props.onPress();
  await s.button("Save connection").props.onPress();
  assert.equal(s.commands[0][1].circleId, null);
});

test("nonownership alone never labels a user as a Trusted Spender", () => {
  const s = screen({ owned: false });
  assert.equal(
    s.render().find((n) => n.type === "CardContext").props.roleLabel,
    undefined,
  );
});

test("ineligible Cards expose no management mutations", () => {
  for (const options of [
    { owned: false },
    { status: "closed" },
    { status: "active" },
  ]) {
    const s = screen(options);
    assert.equal(s.button("Close card"), undefined);
    if (!options.owned || options.status === "closed")
      assert.equal(s.button("Save connection"), undefined);
  }
});
