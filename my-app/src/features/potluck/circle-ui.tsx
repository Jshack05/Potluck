import { useEffect, useState, type ReactNode } from "react";
import { SheetSurface } from "@/design/sheet";
import { Image } from "expo-image";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { Label, Muted, ResourceState, theme } from "@/design/system";
import { useClient, useResource } from "@/services/client";
import type { Collection, Person } from "./types";
import {
  addCircleRecipient,
  removeCircleRecipient,
  unresolvedCircleEmail,
  type CircleRecipient,
} from "./circle-model";

export const circleColors = {
  lilac: "#E8D1F7",
  mint: "#DDF4E8",
  peach: "#FFE1D9",
  blue: "#DDECF8",
};
const glyphs = {
  person: {
    source: require("../../../assets/potluck/circle-flow/person.svg"),
    width: 18.075,
    height: 19.575,
  },
  shield: {
    source: require("../../../assets/potluck/circle-flow/shield.svg"),
    width: 18.075,
    height: 21.075,
  },
  lock: {
    source: require("../../../assets/potluck/circle-flow/lock.svg"),
    width: 16.575,
    height: 21.825,
  },
  chevron: {
    source: require("../../../assets/potluck/circle-flow/chevron.svg"),
    width: 6.9375,
    height: 12.5625,
  },
  check: {
    source: require("../../../assets/potluck/circle-flow/check.svg"),
    width: 42.2,
    height: 32.2,
  },
  hero: {
    source: require("../../../assets/potluck/circle-flow/person-hero.svg"),
    width: 48.2,
    height: 52.2,
  },
};
export function CircleGlyph({ name }: { name: keyof typeof glyphs }) {
  const glyph = glyphs[name];
  return (
    <Image
      source={glyph.source}
      contentFit="contain"
      style={{ width: glyph.width, height: glyph.height }}
    />
  );
}
export function CircleAvatar({
  name,
  size = 46,
  index = 0,
  color,
}: {
  name: string;
  size?: number;
  index?: number;
  color?: keyof typeof circleColors;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color
          ? circleColors[color]
          : ["#DDF4E8", "#FFE1D9", "#E8DCF2", "#FFE0A1"][index % 4],
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Label
        style={{
          fontFamily: "Inter_700Bold",
          color: theme.teal,
          fontSize: Math.round(size * 0.37),
        }}
      >
        {name.trim().slice(0, 1).toUpperCase() || "?"}
      </Label>
    </View>
  );
}
export function CircleArtwork({
  color = "lilac",
}: {
  color?: keyof typeof circleColors;
}) {
  return (
    <View
      style={{
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 1,
        borderColor: "white",
        backgroundColor: circleColors[color] ?? circleColors.lilac,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={require("../../../assets/potluck/circle-flow/preview.svg")}
        contentFit="contain"
        style={{ width: 50, height: 43 }}
      />
    </View>
  );
}
export function CircleHeading({ children }: { children: ReactNode }) {
  return (
    <Label accessibilityRole="header" style={circleStyles.heading}>
      {children}
    </Label>
  );
}
export function CircleHero({
  title,
  detail,
  complete = false,
}: {
  title?: string;
  detail: string;
  complete?: boolean;
}) {
  return (
    <View style={{ alignItems: "center", gap: 16, paddingVertical: 12 }}>
      <View
        style={{
          width: 136,
          height: 136,
          borderRadius: 68,
          backgroundColor: "#DDF4E8",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircleGlyph name={complete ? "check" : "hero"} />
      </View>
      {title && (
        <Label style={[circleStyles.heading, { textAlign: "center" }]}>
          {title}
        </Label>
      )}
      <Label
        style={{
          color: theme.muted,
          fontSize: 16,
          lineHeight: 23,
          textAlign: "center",
          maxWidth: 350,
        }}
      >
        {detail}
      </Label>
    </View>
  );
}
export function CirclePersonRow({
  name,
  subtitle,
  onPress,
  trailing,
}: {
  name: string;
  subtitle: string;
  onPress?: () => void;
  trailing?: ReactNode;
}) {
  const content = (
    <>
      <CircleAvatar name={name} size={56} />
      <View style={{ flex: 1, gap: 4 }}>
        <Label style={{ fontSize: 18, fontFamily: "Inter_600SemiBold" }}>
          {name}
        </Label>
        <Muted>{subtitle}</Muted>
      </View>
      {trailing}
    </>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={circleStyles.personRow}
    >
      {content}
    </Pressable>
  ) : (
    <View style={circleStyles.personRow}>{content}</View>
  );
}
export function CircleMenuRow({
  title,
  detail,
  icon = "person",
  onPress,
}: {
  title: string;
  detail?: string;
  icon?: "person" | "shield" | "lock";
  onPress?: () => void;
}) {
  const content = (
    <>
      <View
        style={{
          width: 24,
          height: 24,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircleGlyph name={icon} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Label style={{ fontFamily: "Inter_600SemiBold" }}>{title}</Label>
        {detail && <Muted>{detail}</Muted>}
      </View>
      {onPress && <CircleGlyph name="chevron" />}
    </>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={circleStyles.menuRow}
    >
      {content}
    </Pressable>
  ) : (
    <View style={circleStyles.menuRow}>{content}</View>
  );
}
export function CircleSetting({
  title,
  detail,
  value,
  onChange,
  disabled = false,
  last = false,
}: {
  title: string;
  detail: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  last?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        minHeight: 58,
        gap: 12,
        paddingVertical: 10,
        borderBottomColor: theme.line,
        borderBottomWidth: last ? 0 : 1,
      }}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Label style={{ fontSize: 14, fontFamily: "Inter_700Bold" }}>
          {title}
        </Label>
        <Label style={{ fontSize: 11, lineHeight: 15, color: theme.muted }}>
          {detail}
        </Label>
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ true: theme.teal, false: "#D2DCDA" }}
      />
    </View>
  );
}
export function CircleSheet({
  visible,
  onClose,
  children,
  height,
  onExpand,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  height?: number;
  onExpand?: () => void;
}) {
  return (
    <SheetSurface visible={visible} onClose={onClose} height={height}>
      <Pressable
        hitSlop={12}
        accessibilityRole={onExpand ? "button" : undefined}
        accessibilityLabel={onExpand ? "Expand or collapse people" : undefined}
        onPress={onExpand}
        style={{
          height: 5,
          width: 58,
          borderRadius: 3,
          backgroundColor: "#D8E2DE",
          alignSelf: "center",
          marginBottom: 6,
        }}
      />
      {children}
    </SheetSurface>
  );
}
export function AddCirclePeople({
  visible,
  people,
  onChange,
  onClose,
}: {
  visible: boolean;
  people: CircleRecipient[];
  onChange: (people: CircleRecipient[]) => void;
  onClose: () => void;
}) {
  const { user } = useClient(),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);
  const contacts = useResource<Collection<Person>>(
    visible && user ? "/people?q=" + encodeURIComponent(query) : null,
  );
  const email = unresolvedCircleEmail(
    search,
    query,
    contacts.error ? undefined : contacts.data?.items.length,
    contacts.loading,
  );
  return (
    <CircleSheet
      visible={visible}
      onClose={onClose}
      height={expanded ? 700 : 380}
      onExpand={() => setExpanded(!expanded)}
    >
      <View style={{ flex: 1, gap: 12 }}>
        <View style={{ gap: 3 }}>
          <Label
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 24,
              lineHeight: 30,
            }}
          >
            Add people
          </Label>
          <Label style={{ color: theme.muted, fontSize: 13, lineHeight: 18 }}>
            {people.length
              ? people.length + " selected · They choose whether to join"
              : "Friends you have invited before"}
          </Label>
        </View>
        <View
          style={[
            circleStyles.search,
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingHorizontal: 12,
            },
          ]}
        >
          <Image
            source={require("../../../assets/potluck/circle-flow/search.svg")}
            style={{ width: 24, height: 24 }}
            contentFit="contain"
          />
          <TextInput
            accessibilityLabel="Find people"
            placeholder="Search name or email"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setExpanded(true)}
            autoCapitalize="none"
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: theme.ink,
              minHeight: 50,
            }}
          />
        </View>
        <Label style={{ fontFamily: "Inter_700Bold", fontSize: 15 }}>
          People you know
        </Label>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
          contentContainerStyle={{ gap: 8 }}
        >
          <ResourceState
            {...contacts}
            variant="people"
            retry={contacts.reload}
          />
          {contacts.data?.items
            .filter((p) => p.id !== user?.id)
            .map((person, index) => {
              const selected = people.some((p) => p.id === person.id);
              return (
                <View
                  key={person.id}
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "center",
                    minHeight: 52,
                  }}
                >
                  <CircleAvatar name={person.name} size={36} index={index} />
                  <Label
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontFamily: "Inter_700Bold",
                    }}
                  >
                    {person.name}
                  </Label>
                  <Pressable
                    accessibilityRole="button"
                    disabled={!selected && people.length >= 20}
                    accessibilityLabel={
                      (selected ? "Remove " : "Add ") + person.name
                    }
                    onPress={() =>
                      onChange(
                        selected
                          ? removeCircleRecipient(people, person)
                          : addCircleRecipient(people, person),
                      )
                    }
                    style={circleStyles.smallButton}
                  >
                    <Label style={{ color: "white", fontSize: 12 }}>
                      {selected ? "Remove" : "Add"}
                    </Label>
                  </Pressable>
                </View>
              );
            })}
          {contacts.data && !contacts.data.items.length && (
            <Muted>
              {query
                ? "No matching people found."
                : "Search an existing member’s exact email to invite them."}
            </Muted>
          )}
          {email && (
            <Pressable
              accessibilityRole="button"
              disabled={people.length >= 20}
              onPress={() => {
                onChange(addCircleRecipient(people, { email, name: email }));
                setSearch("");
              }}
              style={{ paddingVertical: 14 }}
            >
              <Label style={{ color: theme.teal }}>Add {email}</Label>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </CircleSheet>
  );
}
export const circleStyles = StyleSheet.create({
  heading: { fontSize: 28, lineHeight: 39, fontFamily: "Inter_700Bold" },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 90,
    paddingVertical: 12,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    minHeight: 65,
  },
  search: {
    borderWidth: 1,
    borderColor: "#D7E7E1",
    backgroundColor: "#F8FCFA",
    borderRadius: 26,
    minHeight: 52,
    paddingHorizontal: 18,
    fontSize: 15,
    color: theme.ink,
  },
  smallButton: {
    minWidth: 56,
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 12,
    backgroundColor: theme.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: theme.line, marginVertical: 8 },
});
