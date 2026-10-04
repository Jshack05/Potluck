// @vitest-environment node
import { expect, test, vi } from "vitest";
import worker, { type ContactEnv } from "./index";

const data = {
  name: "Alex Example",
  email: "alex@example.com",
  company: "Example Co",
  role: "Founder",
  website: "https://example.com",
  interest: "Business partnerships",
  message: "We would like to discuss a partnership.",
  companyFax: "",
};
function setup() {
  const sent: unknown[] = [];
  const env: ContactEnv = {
    ASSETS: { fetch: async () => new Response("static page") },
    CONTACT_EMAIL: {
      send: async (message) => {
        sent.push(message);
        return { messageId: "test-message" };
      },
    },
    CONTACT_RATE: { limit: async () => ({ success: true }) },
    CONTACT_GLOBAL_RATE: { limit: async () => ({ success: true }) },
  };
  return { env, sent };
}
function request(
  payload: unknown = data,
  headers: Record<string, string> = {},
) {
  return new Request("https://getpotluck.app/api/v1/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://getpotluck.app",
      "cf-connecting-ip": "192.0.2.1",
      ...headers,
    },
    body: JSON.stringify(payload),
  });
}
test("valid inquiries send only to Joseph with a visitor reply-to and return acceptance", async () => {
  const { env, sent } = setup();
  const response = await worker.fetch(request(), env);
  expect(response.status).toBe(202);
  expect(await response.json()).toMatchObject({ status: "accepted" });
  expect(sent).toHaveLength(1);
  expect(sent[0]).toMatchObject({
    to: "joseph@getpotluck.app",
    from: "website@getpotluck.app",
    replyTo: data.email,
    text: expect.stringContaining(data.message),
  });
  expect(response.headers.get("cache-control")).toBe("no-store");
});
test.each([
  { ...data, name: "   " },
  { ...data, email: "alex@example.com\r\nBcc:other@example.com" },
  { ...data, website: "javascript:alert(1)" },
  { ...data, message: "a".repeat(1501) },
  { ...data, to: "other@example.com" },
  { ...data, interest: "Injected topic" },
  null,
])("invalid inquiries never send email: %j", async (invalid) => {
  const { env, sent } = setup();
  expect((await worker.fetch(request(invalid), env)).status).toBe(400);
  expect(sent).toHaveLength(0);
});
test("foreign origins are denied before sending", async () => {
  const { env, sent } = setup();
  expect(
    (
      await worker.fetch(
        request(data, { origin: "https://attacker.example" }),
        env,
      )
    ).status,
  ).toBe(403);
  expect(sent).toHaveLength(0);
});
test("rate limits and honeypot stop unwanted mail", async () => {
  const { env, sent } = setup();
  env.CONTACT_RATE.limit = async () => ({ success: false });
  expect((await worker.fetch(request(), env)).status).toBe(429);
  env.CONTACT_RATE.limit = async () => ({ success: true });
  expect(
    (await worker.fetch(request({ ...data, companyFax: "spam" }), env)).status,
  ).toBe(400);
  expect(sent).toHaveLength(0);
});
test("provider failure returns a safe error rather than success or a leaked exception", async () => {
  const { env } = setup();
  env.CONTACT_EMAIL.send = async () => {
    throw new Error("private provider error");
  };
  const response = await worker.fetch(request(), env);
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("private provider");
});
test("missing delivery or rate bindings fail closed", async () => {
  const { env } = setup();
  const response = await worker.fetch(request(), {
    ...env,
    CONTACT_EMAIL: undefined,
  } as unknown as ContactEnv);
  expect(response.status).toBe(503);
});
test("oversized requests and wrong methods are rejected, static pages still work", async () => {
  const { env, sent } = setup();
  expect(
    (await worker.fetch(request({ message: "a".repeat(20000) }), env)).status,
  ).toBe(413);
  expect(
    (
      await worker.fetch(
        new Request("https://getpotluck.app/api/v1/contact"),
        env,
      )
    ).status,
  ).toBe(405);
  expect(
    await (
      await worker.fetch(new Request("https://getpotluck.app/cards/"), env)
    ).text(),
  ).toBe("static page");
  expect(sent).toHaveLength(0);
});
test("audit logs contain status and a request ID, not visitor data", async () => {
  const log = vi.spyOn(console, "info").mockImplementation(() => {});
  try {
    const { env } = setup();
    await worker.fetch(request(), env);
    const output = JSON.stringify(log.mock.calls);
    expect(output).toContain("accepted");
    expect(output).not.toContain(data.email);
    expect(output).not.toContain(data.message);
  } finally {
    log.mockRestore();
  }
});
