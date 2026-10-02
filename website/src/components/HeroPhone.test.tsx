import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { HeroPhone } from "./HeroPhone";

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
    addEventListener: (_type: string, callback: () => void) =>
      mediaListeners.add(callback),
    removeEventListener: (_type: string, callback: () => void) =>
      mediaListeners.delete(callback),
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

function advance(ms: number) {
  act(() => vi.advanceTimersByTime(ms));
}

function select(name: string) {
  fireEvent.click(screen.getByRole("button", { name: `Show ${name} screen` }));
}

function selected(name: string) {
  expect(
    screen.getByRole("button", { name: `Show ${name} screen` }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    screen.getByRole("region", { name: `${name} screen preview` }),
  ).toBeVisible();
}

test("cycles through the four existing screens in navigation order every five seconds", () => {
  render(<HeroPhone />);
  selected("Circles");
  inView(true);
  advance(4999);
  selected("Circles");
  advance(1);
  selected("Cards");
  advance(5000);
  selected("Bills");
  advance(5000);
  selected("Splitfinder");
  advance(5000);
  selected("Circles");
});

test("selects immediately, holds the chosen screen for 30 seconds, then resumes cycling", () => {
  render(<HeroPhone />);
  inView(true);
  select("Bills");
  selected("Bills");
  advance(29999);
  selected("Bills");
  advance(1);
  selected("Splitfinder");
  advance(5000);
  selected("Circles");
});

test("each selection restarts the 30-second hold, including selecting the same screen", () => {
  render(<HeroPhone />);
  inView(true);
  select("Cards");
  advance(25000);
  select("Bills");
  advance(25000);
  select("Bills");
  advance(29999);
  selected("Bills");
  advance(1);
  selected("Splitfinder");
});

test("the pause control stops cycling until the visitor resumes", () => {
  render(<HeroPhone />);
  inView(true);
  const pause = screen.getByRole("button", { name: "Pause screen cycling" });
  fireEvent.pointerDown(pause);
  fireEvent.focus(pause);
  fireEvent.pointerUp(pause);
  fireEvent.click(pause);
  advance(60000);
  selected("Circles");
  fireEvent.click(
    screen.getByRole("button", { name: "Resume screen cycling" }),
  );
  advance(5000);
  selected("Cards");
});

test("offscreen and hidden previews suspend cycling without catching up on return", () => {
  render(<HeroPhone />);
  inView(true);
  advance(5000);
  inView(false);
  advance(60000);
  selected("Cards");
  inView(true);
  act(() => {
    visibility = "hidden";
    document.dispatchEvent(new Event("visibilitychange"));
  });
  advance(60000);
  selected("Cards");
  act(() => {
    visibility = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
  });
  advance(4999);
  selected("Cards");
  advance(1);
  selected("Bills");
});

test("reduced motion stays static with working manual navigation and preference updates", () => {
  reduced = true;
  render(<HeroPhone />);
  inView(true);
  advance(60000);
  selected("Circles");
  select("Cards");
  advance(60000);
  selected("Cards");
  expect(screen.queryByRole("button", { name: /screen cycling/ })).toBeNull();
  act(() => {
    reduced = false;
    mediaListeners.forEach((listener) => listener());
  });
  advance(30000);
  selected("Bills");
  act(() => {
    reduced = true;
    mediaListeners.forEach((listener) => listener());
  });
  advance(60000);
  selected("Bills");
});

test("search interaction pauses cycling and retains the visitor's filtered results", () => {
  render(<HeroPhone />);
  inView(true);
  select("Splitfinder");
  const search = screen.getByRole("searchbox", {
    name: "Search sample listings",
  });
  fireEvent.focus(search);
  fireEvent.change(search, { target: { value: "Spotify" } });
  advance(60000);
  selected("Splitfinder");
  expect(search).toHaveValue("Spotify");
  expect(
    within(
      screen.getByRole("list", { name: "Sample subscriptions" }),
    ).getAllByRole("listitem"),
  ).toHaveLength(1);
  fireEvent.click(
    screen.getByRole("button", { name: "Resume screen cycling" }),
  );
  advance(5000);
  selected("Circles");
});

test("keyboard navigation pauses before selection and unmount cancels pending work", () => {
  const { unmount } = render(<HeroPhone />);
  inView(true);
  fireEvent.focus(screen.getByRole("button", { name: "Show Cards screen" }));
  advance(60000);
  selected("Circles");
  select("Cards");
  advance(29999);
  selected("Cards");
  unmount();
  expect(vi.getTimerCount()).toBe(0);
  expect(mediaListeners.size).toBe(0);
});
