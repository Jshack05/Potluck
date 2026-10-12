import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { compileFunction } from "node:vm";
import ts from "typescript";
import { sheetGeometry, sheetRelease } from "../src/design/sheet-geometry.ts";

const require = createRequire(import.meta.url);

// Exercise the real component's responder and lifecycle, with synchronous animation boundaries.
function sheet(platform = "ios") {
  const hooks = [],
    effects = [],
    keyboardEvents = {};
  let cursor = 0,
    tree,
    pan,
    visible = true,
    expanded = false,
    closes = 0;
  const scrollOffset = { current: 0 };
  function state(initial) {
    const index = cursor++;
    if (!(index in hooks))
      hooks[index] = typeof initial === "function" ? initial() : initial;
    return [
      hooks[index],
      (value) => {
        hooks[index] =
          typeof value === "function" ? value(hooks[index]) : value;
      },
    ];
  }
  function effect(fn, deps) {
    const index = cursor++,
      old = hooks[index];
    if (!deps || !old || deps.some((d, i) => !Object.is(d, old.deps[i]))) {
      effects.push(() => {
        old?.cleanup?.();
        hooks[index] = { deps, cleanup: fn() };
      });
    }
  }
  class Value {
    listeners = new Map();
    constructor(value) {
      this.value = value;
    }
    setValue(value) {
      this.value = value;
      this.listeners.forEach((fn) => fn({ value }));
    }
    addListener(fn) {
      const id = String(this.listeners.size);
      this.listeners.set(id, fn);
      return id;
    }
    removeListener(id) {
      this.listeners.delete(id);
    }
    stopAnimation() {}
  }
  const animation = (value, options) => ({
    start(fn) {
      value.driver = options.useNativeDriver ? "native" : "js";
      value.setValue(options.toValue);
      fn?.({ finished: true });
    },
    stop() {},
  });
  const imports = {
    react: {
      useState: state,
      useRef: (initial) => state(() => ({ current: initial }))[0],
      useEffect: effect,
      useLayoutEffect: effect,
    },
    "react-native": {
      Animated: {
        Value,
        View: "AnimatedView",
        timing: animation,
        parallel: (motions) => ({
          start() {
            motions.forEach((m) => m.start());
          },
          stop() {},
        }),
      },
      Easing: { cubic: "cubic", out: (x) => x },
      Keyboard: {
        metrics: platform === "web" ? undefined : () => undefined,
        dismiss() {},
        addListener(name, fn) {
          keyboardEvents[name] = fn;
          return { remove() {} };
        },
      },
      KeyboardAvoidingView: "KeyboardAvoidingView",
      Modal: "Modal",
      Pressable: "Pressable",
      View: "View",
      Platform: { OS: platform },
      StyleSheet: { absoluteFill: {} },
      useWindowDimensions: () => ({ height: 844 }),
      PanResponder: {
        create(config) {
          pan = config;
          return { panHandlers: config };
        },
      },
    },
    "react-native-safe-area-context": {
      useSafeAreaInsets: () => ({ top: 47, bottom: 34 }),
    },
    "./loading": { useReducedMotion: () => false },
    "./sheet-geometry": { sheetGeometry, sheetRelease },
  };
  const js = ts.transpileModule(
    readFileSync(new URL("../src/design/sheet.tsx", import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const module = { exports: {} };
  compileFunction(js, ["require", "module", "exports"])(
    (id) => imports[id] ?? require(id),
    module,
    module.exports,
  );
  function render() {
    cursor = 0;
    tree = module.exports.SheetSurface({
      visible,
      onClose() {
        closes++;
        visible = false;
        expanded = false;
      },
      drag: {
        expanded,
        onExpandedChange(value) {
          expanded = value;
        },
        scrollOffset,
      },
      children: "people",
    });
    effects.splice(0).forEach((fn) => fn());
    return tree;
  }
  function surface(node) {
    if (!node || typeof node !== "object") return;
    if (node.props?.accessibilityViewIsModal) return node;
    for (const child of [node.props?.children].flat(Infinity)) {
      const found = surface(child);
      if (found) return found;
    }
  }
  render();
  return {
    translations() {
      const values = [];
      function visit(node) {
        if (!node || typeof node !== "object") return;
        node.props?.style?.transform?.forEach((t) =>
          values.push(t.translateY.value),
        );
        [node.props?.children].flat(Infinity).forEach(visit);
      }
      visit(tree);
      return values;
    },
    driverViolations() {
      const violations = [];
      function visit(node) {
        if (!node || typeof node !== "object") return;
        if (node.type === "AnimatedView") {
          const style = node.props.style;
          const values = Object.entries(style).filter(
            ([, value]) => value instanceof Value,
          );
          const nativeTransform = style.transform?.some((t) =>
            Object.values(t).some(
              (v) => v instanceof Value && v.driver === "native",
            ),
          );
          if (nativeTransform) values.forEach(([key]) => violations.push(key));
        }
        [node.props?.children].flat(Infinity).forEach(visit);
      }
      visit(tree);
      return violations;
    },
    render,
    scrollOffset,
    pan: () => pan,
    surface: () => surface(tree),
    closes: () => closes,
    open() {
      visible = true;
      render();
    },
    keyboard(height) {
      keyboardEvents.keyboardWillChangeFrame({
        endCoordinates: { screenY: 844 - height },
      });
      render();
    },
    drag(dy, vy = 0) {
      pan.onPanResponderGrant();
      pan.onPanResponderMove(null, { dy });
      pan.onPanResponderRelease(null, { dy, vy });
      render();
    },
  };
}

test("native translation never shares an animated style node with JS layout", () => {
  const s = sheet();
  assert.deepEqual(s.driverViolations(), []);
  s.drag(-250);
  assert.deepEqual(s.driverViolations(), []);
  s.keyboard(350);
  assert.deepEqual(s.driverViolations(), []);
  s.pan().onPanResponderTerminate();
  s.render();
  assert.deepEqual(s.driverViolations(), []);
  s.drag(500);
  s.open();
  assert.deepEqual(s.driverViolations(), []);
});

test("drag dismissal preserves content height and reopening restores the compact sheet", () => {
  const s = sheet();
  assert.equal(
    s
      .pan()
      .onStartShouldSetPanResponderCapture({ nativeEvent: { pageY: 455 } }),
    true,
    "the handle owns the drag from touch-down",
  );
  s.pan().onPanResponderGrant();
  s.pan().onPanResponderMove(null, { dy: 180 });
  assert.equal(
    s.surface().props.style.height.value,
    380,
    "dragging below compact moves the sheet instead of crushing its content",
  );
  s.pan().onPanResponderRelease(null, { dy: 180, vy: 0 });
  s.render();
  assert.equal(s.closes(), 1);
  s.open();
  assert.equal(s.surface().props.style.height.value, 380);
  assert.ok(
    s.translations().length === 2 &&
      s.translations().every((value) => value === 0),
  );
});

test("web opens the sheet without a native Keyboard.metrics API", () => {
  assert.equal(sheet("web").surface().props.style.height.value, 380);
});

test("the handle separates pointer gestures from accessible activation", () => {
  const s = sheet();
  let handle = s.surface().props.children[0];
  assert.equal(
    handle.props.pointerEvents,
    "box-only",
    "a pointer release must not also click the child and toggle back",
  );
  handle.props.children.props.onPress();
  s.render();
  assert.equal(s.surface().props.style.height.value, 700);
  s.pan().onPanResponderGrant();
  s.pan().onPanResponderRelease(null, { dx: 0, dy: 0, vy: 0 });
  s.render();
  assert.equal(s.surface().props.style.height.value, 380);
});

test("sheet expands, leaves a scrolled list alone and follows keyboard geometry", () => {
  const s = sheet();
  s.drag(-250);
  assert.equal(s.surface().props.style.height.value, 700);
  s.scrollOffset.current = 35;
  assert.equal(
    s
      .pan()
      .onStartShouldSetPanResponderCapture({ nativeEvent: { pageY: 500 } }),
    false,
  );
  assert.equal(
    s
      .pan()
      .onMoveShouldSetPanResponderCapture(null, { y0: 500, dx: 0, dy: 40 }),
    false,
  );
  s.scrollOffset.current = 0;
  assert.equal(
    s
      .pan()
      .onMoveShouldSetPanResponderCapture(null, { y0: 500, dx: 0, dy: 40 }),
    true,
  );
  s.keyboard(350);
  const style = s.surface().props.style;
  assert.ok(style.height.value + style.marginBottom.value + 47 <= 844);
  assert.equal(
    style.overflow,
    "hidden",
    "constrained sheet content stays inside its surface",
  );
});
