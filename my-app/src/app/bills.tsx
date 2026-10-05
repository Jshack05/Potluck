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
  Empty,
  theme,
  money,
  go,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import type { Bill, Collection } from "@/features/potluck/types";
import { BillSummary } from "@/features/potluck/bill-summary";
import {
  visibleBills,
  ownBillShare,
} from "@/features/potluck/presentation-state";
export default function Bills() {
  const { user } = useClient(),
    resource = useResource<Collection<Bill>>(user ? "/bills" : null),
    [scope, setScope] = useState<"shared" | "all">("shared");
  const bills = resource.data && visibleBills(resource.data.items, scope);
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
          <Empty
            icon="bills"
            title={
              scope === "shared"
                ? "Share the plan, together"
                : "Make room for the next bill"
            }
            detail={
              scope === "shared"
                ? "Create a Bill connected to your Circle or Card. Each person reviews their own share."
                : "Save your first Bill and bring in the people who share it."
            }
          />
        )}
      </AuthGate>
    </Shell>
  );
}
