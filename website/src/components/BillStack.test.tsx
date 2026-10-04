import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { BillStack } from "./BillStack";

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

function advance(milliseconds = 2500) {
  act(() => vi.advanceTimersByTime(milliseconds));
}

function bills(...names: string[]) {
  const carousel = screen.getByRole("group", { name: "Example shared bills" });
  expect(within(carousel).getAllByRole("article")).toHaveLength(names.length);
  names.forEach((name) => {
    expect(
      within(carousel).getByRole("article", { name: `${name} example bill` }),
    ).toBeVisible();
  });
}

test("each example shows the people sharing it and the correct billing period", () => {
  render(<BillStack />);
  bills("Netflix", "Sam’s Club");
  const netflix = screen.getByRole("article", { name: "Netflix example bill" });
  const sams = screen.getByRole("article", { name: "Sam’s Club example bill" });
  expect(within(netflix).getByText("Monthly total")).toBeVisible();
  expect(within(sams).getByText("Yearly total")).toBeVisible();
  [netflix, sams].forEach((bill) => {
    const people = within(bill).getByRole("group", {
      name: /\d people sharing/,
    });
    expect(people.querySelectorAll("img").length).toBeGreaterThanOrEqual(2);
  });

  fireEvent.click(screen.getByRole("button", { name: "Show next bills" }));
  const phone = screen.getByRole("article", {
    name: "Phone bill example bill",
  });
  expect(within(phone).getByText("Monthly total")).toBeVisible();
  const people = within(phone).getByRole("group", {
    name: /\d people sharing/,
  });
  expect(people.querySelectorAll("img").length).toBeGreaterThanOrEqual(2);
});

test("cycles through all three bills and wraps after a readable dwell", () => {
  render(<BillStack />);
  inView(true);
  bills("Netflix", "Sam’s Club");
  advance(900);
  bills("Netflix", "Sam’s Club");
  advance(100);
  bills("Sam’s Club", "Phone bill");
  advance();
  bills("Phone bill", "Netflix");
  advance();
  bills("Netflix", "Sam’s Club");
});

test("a pointer can pause immediately and manual navigation stays paused until resumed", () => {
  render(<BillStack />);
  inView(true);
  const pause = screen.getByRole("button", { name: "Pause bill animation" });
  fireEvent.pointerDown(pause);
  fireEvent.focus(pause);
  fireEvent.pointerUp(pause);
  fireEvent.click(pause);
  expect(
    screen.getByRole("button", { name: "Play bill animation" }),
  ).toBeVisible();
  advance();
  bills("Netflix", "Sam’s Club");
  fireEvent.click(screen.getByRole("button", { name: "Show next bills" }));
  advance();
  bills("Sam’s Club", "Phone bill");
  fireEvent.click(screen.getByRole("button", { name: "Play bill animation" }));
  advance();
  bills("Phone bill", "Netflix");
});

test("offscreen and hidden document time does not skip bills when playback returns", () => {
  render(<BillStack />);
  inView(true);
  advance();
  bills("Sam’s Club", "Phone bill");
  inView(false);
  advance(22000);
  bills("Sam’s Club", "Phone bill");
  inView(true);
  advance(900);
  bills("Sam’s Club", "Phone bill");
  act(() => {
    visibility = "hidden";
    document.dispatchEvent(new Event("visibilitychange"));
  });
  advance(22000);
  bills("Sam’s Club", "Phone bill");
  act(() => {
    visibility = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
  });
  advance(900);
  bills("Sam’s Club", "Phone bill");
  advance(1600);
  bills("Phone bill", "Netflix");
});

test("reduced motion keeps bills static but permits manual navigation and preference changes", () => {
  reduced = true;
  render(<BillStack />);
  inView(true);
  advance();
  bills("Netflix", "Sam’s Club");
  expect(screen.queryByRole("button", { name: /bill animation/ })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Show next bills" }));
  advance();
  bills("Sam’s Club", "Phone bill");
  act(() => {
    reduced = false;
    mediaListeners.forEach((listener) => listener());
  });
  fireEvent.click(screen.getByRole("button", { name: "Play bill animation" }));
  advance();
  bills("Phone bill", "Netflix");
  act(() => {
    reduced = true;
    mediaListeners.forEach((listener) => listener());
  });
  advance();
  bills("Phone bill", "Netflix");
});

test("keyboard focus pauses automatic changes and unmount cancels scheduled work", () => {
  const { unmount } = render(<BillStack />);
  inView(true);
  fireEvent.focus(screen.getByRole("button", { name: "Show next bills" }));
  advance();
  bills("Netflix", "Sam’s Club");
  fireEvent.click(screen.getByRole("button", { name: "Play bill animation" }));
  unmount();
  expect(vi.getTimerCount()).toBe(0);
  expect(mediaListeners.size).toBe(0);
});

test("first change arrives after one visible second and hovering pauses reading", () => {
  render(<BillStack />);
  advance(10000);
  bills("Netflix", "Sam’s Club");
  inView(true);
  advance(999);
  bills("Netflix", "Sam’s Club");
  advance(1);
  bills("Sam’s Club", "Phone bill");
  const group = screen.getByRole("group", { name: "Example shared bills" });
  fireEvent.mouseEnter(group);
  advance(5000);
  bills("Sam’s Club", "Phone bill");
  fireEvent.mouseLeave(group);
  advance(2500);
  bills("Phone bill", "Netflix");
});
