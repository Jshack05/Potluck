import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { compileFunction } from "node:vm";
import ts from "typescript";

test("closed notice requires the signed-in user's confirmed closed Card", () => {
  const require = createRequire(import.meta.url),
    module = { exports: {} };
  let data = null,
    user = { id: "me" },
    path;
  const imports = {
    react: { useEffect() {} },
    "expo-router": { router: { setParams() {} } },
    "@/services/client": {
      useClient: () => ({ user }),
      useResource: (p) => {
        path = p;
        return { data: p ? data : null };
      },
    },
    "./card-ui": { CardActionRow: "Notice" },
  };
  const code = ts.transpileModule(
    readFileSync(
      new URL(
        "../src/features/potluck/card-closure-notice.tsx",
        import.meta.url,
      ),
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
  const render = () => module.exports.CardClosureNotice({ id: "card" });
  assert.equal(render(), null);
  data = { status: "setup_required" };
  assert.equal(render(), null);
  data = { status: "closed" };
  assert.equal(render().props.title, "Card closed");
  assert.equal(path, "/cards/card");
  user = null;
  assert.equal(render(), null);
  assert.equal(path, null);
});
