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
function preview(design, props = {}) {
  const images = [],
    labels = [],
    frames = [];
  const node = ({ children }) => React.createElement("div", null, children);
  const imports = {
    "react-native": {
      Pressable: node,
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
        if (/\.(png|svg)$/.test(id)) return fileURLToPath(new URL(id, url));
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
    React.createElement(CardPreview, {
      name: "My household",
      design,
      ...props,
    }),
  );
  return { images, labels, frames, html };
}

test("new solid looks use their Figma fill and readable identity text without artwork overlays", () => {
  const luminance = (hex) => {
    const rgb = hex
      .slice(1)
      .match(/../g)
      .map((v) => parseInt(v, 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  for (const [id, bg, fg] of [
    ["navy_solid", "#20385B", "#FFFFFF"],
    ["plum_solid", "#623D60", "#FFFFFF"],
    ["sage_solid", "#BFCFBE", "#273432"],
    ["sand_solid", "#E5D8BE", "#273432"],
  ]) {
    const p = preview(id, {
      creationIdentity: { fullName: "Alexandra Maria", role: "host" },
    });
    assert.equal(p.images.length, 0);
    assert.ok(p.frames.some((f) => JSON.stringify(f.style).includes(bg)));
    for (const label of p.labels)
      assert.ok(JSON.stringify(label.style).includes(fg));
    const a = luminance(bg),
      b = luminance(fg);
    assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5, id);
  }
});

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

test("the edit affordance remains visible on both light and dark appearances", () => {
  for (const [design, foreground] of [
    ["brushed_silver", "#273232"],
    ["frosted_glass", "#273232"],
    ["champagne", "#273232"],
    ["coral", "#273432"],
    ["graphite", "#FFFFFF"],
  ]) {
    const { images } = preview(design, { onEdit: () => {} });
    const edit = images.find((image) => image.source.endsWith("edit.svg"));
    assert.ok(edit, design + " has the original edit icon");
    assert.equal(edit.tintColor, foreground, design + " edit contrast");
  }
});

test("creation faces show only the card name, full user name and explicit product role", () => {
  for (const role of ["host", "contributor"]) {
    const fullName = "Alexandra María van der Linden";
    const result = preview("graphite", {
      creationIdentity: { fullName, role },
      availableMinor: 12345,
      onEdit: () => {},
    });
    assert.deepEqual(
      result.labels.map((label) => label.children),
      ["My household", role.toUpperCase(), fullName],
    );
    assert.ok(!result.html.includes("Setup required"));
    assert.ok(!result.html.includes("Not issued"));
    assert.ok(!result.html.includes("Available to spend"));
    assert.equal(
      result.images.length,
      1,
      "creation has artwork, no edit action",
    );
  }
});

test("creation thumbnails use the same full name without financial placeholder text", () => {
  const result = preview("coral", {
    compact: true,
    creationIdentity: { fullName: "Morgan Lee", role: "host" },
  });
  assert.deepEqual(
    result.labels.map((label) => label.children),
    ["My household", "Morgan Lee"],
  );
  assert.ok(result.labels.every((label) => label.style.color === "#273432"));
});

test("approved gradients have their exact saturated fills and no Two tone panel", () => {
  const palettes = {
    aurora_gradient: ["#004F59", "#1554D1", "#7E2FD0"],
    sunset: ["#B64222", "#B8206A", "#5824B7"],
    cobalt_gradient: ["#10266A", "#1754D9", "#006FAD"],
    tidal_gradient: ["#083F40", "#006B64", "#0D7B74"],
    ember_gradient: ["#5F1741", "#A12B35", "#BA4C14"],
    iris_gradient: ["#251B76", "#6632C4", "#A32683"],
  };
  for (const [design, colors] of Object.entries(palettes)) {
    const { images, frames } = preview(design);
    assert.equal(images.length, 1, design + " has a gradient");
    const svg = decodeURIComponent(images[0].source.uri);
    for (const color of colors)
      assert.ok(svg.includes(color), design + " " + color);
    assert.ok(
      !frames.some((frame) => frame.style?.left === "50%"),
      design + " has no panel",
    );
  }
});

test("new Two tone looks retain the approved separate base and accent fills", () => {
  for (const [design, base, accent] of [
    ["evergreen_twotone", "#073F39", "#00786B"],
    ["clay_twotone", "#5C2B33", "#A44C32"],
    ["indigo_twotone", "#282C69", "#64609E"],
    ["slate_twotone", "#283D4A", "#547486"],
  ]) {
    const { frames } = preview(design);
    assert.equal(frames[0].style.backgroundColor, base);
    assert.equal(
      frames.find((frame) => frame.style?.left === "50%")?.style
        .backgroundColor,
      accent,
    );
  }
});
