import { View, Pressable } from "react-native";
import {
  Shell,
  AuthGate,
  Section,
  Label,
  Muted,
  Icon,
  ResourceState,
  go,
  theme,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import type {
  Collection,
  Invitation,
  CircleArrangements,
} from "@/features/potluck/types";
import { HomeEmptyState } from "@/features/potluck/home-empty-state";
import { CircleAvatar } from "@/features/potluck/circle-ui";
import {
  circleSummary,
  type CircleDetail,
} from "@/features/potluck/circle-model";
export default function Circles() {
  const { user } = useClient(),
    circles = useResource<Collection<CircleDetail>>(user ? "/circles" : null),
    invitations = useResource<Collection<Invitation>>(
      user ? "/invitations" : null,
    );
  return (
    <Shell
      title="Circles"
      active="Circles"
      emptyState={!!circles.data && !circles.data.items.length}
    >
      <AuthGate returnTo="/circles">
        <ResourceState {...circles} retry={circles.reload} />
        {(circles.data || invitations.error) && (
          <ResourceState {...invitations} retry={invitations.reload} />
        )}
        {invitations.data?.items.map((invite) => (
          <Pressable
            accessibilityRole="button"
            key={invite.id}
            onPress={() => go("/invitation/" + invite.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 24,
              padding: 20,
              backgroundColor: "white",
              gap: 14,
            }}
          >
            <CircleAvatar name={invite.senderName} size={50} />
            <View style={{ flex: 1, gap: 4 }}>
              <Label style={{ fontFamily: "Inter_700Bold" }}>
                {invite.senderName} invited you
              </Label>
              <Muted>Join {invite.circleName}</Muted>
            </View>
            <View
              style={{
                backgroundColor: theme.teal,
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 18,
              }}
            >
              <Label
                style={{
                  color: "white",
                  fontSize: 13,
                  fontFamily: "Inter_700Bold",
                }}
              >
                View
              </Label>
            </View>
          </Pressable>
        ))}
        {!!circles.data?.items.length && <Section title="Your circles" />}
        {circles.data?.items.map((circle) => (
          <CircleSummary key={circle.id} circle={circle} />
        ))}
        {circles.data && !circles.data.items.length && (
          <HomeEmptyState area="Circles" />
        )}
      </AuthGate>
    </Shell>
  );
}
function CircleSummary({ circle }: { circle: CircleDetail }) {
  const arrangements = useResource<CircleArrangements>(
    "/circle-arrangements/" + circle.id,
  );
  const people = circle.people ?? [],
    visible = people.slice(0, 4),
    extra = Math.max(0, (circle.memberCount ?? people.length) - 3);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => go("/circle/" + circle.id)}
      style={{
        borderRadius: 24,
        backgroundColor: "white",
        padding: 20,
        gap: 10,
        minHeight: 108,
      }}
    >
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <CircleAvatar name={circle.name} size={48} color={circle.color} />
        <Label style={{ fontFamily: "Inter_700Bold", fontSize: 20, flex: 1 }}>
          {circle.name}
        </Label>
        {circle.pendingInvitationCount > 0 && <Icon name="pending" size={30} />}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
        <View style={{ flexDirection: "row" }}>
          {visible.map((person, index) => (
            <View
              key={person.id}
              style={{
                marginLeft: index ? -5 : 0,
                borderWidth: 1,
                borderColor: "white",
                borderRadius: 15,
              }}
            >
              {index === 3 && extra > 1 && circle.privacy !== "anonymous" ? (
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: "#FFE1D9",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Label style={{ fontSize: 9, fontFamily: "Inter_700Bold" }}>
                    +{extra}
                  </Label>
                </View>
              ) : (
                <CircleAvatar name={person.name} size={26} index={index} />
              )}
            </View>
          ))}
        </View>
        <Label style={{ flex: 1, fontSize: 14, color: theme.muted }}>
          {circleSummary(circle, arrangements.data ?? undefined)}
        </Label>
      </View>
      {circle.pendingInvitationCount > 0 && (
        <Label style={{ fontSize: 12, color: theme.amber }}>
          {circle.pendingInvitationCount} invitation
          {circle.pendingInvitationCount === 1 ? "" : "s"} pending
        </Label>
      )}
    </Pressable>
  );
}
