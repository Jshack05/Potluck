import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { compileFunction } from "node:vm";
import React from "react";
import ts from "typescript";
import { merchantControlsSummary } from "../src/features/potluck/merchant-controls-model.ts";

const require = createRequire(import.meta.url);

// Native views, router history and API reads are boundaries. Route handlers,
// CardScene, Shell and Action are executed, including the funding step state.
function screen(
  route,
  { history = false, bottomInset = 34, source, stack = [], circle = null } = {},
) {
  let cursor = 0;
  let removal;
  let mountedKey;
  const user = { id: "host" };
  const state = [],
    visits = [];
  const native = (name) =>
    function Native(props) {
      return React.createElement(name, props, props.children);
    };
  const card = {
    id: "card-1",
    name: "Apartment card",
    hostId: "host",
    circleId: circle?.id ?? null,
    role: "host",
    status: "setup_required",
    version: 1,
    createdAt: "2026-10-01T12:00:00Z",
    design: "aurora",
    description: "",
    availableMinor: null,
    pendingMinor: null,
    reservedMinor: null,
    bills: [],
    spenders: [],
  };
  const theme = { teal: "#006d67", ink: "#273232", canvas: "#f3f2ef" };
  const common = {
    react: {
      ...React,
      useRef: (v) => ({ current: v }),
      useContext: () => theme.teal,
      useId: () => "field",
      useState: (initial) => {
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
    "react-native": {
      ...Object.fromEntries(
        [
          "View",
          "Pressable",
          "ScrollView",
          "TextInput",
          "KeyboardAvoidingView",
        ].map((n) => [n, native(n)]),
      ),
      Platform: { OS: "ios" },
      useWindowDimensions: () => ({ width: 430, height: 932, fontScale: 1 }),
      StyleSheet: { create: (s) => s },
    },
    "expo-image": { Image: native("Image") },
    "expo-router": {
      router: {
        canGoBack: () => history,
        back: () => visits.push("back"),
        replace: (p) => visits.push(p),
        push: (p) => {
          visits.push(p);
          stack.push(p);
        },
        dismissTo: (p) => {
          visits.push(p);
          const index = stack.lastIndexOf(p);
          if (index >= 0) stack.splice(index + 1);
          else stack.splice(Math.max(0, stack.length - 1), 1, p);
        },
      },
      useNavigation: () => ({ dispatch() {} }),
      useLocalSearchParams: () => ({ id: card.id, source }),
      usePathname: () => "/card/" + card.id + "/" + route,
      Redirect: native("Redirect"),
    },
    "expo-router/react-navigation": {
      usePreventRemove: (enabled, callback) => {
        removal = enabled ? callback : null;
      },
    },
    "react-native-safe-area-context": {
      useSafeAreaInsets: () => ({
        top: 47,
        bottom: bottomInset,
        left: 0,
        right: 0,
      }),
    },
    "@/services/client": {
      useClient: () => ({
        user,
        ready: true,
        access: "bank_required",
      }),
      useResource: (path) => ({
        data: path?.endsWith("/merchant-controls")
          ? { settings: { industries: ["groceries"] } }
          : path?.startsWith("/cards/")
            ? card
            : path?.startsWith("/circles/")
              ? circle
              : null,
        error: "",
        loading: false,
      }),
    },
    "@/services/navigation": { entryDestination: () => null },
    "@/features/potluck/creation-menu": {
      CreationMenu: native("CreationMenu"),
    },
    "./primitives": {
      theme,
      icons: {},
      Label: native("Text"),
      Title: native("Title"),
      Muted: native("Muted"),
      Icon: native("Icon"),
    },
    "./chrome": {
      mainTab: () => null,
      BottomNavigation: native("Navigation"),
      HeaderActions: native("HeaderActions"),
    },
    "./loading": { LoadingFeedback: () => null },
    "@/features/potluck/card-preview": { CardPreview: () => null },
    "@/features/potluck/merchant-controls-model": { merchantControlsSummary },
    "@/features/potluck/card-ui": Object.fromEntries(
      ["CardHeading", "CardSettingsGroup", "CardSetting"].map((n) => [
        n,
        native(n),
      ]),
    ),
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
      (id) => (Object.hasOwn(common, id) ? common[id] : require(id)),
      module,
      module.exports,
    );
    return module.exports;
  }
  common["@/services/route-return"] = load("../src/services/route-return.ts");
  common["@/design/system"] = load("../src/design/system.tsx");
  common["./system"] = common["@/design/system"];
  common["@/design/form-controls"] = load("../src/design/form-controls.tsx");
  common["@/features/potluck/card-scene"] = load(
    "../src/features/potluck/card-scene.tsx",
  );
  common["@/features/potluck/planning-controls"] = {
    PlanningPanel: native("PlanningPanel"),
  };
  common["@/features/potluck/calendar-model"] = {
    moneyInput: (s) => Number(s) * 100,
  };
  common["@/features/potluck/card-context"] = {
    CardContext: native("CardContext"),
  };
  common["@/features/potluck/card-people"] = {
    CardPersonRow: (props) =>
      React.createElement(
        "Pressable",
        { ...props, accessibilityLabel: props.name },
        props.name,
      ),
    CardPermissionRow: native("PermissionRow"),
    CardPersonHeading: native("Title"),
    CardPeopleInfo: native("Text"),
  };
  const Page = load("../src/app/card/[id]/" + route + ".tsx").default;
  function render(root = React.createElement(Page)) {
    cursor = 0;
    const all = [];
    function visit(node, ancestors = []) {
      if (Array.isArray(node))
        return node.forEach((child) => visit(child, ancestors));
      if (!node?.props) return;
      if (
        node.type?.name === "CardInvitationDraft" &&
        node.key !== mountedKey
      ) {
        mountedKey = node.key;
        state.length = 0;
        cursor = 0;
      }
      if (typeof node.type === "function")
        return visit(node.type(node.props), ancestors);
      all.push({ ...node, ancestors });
      visit(node.props.children, [...ancestors, node]);
    }
    visit(root);
    return all;
  }
  const text = (node) =>
    typeof node === "string"
      ? node
      : Array.isArray(node)
        ? node.map(text).join("")
        : node?.props
          ? text(node.props.children)
          : "";
  return {
    card,
    user,
    osBack: () => {
      render();
      removal?.({ data: { action: { type: "GO_BACK" } } });
    },
    render,
    renderEntry: () =>
      render(
        React.createElement(
          common["@/design/system"].EntryShell,
          {
            footer: React.createElement("AccountActions"),
          },
          React.createElement("PasswordField"),
        ),
      ),
    renderShell: (props) =>
      render(
        React.createElement(common["@/design/system"].Shell, {
          title: "Create card",
          footer: React.createElement("Continue"),
          ...props,
        }),
      ),
    visits,
    back: () =>
      render()
        .find((n) => n.props.accessibilityLabel === "Go back")
        .props.onPress(),
    input: () => render().find((n) => n.type === "TextInput"),
    button: (label) =>
      render().find((n) => n.type === "Pressable" && text(n) === label),
    text: () =>
      render()
        .filter((n) => n.type === "Text")
        .map(text)
        .join(" "),
  };
}

test("background dismissal is opt-in and sits behind scroll content, without owning child presses", () => {
  const s = screen("fund");
  let dismissed = 0,
    childPresses = 0;
  const props = {
    onBackgroundPress: () => dismissed++,
    backgroundAccessibilityLabel: "Reset card arrangement",
    children: React.createElement("Pressable", {
      onPress: () => childPresses++,
      testID: "child-control",
    }),
  };
  assert.equal(
    s
      .renderShell({})
      .some((n) => n.props.testID === "screen-background-action"),
    false,
  );
  const nodes = s.renderShell(props);
  const background = nodes.find(
    (n) => n.props.testID === "screen-background-action",
  );
  assert.ok(background);
  assert.ok(background.ancestors.some((n) => n.type === "ScrollView"));
  assert.equal(background.props.style.position, "absolute");
  const child = nodes.find((n) => n.props.testID === "child-control");
  assert.ok(nodes.indexOf(background) < nodes.indexOf(child));
  assert.ok(
    child.ancestors.every((n) => n.props.testID !== "screen-background-action"),
  );
  child.props.onPress();
  assert.equal(dismissed, 0);
  background.props.onPress();
  assert.equal(dismissed, 1);
  assert.equal(childPresses, 1);
});

test("transfer-review header Back restores amount selection without leaving funding", () => {
  const s = screen("fund", { history: true });
  s.input().props.onChangeText("50.25");
  s.button("Review transfer").props.onPress();
  assert.ok(s.text().includes("Review transfer"));
  s.back();
  assert.deepEqual(s.visits, []);
  assert.equal(s.input().props.value, "50.25");
  assert.ok(s.button("Review transfer"));
  s.back();
  assert.deepEqual(s.visits, ["back"]);
});

test("floating creation controls do not reserve an opaque full-width footer and reserve measured scroll clearance", () => {
  const s = screen("fund");
  const tree = s.renderShell({ createMenu: true });
  const dock = tree.find((n) => n.props.testID === "floating-screen-actions");
  assert.ok(dock);
  assert.equal(dock.props.pointerEvents, "box-none");
  assert.equal(dock.props.style.position, "absolute");
  dock.props.onLayout({ nativeEvent: { layout: { height: 96 } } });
  const updated = s.renderShell({ createMenu: true });
  assert.equal(
    updated.find((n) => n.type === "ScrollView").props.contentContainerStyle
      .paddingBottom,
    120,
  );
  assert.ok(
    updated
      .find((n) => n.type === "ScrollView")
      .ancestors.every((n) => n.props.testID !== "floating-screen-actions"),
  );
});

test("combined Card form disables keyboard-driven footer movement without changing other screens", () => {
  const s = screen("fund");
  const stationary = s.renderShell({
    avoidKeyboard: false,
    hideNavigation: true,
  });
  const footer = stationary.find((n) => n.type === "Continue");
  assert.ok(footer);
  assert.ok(
    footer.ancestors
      .filter((n) => n.type === "KeyboardAvoidingView")
      .every((n) => n.props.enabled === false),
  );
  assert.equal(
    s.renderShell({}).find((n) => n.type === "KeyboardAvoidingView").props
      .enabled,
    true,
  );
});

test("account-entry fields can avoid the keyboard without moving footer actions over them", () => {
  const nodes = screen("fund").renderEntry();
  const input = nodes.find((n) => n.type === "PasswordField");
  const footer = nodes.find((n) => n.type === "AccountActions");
  assert.ok(input.ancestors.some((n) => n.type === "ScrollView"));
  assert.ok(input.ancestors.some((n) => n.type === "KeyboardAvoidingView"));
  assert.equal(
    footer.ancestors.some((n) => n.type === "KeyboardAvoidingView"),
    false,
  );
  assert.equal(
    footer.ancestors.some((n) => n.type === "ScrollView"),
    false,
  );
});

test("content-only keyboard adjustment leaves Merchant controls actions and navigation stationary", () => {
  const nodes = screen("fund").renderShell({
    keyboardContentOnly: true,
    subtitle: "Choose where this card can be used.",
  });
  assert.equal(
    nodes.find((n) => n.type === "KeyboardAvoidingView").props.enabled,
    false,
  );
  assert.equal(
    nodes.find((n) => n.type === "ScrollView").props
      .automaticallyAdjustKeyboardInsets,
    true,
  );
  const subtitle = nodes.find(
    (n) =>
      n.type === "Text" &&
      n.props.children === "Choose where this card can be used.",
  );
  assert.ok(subtitle);
  assert.equal(
    subtitle.ancestors.some((n) => n.type === "ScrollView"),
    false,
  );
  for (const type of ["Continue", "Navigation"]) {
    assert.ok(
      nodes
        .find((n) => n.type === type)
        .ancestors.every((n) => n.type !== "ScrollView"),
    );
  }
});

test("Card settings combines amount and industry controls into one working entry", () => {
  const s = screen("setup");
  const rows = s.render().filter((n) => n.type === "CardSetting");
  assert.equal(
    rows.some((n) => n.props.title === "Spending limit"),
    false,
  );
  assert.equal(
    rows.some((n) => n.props.title === "Merchant controls"),
    false,
  );
  const entries = rows.filter((n) => n.props.title === "Spending controls");
  assert.equal(entries.length, 1);
  const row = entries[0];
  assert.equal(row.props.value, "1 industry");
  row.props.onPress();
  assert.deepEqual(s.visits, ["/card/card-1/merchant-controls"]);
  rows.find((n) => n.props.title === "Trusted spenders").props.onPress();
  assert.equal(s.visits.at(-1), "/card/card-1/people?source=settings");
});

test("direct-entry Card secondary Back returns to the affected Card", () => {
  for (const route of ["fund", "balance", "activity", "people", "setup"]) {
    const s = screen(route);
    s.back();
    assert.deepEqual(s.visits, ["/card/card-1"], route);
  }
});

test("focused Card flows omit the tab dock while settings retains it", () => {
  for (const route of ["fund", "balance", "activity", "people", "invite"]) {
    assert.equal(
      screen(route)
        .render()
        .filter((n) => n.type === "Navigation").length,
      0,
      route,
    );
  }
  assert.equal(
    screen("setup")
      .render()
      .filter((n) => n.type === "Navigation").length,
    1,
  );
});

test("funding review uses its header Back instead of an extra Change amount action", () => {
  const s = screen("fund");
  s.input().props.onChangeText("50");
  s.button("Review transfer").props.onPress();
  assert.equal(s.button("Change amount"), undefined);
});

test("without a tab dock, funding footer clears the iPhone bottom safe area", () => {
  const s = screen("fund", { bottomInset: 34 });
  const button = s.button("Review transfer");
  assert.ok(button.ancestors.some((n) => n.props.style?.paddingBottom >= 34));
});

test("activity keeps its header and role screens use the updated Figma heading", () => {
  for (const route of ["activity"]) {
    const title = screen(route)
      .render()
      .find((n) => n.props.accessibilityRole === "header");
    assert.equal(title.props.style.textAlign, "center", route);
    assert.equal(title.props.style.fontSize, 16, route);
    assert.equal(title.props.style.fontFamily, "Inter_600SemiBold", route);
  }
  for (const route of ["people", "invite"]) {
    const title = screen(route)
      .render()
      .find((n) => n.props.accessibilityRole === "header");
    assert.equal(title.props.style.textAlign, "left");
    assert.equal(title.props.style.fontSize, 26);
  }
  assert.equal(
    screen("fund")
      .render()
      .find((n) => n.props.accessibilityRole === "header").props.style.fontSize,
    28,
  );
});

test("People/Invite cancellation unwinds repeated visits to each valid parent", () => {
  for (const [source, parent] of [
    ["card", "/card/card-1"],
    ["settings", "/card/card-1/setup"],
    ["manage", "/manage/cards/card-1"],
  ]) {
    const people = "/card/card-1/people?source=" + source;
    const stack = [parent, people];
    for (let cycle = 0; cycle < 3; cycle++) {
      screen("people", { source, stack })
        .button("Invite trusted spender")
        .props.onPress();
      assert.equal(stack.at(-1), "/card/card-1/invite?source=" + source);
      screen("invite", { source, stack }).back();
      assert.deepEqual(stack, [parent, people]);
      screen("people", { source, stack }).back();
      assert.deepEqual(stack, [parent]);
      stack.push(people);
    }
  }
});

test("explicit parent wins over unrelated history; local Back still wins", () => {
  const stack = ["/circles", "/card/card-1/people"];
  const s = screen("people", {
    source: "https://bad.example",
    stack,
    history: true,
  });
  s.back();
  assert.deepEqual(stack, ["/circles", "/card/card-1"]);
  s.back();
  assert.deepEqual(stack, ["/circles", "/card/card-1"]);
  let local = 0;
  s.renderShell({ back: true, backTo: "/cards", onBack: () => local++ })
    .find((n) => n.props.accessibilityLabel === "Go back")
    .props.onPress();
  assert.equal(local, 1);
  assert.deepEqual(stack, ["/circles", "/card/card-1"]);
});

test("invite drafts preserve person and amount on Back, discard on Cancel, and cannot send", () => {
  const s = screen("invite", {
    source: "manage",
    circle: { id: "circle", people: [{ id: "p", name: "Quinn Avery" }] },
  });
  const pick = () =>
    s.render().find((n) => n.props.accessibilityLabel === "Quinn Avery");
  assert.ok(pick());
  pick().props.onPress();
  s.input().props.onChangeText("75.25");
  s.button("Review spending access").props.onPress();
  assert.equal(s.button("Invitation unavailable").props.disabled, true);
  s.back();
  assert.equal(s.input().props.value, "75.25");
  s.back();
  pick().props.onPress();
  assert.equal(s.input().props.value, "75.25");
  s.button("Cancel").props.onPress();
  assert.equal(s.visits.at(-1), "/card/card-1/people?source=manage");
  pick().props.onPress();
  assert.equal(s.input().props.value, "");
  s.card.role = "trusted_spender";
  assert.equal(s.button("Review spending access"), undefined);
  assert.equal(s.button("Invitation unavailable"), undefined);
});

test("native Back from People respects management origin even with unrelated history", () => {
  const stack = ["/circles", "/card/card-1/people?source=manage"];
  const s = screen("people", { source: "manage", stack, history: true });
  s.osBack();
  assert.deepEqual(stack, ["/circles", "/manage/cards/card-1"]);
});

test("People identity belongs to scroll content, not the invitation footer", () => {
  const context = screen("people")
    .render()
    .find((n) => n.type === "CardContext");
  assert.ok(context.ancestors.some((n) => n.type === "ScrollView"));
});

test("native Back at the invitation picker returns to People, even on direct entry", () => {
  const stack = ["/circles", "/card/card-1/invite?source=manage"];
  const s = screen("invite", { source: "manage", stack });
  s.osBack();
  assert.deepEqual(stack, ["/circles", "/card/card-1/people?source=manage"]);
});

test("changing Card or signed-in user discards the prior invitation draft", () => {
  for (const change of [
    (s) => {
      s.card.id = "card-2";
    },
    (s) => {
      s.user.id = "other-user";
    },
  ]) {
    const s = screen("invite", {
      circle: { id: "c", people: [{ id: "p", name: "Quinn Avery" }] },
    });
    s.render()
      .find((n) => n.props.accessibilityLabel === "Quinn Avery")
      .props.onPress();
    s.input().props.onChangeText("75.25");
    change(s);
    assert.equal(s.input(), undefined);
    s.render()
      .find((n) => n.props.accessibilityLabel === "Quinn Avery")
      .props.onPress();
    assert.equal(s.input().props.value, "");
  }
});
