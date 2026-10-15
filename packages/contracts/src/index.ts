import { z } from "zod";

export const id = z.uuid();
export const name = z.string().trim().min(1).max(80);
export const minor = z.number().int().min(0).max(100_000_000);
export const currency = z.literal("USD");
// Product group identifiers, not a processor MCC mapping or active authorization policy.
export const merchantIndustries = [
  "groceries",
  "utilities",
  "internet",
  "dining",
  "fuel",
  "transport",
  "travel",
  "shopping",
  "health",
  "entertainment",
] as const;
export type MerchantIndustry = (typeof merchantIndustries)[number];
export const merchantControlsSettings = z
  .strictObject({
    mode: z.enum(["maximum", "range"]),
    currency,
    minimumMinor: minor.nullable(),
    maximumMinor: minor.min(1),
    industries: z
      .array(z.enum(merchantIndustries))
      .max(10)
      .refine(
        (values) => new Set(values).size === values.length,
        "Choose each industry once.",
      ),
  })
  .refine(
    (value) =>
      value.mode === "maximum"
        ? value.minimumMinor === null
        : value.minimumMinor !== null &&
          value.minimumMinor <= value.maximumMinor,
    { message: "Choose a valid purchase range.", path: ["minimumMinor"] },
  );
export const merchantControlsInput = z.strictObject({
  expectedVersion: z.number().int().min(0).max(2147483646),
  settings: merchantControlsSettings,
});
export const merchantControlsState = z.strictObject({
  cardId: id,
  version: z.number().int().min(0),
  settings: merchantControlsSettings.nullable(),
  enforcement: z.literal("not_active"),
});
export type MerchantControlsSettings = z.infer<typeof merchantControlsSettings>;
export type MerchantControlsState = z.infer<typeof merchantControlsState>;
export const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(value + "T12:00:00Z");
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "Choose a valid date");
export const circleInput = z.strictObject({
  name,
  description: z.string().trim().max(400).default(""),
  privacy: z.enum(["normal", "anonymous"]).default("normal"),
  icon: z.enum(["circles", "home", "heart", "star"]).default("circles"),
  color: z.enum(["lilac", "mint", "peach", "blue"]).default("lilac"),
  membersCanInvite: z.boolean().default(false),
  requireHostApproval: z.boolean().default(true),
  invitedEmails: z
    .array(z.email().transform((v) => v.toLowerCase().trim()))
    .max(20)
    .default([]),
  invitedUserIds: z.array(id).max(20).default([]),
});
export const cardInput = z.strictObject({
  name,
  description: z.string().trim().max(400).default(""),
  design: z
    .enum([
      "teal",
      "graphite",
      "aurora",
      "aurora_gradient",
      "sunset",
      "coral",
      "ocean",
      "berry",
      "brushed_silver",
      "frosted_glass",
      "champagne",
      "satin_teal",
      "ocean_artwork",
      "sunset_artwork",
      "botanical",
      "midnight",
      "terracotta",
      "alpine",
      "prism",
      "orbit",
      "lagoon",
      "cobalt_gradient",
      "tidal_gradient",
      "ember_gradient",
      "iris_gradient",
      "evergreen_twotone",
      "clay_twotone",
      "indigo_twotone",
      "slate_twotone",
      "navy_solid",
      "plum_solid",
      "sage_solid",
      "sand_solid",
    ])
    .default("teal"),
  circleId: id.nullable().default(null),
  betaAccountId: id.optional(),
});
// Metadata only. Reuse the approved catalog without the creation-time default.
export const cardAppearanceInput = z.strictObject({
  name,
  design: cardInput.shape.design.removeDefault(),
  expectedVersion: z.number().int().positive().max(2147483646),
});
export const billInput = z
  .strictObject({
    name,
    icon: z
      .enum([
        "internet",
        "phone",
        "tv",
        "lightning",
        "rent",
        "water",
        "trash",
        "groceries",
        "car",
        "insurance",
        "streaming",
        "medical",
        "bill",
        "utilities",
        "gas",
      ])
      .default("bill"),
    color: z.enum(["teal", "blue", "coral", "gold", "purple"]).default("teal"),
    planningOnly: z.boolean().default(false),
    circleId: id.nullable().default(null),
    cardId: id.nullable().default(null),
    amountMinor: minor.refine((value) => value > 0),
    currency: currency.default("USD"),
    kind: z.enum(["fixed", "flexible"]).default("fixed"),
    maximumMinor: minor.nullable().default(null),
    frequency: z.enum(["once", "weekly", "monthly"]).default("monthly"),
    firstDueDate: calendarDate,
    participants: z
      .array(id)
      .min(1)
      .max(50)
      .refine((ids) => new Set(ids).size === ids.length),
    allocation: z.record(id, minor).optional(),
    percentages: z.record(id, z.number().int().min(0).max(10000)).optional(),
    personalCaps: z.record(id, minor).optional(),
    reasonForChange: z.string().trim().max(500).optional(),
  })
  .refine(
    (value) =>
      value.kind !== "flexible" ||
      (value.maximumMinor !== null && value.maximumMinor >= value.amountMinor),
    "Flexible Bills need a maximum at least equal to the estimate",
  );
export const listingInput = z
  .strictObject({
    title: name,
    brand: z.string().trim().max(60).default(""),
    category: z.enum(["subscriptions", "memberships", "plans", "housing"]),
    description: z.string().trim().min(10).max(2000),
    serviceKind: z.enum(["tv", "music", "software", "other"]).default("other"),
    shareMinor: minor.refine((value) => value > 0),
    totalMinor: minor.nullable().default(null),
    capacity: z.number().int().min(2).max(50),
    filled: z.number().int().min(1).max(49).default(1),
    location: z.string().trim().max(100).default(""),
    moveIn: calendarDate.nullable().default(null),
  })
  .refine(
    (value) =>
      value.filled < value.capacity &&
      (value.totalMinor === null || value.totalMinor >= value.shareMinor),
    "Check availability and total price",
  );
export const messageInput = z.strictObject({
  text: z.string().trim().min(1).max(2000),
});
export const versionInput = z.strictObject({
  expectedVersion: z.number().int().positive(),
});
export const requestInput = z.strictObject({
  listingVersion: z.number().int().positive(),
  message: z.string().trim().min(1).max(2000),
  acceptedRules: z.literal(true),
  rulesVersion: z.literal("2026-10-04"),
});
export const agreementAcceptance = z.strictObject({
  termsVersion: z.number().int().positive(),
  accepted: z.literal(true),
  personalMaximumMinor: minor.optional(),
});
export type Actor = {
  id: string;
  name: string;
  email: string;
  identity: "local" | "supabase";
};
export type BillInput = z.infer<typeof billInput>;
export type ApiError = {
  error: { code: string; message: string };
  requestId: string;
};
