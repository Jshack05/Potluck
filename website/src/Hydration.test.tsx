import { readFileSync, existsSync } from "node:fs";
import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { expect, test, vi } from "vitest";
import App from "./App";
import { pages, normalizePath } from "./pages";

test.each([...Object.keys(pages), "/index.html", "/cards/index.html"])(
  "%s is prerendered, accessible without JS, and hydrates with reduced motion",
  async (pathname) => {
    const canonical = pathname.endsWith("index.html")
      ? pathname.slice(0, -10)
      : pathname;
    const file =
      canonical === "/404/" ? "dist/404.html" : `dist${canonical}index.html`;
    const parsed = new DOMParser().parseFromString(
      readFileSync(file, "utf8"),
      "text/html",
    );
    const rendered = parsed.getElementById("root")!;
    expect(rendered.querySelectorAll("h1")).toHaveLength(1);
    expect(normalizePath(pathname)).toBe(canonical);
    expect(parsed.title).toBe(pages[normalizePath(pathname)].title);
    expect(
      parsed.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe(`https://getpotluck.app${canonical}`);
    expect(
      parsed.querySelector('meta[name="description"]')?.getAttribute("content"),
    ).toBe(pages[normalizePath(pathname)].description);
    for (const img of rendered.querySelectorAll("img"))
      expect(existsSync(`public${img.getAttribute("src")}`)).toBe(true);
    for (const link of rendered.querySelectorAll<HTMLAnchorElement>("a")) {
      const href = link.getAttribute("href")!;
      if (href.startsWith("/") && !href.startsWith("//"))
        expect(Object.keys(pages)).toContain(href.split("#")[0] || "/");
    }
    expect(rendered.querySelector('[style*="opacity:0"]')).toBeNull();
    const container = document.createElement("div");
    container.innerHTML = rendered.innerHTML;
    document.body.append(container);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    let root: Root | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, <App pathname={pathname} />);
      });
      expect(errors.mock.calls.map((args) => args.join(" "))).toEqual([]);
      for (const surface of container.querySelectorAll<HTMLElement>(
        ".scroll-surface",
      ))
        expect(surface.style.transform).toBe("");
    } finally {
      await act(async () => root?.unmount());
      container.remove();
      errors.mockRestore();
    }
  },
);

test("trailing-slash and unknown paths resolve predictably", () => {
  expect(normalizePath("/splitfinder")).toBe("/splitfinder/");
  expect(normalizePath("/")).toBe("/");
  expect(normalizePath("/missing/")).toBe("/404/");
});
