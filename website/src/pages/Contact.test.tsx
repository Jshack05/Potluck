import { render, screen } from "@testing-library/react";
import App from "../App";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

async function fillInquiry() {
  const user = userEvent.setup();
  await user.type(
    screen.getByLabelText("Full name", { exact: true }),
    "Alex Example",
  );
  await user.type(
    screen.getByLabelText("Business email", { exact: true }),
    "alex@example.com",
  );
  await user.type(
    screen.getByLabelText("Company", { exact: true }),
    "Example Co",
  );
  await user.type(
    screen.getByLabelText("How can we work together?", { exact: true }),
    "We would like to discuss a partnership.",
  );
  return user;
}
test("submitting stays pending until delivery is accepted, then shows confirmation", async () => {
  let finish!: (response: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    ),
  );
  try {
    render(<App pathname="/contact/" />);
    const user = await fillInquiry();
    await user.click(screen.getByRole("button", { name: "Send your message" }));
    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
    expect(
      screen.queryByText("Thanks for reaching out."),
    ).not.toBeInTheDocument();
    finish(
      new Response(JSON.stringify({ status: "accepted" }), { status: 202 }),
    );
    expect(
      await screen.findByRole("heading", { name: "Thanks for reaching out." }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Send your message" }),
    ).not.toBeInTheDocument();
  } finally {
    vi.unstubAllGlobals();
  }
});
test.each([503, 429, 400, 200])(
  "unsuccessful delivery (%s) preserves the draft and allows recovery",
  async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ status: "delivery_unavailable" }), {
            status,
          }),
      ),
    );
    try {
      render(<App pathname="/contact/" />);
      const user = await fillInquiry();
      await user.click(
        screen.getByRole("button", { name: "Send your message" }),
      );
      expect(await screen.findByRole("alert")).toBeVisible();
      expect(screen.getByLabelText("Full name", { exact: true })).toHaveValue(
        "Alex Example",
      );
      expect(
        screen.getByRole("button", { name: "Send your message" }),
      ).toBeEnabled();
      expect(
        screen.queryByText("Thanks for reaching out."),
      ).not.toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  },
);
test("network failures do not discard the message or claim it was delivered", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("network");
    }),
  );
  try {
    render(<App pathname="/contact/" />);
    const user = await fillInquiry();
    await user.click(screen.getByRole("button", { name: "Send your message" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "couldn’t confirm",
    );
    expect(
      screen.getByLabelText("How can we work together?", { exact: true }),
    ).toHaveValue("We would like to discuss a partnership.");
  } finally {
    vi.unstubAllGlobals();
  }
});

test("the partnership call to action opens the contact screen", () => {
  render(<App />);
  expect(
    screen.getByRole("link", { name: "Start a conversation" }),
  ).toHaveAttribute("href", "/contact/");
});

test("the contact screen collects essential partnership details with optional extras", () => {
  render(<App pathname="/contact/" />);
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "Good things start with a conversation.",
    }),
  ).toBeVisible();
  for (const label of [
    "Full name",
    "Business email",
    "Company",
    "How can we work together?",
  ]) {
    expect(screen.getByLabelText(label, { exact: true })).toBeRequired();
  }
  for (const label of [
    "Your role (optional)",
    "Company website (optional)",
    "I’m interested in (optional)",
  ]) {
    expect(screen.getByLabelText(label, { exact: true })).not.toBeRequired();
  }
  expect(
    screen.getByLabelText("Business email", { exact: true }),
  ).toHaveAttribute("type", "email");
  expect(
    screen.getByRole("link", { name: "joseph@getpotluck.app" }),
  ).toHaveAttribute("href", "mailto:joseph@getpotluck.app");
});
