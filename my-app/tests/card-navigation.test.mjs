import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { compileFunction } from "node:vm";
import React from "react";
import ts from "typescript";

const require = createRequire(import.meta.url);

// Native views, router history and API reads are boundaries. Route handlers,
// CardScene, Shell and Action are executed, including the funding step state.
function screen(route, { history = false, bottomInset = 34 } = {}) {
  let cursor = 0;
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
    circleId: null,
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
      StyleSheet: { create: (s) => s },
    },
    "expo-image": { Image: native("Image") },
    "expo-router": {
      router: {
        canGoBack: () => history,
        back: () => visits.push("back"),
        replace: (p) => visits.push(p),
        push: (p) => visits.push(p),
      },
      useLocalSearchParams: () => ({ id: card.id }),
      usePathname: () => "/card/" + card.id + "/" + route,
      Redirect: native("Redirect"),
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
        user: { id: "host" },
        ready: true,
        access: "bank_required",
      }),
      useResource: (path) => ({
        data: path?.startsWith("/cards/") ? card : null,
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
  common["@/design/system"] = load("../src/design/system.tsx");
  common["@/features/potluck/card-scene"] = load(
    "../src/features/potluck/card-scene.tsx",
  );
  common["@/features/potluck/planning-controls"] = {
    PlanningPanel: native("PlanningPanel"),
  };
  common["@/features/potluck/calendar-model"] = {
    moneyInput: (s) => Number(s) * 100,
  };
  const Page = load("../src/app/card/[id]/" + route + ".tsx").default;
  function render(root = React.createElement(Page)) {
    cursor = 0;
    const all = [];
    function visit(node, ancestors = []) {
      if (Array.isArray(node))
        return node.forEach((child) => visit(child, ancestors));
      if (!node?.props) return;
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

test("role and activity headers use the centered Figma treatment; funding stays standard", () => {
  for (const route of ["people", "invite", "activity"]) {
    const title = screen(route)
      .render()
      .find((n) => n.props.accessibilityRole === "header");
    assert.equal(title.props.style.textAlign, "center", route);
    assert.equal(title.props.style.fontSize, 16, route);
    assert.equal(title.props.style.fontFamily, "Inter_600SemiBold", route);
  }
  assert.equal(
    screen("fund")
      .render()
      .find((n) => n.props.accessibilityRole === "header").props.style.fontSize,
    28,
  );
});
