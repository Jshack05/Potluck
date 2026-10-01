import { readFileSync } from "node:fs";
import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { expect, test, vi } from "vitest";
import App from "./App";

test("prerender is fully readable without JavaScript and hydrates cleanly with reduced motion", async () => {
  const html = readFileSync("dist/index.html", "utf8");
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const rendered = parsed.getElementById("root");
  expect(rendered).not.toBeNull();
  const initialPanel =
    rendered!.querySelector<HTMLElement>(".tour-stage > div")!;
  expect(initialPanel.style.opacity).toBe("1");
  expect(initialPanel.style.transform).toBe("none");
  const container = document.createElement("div");
  container.innerHTML = rendered!.innerHTML;
  document.body.append(container);
  const errors = vi.spyOn(console, "error").mockImplementation(() => {});
  let root: Root | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, <App />);
    });
    expect(errors.mock.calls.map((args) => args.join(" "))).toEqual([]);
    expect(
      container.querySelector<HTMLElement>(".scroll-surface")!.style.transform,
    ).toBe("");
  } finally {
    await act(async () => {
      root?.unmount();
    });
    container.remove();
    errors.mockRestore();
  }
});
