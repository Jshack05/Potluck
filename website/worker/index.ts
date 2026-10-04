import { parseInquiry } from "../src/contact-data";

type Email = {
  to: string;
  from: string;
  subject: string;
  replyTo: string;
  text: string;
};
type Limiter = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};
export interface ContactEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
  CONTACT_EMAIL: { send(message: Email): Promise<{ messageId: string }> };
  CONTACT_RATE: Limiter;
  CONTACT_GLOBAL_RATE: Limiter;
}
const MAX_BYTES = 16384;
async function readLimitedBody(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > MAX_BYTES)
    throw new RangeError();
  const reader = request.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let length = 0,
    text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BYTES) {
        await reader.cancel();
        throw new RangeError();
      }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}
export default {
  async fetch(request: Request, env: ContactEnv): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    const requestId = crypto.randomUUID();
    const reply = (status: number, code: string) => {
      // Never log form fields, addresses, IPs or raw provider errors.
      console.info(
        JSON.stringify({ event: "contact_inquiry", requestId, status: code }),
      );
      return Response.json(
        { status: code, requestId },
        {
          status,
          headers: {
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
            "X-Request-ID": requestId,
            ...(status === 429 ? { "Retry-After": "60" } : {}),
            ...(status === 405 ? { Allow: "POST" } : {}),
          },
        },
      );
    };
    if (url.pathname !== "/api/v1/contact") return reply(404, "not_found");
    if (request.method !== "POST") return reply(405, "method_not_allowed");
    if (
      request.headers.get("origin") !== url.origin ||
      url.protocol !== "https:"
    )
      return reply(403, "origin_denied");
    if (
      request.headers.get("content-type")?.split(";")[0].trim() !==
      "application/json"
    )
      return reply(415, "unsupported_content_type");
    if (!env.CONTACT_EMAIL || !env.CONTACT_RATE || !env.CONTACT_GLOBAL_RATE)
      return reply(503, "delivery_unavailable");
    try {
      // This public form has no account ID. Limits may also affect people on a shared network.
      const ip = request.headers.get("cf-connecting-ip");
      if (!ip) return reply(403, "origin_denied");
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(ip),
      );
      const key = Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");
      if (!(await env.CONTACT_RATE.limit({ key })).success)
        return reply(429, "rate_limited");
      let input: unknown;
      try {
        input = JSON.parse(await readLimitedBody(request));
      } catch (error) {
        return reply(
          error instanceof RangeError ? 413 : 400,
          error instanceof RangeError ? "too_large" : "invalid_input",
        );
      }
      const inquiry = parseInquiry(input);
      if (!inquiry) return reply(400, "invalid_input");
      if (
        !(await env.CONTACT_GLOBAL_RATE.limit({ key: "partnership-inquiries" }))
          .success
      )
        return reply(429, "rate_limited");
      const result = await env.CONTACT_EMAIL.send({
        to: "joseph@getpotluck.app",
        from: "website@getpotluck.app",
        replyTo: inquiry.email,
        subject: "Potluck website partnership inquiry",
        text: [
          "New inquiry from the Potluck website",
          `Reference: ${requestId}`,
          "",
          `Name: ${inquiry.name}`,
          `Business email: ${inquiry.email}`,
          `Company: ${inquiry.company}`,
          `Role: ${inquiry.role || "Not provided"}`,
          `Website: ${inquiry.website || "Not provided"}`,
          `Interest: ${inquiry.interest || "Not specified"}`,
          "Message:",
          inquiry.message,
        ].join("\n"),
      });
      if (!result?.messageId) return reply(503, "delivery_unavailable");
      return reply(202, "accepted");
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error
          ? error.code
          : undefined;
      const knownCodes = [
        "E_SENDER_NOT_VERIFIED",
        "E_SENDER_DOMAIN_NOT_AVAILABLE",
        "E_RECIPIENT_NOT_ALLOWED",
        "E_DELIVERY_FAILED",
        "E_RATE_LIMIT_EXCEEDED",
        "E_DAILY_LIMIT_EXCEEDED",
      ];
      if (typeof code === "string" && knownCodes.includes(code))
        console.info(
          JSON.stringify({
            event: "contact_delivery_failed",
            requestId,
            providerCode: code,
          }),
        );
      return reply(503, "delivery_unavailable");
    }
  },
};
