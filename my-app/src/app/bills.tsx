import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { View, Pressable } from "react-native";
import {
  Shell,
  AuthGate,
  Label,
  Muted,
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
  collectionPhase,
  visibleBills,
  ownBillShare,
} from "@/features/potluck/presentation-state";
import {
  BillScopeTabs,
  ImportBillsButton,
} from "@/features/potluck/bill-home-controls";
export default function Bills() {
  const params = useLocalSearchParams<{ scope?: string }>();
  const { user } = useClient(),
    resource = useResource<Collection<Bill>>(user ? "/bills" : null);
  const scope = params.scope === "all" ? "all" : "shared";
  const bills = resource.data && visibleBills(resource.data.items, scope);
  const attention = billAttention(resource.data?.items ?? [], user?.id ?? "");
  const phase = collectionPhase(bills, resource.error);
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
      footer={<ImportBillsButton />}
    >
      <AuthGate returnTo="/bills">
        <BillScopeTabs
          scope={scope}
          onChange={(scope) => router.setParams({ scope })}
        />
        <ResourceState
          loading={phase === "loading" || resource.loading}
          data={resource.data}
          loadingKey={resource.loadingKey}
          error={resource.error}
          retry={resource.reload}
        />
        {phase === "ready" && <BillSummary scope={scope} />}
        {phase === "ready" && (
          <Muted>
            {scope === "shared"
              ? "Connected to a Circle or Card"
              : "All your saved bills"}
          </Muted>
        )}
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
        {phase === "empty" && (
          <HomeEmptyState
            area="Bills"
            sharedOnly={scope === "shared" && !!resource.data?.items.length}
          />
        )}
      </AuthGate>
    </Shell>
  );
}
