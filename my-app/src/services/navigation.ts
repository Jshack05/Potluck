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
