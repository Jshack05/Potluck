import { View, Pressable } from "react-native";
import {
  Shell,
  AuthGate,
  Section,
  Avatar,
  Label,
  Muted,
  Icon,
  Action,
  ResourceState,
  Empty,
  Row,
  styles,
  go,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import type { Circle, Collection, Invitation } from "@/features/potluck/types";
export default function Circles() {
  const { user } = useClient(),
    circles = useResource<Collection<Circle>>(user ? "/circles" : null),
    invitations = useResource<Collection<Invitation>>(
      user ? "/invitations" : null,
    );
  return (
    <Shell
      title="Circles"
      active="Circles"
      footer={
        user && (
          <Action
            label="Create a Circle"
            onPress={() => go("/create/circle")}
          />
        )
      }
    >
      <AuthGate returnTo="/circles">
        <ResourceState
          loading={circles.loading}
          error={circles.error}
          retry={circles.reload}
        />
        {!!invitations.data?.items.length && (
          <>
            <Section title="Invitations" />
            {invitations.data.items.map((invite) => (
              <Row
                key={invite.id}
                title={invite.senderName + " invited you"}
                subtitle={"Join " + invite.circleName}
                icon="circles"
                onPress={() => go("/invitation/" + invite.id)}
              />
            ))}
          </>
        )}
        <Section title="Your circles" />
        {circles.data?.items.map((circle) => (
          <Pressable
            accessibilityRole="button"
            key={circle.id}
            onPress={() => go("/circle/" + circle.id)}
            style={[styles.item, { gap: 14 }]}
          >
            <View style={styles.row}>
              <Avatar name={circle.name} />
              <Label
                style={{ fontFamily: "Inter_700Bold", fontSize: 20, flex: 1 }}
              >
                {circle.name}
              </Label>
              <Icon name="circles" size={28} />
            </View>
            <Muted>
              {circle.privacy === "anonymous"
                ? "Private member identities"
                : circle.description || "Your people and shared arrangements"}
            </Muted>
          </Pressable>
        ))}
        {circles.data && !circles.data.items.length && (
          <Empty
            title="A place for your people"
            detail="Create your first Circle, then bring your shared Bills and Cards together."
          />
        )}
      </AuthGate>
    </Shell>
  );
}
