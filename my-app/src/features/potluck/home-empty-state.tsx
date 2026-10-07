import { Image } from "expo-image";
import { View } from "react-native";
import { Action, Label, Shell, go, theme } from "@/design/system";
import { useClient } from "@/services/client";

type Area = "Circles" | "Cards" | "Bills";

/** Figma 766:3012 / 766:3056 / 766:3098. Original assets at native dimensions. */
export function HomeEmptyState({
  area,
  sharedOnly = false,
  bankRequired = false,
  bankStatusError = false,
}: {
  area: Area;
  sharedOnly?: boolean;
  bankRequired?: boolean;
  bankStatusError?: boolean;
}) {
  const circles = area === "Circles";
  return (
    <View
      style={{
        flexGrow: 1,
        minHeight: 300,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 24,
        gap: 18,
      }}
    >
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={{ width: 164, height: 128 }}
      >
        <Image
          source={require("../../../assets/potluck/empty/table-glow.svg")}
          style={{
            position: "absolute",
            left: 1,
            top: 77,
            width: 162,
            height: 48,
          }}
        />
        <Image
          source={require("../../../assets/potluck/empty/table.svg")}
          style={{
            position: "absolute",
            left: 11,
            top: 70,
            width: 142,
            height: 52,
          }}
        />
        <Image
          source={require("../../../assets/potluck/empty/contact-shadow.svg")}
          style={{
            position: "absolute",
            left: 51,
            top: 69,
            width: 62,
            height: 21,
          }}
        />
        <Image
          source={
            circles
              ? require("../../../assets/potluck/empty/circle-lucky.svg")
              : require("../../../assets/potluck/empty/lucky.svg")
          }
          style={{
            position: "absolute",
            left: 47,
            top: 14,
            width: 70,
            height: 70,
          }}
        />
        {[69, 89].map((left) => (
          <Image
            key={left}
            source={
              circles
                ? require("../../../assets/potluck/empty/circle-eye.svg")
                : require("../../../assets/potluck/empty/eye.svg")
            }
            style={{ position: "absolute", left, top: 39, width: 6, height: 6 }}
          />
        ))}
        <Image
          source={require("../../../assets/potluck/empty/smile.svg")}
          style={{
            position: "absolute",
            left: 72,
            top: 55,
            width: 22,
            height: 7,
          }}
        />
        {circles ? (
          <Label
            style={{
              position: "absolute",
              left: 22,
              top: 12,
              fontFamily: "Inter_700Bold",
              fontSize: 22,
              lineHeight: 26,
              color: theme.teal,
            }}
          >
            +
          </Label>
        ) : area === "Cards" ? (
          <>
            <View
              style={{
                position: "absolute",
                left: 9,
                top: 26,
                width: 36,
                height: 26.4,
                borderRadius: 4,
                backgroundColor: "#FFE4ED",
              }}
            />
            <Image
              source={require("../../../assets/potluck/empty/card.svg")}
              style={{
                position: "absolute",
                left: 7.75,
                top: 24.75,
                width: 38.5,
                height: 28.9,
              }}
            />
          </>
        ) : (
          <>
            <Image
              source={require("../../../assets/potluck/empty/bill-infill.svg")}
              style={{
                position: "absolute",
                left: 18,
                top: 25,
                width: 32,
                height: 34,
              }}
            />
            <Image
              source={require("../../../assets/potluck/empty/bill.svg")}
              style={{
                position: "absolute",
                left: 18,
                top: 25,
                width: 32,
                height: 34,
              }}
            />
          </>
        )}
        <Label
          style={{
            position: "absolute",
            left: circles ? 124 : 128,
            top: circles ? 25 : 26,
            width: 18,
            textAlign: "center",
            fontFamily: "Inter_700Bold",
            fontSize: 18,
            lineHeight: 22,
            color: circles
              ? "#8EDBC0"
              : area === "Cards"
                ? "#FF397D"
                : "#E09F00",
          }}
        >
          +
        </Label>
      </View>
      <View
        style={{ alignItems: "center", gap: 8, width: "100%", maxWidth: 350 }}
      >
        <Label
          accessibilityRole="header"
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 24,
            lineHeight: 29,
            textAlign: "center",
          }}
        >
          {bankStatusError
            ? "Check your bank connection"
            : circles
              ? "Your table is wide open"
              : area === "Cards"
                ? "No cards yet"
                : sharedOnly
                  ? "No shared bills yet"
                  : "No bills yet"}
        </Label>
        <Label
          style={{
            maxWidth: 320,
            fontSize: 15,
            lineHeight: 21,
            textAlign: "center",
            color: theme.muted,
          }}
        >
          {bankStatusError
            ? "We couldn’t confirm your bank status. Circles and Splitfinder are still available."
            : circles
              ? "No circles yet. Start one when there is something to split, plan, or share."
              : bankRequired
                ? area === "Cards"
                  ? "Connect your bank account to get started with shared cards."
                  : "Connect your bank account to get started with shared bills."
                : area === "Cards"
                  ? "Create a shared card when you are ready to spend together."
                  : sharedOnly
                    ? "Your personal bills are in All bills. Connect a bill to a Circle or Card to see it here."
                    : "Add a bill or import bills when you are ready."}
        </Label>
      </View>
    </View>
  );
}

/** A tab-level introduction, not a redirect that blocks the rest of Potluck. */
export function BankAccessPrompt({ area }: { area: "Cards" | "Bills" }) {
  const { access } = useClient();
  return (
    <Shell
      title={area}
      active={area}
      emptyState
      footer={
        <Action
          label={
            access === "loading"
              ? "Checking bank connection…"
              : access === "error"
                ? "Check bank connection"
                : "Connect bank account"
          }
          disabled={access === "loading"}
          onPress={() =>
            go(
              "/connect-bank?returnTo=" +
                encodeURIComponent(area === "Cards" ? "/cards" : "/bills"),
            )
          }
        />
      }
    >
      <HomeEmptyState
        area={area}
        bankRequired
        bankStatusError={access === "error"}
      />
    </Shell>
  );
}
