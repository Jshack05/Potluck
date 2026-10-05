import { useState } from "react";
import { View, Pressable } from "react-native";
import {
  Shell,
  AuthGate,
  Label,
  Muted,
  Section,
  Row,
  Action,
  ResourceState,
  theme,
  money,
  go,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import type { Bill, Collection } from "@/features/potluck/types";
import { BillSummary } from "@/features/potluck/bill-summary";
import {
  HomeEmptyState,
  BankAccessPrompt,
} from "@/features/potluck/home-empty-state";
import {
  visibleBills,
  ownBillShare,
} from "@/features/potluck/presentation-state";
export default function Bills() {
  const { user, access } = useClient(),
    resource = useResource<Collection<Bill>>(user ? "/bills" : null),
    [scope, setScope] = useState<"shared" | "all">("shared");
  const bills = resource.data && visibleBills(resource.data.items, scope);
  if (user && access !== "ready") return <BankAccessPrompt area="Bills" />;
  if (resource.data && !resource.data.items.length)
    return (
      <Shell
        title="Bills"
        active="Bills"
        emptyState
        footer={
          <Action label="Create a Bill" onPress={() => go("/create/bill")} />
        }
      >
        <HomeEmptyState area="Bills" />
      </Shell>
    );
  return (
    <Shell
      title="Bills"
      active="Bills"
      footer={
        user && (
          <Action label="Create a Bill" onPress={() => go("/create/bill")} />
        )
      }
    >
      <AuthGate returnTo="/bills">
        <View style={{ flexDirection: "row" }}>
          {(["shared", "all"] as const).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityState={{ selected: scope === value }}
              aria-selected={scope === value}
              onPress={() => setScope(value)}
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
        <Section
          title={
            scope === "shared" ? "Together, on track" : "Your bill collection"
          }
        />
        <Muted>
          {scope === "shared"
            ? "Connected to a Circle or Card"
            : "All your saved Bills and individual contributions"}
        </Muted>
        {bills?.map((bill) => {
          const agreement = ownBillShare(bill, user?.id);
          return (
            <Row
              key={bill.id}
              title={bill.name}
              subtitle={
                bill.status === "ended"
                  ? "Ended · history retained"
                  : agreement
                    ? (agreement.status === "accepted"
                        ? "Your agreed share"
                        : "Review your share") +
                      " · " +
                      agreement.terms.frequency
                    : "Waiting for individual acceptance"
              }
              icon="bills"
              right={
                <Label
                  style={{ fontFamily: "Inter_700Bold", color: theme.teal }}
                >
                  {money(agreement?.amountMinor ?? bill.amountMinor)}
                </Label>
              }
              onPress={() => go("/bill/" + bill.id)}
            />
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
