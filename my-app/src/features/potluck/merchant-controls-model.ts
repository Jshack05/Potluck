import {
  merchantControlsSettings,
  merchantIndustries,
  type MerchantControlsSettings,
  type MerchantControlsState,
  type MerchantIndustry,
} from "@potluck/contracts";
import { parseMoney } from "@potluck/domain/money";

function moneyInput(value: string): number {
  const minor = parseMoney(value.trim());
  if (minor > 100000000) throw new Error("The amount is too large.");
  return minor;
}

export const merchantIndustryLabels: Record<MerchantIndustry, string> = {
  groceries: "Groceries",
  utilities: "Utilities",
  internet: "Phone & internet",
  dining: "Dining",
  fuel: "Fuel",
  transport: "Transportation",
  travel: "Travel & lodging",
  shopping: "Shopping",
  health: "Health & pharmacy",
  entertainment: "Entertainment",
};
export type MerchantDraft = {
  mode: "maximum" | "range";
  minimum: string;
  maximum: string;
  industries: MerchantIndustry[];
};
export type MerchantEditor = {
  version: number;
  draft: MerchantDraft;
  picker: MerchantIndustry[] | null;
};
export type MerchantEdit =
  | { type: "mode"; value: MerchantDraft["mode"] }
  | { type: "amount"; field: "minimum" | "maximum"; value: string }
  | { type: "edit-industries" | "cancel-industries" | "use-industries" }
  | { type: "toggle-industry"; industry: MerchantIndustry };
const amountText = (minor: number | null | undefined) =>
  minor == null
    ? ""
    : `${Math.floor(minor / 100)}.${String(minor % 100).padStart(2, "0")}`;

export function createMerchantEditor(
  state: MerchantControlsState,
): MerchantEditor {
  return {
    version: state.version,
    picker: null,
    draft: {
      mode: state.settings?.mode ?? "maximum",
      minimum: amountText(state.settings?.minimumMinor),
      maximum: amountText(state.settings?.maximumMinor),
      industries: [...(state.settings?.industries ?? [])],
    },
  };
}
export function merchantEditorReducer(
  state: MerchantEditor,
  action: MerchantEdit,
): MerchantEditor {
  switch (action.type) {
    case "mode":
      return { ...state, draft: { ...state.draft, mode: action.value } };
    case "amount":
      return {
        ...state,
        draft: { ...state.draft, [action.field]: action.value },
      };
    case "edit-industries":
      return { ...state, picker: [...state.draft.industries] };
    case "cancel-industries":
      return { ...state, picker: null };
    case "use-industries":
      return state.picker === null
        ? state
        : {
            ...state,
            draft: { ...state.draft, industries: [...state.picker] },
            picker: null,
          };
    case "toggle-industry": {
      if (state.picker === null) return state;
      const choices = new Set(state.picker);
      if (choices.has(action.industry)) choices.delete(action.industry);
      else choices.add(action.industry);
      return {
        ...state,
        picker: merchantIndustries.filter((id) => choices.has(id)),
      };
    }
  }
}
export type MerchantErrors = Partial<
  Record<"minimum" | "maximum" | "industries", string>
>;
export function merchantSettings(
  draft: MerchantDraft,
):
  | { ok: true; settings: MerchantControlsSettings }
  | { ok: false; errors: MerchantErrors } {
  const errors: MerchantErrors = {};
  let maximumMinor = 0,
    minimumMinor: number | null = null;
  try {
    maximumMinor = moneyInput(draft.maximum);
    if (maximumMinor === 0)
      errors.maximum = "Enter a maximum greater than zero.";
  } catch (error) {
    errors.maximum = (error as Error).message;
  }
  if (draft.mode === "range") {
    try {
      minimumMinor = moneyInput(draft.minimum);
    } catch (error) {
      errors.minimum = (error as Error).message;
    }
    if (!errors.maximum && minimumMinor !== null && minimumMinor > maximumMinor)
      errors.minimum = "Minimum cannot exceed maximum.";
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  const result = merchantControlsSettings.safeParse({
    mode: draft.mode,
    currency: "USD",
    minimumMinor,
    maximumMinor,
    industries: draft.industries,
  });
  return result.success
    ? { ok: true, settings: result.data }
    : { ok: false, errors: { industries: "Choose valid industries." } };
}
export function filterMerchantIndustries(query: string): MerchantIndustry[] {
  const needle = query.trim().toLocaleLowerCase();
  return merchantIndustries.filter((id) =>
    merchantIndustryLabels[id].toLocaleLowerCase().includes(needle),
  );
}
export function merchantControlsSummary(
  settings: MerchantControlsSettings | null,
): string {
  return settings === null
    ? "Not configured"
    : `${settings.industries.length} ${settings.industries.length === 1 ? "industry" : "industries"}`;
}
