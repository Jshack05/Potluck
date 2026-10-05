import { View } from "react-native";
import { Redirect, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import {
  Shell,
  EntryLoading,
  Label,
  Muted,
  Action,
  Link,
  Icon,
  Divider,
  ErrorText,
  theme,
  go,
} from "@/design/system";
import { useAction, useClient } from "@/services/client";
import {
  entryDestination,
  safeReturnTo,
  financialArea,
} from "@/services/navigation";

export default function ConnectBank() {
  const { returnTo } = useLocalSearchParams(),
    client = useClient(),
    action = useAction();
  const [checked, setChecked] = useState(false);
  if (!client.ready || client.access === "loading") return <EntryLoading />;
  if (!client.user)
    return <Redirect href={entryDestination("signed_out", returnTo) as Href} />;
  if (client.access === "ready")
    return <Redirect href={safeReturnTo(returnTo) as Href} />;
  const unavailable = client.entryStatus?.bankConnection === "unavailable";
  const area = financialArea(safeReturnTo(returnTo)) ?? "Cards";
  const backTo = area === "Cards" ? "/cards" : "/bills";
  return (
    <Shell
      title="Connect your bank"
      back
      active={area}
      returnTo={backTo}
      footer={
        <>
          <ErrorText text={action.error || client.entryError} />
          <Label
            accessibilityLiveRegion="polite"
            style={{ fontSize: 14, lineHeight: 21, color: theme.muted }}
          >
            {unavailable
              ? checked
                ? "Bank connection is still unavailable in this development build. You can keep using Circles and Splitfinder."
                : "Bank connection isn't available in this development build yet. You can keep using Circles and Splitfinder."
              : "A confirmed bank connection is required for Cards and Bills."}
          </Label>
          <Action label="Connect bank account" disabled onPress={() => {}} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <Link
              onPress={() =>
                action.run(async () => {
                  await client.refreshEntry();
                  setChecked(true);
                })
              }
            >
              {action.busy ? "Checking…" : "Check again"}
            </Link>
            <Link onPress={() => go("/circles")}>Back to Circles</Link>
          </View>
        </>
      }
    >
      <Label
        style={{
          fontSize: 13,
          color: theme.teal,
          fontFamily: "Inter_600SemiBold",
          textAlign: "center",
        }}
      >
        CARDS & BILLS · BANK SETUP
      </Label>
      <View
        style={{
          alignItems: "center",
          gap: 20,
          marginTop: 10,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 22,
            backgroundColor: theme.mint,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="agreement" size={48} />
        </View>
        <Label
          accessibilityRole="header"
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 28,
            lineHeight: 36,
            textAlign: "center",
          }}
        >
          Connect your bank securely
        </Label>
        <Label
          style={{
            fontSize: 15,
            lineHeight: 22,
            color: theme.muted,
            textAlign: "center",
          }}
        >
          Connect your own bank account when you’re ready to use Cards and
          Bills.
        </Label>
      </View>
      <View style={{ gap: 20 }}>
        <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
          <Icon name="bank" size={24} />
          <View style={{ flex: 1, gap: 4 }}>
            <Label style={{ fontFamily: "Inter_600SemiBold" }}>
              Choose your bank
            </Label>
            <Muted>Continue through the bank connection provider.</Muted>
          </View>
        </View>
        <Divider />
        <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
          <Icon name="bank" size={24} />
          <View style={{ flex: 1, gap: 4 }}>
            <Label style={{ fontFamily: "Inter_600SemiBold" }}>
              Confirm your account
            </Label>
            <Muted>Select an eligible account in your name.</Muted>
          </View>
        </View>
        <Divider />
        <View style={{ gap: 6 }}>
          <Label style={{ fontFamily: "Inter_600SemiBold" }}>
            You’re in control
          </Label>
          <Muted>
            Connecting your bank does not authorize a payment. You’ll review and
            accept contribution terms separately.
          </Muted>
        </View>
      </View>
    </Shell>
  );
}
