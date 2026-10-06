import { Image } from "expo-image";
import {
  Redirect,
  router,
  usePathname,
  useLocalSearchParams,
  type Href,
} from "expo-router";
import { type ReactNode, createContext, useContext, useId } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextProps,
  type TextInputProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useClient } from "@/services/client";
import { entryDestination, financialArea } from "@/services/navigation";
export const theme = {
  canvas: "#F3F2EF",
  blueCanvas: "#F2F9FD",
  ink: "#273432",
  muted: "#596562",
  teal: "#006D67",
  blue: "#287AAA",
  mint: "#E3F6F0",
  paleBlue: "#E4F1FC",
  line: "#D9E5E0",
  danger: "#AD3E48",
  amber: "#996300",
};
const Accent = createContext(theme.teal);
export const icons = {
  circles: require("../../assets/potluck/circles.svg"),
  cards: require("../../assets/potluck/cards.svg"),
  bills: require("../../assets/potluck/bills.svg"),
  pending: require("../../assets/potluck/pending.svg"),
  healthy: require("../../assets/potluck/health-good.svg"),
  attention: require("../../assets/potluck/health-attention.svg"),
  internet: require("../../assets/potluck/internet.svg"),
  phone: require("../../assets/potluck/phone.svg"),
  electric: require("../../assets/potluck/electric.svg"),
  groceries: require("../../assets/potluck/groceries.svg"),
  plus: require("../../assets/potluck/plus.svg"),
  back: require("../../assets/potluck/back.svg"),
  discover: require("../../assets/splitfinder/discover.svg"),
  inbox: require("../../assets/potluck/inbox.svg"),
  inboxBlue: require("../../assets/splitfinder/inbox.svg"),
  bank: require("../../assets/potluck/bank-house.svg"),
  agreement: require("../../assets/potluck/agreement-document.svg"),
  authLucky: require("../../assets/potluck/auth-lucky.svg"),
  lucky: require("../../assets/splitfinder/lucky.svg"),
  service: require("../../assets/splitfinder/service.png"),
  check: require("../../assets/splitfinder/check.svg"),
};
export function Label({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.text, style]} />;
}
export function Title({
  children,
  small = false,
}: {
  children: ReactNode;
  small?: boolean;
}) {
  return (
    <Label
      accessibilityRole="header"
      style={{
        fontFamily: "Inter_700Bold",
        fontSize: small ? 20 : 26,
        lineHeight: small ? 27 : 33,
      }}
    >
      {children}
    </Label>
  );
}
export function Muted({ children }: { children: ReactNode }) {
  return (
    <Label style={{ color: theme.muted, fontSize: 14, lineHeight: 21 }}>
      {children}
    </Label>
  );
}
export function Icon({
  name,
  size = 24,
}: {
  name: keyof typeof icons;
  size?: number;
}) {
  if (name === "inbox")
    return (
      <View
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={icons.inbox}
          contentFit="contain"
          style={{ width: (size * 17.8) / 24, height: (size * 15.8) / 24 }}
        />
      </View>
    );
  return (
    <Image
      source={icons[name]}
      contentFit="contain"
      style={{ width: size, height: size }}
    />
  );
}
export function Action({
  label,
  onPress,
  secondary = false,
  disabled = false,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  danger?: boolean;
}) {
  const accent = useContext(Accent);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: secondary ? "white" : danger ? theme.danger : accent,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <Label
        style={{
          fontFamily: "Inter_600SemiBold",
          textAlign: "center",
          color: secondary ? accent : "white",
        }}
      >
        {label}
      </Label>
    </Pressable>
  );
}
export function Link({
  children,
  onPress,
  danger = false,
}: {
  children: ReactNode;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{ minHeight: 44, justifyContent: "center" }}
    >
      <Label
        style={{
          color: danger ? theme.danger : theme.teal,
          fontFamily: "Inter_600SemiBold",
        }}
      >
        {children}
      </Label>
    </Pressable>
  );
}
export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  const errorId = useId();
  return (
    <View style={{ gap: 8 }}>
      <Label style={{ fontFamily: "Inter_600SemiBold" }}>{label}</Label>
      <TextInput
        {...props}
        accessibilityLabel={label}
        accessibilityHint={error || props.accessibilityHint}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        placeholderTextColor={theme.muted}
        style={[
          styles.field,
          props.multiline && { minHeight: 115, textAlignVertical: "top" },
          props.style,
          !!error && { borderColor: theme.danger, borderWidth: 2 },
        ]}
      />
      {!!error && (
        <Label
          nativeID={errorId}
          accessibilityRole="alert"
          style={{ color: theme.danger, fontSize: 14 }}
        >
          {error}
        </Label>
      )}
    </View>
  );
}
export function Row({
  title,
  subtitle,
  right,
  onPress,
  icon,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  icon?: keyof typeof icons;
}) {
  const content = (
    <View style={styles.row}>
      {icon && (
        <View style={styles.iconTile}>
          <Icon name={icon} />
        </View>
      )}
      <View style={{ flex: 1, gap: 4 }}>
        <Label style={{ fontFamily: "Inter_600SemiBold" }}>{title}</Label>
        {subtitle && <Muted>{subtitle}</Muted>}
      </View>
      {right}
      {onPress && <Label style={{ color: theme.teal, fontSize: 26 }}>›</Label>}
    </View>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.item}>
      {content}
    </Pressable>
  ) : (
    <View style={styles.item}>{content}</View>
  );
}
export function Section({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View
      style={[styles.row, { marginTop: 8, justifyContent: "space-between" }]}
    >
      <Title>{title}</Title>
      {action && onAction && <Link onPress={onAction}>{action}</Link>}
    </View>
  );
}
export function Divider() {
  return (
    <View
      style={{ height: 1, backgroundColor: theme.line, marginVertical: 6 }}
    />
  );
}
export function Avatar({ name, size = 46 }: { name: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.mint,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Label
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: size / 2.8,
          color: theme.teal,
        }}
      >
        {name.slice(0, 1).toUpperCase()}
      </Label>
    </View>
  );
}
export function ErrorText({ text }: { text?: string }) {
  return text ? (
    <Label
      accessibilityRole="alert"
      style={{ color: theme.danger, fontSize: 14 }}
    >
      {text}
    </Label>
  ) : null;
}
export function ResourceState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: string;
  retry: () => void;
}) {
  return loading ? (
    <ActivityIndicator color={theme.teal} style={{ marginVertical: 30 }} />
  ) : error ? (
    <View style={{ gap: 12, marginVertical: 20 }}>
      <ErrorText text={error} />
      <Action secondary label="Try again" onPress={retry} />
    </View>
  ) : null;
}
export function Empty({
  title,
  detail,
  icon = "circles",
}: {
  title: string;
  detail: string;
  icon?: keyof typeof icons;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        gap: 18,
        paddingVertical: 42,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: theme.mint,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={42} />
      </View>
      <Label
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 24,
          textAlign: "center",
        }}
      >
        {title}
      </Label>
      <Label
        style={{ color: theme.muted, textAlign: "center", lineHeight: 24 }}
      >
        {detail}
      </Label>
    </View>
  );
}
export function go(path: string) {
  router.push(path as Href);
}
export function money(minor: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: minor % 100 ? 2 : 0,
  }).format(minor / 100);
}
export function dateLabel(date: string) {
  return new Date(date.slice(0, 10) + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
export function Shell({
  title,
  children,
  back = false,
  footer,
  blue = false,
  active,
  returnTo,
  emptyState = false,
}: {
  title: string;
  children: ReactNode;
  back?: boolean;
  footer?: ReactNode;
  blue?: boolean;
  active?: "Circles" | "Cards" | "Bills" | "Splitfinder";
  returnTo?: string;
  emptyState?: boolean;
}) {
  const inset = useSafeAreaInsets(),
    pathname = usePathname();
  const params = useLocalSearchParams(),
    client = useClient();
  const query = new URLSearchParams(
    Object.entries(params).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
  const destination = entryDestination(
    client.access,
    pathname + (query.size ? "?" + query.toString() : ""),
  );
  if (
    !client.ready ||
    (client.access === "loading" &&
      financialArea(pathname) &&
      !["/cards", "/bills"].includes(pathname))
  )
    return <EntryLoading />;
  if (destination) return <Redirect href={destination as Href} />;
  const selected =
    active ??
    (pathname.startsWith("/card")
      ? "Cards"
      : pathname.startsWith("/bill") || pathname.startsWith("/agreement")
        ? "Bills"
        : pathname.startsWith("/discover") || pathname.startsWith("/listing")
          ? "Splitfinder"
          : "Circles");
  return (
    <Accent.Provider value={blue ? theme.blue : theme.teal}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          backgroundColor: blue
            ? theme.blueCanvas
            : emptyState && active !== "Circles"
              ? "#F1EFE7"
              : theme.canvas,
        }}
      >
        <View
          style={{
            flex: 1,
            width: "100%",
            maxWidth: emptyState ? 430 : 478,
            alignSelf: "center",
          }}
        >
          {emptyState && active !== "Circles" && (
            <View
              style={{
                pointerEvents: "none",
                position: "absolute",
                top: 16,
                bottom: 16,
                left: 16,
                right: 16,
                borderRadius: 24,
                backgroundColor: "#FBFAF5",
              }}
            />
          )}
          <View
            style={[
              styles.row,
              {
                paddingHorizontal: 20,
                paddingTop: Math.max(inset.top, 18) + 12,
                paddingBottom: 20,
                gap: 12,
              },
            ]}
          >
            {back && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() =>
                  router.canGoBack()
                    ? router.back()
                    : router.replace((returnTo ?? "/circles") as Href)
                }
                style={styles.back}
              >
                <Image
                  source={icons.back}
                  style={{
                    position: "absolute",
                    width: 60,
                    height: 60,
                    left: -8,
                    top: -6,
                  }}
                  contentFit="contain"
                />
                <Label
                  style={{ fontSize: 30, color: theme.teal, lineHeight: 32 }}
                >
                  ‹
                </Label>
              </Pressable>
            )}
            <Label
              accessibilityRole="header"
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: back ? 25 : emptyState ? 28 : 32,
                lineHeight: 38,
                flex: 1,
              }}
            >
              {title}
            </Label>
            {!back && (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open inbox"
                  onPress={() => go("/inbox")}
                  style={styles.round}
                >
                  <Icon name={blue ? "inboxBlue" : "inbox"} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Your profile"
                  onPress={() => go("/you")}
                  style={[
                    styles.round,
                    { borderWidth: 1.8, borderColor: theme.teal },
                  ]}
                >
                  <Label
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      color: theme.teal,
                      fontSize: 14,
                    }}
                  >
                    You
                  </Label>
                </Pressable>
              </>
            )}
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 24,
              gap: 16,
              flexGrow: 1,
            }}
          >
            {children}
          </ScrollView>
          {footer && (
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: 12,
                gap: 10,
              }}
            >
              {footer}
            </View>
          )}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 6,
              paddingBottom: Math.max(inset.bottom, 16),
            }}
          >
            <View style={styles.nav}>
              {(["Circles", "Cards", "Bills", "Splitfinder"] as const).map(
                (name, index) => (
                  <Pressable
                    key={name}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: selected === name }}
                    aria-selected={selected === name}
                    accessibilityLabel={name}
                    onPress={() =>
                      router.replace(
                        ["/circles", "/cards", "/bills", "/discover"][
                          index
                        ] as Href,
                      )
                    }
                    style={[
                      styles.tab,
                      selected === name && {
                        backgroundColor:
                          name === "Splitfinder" ? theme.paleBlue : theme.mint,
                      },
                    ]}
                  >
                    <Icon
                      name={
                        (["circles", "cards", "bills", "discover"] as const)[
                          index
                        ]
                      }
                      size={26}
                    />
                    <Label
                      style={{
                        fontSize: 10,
                        lineHeight: 15,
                        color:
                          selected === name
                            ? name === "Splitfinder"
                              ? theme.blue
                              : theme.teal
                            : theme.muted,
                        fontFamily:
                          selected === name
                            ? "Inter_600SemiBold"
                            : "Inter_400Regular",
                      }}
                    >
                      {name}
                    </Label>
                  </Pressable>
                ),
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Accent.Provider>
  );
}
export function AuthGate({
  children,
  returnTo,
}: {
  children: ReactNode;
  returnTo: string;
}) {
  const { access, ready } = useClient();
  if (!ready) return <EntryLoading />;
  const destination = entryDestination(access, returnTo);
  return destination ? (
    <Redirect href={destination as Href} />
  ) : (
    <>{children}</>
  );
}

export function EntryLoading() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.canvas,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator
        accessibilityLabel="Opening Potluck"
        color={theme.teal}
      />
    </View>
  );
}

/** Content scrolls; entry actions stay at the lower safe area, above the keyboard. */
export function EntryShell({
  children,
  footer,
  brand = true,
}: {
  children: ReactNode;
  footer: ReactNode;
  brand?: boolean;
}) {
  const inset = useSafeAreaInsets();
  return (
    <Accent.Provider value={theme.teal}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: theme.canvas }}
      >
        <View
          style={{ flex: 1, width: "100%", maxWidth: 430, alignSelf: "center" }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: Math.max(inset.top, 24) + 28,
              paddingBottom: 24,
              gap: 20,
              flexGrow: 1,
            }}
          >
            {brand && (
              <View
                style={{
                  height: 88,
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <Icon name="authLucky" size={44} />
                <Label
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 22,
                    lineHeight: 28,
                    color: theme.teal,
                  }}
                >
                  Potluck
                </Label>
              </View>
            )}
            {children}
          </ScrollView>
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: Math.max(inset.bottom, 24),
              gap: 12,
            }}
          >
            {footer}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Accent.Provider>
  );
}
export const styles = StyleSheet.create({
  text: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
    color: theme.ink,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  action: {
    minHeight: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  field: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: theme.ink,
    minHeight: 56,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: theme.line,
  },
  item: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 18,
    minHeight: 78,
  },
  round: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  nav: {
    backgroundColor: "white",
    borderRadius: 36,
    padding: 6,
    flexDirection: "row",
    minHeight: 72,
  },
  tab: {
    flex: 1,
    minHeight: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.mint,
    alignItems: "center",
    justifyContent: "center",
  },
});
