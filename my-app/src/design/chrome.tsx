import { router, usePathname } from "expo-router";
import { Pressable, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, Label, theme } from "./primitives";

const destinations = [
  { name: "Circles", path: "/circles", icon: "circles" },
  { name: "Cards", path: "/cards", icon: "cards" },
  { name: "Bills", path: "/bills", icon: "bills" },
  { name: "Splitfinder", path: "/discover", icon: "discover" },
] as const;
export type MainTab = (typeof destinations)[number]["name"];
export function mainTab(path: string): MainTab | undefined {
  return destinations.find((d) => d.path === path)?.name;
}

/** One implementation for the persistent home navigation and nested-flow navigation. */
export function BottomNavigation({ selected }: { selected: MainTab }) {
  const inset = useSafeAreaInsets();
  const pathname = usePathname();
  return (
    <View
      testID="bottom-navigation"
      style={[s.dock, { paddingBottom: Math.max(inset.bottom, 28) }]}
    >
      <View style={s.nav}>
        {destinations.map(({ name, path, icon }) => (
          <Pressable
            key={name}
            accessibilityRole="tab"
            accessibilityLabel={name}
            accessibilityState={{ selected: selected === name }}
            aria-selected={selected === name}
            onPress={() => {
              if (pathname !== path) router.replace(path);
            }}
            style={[
              s.tab,
              selected === name && {
                backgroundColor:
                  name === "Splitfinder" ? theme.paleBlue : theme.mint,
              },
            ]}
          >
            <Icon name={icon} size={26} />
            <Label
              numberOfLines={1}
              style={{
                fontSize: 11,
                lineHeight: 15,
                color:
                  selected === name
                    ? name === "Splitfinder"
                      ? theme.blue
                      : theme.teal
                    : theme.muted,
                fontFamily:
                  selected === name ? "Inter_600SemiBold" : "Inter_400Regular",
              }}
            >
              {name}
            </Label>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function HeaderActions({ blue = false }: { blue?: boolean }) {
  return (
    <View style={s.actions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open inbox"
        onPress={() => router.push("/inbox")}
        style={s.round}
      >
        <Icon name={blue ? "inboxBlue" : "inbox"} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Your profile"
        onPress={() => router.push("/you")}
        style={[s.round, s.profile]}
      >
        <Label
          style={{
            color: theme.teal,
            fontSize: 14,
            fontFamily: "Inter_600SemiBold",
          }}
        >
          You
        </Label>
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  dock: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 6,
    flexShrink: 0,
  },
  nav: {
    backgroundColor: "white",
    borderRadius: 36,
    paddingHorizontal: 7,
    paddingVertical: 6,
    flexDirection: "row",
    height: 72,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    flexShrink: 0,
    alignItems: "center",
  },
  round: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  profile: { borderWidth: 1.8, borderColor: theme.teal },
});
