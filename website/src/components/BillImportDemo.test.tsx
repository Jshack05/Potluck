import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { BillImportDemo } from "./BillImportDemo";

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

function advance(milliseconds: number) {
  act(() => vi.advanceTimersByTime(milliseconds));
}

function choose(name: string) {
  const start = screen.queryByRole("button", { name: "Choose bills" });
  if (start) fireEvent.click(start);
  fireEvent.click(screen.getByRole("checkbox", { name: new RegExp(name) }));
}

function review() {
  fireEvent.click(screen.getByRole("button", { name: /Review selected/ }));
}

test("starts with no selection and prevents reviewing an empty selection", () => {
  render(<BillImportDemo />);
  expect(
    screen.getByRole("img", { name: /arriving from bank activity/ }),
  ).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Choose bills" }));
  expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  screen
    .getAllByRole("checkbox")
    .forEach((item) => expect(item).not.toBeChecked());
  const next = screen.getByRole("button", { name: /Review selected/ });
  expect(next).toBeDisabled();
  choose("Internet bill");
  expect(next).toBeEnabled();
  choose("Internet bill");
  expect(next).toBeDisabled();
});

test("reviews only selected bills and preserves the selection when editing", () => {
  render(<BillImportDemo />);
  choose("Internet bill");
  choose("Streaming");
  review();
  expect(screen.getByRole("heading", { name: "Confirm bills" })).toHaveFocus();
  const list = screen.getByRole("list", { name: "Selected bills" });
  expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  expect(within(list).queryByText("Electric")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Change selection" }));
  expect(
    screen.getByRole("heading", { name: "Recurring charges" }),
  ).toHaveFocus();
  expect(screen.getByRole("checkbox", { name: /Internet bill/ })).toBeChecked();
  expect(screen.getByRole("checkbox", { name: /Streaming/ })).toBeChecked();
  choose("Streaming");
  choose("Internet bill");
  expect(
    screen.getByRole("button", { name: /Review selected/ }),
  ).toBeDisabled();
});

test("only explicit compact saving returns selected bills to the surrounding preview", () => {
  const onDone = vi.fn();
  render(<BillImportDemo compact onDone={onDone} autoPlay />);
  inView(true);
  advance(30_000);
  expect(screen.getByRole("checkbox", { name: /Electric/ })).not.toBeChecked();
  choose("Electric");
  review();
  expect(onDone).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Save to All bills" }));
  expect(onDone).toHaveBeenCalledOnce();
  expect(onDone).toHaveBeenCalledWith([
    {
      id: "electric",
      name: "Electric",
      icon: "import-electric",
      amount: "$65–$110",
      cadence: "Likely monthly",
    },
  ]);
  expect(screen.getByRole("heading", { name: "All bills" })).toHaveFocus();
  expect(screen.getByText("Share when you’re ready.")).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Save to All bills" }),
  ).toBeNull();
});

test("closing an unfinished compact import never saves", () => {
  const onDone = vi.fn();
  const onClose = vi.fn();
  render(<BillImportDemo compact onDone={onDone} onClose={onClose} />);
  choose("Streaming");
  fireEvent.click(screen.getByRole("button", { name: "Close bill import" }));
  expect(onClose).toHaveBeenCalledOnce();
  expect(onDone).not.toHaveBeenCalled();
});

test("opening compact import moves keyboard focus to its first heading", () => {
  render(<BillImportDemo compact />);
  expect(
    screen.getByRole("heading", { name: "Recurring charges" }),
  ).toHaveFocus();
});

test("the animated story selects, reviews and saves illustrative bills without calling onDone", () => {
  const onDone = vi.fn();
  render(<BillImportDemo autoPlay onDone={onDone} />);
  inView(true);
  expect(
    screen.getByRole("heading", { name: "Start with your bank." }),
  ).toBeVisible();
  advance(4399);
  expect(screen.queryByRole("checkbox")).toBeNull();
  advance(1);
  advance(900);
  expect(screen.getByRole("checkbox", { name: /Internet bill/ })).toBeChecked();
  advance(700);
  expect(screen.getByRole("checkbox", { name: /Streaming/ })).toBeChecked();
  advance(2200);
  expect(screen.getByRole("heading", { name: "Confirm bills" })).toBeVisible();
  expect(
    screen.getByRole("heading", { name: "Confirm bills" }),
  ).not.toHaveFocus();
  advance(3000);
  expect(screen.getByRole("heading", { name: "All bills" })).toBeVisible();
  expect(onDone).not.toHaveBeenCalled();
  advance(3600);
  expect(
    screen.getByRole("heading", { name: "Start with your bank." }),
  ).toBeVisible();
});

test("manual interaction stops the story until replay and a full demo never calls onDone", () => {
  const onDone = vi.fn();
  render(<BillImportDemo autoPlay onDone={onDone} />);
  inView(true);
  choose("Electric");
  advance(30_000);
  expect(screen.getByRole("checkbox", { name: /Electric/ })).toBeChecked();
  expect(
    screen.getByRole("checkbox", { name: /Internet bill/ }),
  ).not.toBeChecked();
  review();
  fireEvent.click(screen.getByRole("button", { name: "Save to All bills" }));
  expect(onDone).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "Replay import preview" }),
  );
  advance(4400);
  advance(900);
  expect(screen.getByRole("checkbox", { name: /Internet bill/ })).toBeChecked();
});

test("the pause button stays paused through the browser pointer and focus sequence", () => {
  render(<BillImportDemo autoPlay />);
  inView(true);
  const pause = screen.getByRole("button", { name: "Pause import preview" });
  fireEvent.pointerDown(pause);
  fireEvent.focus(pause);
  fireEvent.pointerUp(pause);
  fireEvent.click(pause);
  advance(30_000);
  expect(
    screen.getByRole("heading", { name: "Start with your bank." }),
  ).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "Replay import preview" }),
  );
  advance(4400);
  advance(900);
  expect(screen.getByRole("checkbox", { name: /Internet bill/ })).toBeChecked();
});

test("pauses offscreen and in a hidden document without catching up", () => {
  render(<BillImportDemo autoPlay />);
  inView(false);
  advance(30_000);
  expect(
    screen.getByRole("heading", { name: "Start with your bank." }),
  ).toBeVisible();
  inView(true);
  advance(4400);
  advance(900);
  inView(false);
  advance(30_000);
  expect(screen.getByRole("checkbox", { name: /Streaming/ })).not.toBeChecked();
  inView(true);
  act(() => {
    visibility = "hidden";
    document.dispatchEvent(new Event("visibilitychange"));
  });
  advance(30_000);
  expect(screen.getByRole("checkbox", { name: /Streaming/ })).not.toBeChecked();
  act(() => {
    visibility = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
  });
  advance(700);
  expect(screen.getByRole("checkbox", { name: /Streaming/ })).toBeChecked();
});

test("reduced motion disables autoplay but preserves manual review and saving", () => {
  reduced = true;
  render(<BillImportDemo autoPlay />);
  inView(true);
  advance(30_000);
  expect(
    screen.getByRole("heading", { name: "Start with your bank." }),
  ).toBeVisible();
  expect(
    screen.getByRole("group", { name: "Bill import preview" }),
  ).toHaveAttribute("data-drop-motion", "false");
  choose("Streaming");
  review();
  fireEvent.click(screen.getByRole("button", { name: "Save to All bills" }));
  expect(screen.getByRole("heading", { name: "All bills" })).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Replay import preview" }),
  ).toBeNull();
});

test("keyboard focus stops autoplay and unmount cleans up timers and subscriptions", () => {
  const { unmount } = render(<BillImportDemo autoPlay />);
  inView(true);
  fireEvent.focus(screen.getByRole("button", { name: "Choose bills" }));
  advance(30_000);
  expect(
    screen.getByRole("heading", { name: "Start with your bank." }),
  ).toBeVisible();
  unmount();
  expect(vi.getTimerCount()).toBe(0);
  expect(mediaListeners.size).toBe(0);
});
