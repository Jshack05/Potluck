import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Home } from "../pages/Home";

let reduced = false;
let visible = true;
const motionListeners = new Set<() => void>();
vi.mock("motion/react", async (original) => ({
  ...(await original<typeof import("motion/react")>()),
  useInView: () => visible,
}));

beforeEach(() => {
  vi.useFakeTimers();
  reduced = false;
  visible = true;
  motionListeners.clear();
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: reduced,
    addEventListener: (_: string, cb: () => void) => motionListeners.add(cb),
    removeEventListener: (_: string, cb: () => void) =>
      motionListeners.delete(cb),
  }));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const meter = () =>
  screen.getByRole("progressbar", { name: "Set aside for the phone bill" });

test("the homepage story collects distinct shares exactly once and holds a funded, not paid, bill", () => {
  render(<Home />);
  expect(meter()).toHaveAttribute("aria-valuenow", "0");
  advance(2950);
  expect(meter()).toHaveAttribute("aria-valuenow", "0");
  advance(50);
  expect(meter()).toHaveAttribute("aria-valuenow", "60");
  advance(1500);
  expect(meter()).toHaveAttribute("aria-valuenow", "100");
  advance(1500);
  expect(meter()).toHaveAttribute("aria-valuenow", "120");
  expect(screen.getByText("Ready for the phone bill")).toBeVisible();
  advance(30000);
  expect(meter()).toHaveAttribute("aria-valuenow", "120");
  fireEvent.click(
    screen.getByRole("button", { name: "Replay family contribution story" }),
  );
  expect(meter()).toHaveAttribute("aria-valuenow", "0");
});

test("pause and offscreen time preserve the remaining contribution timing", () => {
  const view = render(<Home />);
  advance(2000);
  fireEvent.click(
    screen.getByRole("button", { name: "Pause family contribution story" }),
  );
  advance(10000);
  expect(meter()).toHaveAttribute("aria-valuenow", "0");
  fireEvent.click(
    screen.getByRole("button", { name: "Resume family contribution story" }),
  );
  advance(500);
  visible = false;
  view.rerender(<Home />);
  advance(10000);
  expect(meter()).toHaveAttribute("aria-valuenow", "0");
  visible = true;
  view.rerender(<Home />);
  advance(500);
  expect(meter()).toHaveAttribute("aria-valuenow", "60");
});

test("reduced motion shows the complete story without animation or replay, including live preference changes", () => {
  render(<Home />);
  advance(2000);
  reduced = true;
  act(() => motionListeners.forEach((cb) => cb()));
  expect(meter()).toHaveAttribute("aria-valuenow", "120");
  expect(
    screen.queryByRole("button", { name: /family contribution story/ }),
  ).toBeNull();
  expect(
    within(
      screen.getByRole("group", { name: "Illustrative agreed contributions" }),
    ).getByText("Jordan"),
  ).toBeVisible();
  expect(screen.getByText("Family card")).toBeVisible();
});

test("switching browser tabs suspends the story without skipping ahead", () => {
  let state: DocumentVisibilityState = "visible";
  vi.spyOn(document, "visibilityState", "get").mockImplementation(() => state);
  render(<Home />);
  advance(2000);
  state = "hidden";
  fireEvent(document, new Event("visibilitychange"));
  advance(20000);
  expect(meter()).toHaveAttribute("aria-valuenow", "0");
  state = "visible";
  fireEvent(document, new Event("visibilitychange"));
  advance(1000);
  expect(meter()).toHaveAttribute("aria-valuenow", "60");
});
