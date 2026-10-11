import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { compileFunction } from "node:vm";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
function preview(design) {
  const images = [],
    labels = [],
    frames = [];
  const node = ({ children }) => React.createElement("div", null, children);
  const imports = {
    "react-native": {
      View: (props) => {
        frames.push(props);
        return node(props);
      },
      StyleSheet: {
        absoluteFill: {
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
      },
    },
    "expo-image": {
      Image: (props) => {
        images.push(props);
        return null;
      },
    },
    "@/design/system": {
      Label: (props) => {
        labels.push(props);
        return node(props);
      },
      money: String,
    },
  };
  function load(url) {
    const js = ts.transpileModule(readFileSync(url, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    const module = { exports: {} };
    compileFunction(js, ["require", "module", "exports"])(
      (id) => {
        if (imports[id]) return imports[id];
        if (/\.png$/.test(id)) return fileURLToPath(new URL(id, url));
        if (id.startsWith(".")) return load(new URL(id + ".ts", url));
        return require(id);
      },
      module,
      module.exports,
    );
    return module.exports;
  }
  const { CardPreview } = load(
    new URL("../src/features/potluck/card-preview.tsx", import.meta.url),
  );
  const html = renderToStaticMarkup(
    React.createElement(CardPreview, { name: "My household", design }),
  );
  return { images, labels, frames, html };
}

test("all artwork fills the card bounds and light finishes use readable source lettering", () => {
  const art = [
    "aurora",
    "graphite",
    "brushed_silver",
    "frosted_glass",
    "champagne",
    "satin_teal",
    "ocean_artwork",
    "sunset_artwork",
    "botanical",
    "midnight",
    "terracotta",
    "alpine",
    "prism",
    "orbit",
    "lagoon",
  ];
  for (const design of art) {
    const { images, labels, frames, html } = preview(design);
    assert.equal(images.length, 1, design + " has its artwork");
    assert.ok(existsSync(images[0].source), design + " local asset");
    assert.ok(readFileSync(images[0].source).length > 100);
    assert.equal(images[0].contentFit, "cover");
    assert.equal(images[0].style.right, 0);
    assert.equal(images[0].style.bottom, 0);
    assert.equal(frames[0].style.aspectRatio, 330 / 176);
    const foreground = [
      "brushed_silver",
      "frosted_glass",
      "champagne",
    ].includes(design)
      ? "#273232"
      : "#FFFFFF";
    assert.ok(
      labels.every(
        (n) =>
          (n.style.color === "white" ? "#FFFFFF" : n.style.color) ===
          foreground,
      ),
      design + " foreground",
    );
    assert.ok(html.includes("My household"));
    assert.ok(html.includes("Not issued"));
    assert.ok(!html.includes("$357.89"));
  }
});

test("unknown appearances remain readable without inventing a replacement saved choice", () => {
  const result = preview("future_design");
  assert.ok(result.html.includes("My household"));
  assert.ok(result.html.includes("Not issued"));
  assert.equal(result.frames[0].style.backgroundColor, "#263433");
});

test("Coral retains the dark foreground specified by its Figma source", () => {
  assert.ok(preview("coral").labels.every((n) => n.style.color === "#273432"));
});
