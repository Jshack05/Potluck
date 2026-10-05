export function creationPath(
  path: "/create/circle" | "/create/card" | "/create/bill" | "/create/listing",
  params: Record<string, string | undefined>,
): string {
  const query = new URLSearchParams(
    Object.entries(params).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
  return path + (query.size ? "?" + query.toString() : "");
}
export function safeReturnTo(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\r\n]/.test(value)
  )
    return "/circles";
  const url = new URL(value, "https://potluck.invalid");
  if (
    url.origin !== "https://potluck.invalid" ||
    !/^\/(circles|circle|cards|card|bills|bill|agreement|discover|listing|inbox|conversation|create|saved|you|invitation|my-listings|sharing-rules|manage|profile|circle-transfer)(\/|$)/.test(
      url.pathname,
    )
  )
    return "/circles";
  return url.pathname + url.search;
}

export type EntryAccess =
  "loading" | "signed_out" | "bank_required" | "ready" | "error";
export type EntryStatus =
  | { access: "ready"; bankConnection: "confirmed" }
  | {
      access: "bank_required";
      bankConnection: "unavailable" | "not_connected";
    };

export function parseEntryStatus(value: unknown): EntryStatus {
  if (
    value &&
    typeof value === "object" &&
    "access" in value &&
    "bankConnection" in value
  ) {
    if (value.access === "ready" && value.bankConnection === "confirmed")
      return { access: "ready", bankConnection: "confirmed" };
    if (
      value.access === "bank_required" &&
      (value.bankConnection === "unavailable" ||
        value.bankConnection === "not_connected")
    )
      return { access: "bank_required", bankConnection: value.bankConnection };
  }
  throw new Error("We couldn't confirm your account setup. Please try again.");
}

export function entryDestination(
  access: EntryAccess,
  destination: unknown,
): string | null {
  if (access === "ready" || access === "loading") return null;
  return (
    (access === "signed_out" ? "/sign-in" : "/connect-bank") +
    "?returnTo=" +
    encodeURIComponent(safeReturnTo(destination))
  );
}
