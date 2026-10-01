import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

test("product tour changes panels with keyboard, roves focus and exposes only the active panel", async () => {
  const user = userEvent.setup();
  render(<App />);
  const discovery = screen.getByRole("tab", { name: "Splitfinder" });
  expect(discovery).toHaveAttribute("aria-selected", "true");
  discovery.focus();
  await user.keyboard("{ArrowRight}");
  const bills = screen.getByRole("tab", { name: "Bills" });
  expect(bills).toHaveFocus();
  expect(bills).toHaveAttribute("aria-selected", "true");
  expect(discovery).toHaveAttribute("tabindex", "-1");
  expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Bills");
  await user.keyboard("{End}");
  expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Cards");
  await user.keyboard("{ArrowRight}");
  expect(discovery).toHaveFocus();
  await user.keyboard("{ArrowLeft}");
  expect(screen.getByRole("tab", { name: "Cards" })).toHaveFocus();
  await user.keyboard("{Home}");
  expect(discovery).toHaveFocus();
});

test("sample listing search filters, handles no results, and clear restores results and input focus", async () => {
  const user = userEvent.setup();
  render(<App />);
  const search = screen.getByRole("searchbox", {
    name: "Search sample listings",
  });
  await user.type(search, " SPOTIFY ");
  const listings = screen.getByRole("list", { name: "Sample subscriptions" });
  expect(within(listings).getAllByRole("listitem")).toHaveLength(1);
  expect(within(listings).getByText("Spotify")).toBeVisible();
  await user.clear(search);
  await user.type(search, "zz-no-match");
  expect(screen.getByText("No sample listings match.")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Clear search" }));
  expect(search).toHaveValue("");
  expect(search).toHaveFocus();
  expect(
    within(
      screen.getByRole("list", { name: "Sample subscriptions" }),
    ).getAllByRole("listitem"),
  ).toHaveLength(3);
});

test("financial views remain read-only and clearly conditional; contact opens the existing public email", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("tab", { name: "Cards" }));
  expect(
    within(screen.getByRole("tabpanel")).getByText(
      /subject to provider approval/i,
    ),
  ).toBeVisible();
  expect(
    screen.queryByRole("button", { name: /pay|deposit|accept|issue/i }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Start a conversation" }),
  ).toHaveAttribute(
    "href",
    "mailto:joseph@getpotluck.app?subject=Potluck%20partnership",
  );
  expect(screen.getByText(/Stripe is our preferred/i)).toBeInTheDocument();
  expect(screen.getAllByText(/not yet available/i).length).toBeGreaterThan(0);
});
