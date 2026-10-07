import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Shell,
  AuthGate,
  Title,
  Muted,
  Label,
  Row,
  Action,
  ResourceState,
  Avatar,
  theme,
  money,
  dateLabel,
  go,
  styles,
  Divider,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import type { Bill, Circle, Card } from "@/features/potluck/types";
import {
  BillIcon,
  BillPanel,
  BillDetailRow,
  BillInfo,
} from "@/features/potluck/bill-ui";
import { billStatusLabel } from "@/features/potluck/bill-flow-model";
import { CardPreview } from "@/features/potluck/card-preview";

export default function BillDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient();
  const resource = useResource<Bill>(user ? "/bills/" + id : null),
    bill = resource.data;
  const circle = useResource<Circle>(
    bill?.circleId ? "/circles/" + bill.circleId : null,
  );
  const card = useResource<Card>(
    bill?.role === "host" && bill.cardId ? "/cards/" + bill.cardId : null,
  );
  const offered = bill?.agreements.find(
    (item) => item.participantId === user?.id && item.status === "offered",
  );
  const accepted = bill?.agreements.find(
    (item) => item.participantId === user?.id && item.status === "accepted",
  );
  const people = Array.from(
    new Map(
      (
        bill?.agreements.filter(
          (item) => item.status === "offered" || item.status === "accepted",
        ) ?? []
      )
        .slice()
        .reverse()
        .map((item) => [item.participantId, item]),
    ).values(),
  );
  return (
    <Shell
      title={bill?.name ?? "Bill"}
      back
      active="Bills"
      returnTo="/bills"
      footer={
        offered ? (
          <Action
            label="Review your share"
            onPress={() => go("/agreement/" + offered.id)}
          />
        ) : accepted && bill?.status !== "ended" ? (
          <Action
            label="Review your contribution"
            onPress={() => go("/bill/" + id + "/payment")}
          />
        ) : undefined
      }
    >
      <AuthGate returnTo={"/bill/" + id}>
        <ResourceState {...resource} retry={resource.reload} />
        {bill && (
          <>
            <Label
              style={{
                fontSize: 14,
                color: theme.teal,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              {bill.role === "host"
                ? "You’re the bill host"
                : "You’re a contributor"}
            </Label>
            <BillPanel>
              <View style={styles.row}>
                <BillIcon name={bill.icon} color={bill.color} />
                <View style={{ flex: 1 }}>
                  <Title small>{bill.name}</Title>
                  <Muted>{billStatusLabel(bill.status)}</Muted>
                </View>
                <Label
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 28,
                    lineHeight: 34,
                    color: theme.teal,
                  }}
                >
                  {money(bill.amountMinor)}
                </Label>
              </View>
              <Muted>
                {bill.kind === "flexible"
                  ? "Estimated amount · " +
                    money(bill.maximumMinor ?? 0) +
                    " maximum"
                  : "Fixed bill"}
              </Muted>
            </BillPanel>
            <Title>Schedule</Title>
            <BillPanel>
              <BillDetailRow
                label="First due date"
                value={dateLabel(bill.firstDueDate)}
              />
              <Divider />
              <BillDetailRow
                label="Contributions"
                value="Separate payment authorization required"
              />
              <Divider />
              <BillDetailRow label="Repeats" value={bill.frequency} />
            </BillPanel>
            <Title>
              {bill.role === "host"
                ? "People on this bill"
                : "Your contribution"}
            </Title>
            {people.length ? (
              <BillPanel>
                <Muted>
                  {people.length} {people.length === 1 ? "person" : "people"} ·
                  current terms and proposals
                </Muted>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 20 }}
                >
                  {people.map((person) => (
                    <View
                      key={person.participantId}
                      style={{
                        minWidth: 70,
                        flexBasis: "25%",
                        flexGrow: 1,
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Avatar name={person.name ?? "You"} size={44} />
                      <Label
                        numberOfLines={2}
                        style={{ textAlign: "center", fontSize: 13 }}
                      >
                        {person.name ?? "You"}
                      </Label>
                      <Label
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          color:
                            person.status === "accepted"
                              ? theme.teal
                              : theme.amber,
                        }}
                      >
                        {money(person.amountMinor)}
                      </Label>
                      <Muted>
                        {person.status === "accepted"
                          ? "Agreed"
                          : "Pending review"}
                      </Muted>
                    </View>
                  ))}
                </View>
              </BillPanel>
            ) : (
              <BillPanel>
                <Title small>No contributions scheduled</Title>
                <Muted>
                  Your bill is saved. Set terms when you’re ready to invite
                  people.
                </Muted>
              </BillPanel>
            )}
            {accepted && (
              <Row
                title="Your agreement"
                subtitle="Terms, funding account and contribution controls"
                icon="agreement"
                onPress={() => go("/agreement/" + accepted.id)}
              />
            )}
            <Title>Attached to</Title>
            {bill.circleId ? (
              <Row
                title={circle.data?.name ?? "Attached Circle"}
                icon="circles"
                onPress={() => go("/circle/" + bill.circleId)}
              />
            ) : (
              <Muted>No Circle attached</Muted>
            )}
            {bill.role === "host" && bill.cardId && (
              <View style={{ gap: 10 }}>
                <CardPreview
                  name={card.data?.name ?? "Funding Card"}
                  design={card.data?.design}
                />
                <Row
                  title="View funding Card"
                  subtitle="Setup required"
                  onPress={() => go("/card/" + bill.cardId)}
                />
              </View>
            )}
            <Row
              title="Bill history"
              subtitle="Past terms and contribution records"
              icon="agreement"
              onPress={() => go("/bill/" + id + "/history")}
            />
            {bill.role === "host" && bill.status !== "ended" && (
              <Row
                title="Manage bill"
                subtitle="Contributions, connections and ending this bill"
                onPress={() => go("/bill/" + id + "/manage")}
              />
            )}
            <BillInfo>
              {bill.status === "ended"
                ? "This bill has ended. Its history remains. Ending does not cancel the external service or close an attached Card."
                : "No payment has been initiated. Agreement acceptance is separate from bank funding and merchant payment."}
            </BillInfo>
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
