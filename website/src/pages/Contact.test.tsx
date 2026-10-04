import { render, screen } from "@testing-library/react";
import App from "../App";

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
