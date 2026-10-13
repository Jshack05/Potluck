import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { compileFunction } from "node:vm";
import ts from "typescript";

test("people rows use actual identity and status, without sample permissions or invitations", () => {
  const require = createRequire(import.meta.url),
    module = { exports: {} };
  const imports = {
    "react-native": { View: "View", Pressable: "Pressable" },
    "expo-image": { Image: "Image" },
    "@/design/system": {
      Label: "Text",
      Muted: "Text",
      theme: {},
      money: (n) => `$${n / 100}`,
    },
    "./circle-ui": { CircleAvatar: "Avatar", CircleGlyph: "Glyph" },
    "./card-ui": { CardHeading: "Heading", CardChevron: "Chevron" },
  };
  const code = ts.transpileModule(
    readFileSync(
      new URL("../src/features/potluck/card-people.tsx", import.meta.url),
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
    (id) => imports[id] ?? (id.endsWith(".svg") ? id : require(id)),
    module,
    module.exports,
  );
  let selected = false;
  const row = module.exports.CardPersonRow({
    name: "Quinn Avery",
    detail: "Circle member · No card access",
    onPress: () => (selected = true),
  });
  assert.equal(row.props.accessibilityLabel, "Quinn Avery");
  row.props.onPress();
  assert.ok(selected);
  assert.match(JSON.stringify(row), /Quinn Avery/);
  assert.doesNotMatch(JSON.stringify(row), /Maya|Taylor|Utilities|\$200/);
  const readOnly = module.exports.CardPersonRow({
    name: "Quinn Avery",
    detail: "pending",
  });
  assert.equal(readOnly.props.onPress, undefined);
});
