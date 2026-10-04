import { Image } from "expo-image";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";
import { colors, Txt } from "./ui";

export function SearchRow({
  value,
  onChangeText,
  placeholder,
  filtered,
  onOpenFilters,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  filtered: boolean;
  onOpenFilters: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Image
          source={require("../../../assets/splitfinder/search.svg")}
          style={{ width: 22, height: 22 }}
          contentFit="contain"
        />
        <TextInput
          accessibilityLabel="Search listings"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#57666E"
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
          style={styles.input}
        />
        {Boolean(value) && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => onChangeText("")}
            style={styles.clear}
          >
            <Txt style={{ color: colors.blue, fontSize: 13 }}>Clear</Txt>
          </Pressable>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={filtered ? "Filters, 1 applied" : "Filters"}
        onPress={() => {
          Keyboard.dismiss();
          onOpenFilters();
        }}
        style={({ pressed }) => [styles.filters, pressed && { opacity: 0.7 }]}
      >
        <Txt style={{ color: colors.blue, fontSize: 14, textAlign: "center" }}>
          {filtered ? "Filters · 1" : "Filters"}
        </Txt>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, alignItems: "stretch" },
  field: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 54,
    paddingLeft: 16,
    paddingRight: 8,
    borderRadius: 18,
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.ink,
  },
  clear: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  filters: {
    minWidth: 98,
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
});
