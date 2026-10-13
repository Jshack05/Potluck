import { useState } from "react";
import { Image } from "expo-image";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import type { MerchantIndustry } from "@potluck/contracts";
import { Field, ErrorText, Label, theme } from "@/design/system";
import { CardThumbnail } from "./card-thumbnail";
import type { Card } from "./types";
import {
  filterMerchantIndustries,
  merchantIndustryLabels,
  type MerchantDraft,
  type MerchantEdit,
  type MerchantErrors,
} from "./merchant-controls-model";

const industryIcons: Record<
  MerchantIndustry,
  { source: number; size: number; offset?: number }
> = {
  groceries: {
    source: require("../../../assets/potluck/bill/groceries.svg"),
    size: 20,
  },
  utilities: {
    source: require("../../../assets/potluck/bill/lightning.svg"),
    size: 20,
  },
  internet: {
    source: require("../../../assets/potluck/bill/internet.svg"),
    size: 20,
    offset: 4.3,
  },
  transport: {
    source: require("../../../assets/potluck/bill/car.svg"),
    size: 20,
  },
  health: {
    source: require("../../../assets/potluck/bill/medical.svg"),
    size: 20,
  },
  dining: {
    source: require("../../../assets/potluck/merchant-controls/dining.svg"),
    size: 17.143,
  },
  fuel: {
    source: require("../../../assets/potluck/merchant-controls/fuel.svg"),
    size: 17.143,
  },
  travel: {
    source: require("../../../assets/potluck/merchant-controls/travel.svg"),
    size: 17.143,
  },
  shopping: {
    source: require("../../../assets/potluck/merchant-controls/shopping.svg"),
    size: 17.143,
  },
  entertainment: {
    source: require("../../../assets/potluck/merchant-controls/entertainment.svg"),
    size: 17.143,
  },
};

export function MerchantIndustryRow({
  industry,
  checked,
  onPress,
}: {
  industry: MerchantIndustry;
  checked: boolean;
  onPress?: () => void;
}) {
  const icon = industryIcons[industry];
  const content = (
    <>
      <View
        style={[styles.icon, { borderRadius: icon.size === 20 ? 17 : 11.429 }]}
      >
        <Image
          source={icon.source}
          contentFit="contain"
          style={{
            width: icon.size,
            height: icon.size,
            marginTop: icon.offset ?? 0,
          }}
        />
      </View>
      <Label style={[styles.label, { flex: 1 }]}>
        {merchantIndustryLabels[industry]}
      </Label>
      <View style={{ width: 24, height: 24 }}>
        <View
          style={{
            position: "absolute",
            top: 1,
            left: 1,
            width: 22,
            height: 22,
            borderWidth: 1.5,
            borderColor: theme.teal,
            borderRadius: 5,
            backgroundColor: checked ? theme.teal : "white",
          }}
        />
        {checked && (
          <Image
            source={require("../../../assets/potluck/merchant-controls/checked.svg")}
            contentFit="contain"
            style={{ width: 24, height: 24 }}
          />
        )}
      </View>
    </>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={merchantIndustryLabels[industry]}
      accessibilityState={{ checked }}
      aria-checked={checked}
      onPress={onPress}
      style={styles.industry}
    >
      {content}
    </Pressable>
  ) : (
    <View style={styles.industry}>{content}</View>
  );
}

function AmountField({
  field,
  label,
  draft,
  error,
  disabled,
  onChange,
}: {
  field: "minimum" | "maximum";
  label: string;
  draft: MerchantDraft;
  error?: string;
  disabled: boolean;
  onChange: (action: MerchantEdit) => void;
}) {
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Label style={styles.caption}>{label}</Label>
      <Field
        label={label}
        hideLabel
        error={error}
        keyboardType="decimal-pad"
        editable={!disabled}
        value={draft[field] ? "$" + draft[field] : ""}
        placeholder="$0.00"
        onChangeText={(value) =>
          onChange({ type: "amount", field, value: value.replace(/^\$/, "") })
        }
        style={styles.amount}
      />
    </View>
  );
}

export function MerchantControlsForm({
  card,
  fullName,
  draft,
  errors,
  disabled,
  onChange,
}: {
  card: Pick<Card, "name" | "design">;
  fullName: string;
  draft: MerchantDraft;
  errors: MerchantErrors;
  disabled: boolean;
  onChange: (action: MerchantEdit) => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.cardContext}>
        <CardThumbnail design={card.design} fullName={fullName} />
        <Label style={[styles.label, { flex: 1 }]}>{card.name}</Label>
        <View style={styles.badge}>
          <Label style={[styles.caption, { color: theme.teal }]}>HOST</Label>
        </View>
      </View>
      <Label accessibilityRole="header" style={styles.heading}>
        Purchase amount
      </Label>
      <View style={styles.purchase}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Label
            style={{
              width: 24,
              textAlign: "center",
              color: theme.teal,
              fontFamily: "Inter_700Bold",
              fontSize: 22,
              lineHeight: 24,
            }}
          >
            $
          </Label>
          <Label style={styles.label}>Per purchase</Label>
        </View>
        <View accessibilityRole="radiogroup" style={styles.modes}>
          {(["maximum", "range"] as const).map((mode) => (
            <Pressable
              key={mode}
              accessibilityRole="radio"
              accessibilityLabel={mode === "maximum" ? "Maximum" : "Range"}
              accessibilityState={{ checked: draft.mode === mode, disabled }}
              aria-checked={draft.mode === mode}
              disabled={disabled}
              onPress={() => onChange({ type: "mode", value: mode })}
              style={[
                styles.mode,
                {
                  backgroundColor:
                    draft.mode === mode ? theme.teal : theme.canvas,
                },
              ]}
            >
              <Label
                style={[
                  styles.label,
                  { color: draft.mode === mode ? "white" : theme.muted },
                ]}
              >
                {mode === "maximum" ? "Maximum" : "Range"}
              </Label>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {draft.mode === "range" && (
            <AmountField
              field="minimum"
              label="Minimum"
              {...{ draft, disabled, onChange }}
              error={errors.minimum}
            />
          )}
          <AmountField
            field="maximum"
            label={draft.mode === "range" ? "Maximum" : "Maximum amount"}
            {...{ draft, disabled, onChange }}
            error={errors.maximum}
          />
        </View>
        <Label style={{ color: theme.muted, fontSize: 12, lineHeight: 16 }}>
          USD per purchase
        </Label>
        <Label style={[styles.caption, { color: theme.muted }]}>
          Saved controls are not active.
        </Label>
      </View>
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Label
            accessibilityRole="header"
            style={[styles.heading, { flex: 1 }]}
          >
            Allowed industries
          </Label>
          <Pressable
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Edit industries"
            onPress={() => onChange({ type: "edit-industries" })}
            style={{
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Label style={[styles.label, { color: theme.teal }]}>Edit</Label>
          </Pressable>
        </View>
        <Label style={[styles.caption, { color: theme.muted }]}>
          Only selected industries are allowed.
        </Label>
        {!!draft.industries.length && (
          <View style={[styles.list, { paddingVertical: 4 }]}>
            {draft.industries.map((industry) => (
              <MerchantIndustryRow key={industry} industry={industry} checked />
            ))}
          </View>
        )}
        <ErrorText text={errors.industries} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 8,
            paddingTop: 10,
          }}
        >
          <Image
            source={require("../../../assets/potluck/bill/info.svg")}
            tintColor={theme.teal}
            contentFit="contain"
            style={{ width: 18, height: 18 }}
          />
          <Label style={[styles.caption, { color: theme.muted, flex: 1 }]}>
            Uses merchant categories, not individual items.
          </Label>
        </View>
      </View>
    </View>
  );
}

export function MerchantIndustryPicker({
  selected,
  onToggle,
}: {
  selected: readonly MerchantIndustry[];
  onToggle: (industry: MerchantIndustry) => void;
}) {
  const [query, setQuery] = useState("");
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.search}>
        <Image
          source={require("../../../assets/potluck/circle-flow/search.svg")}
          contentFit="contain"
          style={{ width: 24, height: 24 }}
        />
        <TextInput
          accessibilityLabel="Search industries"
          placeholder="Search industries"
          placeholderTextColor={theme.muted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          style={{
            flex: 1,
            minWidth: 0,
            padding: 0,
            color: theme.ink,
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            lineHeight: 23,
          }}
        />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Label accessibilityRole="header" style={[styles.heading, { flex: 1 }]}>
          Industries
        </Label>
        <Label style={[styles.caption, { color: theme.muted }]}>
          {selected.length} selected
        </Label>
      </View>
      <View style={styles.list}>
        {filterMerchantIndustries(query).map((industry) => (
          <MerchantIndustryRow
            key={industry}
            industry={industry}
            checked={selected.includes(industry)}
            onPress={() => onToggle(industry)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: "Inter_600SemiBold", fontSize: 16, lineHeight: 23 },
  caption: { fontSize: 14, lineHeight: 20 },
  heading: { fontFamily: "Inter_600SemiBold", fontSize: 20, lineHeight: 28 },
  cardContext: {
    minHeight: 88,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badge: { backgroundColor: theme.mint, padding: 4, borderRadius: 12 },
  purchase: {
    borderRadius: 20,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  modes: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 999,
    backgroundColor: theme.canvas,
  },
  mode: {
    flex: 1,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  amount: {
    minHeight: 46,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#DDE3DF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: "Inter_600SemiBold",
    fontSize: 22,
    lineHeight: 28,
  },
  list: { borderRadius: 20, backgroundColor: "white", overflow: "hidden" },
  industry: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 12,
    backgroundColor: "white",
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.mint,
  },
  search: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
});
