import {
  createApp as createProductionApp,
  type Options,
} from "../../services/potluck-api/src/app.ts";

/** Existing business-rule journeys begin after onboarding. Only tests supply this
 * provider fixture; production startup has no flag or route that grants access. */
export function createApp(options: Options) {
  return createProductionApp({
    ...options,
    bankOnboarding: {
      readConfirmation: async (actorId) => ({
        actorId,
        providerReference: "test-only-confirmation",
        confirmedAt: "2026-01-01T00:00:00Z",
      }),
    },
  });
}
