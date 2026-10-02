import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { FloatingCard } from "./FloatingCard";

let reduced = false;
let visibility = "visible";
let observerCallback: IntersectionObserverCallback;
let observed: Element;
const mediaListeners = new Set<() => void>();

beforeEach(() => {
  vi.useFakeTimers();
  reduced = false;
  visibility = "visible";
  mediaListeners.clear();
  vi.spyOn(document, "visibilityState", "get").mockImplementation(
    () => visibility as DocumentVisibilityState,
  );
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduced,
    media: query,
    onchange: null,
    addEventListener: (_type: string, callback: () => void) =>
      mediaListeners.add(callback),
    removeEventListener: (_type: string, callback: () => void) =>
      mediaListeners.delete(callback),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
  }));
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
      observe(element: Element) {
        observed = element;
      }
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function inView(visible: boolean) {
  act(() => {
    const rect = observed.getBoundingClientRect();
    observerCallback(
      [
        {
          target: observed,
          isIntersecting: visible,
          intersectionRatio: visible ? 1 : 0,
          time: 0,
          boundingClientRect: rect,
          intersectionRect: rect,
          rootBounds: null,
        },
      ],
      {} as IntersectionObserver,
    );
  });
}

function advance() {
  act(() => vi.advanceTimersByTime(4500));
}

function selected(name: string) {
  expect(
    screen.getByRole("button", { name: `Show ${name} card` }),
  ).toHaveAttribute("aria-pressed", "true");
}

test("cycles through each design and wraps, with a readable dwell between changes", () => {
  render(<FloatingCard />);
  selected("Deep teal");
  inView(true);
  act(() => vi.advanceTimersByTime(3000));
  selected("Deep teal");
  act(() => vi.advanceTimersByTime(1500));
  selected("Mint");
  advance();
  selected("Ivory");
  advance();
  selected("Deep teal");
});

test("pause and manual selection persist until the visitor resumes", () => {
  render(<FloatingCard />);
  inView(true);
  fireEvent.click(screen.getByRole("button", { name: "Pause card animation" }));
  advance();
  selected("Deep teal");
  fireEvent.click(screen.getByRole("button", { name: "Show Ivory card" }));
  advance();
  selected("Ivory");
  fireEvent.click(screen.getByRole("button", { name: "Play card animation" }));
  advance();
  selected("Deep teal");
});

test("a pointer click pauses immediately even when it first focuses the carousel", () => {
  render(<FloatingCard />);
  inView(true);
  const pause = screen.getByRole("button", { name: "Pause card animation" });
  fireEvent.pointerDown(pause);
  fireEvent.focus(pause);
  fireEvent.pointerUp(pause);
  fireEvent.click(pause);
  expect(
    screen.getByRole("button", { name: "Play card animation" }),
  ).toBeVisible();
  advance();
  selected("Deep teal");
});

test("leaving the viewport and hiding the document suspend cycling without catch-up", () => {
  render(<FloatingCard />);
  inView(true);
  advance();
  selected("Mint");
  inView(false);
  advance();
  selected("Mint");
  inView(true);
  act(() => {
    visibility = "hidden";
    document.dispatchEvent(new Event("visibilitychange"));
  });
  advance();
  selected("Mint");
  act(() => {
    visibility = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
  });
  advance();
  selected("Ivory");
});

test("reduced motion remains static, allows selection, and reacts to preference changes", () => {
  reduced = true;
  render(<FloatingCard />);
  inView(true);
  advance();
  selected("Deep teal");
  expect(screen.queryByRole("button", { name: /card animation/ })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Show Mint card" }));
  selected("Mint");
  advance();
  selected("Mint");
  act(() => {
    reduced = false;
    mediaListeners.forEach((listener) => listener());
  });
  fireEvent.click(screen.getByRole("button", { name: "Play card animation" }));
  advance();
  selected("Ivory");
  act(() => {
    reduced = true;
    mediaListeners.forEach((listener) => listener());
  });
  advance();
  selected("Ivory");
});

test("keyboard focus pauses playback and unmount cancels pending rotations", () => {
  const { unmount } = render(<FloatingCard />);
  inView(true);
  fireEvent.focus(screen.getByRole("button", { name: "Show Mint card" }));
  advance();
  selected("Deep teal");
  fireEvent.click(screen.getByRole("button", { name: "Play card animation" }));
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
