import { fireEvent, render, screen, within } from "@testing-library/react";
import { BillsPreview } from "./AppPreviews";

test("shows the saved collection and a clear entry into bill importing", () => {
  render(<BillsPreview />);
  expect(screen.getByRole("button", { name: "Import bills" })).toBeVisible();
  const collections = screen.getByRole("group", { name: "Bill collections" });
  expect(
    within(collections)
      .getAllByRole("button")
      .map((b) => b.textContent),
  ).toEqual(["All bills", "Shared"]);
  expect(screen.getByRole("button", { name: "All bills" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  fireEvent.click(screen.getByRole("button", { name: "Import bills" }));
  expect(
    screen.getByRole("heading", { name: "Recurring charges" }),
  ).toBeVisible();
});

function importStreaming() {
  fireEvent.click(screen.getByRole("button", { name: "Import bills" }));
  fireEvent.click(screen.getByRole("checkbox", { name: /Internet bill/ }));
  fireEvent.click(screen.getByRole("checkbox", { name: /Streaming/ }));
  fireEvent.click(screen.getByRole("button", { name: /Review selected/ }));
  fireEvent.click(screen.getByRole("button", { name: "Save to All bills" }));
}

test("confirmed imports open All bills without duplicates or automatically sharing", () => {
  render(<BillsPreview />);
  importStreaming();
  expect(screen.getByRole("button", { name: "All bills" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  let list = screen.getByRole("list", { name: "All bills preview" });
  expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  expect(within(list).getByText("Streaming")).toBeVisible();
  expect(
    within(list).getAllByRole("link", { name: /Share bill/ }),
  ).toHaveLength(2);
  expect(screen.getByRole("button", { name: "Import bills" })).toHaveFocus();
  importStreaming();
  list = screen.getByRole("list", { name: "All bills preview" });
  expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  fireEvent.click(screen.getByRole("button", { name: "Shared" }));
  list = screen.getByRole("list", { name: "Shared preview" });
  expect(within(list).getAllByRole("listitem")).toHaveLength(1);
  expect(within(list).queryByText("Streaming")).toBeNull();
  expect(within(list).getByText("$84")).toBeVisible();
});

test("All bills includes a personal import while Shared filters it out", () => {
  render(<BillsPreview />);
  const all = screen.getByRole("list", { name: "All bills preview" });
  const phone = within(all).getByText("Phone bill").closest("li")!;
  expect(within(phone).getByText("Imported · Not shared")).toBeVisible();
  expect(phone.querySelector(".bills-home-people")).toBeNull();
  expect(within(all).getByText("Internet bill")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Shared" }));
  const shared = screen.getByRole("list", { name: "Shared preview" });
  expect(within(shared).queryByText("Phone bill")).toBeNull();
  expect(within(shared).getByText("Internet bill")).toBeVisible();
});
