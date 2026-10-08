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
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useClient } from "@/services/client";
import { entryDestination } from "@/services/navigation";
import { CreationMenu } from "@/features/potluck/creation-menu";
import { theme, icons, Label, Title, Muted, Icon } from "./primitives";
import { BottomNavigation, HeaderActions, mainTab } from "./chrome";
import { LoadingFeedback } from "./loading";
export { theme, icons, Label, Title, Muted, Icon } from "./primitives";
const Accent = createContext(theme.teal);
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
  hideLabel = false,
  ...props
}: TextInputProps & { label: string; error?: string; hideLabel?: boolean }) {
  const errorId = useId();
  return (
    <View style={{ gap: 8 }}>
      {!hideLabel && (
        <Label style={{ fontFamily: "Inter_600SemiBold" }}>{label}</Label>
      )}
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
  data,
  loadingKey,
}: {
  loading: boolean;
  error: string;
  retry: () => void;
  data?: unknown;
  loadingKey?: string;
}) {
  return loading && data == null ? (
    <LoadingFeedback key={loadingKey} />
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
  onBack,
  hideNavigation = false,
  createMenu,
  continuation = false,
  headerAccessory,
  headerTitleSize,
  titlePlacement = "header",
}: {
  title: string;
  children: ReactNode;
  back?: boolean;
  footer?: ReactNode;
  blue?: boolean;
  active?: "Circles" | "Cards" | "Bills" | "Splitfinder";
  returnTo?: string;
  emptyState?: boolean;
  onBack?: () => void;
  hideNavigation?: boolean;
  createMenu?: boolean;
  continuation?: boolean;
  headerAccessory?: ReactNode;
  headerTitleSize?: number;
  titlePlacement?: "header" | "content";
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
  if (!client.ready) return <EntryLoading />;
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
      <View
        style={{
          flex: 1,
          backgroundColor:
            blue || continuation ? theme.blueCanvas : theme.canvas,
        }}
      >
        <View
          style={{
            flex: 1,
            width: "100%",
            maxWidth: 430,
            alignSelf: "center",
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <View
              style={[
                styles.row,
                {
                  paddingHorizontal: 20,
                  paddingTop: Math.max(inset.top + 12, 45),
                  paddingBottom: mainTab(pathname) ? 11 : 20,
                  gap: 12,
                },
              ]}
            >
              {back && !continuation && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  onPress={
                    onBack ??
                    (() =>
                      router.canGoBack()
                        ? router.back()
                        : router.replace((returnTo ?? "/circles") as Href))
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
              {titlePlacement === "header" ? (
                <Label
                  accessibilityRole="header"
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize:
                      headerTitleSize ?? (continuation ? 36 : back ? 25 : 28),
                    lineHeight: continuation ? 44 : 38,
                    color: continuation ? theme.teal : theme.ink,
                    flex: 1,
                  }}
                >
                  {title}
                </Label>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              {headerAccessory}
              {(!back || continuation) && (
                <>
                  <HeaderActions blue={blue} />
                </>
              )}
            </View>
            {back && continuation && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={
                  onBack ??
                  (() =>
                    router.canGoBack()
                      ? router.back()
                      : router.replace((returnTo ?? "/circles") as Href))
                }
                style={[styles.back, { marginLeft: 20, marginBottom: 20 }]}
              >
                <Label
                  style={{ fontSize: 30, color: theme.teal, lineHeight: 32 }}
                >
                  ‹
                </Label>
              </Pressable>
            )}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 24,
                gap: 16,
                flexGrow: 1,
              }}
            >
              {titlePlacement === "content" && (
                <Label
                  accessibilityRole="header"
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 30,
                    lineHeight: 34,
                  }}
                >
                  {title}
                </Label>
              )}
              {children}
            </ScrollView>
            {(footer ||
              (createMenu ??
                ["/circles", "/cards", "/bills"].includes(pathname))) && (
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingTop: 12,
                  paddingBottom: 12,
                  gap: 10,
                  flexDirection: "row",
                  alignItems: mainTab(pathname) ? "center" : "flex-end",
                }}
              >
                <View style={{ flex: 1, gap: 10 }}>{footer}</View>
                {(createMenu ??
                  ["/circles", "/cards", "/bills"].includes(pathname)) && (
                  <CreationMenu
                    circleId={
                      typeof params.id === "string" &&
                      pathname.startsWith("/circle/")
                        ? params.id
                        : undefined
                    }
                  />
                )}
              </View>
            )}
          </KeyboardAvoidingView>
          {!hideNavigation && !mainTab(pathname) && (
            <BottomNavigation selected={selected} />
          )}
        </View>
      </View>
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
      <LoadingFeedback label="Opening Potluck…" />
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
