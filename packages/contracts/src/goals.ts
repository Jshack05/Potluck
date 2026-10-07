import { z } from "zod";
import { calendarDate, currency, id, minor, name } from "./index.ts";

/** Planning only. This contract cannot accept consent, an account, or provider state. */
export const goalInput = z
  .strictObject({
    name,
    kind: z.enum(["target", "time_based"]),
    targetMinor: minor
      .refine((amount) => amount > 0)
      .nullable()
      .default(null),
    endDate: calendarDate.nullable().default(null),
    frequency: z.enum(["monthly", "weekly"]).default("monthly"),
    firstContributionDate: calendarDate,
    currency: currency.default("USD"),
    circleId: id.nullable().default(null),
    cardId: id.nullable().default(null),
    plannedContributions: z
      .array(
        z.strictObject({
          personId: id,
          amountMinor: minor.refine((amount) => amount > 0),
        }),
      )
      .max(50)
      .default([]),
    lockFundsRequested: z.boolean().default(false),
    showContributions: z.boolean().default(false),
  })
  .superRefine((input, context) => {
    if (
      input.kind === "target" &&
      (input.targetMinor === null || input.endDate !== null)
    )
      context.addIssue({
        code: "custom",
        path: ["targetMinor"],
        message: "A target goal needs an amount and no end date.",
      });
    if (input.kind === "time_based" && input.targetMinor !== null)
      context.addIssue({
        code: "custom",
        path: ["targetMinor"],
        message: "A time-based goal uses a duration, not a target amount.",
      });
    if (input.endDate && input.endDate < input.firstContributionDate)
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message:
          "The end date must be on or after the first contribution date.",
      });
    if (
      new Set(input.plannedContributions.map((p) => p.personId)).size !==
      input.plannedContributions.length
    )
      context.addIssue({
        code: "custom",
        path: ["plannedContributions"],
        message: "Choose each person once.",
      });
    if (
      input.plannedContributions.reduce((sum, p) => sum + p.amountMinor, 0) >
      100_000_000
    )
      context.addIssue({
        code: "custom",
        path: ["plannedContributions"],
        message: "The planned total is too large.",
      });
  });
