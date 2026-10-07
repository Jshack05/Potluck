import { useState } from "react";
import { Image } from "expo-image";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Action,
  AuthGate,
  Divider,
  ErrorText,
  Label,
  Link,
  Muted,
  ResourceState,
  Row,
  Shell,
  Title,
  go,
  styles,
} from "@/design/system";
import {
  useAction,
  useClient,
  useCommand,
  useResource,
} from "@/services/client";
import {
  BillIcon,
  BillPanel,
  BillInfo,
  BillDetailRow,
} from "@/features/potluck/bill-ui";
import type { Bill, Card, Circle, Collection } from "@/features/potluck/types";

export default function ManageBill() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    action = useAction(),
    command = useCommand();
  const resource = useResource<Bill>(user ? "/bills/" + id : null),
    bill = resource.data;
  const circles = useResource<Collection<Circle>>(user ? "/circles" : null),
    cards = useResource<Collection<Card>>(user ? "/cards" : null);
  const [view, setView] = useState<"manage" | "connection" | "end" | "ended">(
    "manage",
  );
  const [circleId, setCircleId] = useState<string | null | undefined>(),
    [cardId, setCardId] = useState<string | null | undefined>();
  const owned = bill?.hostId === user?.id;
  const back = () =>
    view !== "manage"
      ? setView("manage")
      : router.canGoBack()
        ? router.back()
        : go("/bill/" + id);
  const saveConnection = () =>
    action.run(async () => {
      if (!bill || !owned) return;
      await command("/bills/" + id + "/connection", {
        expectedVersion: bill.version,
        expectedConnectionVersion: bill.connectionVersion,
        circleId: circleId === undefined ? bill.circleId : circleId,
        cardId: cardId === undefined ? bill.cardId : cardId,
      });
      await resource.reload();
      setView("manage");
    });
  const end = () =>
    action.run(async () => {
      if (!bill || !owned) return;
      await command("/bills/" + id + "/end", {
        expectedVersion: bill.version,
        acknowledged: true,
      });
      await resource.reload();
      setView("ended");
    });
  return (
    <Shell
      title={
        view === "end"
          ? "End shared bill"
          : view === "ended"
            ? "Bill ended"
            : view === "connection"
              ? "Bill connections"
              : "Manage bill"
      }
      back
      onBack={back}
      hideNavigation
      active="Bills"
      footer={
        bill && owned ? (
          <>
            <ErrorText text={action.error} />
            {view === "connection" ? (
              <Action
                label="Save connection"
                disabled={action.busy}
                onPress={saveConnection}
              />
            ) : view === "end" ? (
              <>
                <Action
                  label="End shared bill"
                  disabled={action.busy}
                  onPress={end}
                />
                <Action
                  secondary
                  label="Keep bill active"
                  onPress={() => setView("manage")}
                />
              </>
            ) : view === "ended" ? (
              <>
                <Action
                  label="View bill history"
                  onPress={() => go("/bill/" + id + "/history")}
                />
                <Action
                  secondary
                  label="Back to bills"
                  onPress={() => router.replace("/bills")}
                />
              </>
            ) : (
              <Action label="Back to bill" onPress={() => go("/bill/" + id)} />
            )}
          </>
        ) : undefined
      }
    >
      <AuthGate returnTo={"/bill/" + id + "/manage"}>
        <ResourceState {...resource} retry={resource.reload} />
        {bill &&
          (!owned ? (
            <BillInfo>
              Only the Bill host can change its connections or end it. Your own
              contribution controls are available from your agreement.
            </BillInfo>
          ) : (
            <>
              {view === "manage" && (
                <>
                  <Title>{bill.name}</Title>
                  {bill.status !== "ended" && (
                    <>
                      <Row
                        title={
                          bill.agreements.length
                            ? "Propose new terms"
                            : "Set contribution terms"
                        }
                        subtitle="Each person reviews their own share"
                        icon="agreement"
                        onPress={() => go("/create/bill?id=" + id)}
                      />
                      <Row
                        title="Change connection"
                        subtitle="Keep this bill and its history"
                        icon="circles"
                        onPress={() => setView("connection")}
                      />
                      <Link danger onPress={() => setView("end")}>
                        End this bill
                      </Link>
                    </>
                  )}
                  <Row
                    title="View bill history"
                    icon="agreement"
                    onPress={() => go("/bill/" + id + "/history")}
                  />
                </>
              )}
              {view === "connection" && (
                <>
                  <Title>Connect to your people</Title>
                  <ResourceState
                    loading={circles.loading}
                    data={circles.data}
                    error={circles.error}
                    retry={circles.reload}
                  />
                  <Row
                    title="No Circle"
                    right={
                      <Label>
                        {(circleId === undefined ? bill.circleId : circleId) ===
                        null
                          ? "✓"
                          : ""}
                      </Label>
                    }
                    onPress={() => setCircleId(null)}
                  />
                  {circles.data?.items.map((item) => (
                    <Row
                      key={item.id}
                      title={item.name}
                      right={
                        <Label>
                          {(circleId === undefined
                            ? bill.circleId
                            : circleId) === item.id
                            ? "✓"
                            : ""}
                        </Label>
                      }
                      onPress={() => setCircleId(item.id)}
                    />
                  ))}
                  <Title small>Funding Card</Title>
                  <ResourceState
                    loading={cards.loading}
                    data={cards.data}
                    error={cards.error}
                    retry={cards.reload}
                  />
                  <Row
                    title="No funding Card"
                    right={
                      <Label>
                        {(cardId === undefined ? bill.cardId : cardId) == null
                          ? "✓"
                          : ""}
                      </Label>
                    }
                    onPress={() => setCardId(null)}
                  />
                  {cards.data?.items
                    .filter(
                      (item) =>
                        item.hostId === user?.id && item.status !== "closed",
                    )
                    .map((item) => (
                      <Row
                        key={item.id}
                        title={item.name}
                        subtitle="Setup required"
                        icon="cards"
                        right={
                          <Label>
                            {(cardId === undefined ? bill.cardId : cardId) ===
                            item.id
                              ? "✓"
                              : ""}
                          </Label>
                        }
                        onPress={() => setCardId(item.id)}
                      />
                    ))}
                  <BillInfo>
                    Changing a connection does not enroll people, change
                    accepted terms or give spending access.
                  </BillInfo>
                </>
              )}
              {view === "end" && (
                <>
                  <Title>End this shared bill?</Title>
                  <Muted>Review what changes for everyone.</Muted>
                  <BillPanel>
                    <View style={styles.row}>
                      <BillIcon name={bill.icon} />
                      <Title small>{bill.name}</Title>
                    </View>
                    <Divider />
                    <BillDetailRow label="Ends" value="When you confirm" />
                    <BillDetailRow
                      label="Contributors"
                      value={
                        String(
                          new Set(
                            bill.agreements
                              .filter(
                                (item) =>
                                  item.status === "accepted" ||
                                  item.status === "offered",
                              )
                              .map((item) => item.participantId),
                          ).size,
                        ) + " people"
                      }
                    />
                    <BillDetailRow
                      label="Future agreements"
                      value="Canceled; pending offers withdrawn"
                    />
                    <BillInfo>
                      Funding has not been enabled for this local bill. No
                      transfers or settled payments are represented here.
                    </BillInfo>
                  </BillPanel>
                  <View style={styles.row}>
                    <Image
                      source={require("../../../../assets/potluck/bill/stop.svg")}
                      style={{ width: 32, height: 32 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Title small>Future contributions stop</Title>
                      <Muted>No new collection attempts will start.</Muted>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Image
                      source={require("../../../../assets/potluck/bill/archive.svg")}
                      style={{ width: 32, height: 32 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Title small>Past history stays available</Title>
                      <Muted>
                        Accepted terms and earlier records are retained.
                      </Muted>
                    </View>
                  </View>
                  <BillInfo>
                    This does not cancel your service with the provider, close a
                    Card, or remove Circle members. Existing obligations are not
                    erased.
                  </BillInfo>
                </>
              )}
              {view === "ended" && (
                <>
                  <Image
                    source={require("../../../../assets/potluck/bill/ended.svg")}
                    contentFit="contain"
                    style={{
                      width: 180,
                      height: 160,
                      alignSelf: "center",
                      marginVertical: 24,
                    }}
                  />
                  <Title>This shared bill has ended</Title>
                  <Muted>Future contribution agreements are stopped.</Muted>
                  <BillPanel>
                    <View style={styles.row}>
                      <BillIcon name={bill.icon} />
                      <Title small>{bill.name}</Title>
                    </View>
                    <Divider />
                    <BillDetailRow
                      label="Status"
                      value={
                        bill.status === "ended"
                          ? "Ended"
                          : "Refresh bill status"
                      }
                    />
                  </BillPanel>
                  <Muted>Your Circle and Card stay unchanged.</Muted>
                  <BillInfo>
                    Your past records remain available in history.
                  </BillInfo>
                </>
              )}
            </>
          ))}
      </AuthGate>
    </Shell>
  );
}
