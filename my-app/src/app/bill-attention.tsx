import { Pressable, View } from "react-native";
import {
  Action,
  AuthGate,
  Label,
  Muted,
  ResourceState,
  Shell,
  Title,
  go,
  styles,
  theme,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import { BillIcon, BillPanel, BillInfo } from "@/features/potluck/bill-ui";
import { billAttention } from "@/features/potluck/bill-flow-model";
import type { Bill, Collection } from "@/features/potluck/types";

export default function BillAttentionScreen() {
  const { user } = useClient(),
    resource = useResource<Collection<Bill>>(user ? "/bills" : null);
  const issues = billAttention(resource.data?.items ?? [], user?.id ?? "");
  return (
    <Shell
      title="Bill help"
      back
      hideNavigation
      active="Bills"
      footer={
        <>
          <Action label="Back to bills" onPress={() => go("/bills")} />
          <Action
            secondary
            label="View invitations"
            onPress={() => go("/inbox")}
          />
        </>
      }
    >
      <AuthGate returnTo="/bill-attention">
        <Title>Needs attention</Title>
        <Muted>A clear next step for each bill.</Muted>
        <ResourceState {...resource} retry={resource.reload} />
        {resource.data && (
          <>
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#FCE3DD",
                paddingHorizontal: 24,
                paddingVertical: 8,
                borderRadius: 24,
              }}
            >
              <Label style={{ fontSize: 13, fontFamily: "Inter_600SemiBold" }}>
                {issues.length} {issues.length === 1 ? "action" : "actions"} for
                you
              </Label>
            </View>
            {issues.map((issue) => (
              <Pressable
                key={issue.agreementId + issue.kind}
                accessibilityRole="button"
                onPress={() =>
                  go(
                    issue.kind === "review"
                      ? "/agreement/" + issue.agreementId
                      : "/bill/" +
                          issue.billId +
                          "/recovery?agreementId=" +
                          issue.agreementId,
                  )
                }
              >
                <BillPanel>
                  <View style={styles.row}>
                    <BillIcon
                      name={
                        resource.data?.items.find(
                          (bill) => bill.id === issue.billId,
                        )?.icon
                      }
                    />
                    <View style={{ flex: 1, gap: 4 }}>
                      <Muted>{issue.name}</Muted>
                      <Label style={{ fontFamily: "Inter_600SemiBold" }}>
                        {issue.kind === "review"
                          ? "Review your new share"
                          : issue.kind === "maximum"
                            ? "Share above your maximum"
                            : "A contributor declined"}
                      </Label>
                    </View>
                    <Label style={{ color: theme.teal }}>›</Label>
                  </View>
                </BillPanel>
              </Pressable>
            ))}
            {!issues.length && (
              <BillInfo>
                No contribution terms or accepted maximums need your attention.
              </BillInfo>
            )}
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
