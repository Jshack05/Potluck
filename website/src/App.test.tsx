import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

test("Bills explains Import, Choose and Review before showing the app sample", () => {
  render(<App pathname="/bills/" />);
  const steps = screen.getByRole("list", { name: "Import steps" });
  expect(
    within(steps)
      .getAllByRole("listitem")
      .map((item) => item.querySelector("strong")?.textContent),
  ).toEqual(["Import", "Choose", "Review"]);
  const sample = screen.getByRole("region", {
    name: "Your bills, in Potluck.",
  });
  expect(
    steps.compareDocumentPosition(sample) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});

test("all four products are visible and link to dedicated pages without switching tabs", () => {
  render(<App />);
  const products = screen.getByRole("region", {
    name: "A little more together.",
  });
  for (const name of ["Splitfinder", "Cards", "Bills", "Circles"]) {
    expect(
      within(products).getByRole("link", { name: `Explore ${name}` }),
    ).toHaveAttribute("href", `/${name.toLowerCase()}/`);
    expect(within(products).getByRole("heading", { name })).toBeVisible();
  }
  expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
});
test.each(["splitfinder", "cards", "bills", "circles", "credits"])(
  "/%s/ has its own content and a route back home",
  (page) => {
    render(<App pathname={`/${page}/`} />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.queryByRole("heading", {
        name: "Your bills. Your people. All together.",
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Potluck home" })).toHaveAttribute(
      "href",
      "/",
    );
  },
);
test("Splitfinder search filters, handles no results, and clear restores results and focus", async () => {
  const user = userEvent.setup();
  render(<App pathname="/splitfinder/" />);
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
  expect(within(listings).getAllByRole("listitem")).toHaveLength(3);
});
test.each(["cards", "bills", "circles"])(
  "%s stays read-only with visible availability and consent boundaries",
  (page) => {
    render(<App pathname={`/${page}/`} />);
    expect(
      screen.getAllByText(/subject to provider.*approval/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/not yet available/i).length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("button", { name: /pay|deposit|accept|issue/i }),
    ).not.toBeInTheDocument();
  },
);
test("contact uses the public email and credits preserve source attribution", () => {
  render(<App />);
  expect(
    screen.getByRole("link", { name: "Start a conversation" }),
  ).toHaveAttribute(
    "href",
    "mailto:joseph@getpotluck.app?subject=Potluck%20partnership",
  );
  expect(screen.getByText(/Stripe is our preferred/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Credits" })).toHaveAttribute(
    "href",
    "/credits/",
  );
  expect(screen.getByRole("link", { name: "Skiper UI" })).toHaveAttribute(
    "href",
    "https://skiper-ui.com/v1/skiper40",
  );
});
test("unknown destinations offer recovery instead of silently showing the homepage", () => {
  render(<App pathname="/missing-page/" />);
  expect(
    screen.getByRole("heading", { name: "Let’s get you home." }),
  ).toBeVisible();
  expect(screen.getByRole("link", { name: "Explore Potluck" })).toHaveAttribute(
    "href",
    "/",
  );
});
