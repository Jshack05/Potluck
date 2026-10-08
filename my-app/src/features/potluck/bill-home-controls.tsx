import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Label, theme } from "@/design/primitives";

export function BillScopeTabs({
  scope,
  onChange,
}: {
  scope: "all" | "shared";
  onChange: (scope: "all" | "shared") => void;
}) {
  return (
    <View style={{ flexDirection: "row" }}>
      {(["all", "shared"] as const).map((value) => (
        <Pressable
          key={value}
          accessibilityRole="tab"
          accessibilityState={{ selected: scope === value }}
          aria-selected={scope === value}
          onPress={() => onChange(value)}
          style={{
            flex: 1,
            minHeight: 52,
            alignItems: "center",
            justifyContent: "center",
            borderBottomWidth: 3,
            borderColor: scope === value ? theme.teal : "transparent",
          }}
        >
          <Label
            style={{
              fontSize: 20,
              fontFamily: "Inter_600SemiBold",
              color: scope === value ? theme.teal : theme.muted,
            }}
          >
            {value === "shared" ? "Shared" : "All bills"}
          </Label>
        </Pressable>
      ))}
    </View>
  );
}

/** Source: Figma Bills / Import bills button, enlarged 1.5x; shares the footer with +. */
export function ImportBillsButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Import bills"
      onPress={() => router.push("/import-bills")}
      style={({ pressed }) => ({
        width: "100%",
        maxWidth: 284,
        minHeight: 66,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "white",
        borderWidth: 2,
        borderColor: theme.teal,
        borderRadius: 12,
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Image
        source={require("../../../assets/potluck/bill/import.svg")}
        style={{ width: 24, height: 24 }}
        contentFit="contain"
      />
      <Label
        style={{
          color: theme.teal,
          fontFamily: "Inter_600SemiBold",
          fontSize: 16,
        }}
      >
        Import bills
      </Label>
    </Pressable>
  );
}
