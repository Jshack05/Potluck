import test from "node:test";
import assert from "node:assert/strict";
import {
  createMerchantEditor,
  merchantEditorReducer,
  merchantSettings,
  filterMerchantIndustries,
  merchantControlsSummary,
} from "../src/features/potluck/merchant-controls-model.ts";

const saved = {
  cardId: "card",
  version: 3,
  enforcement: "not_active",
  settings: {
    mode: "range",
    currency: "USD",
    minimumMinor: 1001,
    maximumMinor: 15099,
    industries: ["groceries", "utilities"],
  },
};
test("unconfigured controls have no fictional amounts; saved minor units round-trip exactly", () => {
  const blank = createMerchantEditor({ ...saved, version: 0, settings: null });
  assert.equal(blank.draft.maximum, "");
  assert.deepEqual(blank.draft.industries, []);
  const state = createMerchantEditor(saved);
  assert.equal(state.draft.minimum, "10.01");
  assert.deepEqual(merchantSettings(state.draft), {
    ok: true,
    settings: saved.settings,
  });
  assert.equal(merchantControlsSummary(null), "Not configured");
  assert.equal(merchantControlsSummary(saved.settings), "2 industries");
});
test("industry picker cancel restores the editor draft; Use commits only temporary selections", () => {
  const initial = createMerchantEditor(saved);
  const opened = merchantEditorReducer(initial, { type: "edit-industries" });
  const changed = merchantEditorReducer(opened, {
    type: "toggle-industry",
    industry: "groceries",
  });
  assert.deepEqual(changed.draft.industries, saved.settings.industries);
  assert.deepEqual(
    merchantEditorReducer(changed, { type: "cancel-industries" }),
    initial,
  );
  const applied = merchantEditorReducer(changed, { type: "use-industries" });
  assert.deepEqual(applied.draft.industries, ["utilities"]);
  assert.equal(applied.picker, null);
  assert.equal(initial.version, 3);
  assert.equal(applied.version, 3, "picker cannot advance the saved version");
});
test("mode switching and searches never discard values or hidden selections", () => {
  const initial = createMerchantEditor(saved);
  const maximum = merchantEditorReducer(initial, {
    type: "mode",
    value: "maximum",
  });
  assert.equal(merchantSettings(maximum.draft).settings.minimumMinor, null);
  assert.deepEqual(
    merchantEditorReducer(maximum, { type: "mode", value: "range" }),
    initial,
  );
  assert.deepEqual(filterMerchantIndustries("  PHARMACY "), ["health"]);
  assert.deepEqual(filterMerchantIndustries("zzz"), []);
  assert.deepEqual(initial.draft.industries, ["groceries", "utilities"]);
});
test("amount validation reports the relevant fields and preserves money precision", () => {
  const draft = createMerchantEditor(saved).draft;
  for (const maximum of [
    "",
    "1.001",
    "-1",
    "1e3",
    "1,000",
    "1000000.01",
    "NaN",
    "0",
  ]) {
    const result = merchantSettings({ ...draft, maximum });
    assert.equal(result.ok, false, maximum);
    assert.ok(result.errors.maximum, maximum);
  }
  assert.ok(merchantSettings({ ...draft, minimum: "200" }).errors.minimum);
  assert.ok(merchantSettings({ ...draft, minimum: "" }).errors.minimum);
  assert.equal(
    merchantSettings({ ...draft, minimum: "0.01", maximum: "0.29" }).settings
      .maximumMinor,
    29,
  );
  assert.deepEqual(
    merchantSettings({
      ...draft,
      minimum: "0",
      maximum: "1000000",
      industries: [],
    }).settings.industries,
    [],
  );
});
