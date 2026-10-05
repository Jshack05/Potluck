import { z } from "zod";

export const id = z.uuid();
export const name = z.string().trim().min(1).max(80);
export const minor = z.number().int().min(0).max(100_000_000);
export const currency = z.literal("USD");
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
});
export const cardInput = z.strictObject({
  name,
  description: z.string().trim().max(400).default(""),
  design: z.enum(["teal", "graphite", "aurora"]).default("teal"),
  circleId: id.nullable().default(null),
});
export const billInput = z
  .strictObject({
    name,
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
