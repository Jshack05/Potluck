import { readFile, writeFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { default: App } = await server.ssrLoadModule("/src/App.tsx");
  const html = await readFile("dist/index.html", "utf8");
  const rendered = renderToString(createElement(App));
  if (!rendered.includes("Your bills.") || !rendered.includes("subject to"))
    throw new Error("Prerender missed product content.");
  await writeFile(
    "dist/index.html",
    html.replace('<div id="root"></div>', `<div id="root">${rendered}</div>`),
  );
  console.log(
    "Prerendered the public page for no-JavaScript access and search engines.",
  );
} finally {
  await server.close();
}
