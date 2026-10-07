import { type ReactNode } from "react";
import { Image } from "expo-image";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Redirect, router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Action, EntryLoading, ErrorText, Label, theme } from "@/design/system";
import { useAction, useClient } from "@/services/client";

/** Figma 652:2589 / 669 family: inset canvas, circular back, grouped rows. */
export function SettingsPage({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const inset = useSafeAreaInsets(),
    client = useClient(),
    pathname = usePathname();
  if (!client.ready) return <EntryLoading />;
  if (!client.user)
    return (
      <Redirect
        href={{ pathname: "/sign-in", params: { returnTo: pathname } }}
      />
    );
  return (
    <View style={{ flex: 1, backgroundColor: theme.canvas }}>
      <View
        style={{ flex: 1, maxWidth: 430, width: "100%", alignSelf: "center" }}
      >
        <View
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            top: 16,
            bottom: 16,
            borderRadius: 32,
            backgroundColor: "#F8F7F2",
          }}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            paddingHorizontal: 20,
            paddingTop: Math.max(inset.top, 32) + 22,
            paddingBottom: 26,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/circles")
            }
            style={{
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 22,
              backgroundColor: "white",
            }}
          >
            <Image
              source={require("../../../assets/potluck/back.svg")}
              contentFit="contain"
              style={{
                position: "absolute",
                width: 60,
                height: 60,
                left: -8,
                top: -6,
              }}
            />
            <Label style={{ fontSize: 30, lineHeight: 34, color: theme.teal }}>
              ‹
            </Label>
          </Pressable>
          <Label
            accessibilityRole="header"
            style={{
              fontSize: 30,
              lineHeight: 37,
              fontFamily: "Inter_700Bold",
              flex: 1,
            }}
          >
            {title}
          </Label>
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            gap: 28,
          }}
        >
          {children}
        </ScrollView>
        {footer && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: Math.max(inset.bottom, 24),
              paddingTop: 12,
              gap: 10,
            }}
          >
            {footer}
          </View>
        )}
      </View>
    </View>
  );
}
export function SettingsGroup({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <View style={{ gap: 12 }}>
      {title && (
        <Label
          style={{
            fontSize: 15,
            color: "#6F7E79",
            fontFamily: "Inter_700Bold",
          }}
        >
          {title}
        </Label>
      )}
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}
export function SettingsRow({
  title,
  detail,
  value,
  onPress,
  danger,
  last = false,
}: {
  title: string;
  detail?: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <View>
      <Pressable
        accessibilityRole={onPress ? "button" : undefined}
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => ({
          minHeight: detail ? 66 : 56,
          paddingHorizontal: 24,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Label
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: danger ? theme.danger : theme.ink,
            }}
          >
            {title}
          </Label>
          {detail && (
            <Label style={{ fontSize: 13, lineHeight: 18, color: "#6F7E79" }}>
              {detail}
            </Label>
          )}
        </View>
        {value && (
          <Label
            style={{
              fontSize: 14,
              color: "#6F7E79",
              maxWidth: 128,
              textAlign: "right",
            }}
          >
            {value}
          </Label>
        )}
        {onPress && <Label style={{ fontSize: 26, color: "#6F7E79" }}>›</Label>}
      </Pressable>
      {!last && (
        <View
          style={{
            height: 1,
            backgroundColor: theme.line,
            marginHorizontal: 24,
          }}
        />
      )}
    </View>
  );
}
export function SettingsNote({ children }: { children: ReactNode }) {
  return (
    <Label
      style={{
        fontSize: 13,
        lineHeight: 19,
        color: "#6F7E79",
        marginHorizontal: 16,
      }}
    >
      {children}
    </Label>
  );
}
export function ProfileArt({ size = 52 }: { size?: number }) {
  return (
    <Image
      source={require("../../../assets/potluck/profile-avatar.svg")}
      style={{ width: size, height: size }}
      contentFit="contain"
    />
  );
}
export function SettingsSheet({
  title,
  detail,
  onClose,
  action,
}: {
  title: string;
  detail: string;
  onClose: () => void;
  action?: ReactNode;
}) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose} visible>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          backgroundColor: "#00000070",
          justifyContent: "flex-end",
          padding: 20,
          paddingBottom: 44,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          style={{ position: "absolute", inset: 0 }}
        />
        <View
          accessibilityViewIsModal
          style={{
            maxWidth: 390,
            maxHeight: "100%",
            width: "100%",
            alignSelf: "center",
            borderRadius: 28,
            backgroundColor: "white",
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 24, gap: 14 }}
          >
            <View
              style={{
                width: 60,
                height: 5,
                borderRadius: 3,
                backgroundColor: theme.line,
                alignSelf: "center",
                marginBottom: 12,
              }}
            />
            <Label
              accessibilityRole="header"
              style={{
                fontSize: 22,
                fontFamily: "Inter_700Bold",
                textAlign: "center",
              }}
            >
              {title}
            </Label>
            <Label
              style={{
                fontSize: 14,
                lineHeight: 22,
                color: theme.muted,
                textAlign: "center",
              }}
            >
              {detail}
            </Label>
            {action ?? <Action label="Got it" onPress={onClose} />}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function SettingsLogoutSheet({ onClose }: { onClose: () => void }) {
  const client = useClient(),
    action = useAction();
  return (
    <SettingsSheet
      title="Log out?"
      detail="You can sign back in anytime."
      onClose={onClose}
      action={
        <>
          <ErrorText text={action.error} />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Action label="Cancel" secondary onPress={onClose} />
            </View>
            <View style={{ flex: 1 }}>
              <Action
                label={action.busy ? "Logging out…" : "Log out"}
                disabled={action.busy}
                onPress={() =>
                  action.run(async () => {
                    await client.signOut();
                    router.replace("/sign-in");
                  })
                }
              />
            </View>
          </View>
        </>
      }
    />
  );
}
