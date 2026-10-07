import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { View, Pressable } from "react-native";
import {
  Shell,
  AuthGate,
  Label,
  Muted,
  Action,
  ResourceState,
  theme,
  money,
  go,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import type { Bill, Collection } from "@/features/potluck/types";
import { BillSummary } from "@/features/potluck/bill-summary";
import { HomeEmptyState } from "@/features/potluck/home-empty-state";
import { BillIcon } from "@/features/potluck/bill-ui";
import {
  billAttention,
  billStatusLabel,
} from "@/features/potluck/bill-flow-model";
import {
  visibleBills,
  ownBillShare,
} from "@/features/potluck/presentation-state";
export default function Bills() {
  const params = useLocalSearchParams<{ scope?: string }>();
  const { user } = useClient(),
    resource = useResource<Collection<Bill>>(user ? "/bills" : null);
  const scope = params.scope === "all" ? "all" : "shared";
  const bills = resource.data && visibleBills(resource.data.items, scope);
  const attention = billAttention(resource.data?.items ?? [], user?.id ?? "");
  if (resource.data && !resource.data.items.length)
    return (
      <Shell
        title="Bills"
        active="Bills"
        emptyState
        createMenu
        footer={
          <Action
            secondary
            label="Import bills"
            onPress={() => go("/import-bills")}
          />
        }
      >
        <HomeEmptyState area="Bills" />
      </Shell>
    );
  return (
    <Shell
      title="Bills"
      active="Bills"
      headerAccessory={
        attention.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${attention.length} bills need attention`}
            onPress={() => go("/bill-attention")}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#FFF0EC",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../../assets/potluck/bill/attention.svg")}
              style={{ width: 44, height: 44 }}
              contentFit="contain"
            />
          </Pressable>
        )
      }
      createMenu
      footer={
        user && (
          <Pressable
            accessibilityRole="button"
            onPress={() => go("/import-bills")}
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              minHeight: 46,
              flexDirection: "row",
              gap: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../../assets/potluck/bill/import.svg")}
              style={{ width: 18, height: 18 }}
            />
            <Label
              style={{
                color: theme.teal,
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
              }}
            >
              Import bills
            </Label>
          </Pressable>
        )
      }
    >
      <AuthGate returnTo="/bills">
        <View style={{ flexDirection: "row" }}>
          {(["all", "shared"] as const).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityState={{ selected: scope === value }}
              aria-selected={scope === value}
              onPress={() => router.setParams({ scope: value })}
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
        <ResourceState
          loading={resource.loading}
          error={resource.error}
          retry={resource.reload}
        />
        {user && <BillSummary scope={scope} />}
        <Muted>
          {scope === "shared"
            ? "Connected to a Circle or Card"
            : "All your saved bills"}
        </Muted>
        {bills?.map((bill) => {
          const agreement = ownBillShare(bill, user?.id);
          return (
            <Pressable
              key={bill.id}
              accessibilityRole="button"
              style={{
                backgroundColor: "white",
                borderRadius: 28,
                minHeight: 96,
                padding: 20,
                flexDirection: "row",
                gap: 16,
                alignItems: "center",
              }}
              onPress={() => go("/bill/" + bill.id)}
            >
              <BillIcon name={bill.icon} color={bill.color} size={44} />
              <View style={{ flex: 1, gap: 4 }}>
                <Label style={{ fontFamily: "Inter_600SemiBold" }}>
                  {bill.name}
                </Label>
                <Muted>
                  {agreement
                    ? agreement.status === "accepted"
                      ? "Your agreed share"
                      : "Review your share"
                    : billStatusLabel(bill.status)}
                </Muted>
              </View>
              <Label style={{ fontFamily: "Inter_700Bold", color: theme.teal }}>
                {money(agreement?.amountMinor ?? bill.amountMinor)}
              </Label>
            </Pressable>
          );
        })}
        {bills && !bills.length && (
          <Muted>
            Your saved bills are in All bills. Connect one to a Circle or Card
            to see it here.
          </Muted>
        )}
      </AuthGate>
    </Shell>
  );
}
