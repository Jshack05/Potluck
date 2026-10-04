import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
try {
  const { default: App } = await server.ssrLoadModule("/src/App.tsx");
  const { pages } = await server.ssrLoadModule("/src/pages.ts");
  const template = await readFile("dist/index.html", "utf8");
  for (const [pathname, meta] of Object.entries(pages)) {
    const rendered = renderToString(createElement(App, { pathname }));
    if (!rendered.includes("<h1") || !rendered.includes('id="main"'))
      throw new Error(`Missing content: ${pathname}`);
    const url = `https://getpotluck.app${pathname}`;
    const html = template
      .replace(
        /<title>.*?<\/title>/s,
        `<title>${escapeHtml(meta.title)}</title>`,
      )
      .replace(
        /(<meta\s+name="description"\s+content=")[^"]*("\s*\/>)/,
        `$1${escapeHtml(meta.description)}$2`,
      )
      .replace(
        /(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/>)/,
        `$1${escapeHtml(meta.title)}$2`,
      )
      .replace(
        /(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/>)/,
        `$1${escapeHtml(meta.description)}$2`,
      )
      .replace(
        /(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/>)/,
        `$1${url}$2`,
      )
      .replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/>)/, `$1${url}$2`)
      .replace('<div id="root"></div>', `<div id="root">${rendered}</div>`)
      .replace(
        "</head>",
        pathname === "/404/"
          ? '<meta name="robots" content="noindex" /></head>'
          : "</head>",
      );
    const output =
      pathname === "/404/" ? "dist/404.html" : `dist${pathname}index.html`;
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, html);
  }
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(
      pages,
    )
      .filter((path) => path !== "/404/")
      .map((path) => `<url><loc>https://getpotluck.app${path}</loc></url>`)
      .join("")}</urlset>\n`,
  );
  console.log(
    `Prerendered ${Object.keys(pages).length - 1} public pages and the not-found page with unique metadata.`,
  );
} finally {
  await server.close();
}
