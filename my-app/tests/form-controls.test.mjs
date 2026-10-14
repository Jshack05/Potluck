import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compileFunction } from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
function controls(fontScale = 1) {
  const mod = { exports: {} };
  const code = ts.transpileModule(
    readFileSync(
      new URL("../src/design/form-controls.tsx", import.meta.url),
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
    (id) =>
      id === "react-native"
        ? { Switch: "Switch", useWindowDimensions: () => ({ fontScale }) }
        : id === "./system"
          ? { Field: "Field", theme: { teal: "#006D67" } }
          : require(id),
    mod,
    mod.exports,
  );
  return mod.exports;
}
test("off and disabled toggles retain a visible iOS track and state/handler semantics", () => {
  const { Toggle } = controls();
  for (const disabled of [false, true]) {
    let next;
    const n = Toggle({
      value: false,
      disabled,
      onValueChange: (v) => {
        next = v;
      },
      accessibilityLabel: "Members can invite",
    });
    assert.notEqual(n.props.ios_backgroundColor, "white");
    assert.equal(n.props.ios_backgroundColor, n.props.trackColor.false);
    assert.equal(n.props.disabled, disabled);
    assert.equal(n.props.value, false);
    n.props.onValueChange(true);
    assert.equal(next, true);
  }
});
test("large amount fields have room for scaled glyphs and retain decimal input/value/error behavior", () => {
  for (const fontScale of [1, 1.5, 2]) {
    const { AmountField } = controls(fontScale);
    let changed;
    const n = AmountField({
      label: "Amount",
      value: "50.25",
      error: "Invalid",
      onChangeText: (v) => {
        changed = v;
      },
    });
    const style = Object.assign({}, ...n.props.style);
    assert.ok(style.lineHeight >= style.fontSize * 1.2);
    assert.ok(
      style.minHeight >=
        style.lineHeight * fontScale + style.paddingVertical * 2,
    );
    assert.equal(n.props.value, "50.25");
    assert.equal(n.props.error, "Invalid");
    assert.equal(n.props.keyboardType, "decimal-pad");
    n.props.onChangeText("12.34");
    assert.equal(changed, "12.34");
  }
});
