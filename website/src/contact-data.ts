export const contactInterests = [
  "Cards & issuing",
  "Banking & payments",
  "Business partnerships",
  "Investment",
  "Press & media",
  "Something else",
] as const;
export type Inquiry = {
  name: string;
  email: string;
  company: string;
  role: string;
  website: string;
  interest: string;
  message: string;
  companyFax: string;
};
const limits: Record<keyof Inquiry, number> = {
  name: 80,
  email: 254,
  company: 120,
  role: 100,
  website: 300,
  interest: 50,
  message: 1500,
  companyFax: 100,
};
export function parseInquiry(value: unknown): Inquiry | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !Object.hasOwn(limits, key)))
    return null;
  const result = {} as Inquiry;
  for (const key of Object.keys(limits) as (keyof Inquiry)[]) {
    if (input[key] !== undefined && typeof input[key] !== "string") return null;
    const raw = (input[key] ?? "") as string;
    // Header-like fields must never contain control characters, even at the edges.
    if (
      [...raw].some((character) => {
        const code = character.charCodeAt(0);
        return (
          code === 127 ||
          (code < 32 && !(key === "message" && [9, 10, 13].includes(code)))
        );
      })
    )
      return null;
    if (raw.length > limits[key]) return null;
    result[key] = raw.trim();
  }
  if (!result.name || !result.company || !result.message || result.companyFax)
    return null;
  if (
    !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(
      result.email,
    )
  )
    return null;
  if (
    result.interest &&
    !contactInterests.some((item) => item === result.interest)
  )
    return null;
  if (result.website) {
    try {
      const url = new URL(result.website);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password
      )
        return null;
    } catch {
      return null;
    }
  }
  return result;
}
