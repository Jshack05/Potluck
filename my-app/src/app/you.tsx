import { useState } from "react";
import { Image } from "expo-image";
import { Pressable, TextInput, View } from "react-native";
import { go, Label, theme } from "@/design/system";
import { useClient } from "@/services/client";
import {
  ProfileArt,
  SettingsGroup,
  SettingsPage,
  SettingsRow,
  SettingsLogoutSheet,
} from "@/features/potluck/settings-ui";
const groups = [
  {
    title: "Account",
    rows: [
      ["Banking & funding", "banking"],
      ["Login & security", "security"],
      ["Personal details", "personal"],
    ],
  },
  {
    title: "People & privacy",
    rows: [
      ["Friends", "friends"],
      ["Privacy", "privacy"],
      ["Notifications", "notifications"],
    ],
  },
  {
    title: "Support",
    rows: [
      ["Help", "help"],
      ["Log out", "logout"],
    ],
  },
];
export default function You() {
  const client = useClient();
  const [query, setQuery] = useState(""),
    [logout, setLogout] = useState(false);
  return (
    <SettingsPage title="Settings">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
        onPress={() => go("/settings/profile")}
        style={{
          backgroundColor: "white",
          borderRadius: 24,
          minHeight: 94,
          padding: 24,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
        }}
      >
        <ProfileArt />
        <View style={{ flex: 1, gap: 5 }}>
          <Label style={{ fontSize: 22, fontFamily: "Inter_700Bold" }}>
            {client.user?.name}
          </Label>
          <Label style={{ fontSize: 14, color: theme.muted }}>
            Your Potluck profile
          </Label>
        </View>
        <Label style={{ fontSize: 26, color: theme.muted }}>›</Label>
      </Pressable>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          backgroundColor: "white",
          borderRadius: 18,
          paddingHorizontal: 18,
          height: 52,
        }}
      >
        <Image
          source={require("../../assets/potluck/search.svg")}
          style={{ width: 18, height: 18 }}
        />
        <TextInput
          accessibilityLabel="Search settings"
          placeholder="Search settings"
          placeholderTextColor={theme.muted}
          value={query}
          onChangeText={setQuery}
          style={{
            flex: 1,
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: theme.ink,
          }}
        />
      </View>
      {groups.map((group) => {
        const rows = group.rows.filter(([label]) =>
          label.toLowerCase().includes(query.trim().toLowerCase()),
        );
        return rows.length ? (
          <SettingsGroup title={group.title} key={group.title}>
            {rows.map(([label, route], i) => (
              <SettingsRow
                key={route}
                title={label}
                danger={route === "logout"}
                last={i === rows.length - 1}
                onPress={() =>
                  route === "logout"
                    ? setLogout(true)
                    : go("/settings/" + route)
                }
              />
            ))}
          </SettingsGroup>
        ) : null;
      })}
      {Boolean(query) &&
        !groups.some((g) =>
          g.rows.some(([l]) =>
            l.toLowerCase().includes(query.trim().toLowerCase()),
          ),
        ) && (
          <Label style={{ color: theme.muted }}>No matching settings.</Label>
        )}
      {logout && <SettingsLogoutSheet onClose={() => setLogout(false)} />}
    </SettingsPage>
  );
}
