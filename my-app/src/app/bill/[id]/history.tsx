import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Action,
  AuthGate,
  Divider,
  Muted,
  ResourceState,
  Row,
  Shell,
  Title,
  go,
  money,
  styles,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import { BillIcon, BillPanel, BillInfo } from "@/features/potluck/bill-ui";
import type { Bill } from "@/features/potluck/types";

export default function BillHistory() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient();
  const resource = useResource<Bill>(user ? "/bills/" + id : null),
    bill = resource.data;
  return (
    <Shell
      title="Bill history"
      back
      hideNavigation
      active="Bills"
      footer={<Action label="Back to bills" onPress={() => go("/bills")} />}
    >
      <AuthGate returnTo={"/bill/" + id + "/history"}>
        <ResourceState {...resource} retry={resource.reload} />
        {bill && (
          <>
            <BillPanel>
              <View style={styles.row}>
                <BillIcon name={bill.icon} />
                <Title small>{bill.name}</Title>
              </View>
              <Divider />
              <Muted>
                {bill.status === "ended"
                  ? "Ended · records retained"
                  : "Active bill"}
              </Muted>
            </BillPanel>
            <Title small>Past payments</Title>
            <BillPanel>
              <Title small>No payments recorded</Title>
              <Muted>
                Contribution acceptance is separate from a transfer. No settled
                payment records are available for this bill.
              </Muted>
            </BillPanel>
            <Title small>Contribution terms</Title>
            {bill.agreements.length ? (
              bill.agreements.map((item) => (
                <Row
                  key={item.id}
                  title={item.name ?? "Your contribution"}
                  subtitle={`Version ${item.termsVersion} · ${item.status} · ${money(item.amountMinor)} ${item.terms.frequency}`}
                  icon="agreement"
                  onPress={
                    item.participantId === user?.id
                      ? () => go("/agreement/" + item.id)
                      : undefined
                  }
                />
              ))
            ) : (
              <Muted>No contribution proposals have been created.</Muted>
            )}
            <BillInfo>
              Ending a bill keeps its earlier terms and payment records.
            </BillInfo>
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
