import { View, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Shell,
  AuthGate,
  Section,
  Label,
  Muted,
  Row,
  ResourceState,
  go,
  money,
  theme,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import type { CircleArrangements } from "@/features/potluck/types";
import { CircleAvatar } from "@/features/potluck/circle-ui";
import { CardPreview } from "@/features/potluck/card-preview";
import {
  canInviteToCircle,
  circleSummary,
  type CircleDetail as Circle,
} from "@/features/potluck/circle-model";
export default function CircleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    resource = useResource<Circle>(user ? "/circles/" + id : null),
    circle = resource.data,
    arrangements = useResource<CircleArrangements>(
      user ? "/circle-arrangements/" + id : null,
    );
  const attach =
    circle && (circle.role === "host" || circle.privacy === "normal");
  return (
    <Shell title={circle?.name ?? "Circle"} back active="Circles">
      <AuthGate returnTo={"/circle/" + id}>
        <ResourceState {...resource} retry={resource.reload} />
        {circle && (
          <>
            <Muted>
              {circleSummary(circle, arrangements.data ?? undefined)}
            </Muted>
            {!!circle.description && <Muted>{circle.description}</Muted>}
            {circle.pendingInvitationCount > 0 && (
              <Row
                title={
                  circle.pendingInvitationCount +
                  " invitation" +
                  (circle.pendingInvitationCount === 1
                    ? " pending"
                    : "s pending")
                }
                subtitle="Membership updates after acceptance."
                icon="pending"
                onPress={() => go("/circle/" + id + "/members")}
              />
            )}
            <Section
              title="People"
              action="Manage"
              onAction={() => go("/circle/" + id + "/members")}
            />
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 24,
                padding: 20,
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 16,
                justifyContent: "space-between",
              }}
            >
              {circle.people.slice(0, 4).map((person, index) => (
                <Pressable
                  accessibilityRole="button"
                  key={person.id}
                  onPress={() => go("/circle/" + id + "/members")}
                  style={{ alignItems: "center", width: 46, gap: 6 }}
                >
                  <CircleAvatar name={person.name} index={index} />
                  <Label
                    numberOfLines={1}
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_700Bold",
                      maxWidth: 64,
                    }}
                  >
                    {person.id === user?.id ? "You" : person.name.split(" ")[0]}
                  </Label>
                </Pressable>
              ))}
              {canInviteToCircle(circle) && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Invite someone"
                  onPress={() => go("/circle/" + id + "/invite")}
                  style={{ alignItems: "center", width: 46, gap: 6 }}
                >
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: theme.mint,
                    }}
                  >
                    <Label style={{ color: theme.teal, fontSize: 25 }}>+</Label>
                  </View>
                  <Label
                    style={{
                      color: theme.teal,
                      fontSize: 12,
                      fontFamily: "Inter_700Bold",
                    }}
                  >
                    Add
                  </Label>
                </Pressable>
              )}
            </View>
            {circle.privacy === "anonymous" && (
              <Muted>
                Members’ identities are private. The Circle Host stays visible.
              </Muted>
            )}
            <ResourceState {...arrangements} retry={arrangements.reload} />
            <Section
              title="Bills"
              action={attach ? "+ Bill" : undefined}
              onAction={() => go("/create/bill?circleId=" + id)}
            />
            {arrangements.data?.bills.map((bill) => (
              <Row
                key={bill.id}
                title={bill.name}
                subtitle={
                  bill.status === "ended" ? "Ended" : "View agreed shares"
                }
                icon="bills"
                right={
                  <Label
                    style={{
                      color: theme.teal,
                      fontFamily: "Inter_700Bold",
                      fontSize: 20,
                    }}
                  >
                    {money(bill.amountMinor)}
                  </Label>
                }
                onPress={() => go("/bill/" + bill.id)}
              />
            ))}
            {arrangements.data?.bills.length === 0 && (
              <Muted>
                Bring a shared expense into this Circle when you’re ready.
              </Muted>
            )}
            <Section
              title="Cards"
              action={attach ? "+ Card" : undefined}
              onAction={() => go("/create/card?circleId=" + id)}
            />
            {arrangements.data?.cards.map((card) => (
              <Pressable
                key={card.id}
                accessibilityRole="button"
                accessibilityLabel={"View " + card.name}
                onPress={() => go("/card/" + card.id)}
              >
                <CardPreview
                  name={card.name}
                  design={card.design}
                  closed={card.status === "closed"}
                  availableMinor={null}
                />
              </Pressable>
            ))}
            {arrangements.data?.cards.length === 0 && (
              <Muted>Cards you’re permitted to access will appear here.</Muted>
            )}
            <Row
              title="Manage Circle"
              subtitle="Members, invitations and privacy"
              onPress={() => go("/circle/" + id + "/settings")}
            />
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
