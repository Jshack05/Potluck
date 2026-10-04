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
  selected("Mountains");
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
  selected("Mountains");
  inView(false);
  advance();
  selected("Mountains");
  inView(true);
  act(() => {
    visibility = "hidden";
    document.dispatchEvent(new Event("visibilitychange"));
  });
  advance();
  selected("Mountains");
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
  fireEvent.click(screen.getByRole("button", { name: "Show Mountains card" }));
  selected("Mountains");
  advance();
  selected("Mountains");
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
  fireEvent.focus(screen.getByRole("button", { name: "Show Mountains card" }));
  advance();
  selected("Deep teal");
  fireEvent.click(screen.getByRole("button", { name: "Play card animation" }));
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

test("swiping coasts, settles, holds, then returns to automatic rotation", () => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  render(<FloatingCard />);
  inView(true);
  const scene = screen.getByRole("img", { name: /Deep teal Potluck/ });
  const group = screen.getByRole("group", { name: "Virtual card designs" });
  fireEvent.pointerDown(scene, { clientX: 250, clientY: 100, button: 0 });
  act(() => vi.advanceTimersByTime(30));
  fireEvent.pointerMove(scene, { clientX: 70, clientY: 100 });
  fireEvent.pointerUp(scene, { clientX: 70, clientY: 100 });
  expect(group).toHaveAttribute("data-interaction", "coasting");
  act(() => vi.advanceTimersByTime(2050));
  act(() => vi.advanceTimersByTime(650));
  expect(group).toHaveAttribute("data-interaction", "idle");
  const selectedButton = screen
    .getAllByRole("button")
    .find((button) => button.getAttribute("aria-pressed") === "true");
  act(() => vi.advanceTimersByTime(2000));
  expect(selectedButton).toHaveAttribute("aria-pressed", "true");
  act(() => vi.advanceTimersByTime(1200));
  expect(selectedButton).toHaveAttribute("aria-pressed", "false");
});

test("vertical gestures do not spin cards and cancelled drags settle safely", () => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  render(<FloatingCard />);
  inView(true);
  const scene = screen.getByRole("img", { name: /Deep teal Potluck/ });
  fireEvent.pointerDown(scene, { clientX: 200, clientY: 100, button: 0 });
  fireEvent.pointerMove(scene, { clientX: 202, clientY: 180 });
  fireEvent.pointerUp(scene);
  selected("Deep teal");
  fireEvent.pointerDown(scene, { clientX: 200, clientY: 100, button: 0 });
  fireEvent.pointerMove(scene, { clientX: 60, clientY: 100 });
  fireEvent.pointerCancel(scene);
  act(() => vi.advanceTimersByTime(700));
  expect(
    screen.getByRole("group", { name: "Virtual card designs" }),
  ).toHaveAttribute("data-interaction", "idle");
});

test("pause stops inertia and a drag does not override an explicit pause", () => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  render(<FloatingCard />);
  inView(true);
  const scene = screen.getByRole("img", { name: /Deep teal Potluck/ });
  fireEvent.pointerDown(scene, { clientX: 200, clientY: 100, button: 0 });
  act(() => vi.advanceTimersByTime(30));
  fireEvent.pointerMove(scene, { clientX: 30, clientY: 100 });
  fireEvent.pointerUp(scene);
  fireEvent.click(screen.getByRole("button", { name: "Pause card animation" }));
  act(() => vi.advanceTimersByTime(10000));
  expect(
    screen.getByRole("group", { name: "Virtual card designs" }),
  ).toHaveAttribute("data-playing", "false");
  fireEvent.pointerDown(scene, { clientX: 200, clientY: 100, button: 0 });
  fireEvent.pointerMove(scene, { clientX: 100, clientY: 100 });
  fireEvent.pointerUp(scene);
  act(() => vi.advanceTimersByTime(10000));
  expect(
    screen.getByRole("button", { name: "Play card animation" }),
  ).toBeVisible();
});

test("reverse swipe momentum decays and freezes offscreen without catch-up", () => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  const { container, unmount } = render(<FloatingCard />);
  inView(true);
  const scene = screen.getByRole("img", { name: /Deep teal Potluck/ });
  const angle = () =>
    parseFloat(
      (
        container.querySelector(".card-orbit") as HTMLElement
      ).style.getPropertyValue("--orbit-angle"),
    );
  fireEvent.pointerDown(scene, { clientX: 100, clientY: 100, button: 0 });
  act(() => vi.advanceTimersByTime(30));
  fireEvent.pointerMove(scene, { clientX: 280, clientY: 100 });
  fireEvent.pointerUp(scene);
  const released = angle();
  expect(released).toBeGreaterThan(0);
  act(() => vi.advanceTimersByTime(200));
  const first = angle();
  act(() => vi.advanceTimersByTime(200));
  const second = angle();
  expect(first - released).toBeGreaterThan(second - first);
  expect(second).toBeGreaterThan(first);
  inView(false);
  act(() => vi.advanceTimersByTime(10000));
  expect(angle()).toBe(second);
  inView(true);
  act(() => vi.advanceTimersByTime(100));
  expect(angle() - second).toBeLessThan(first - released);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

test("reduced-motion swipes select a card without inertial or automatic spinning", () => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  reduced = true;
  render(<FloatingCard />);
  inView(true);
  const scene = screen.getByRole("img", { name: /Deep teal Potluck/ });
  fireEvent.pointerDown(scene, { clientX: 260, clientY: 100, button: 0 });
  fireEvent.pointerMove(scene, { clientX: 20, clientY: 100 });
  fireEvent.pointerUp(scene);
  act(() => vi.advanceTimersByTime(10000));
  selected("Mountains");
  expect(
    screen.getByRole("group", { name: "Virtual card designs" }),
  ).toHaveAttribute("data-interaction", "idle");
});
