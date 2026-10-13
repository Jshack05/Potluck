import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { compileFunction } from "node:vm";
import ts from "typescript";

test("shared Card context keeps identity and role outside the name-only miniature", () => {
  const module = { exports: {} },
    require = createRequire(import.meta.url);
  const code = ts.transpileModule(
    readFileSync(
      new URL("../src/features/potluck/card-context.tsx", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  const imports = {
    "react-native": { View: "View", StyleSheet: { create: (s) => s } },
    "@/design/primitives": {
      Label: "Text",
      theme: { teal: "green", mint: "mint" },
    },
    "./card-thumbnail": { CardThumbnail: "Thumbnail" },
  };
  compileFunction(code, ["require", "module", "exports"])(
    (id) => imports[id] ?? require(id),
    module,
    module.exports,
  );
  for (const roleLabel of ["HOST", "TRUSTED SPENDER"]) {
    const tree = module.exports.CardContext({
      card: { name: "Weekend card", design: "graphite" },
      fullName: "Joseph Shackelford",
      roleLabel,
    });
    const [thumbnail, name, badge] = tree.props.children;
    assert.deepEqual(thumbnail.props, {
      design: "graphite",
      fullName: "Joseph Shackelford",
    });
    assert.equal(name.props.children, "Weekend card");
    assert.equal(badge.props.children.props.children, roleLabel);
    assert.equal(tree.props.style.minHeight, 88);
    assert.equal(JSON.stringify(tree).includes("Setup required"), false);
  }
});
