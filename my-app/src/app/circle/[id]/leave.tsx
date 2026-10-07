import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Shell,
  AuthGate,
  Muted,
  Label,
  Action,
  ErrorText,
  ResourceState,
  go,
} from "@/design/system";
import {
  useAction,
  useClient,
  useCommand,
  useResource,
} from "@/services/client";
import type { CircleDetail } from "@/features/potluck/circle-model";
import {
  CircleHeading,
  CircleHero,
  circleStyles,
} from "@/features/potluck/circle-ui";
export default function LeaveCircle() {
  const { id, archive } = useLocalSearchParams<{
      id: string;
      archive?: string;
    }>(),
    { user } = useClient(),
    resource = useResource<CircleDetail>(user ? "/circles/" + id : null),
    circle = resource.data,
    action = useAction(),
    command = useCommand(),
    [done, setDone] = useState<"left" | "archived" | null>(null);
  const host = circle?.role === "host",
    solo = circle?.memberCount === 1 || archive === "true";
  return (
    <Shell
      title="Potluck"
      continuation
      back={!done}
      active="Circles"
      footer={
        circle && (
          <>
            <ErrorText text={action.error} />
            {done ? (
              <Action label="Back to Circles" onPress={() => go("/circles")} />
            ) : host && !solo ? (
              <>
                <Action
                  label="Stay"
                  secondary
                  onPress={() => go("/circle/" + id + "/settings")}
                />
                <Action
                  label="Choose the next Circle Host"
                  onPress={() => go("/circle/" + id + "/handover")}
                />
              </>
            ) : (
              <>
                <Action
                  label="Stay"
                  secondary
                  disabled={action.busy}
                  onPress={() => go("/circle/" + id + "/settings")}
                />
                <Action
                  label={host ? "Archive Circle" : "Leave Circle"}
                  danger
                  disabled={action.busy}
                  onPress={() =>
                    action.run(async () => {
                      await command(
                        "/circles/" + id + (host ? "/archive" : "/leave"),
                        { expectedVersion: circle.version, acknowledged: true },
                      );
                      setDone(host ? "archived" : "left");
                    })
                  }
                />
              </>
            )}
          </>
        )
      }
    >
      <AuthGate returnTo={"/circle/" + id + "/leave"}>
        <ResourceState {...resource} retry={resource.reload} />
        {circle &&
          (done ? (
            <CircleHero
              complete
              title={
                done === "left" ? "You left the Circle" : "Circle archived"
              }
              detail={
                done === "left"
                  ? "Your membership in " + circle.name + " has ended."
                  : circle.name + " is archived. Its history is retained."
              }
            />
          ) : (
            <>
              <CircleHeading>
                {host && solo ? "Archive " : "Leave "}
                {circle.name}?
              </CircleHeading>
              <Muted>
                {host && !solo
                  ? "Choose another accepted member to become Circle Host before you leave. Your role changes only after they accept."
                  : host
                    ? "Archiving removes this Circle from everyone’s active Circles and cancels pending invitations. Its history is retained."
                    : "You’ll lose access to this Circle. You can ask for another invitation later."}
              </Muted>
              <View style={circleStyles.divider} />
              <Label style={{ fontSize: 20, fontFamily: "Inter_700Bold" }}>
                Before you leave
              </Label>
              <Muted>
                Any separate Cards, Bills or contribution agreements remain in
                effect until handled through their own controls.
              </Muted>
            </>
          ))}
      </AuthGate>
    </Shell>
  );
}
