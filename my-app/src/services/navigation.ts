export function creationPath(
  path:
    | "/create/circle"
    | "/create/card"
    | "/create/bill"
    | "/create/goal"
    | "/create/listing",
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
    !/^\/(circles|circle|cards|card|bills|bill|bill-attention|agreement|goal|goals|import-bills|settings|discover|listing|inbox|conversation|create|saved|you|invitation|my-listings|sharing-rules|manage|profile|circle-transfer)(\/|$)/.test(
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
  if (access !== "signed_out") return null;
  const target = safeReturnTo(destination);
  return "/sign-in?returnTo=" + encodeURIComponent(target);
}

export function financialArea(path: string): "Cards" | "Bills" | null {
  const pathname = path.split("?")[0];
  if (/^\/(cards?|create\/card|manage\/cards)(\/|$)/.test(pathname))
    return "Cards";
  if (/^\/(bills?|agreement|create\/bill|manage\/bills)(\/|$)/.test(pathname))
    return "Bills";
  return null;
}

/** Organization never waits for banking. Provider-only and unknown reads stay gated. */
export function canLoadResource(access: EntryAccess, path: string): boolean {
  if (access === "signed_out") return false;
  if (
    /^\/(circles|circle-transfers|invitations|brands|listings|my-listings|profiles|requests|conversations|saved|notifications)(\/|\?|$)/.test(
      path,
    )
  )
    return true;
  if (
    /^\/(cards|bills|agreements|circle-arrangements|goals)(\/[^/?]+)?(\?|$)/.test(
      path,
    ) ||
    /^\/(bill-summary|people|settings)(\?|$)/.test(path)
  )
    return true;
  return access === "ready";
}
