import { useState } from "react";
import { router, useLocalSearchParams, type Href } from "expo-router";
import {
  Shell,
  AuthGate,
  Title,
  Muted,
  Field,
  Action,
  ErrorText,
} from "@/design/system";
import { useAction, useClient, useCommand } from "@/services/client";
export default function Invite() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    command = useCommand(),
    action = useAction(),
    [email, setEmail] = useState("");
  return (
    <Shell
      title="Invite to Circle"
      back
      active="Circles"
      footer={
        user && (
          <>
            <ErrorText text={action.error} />
            <Action
              label={action.busy ? "Sending…" : "Send invitation"}
              disabled={action.busy || !email.includes("@")}
              onPress={() =>
                action.run(async () => {
                  await command("/circles/" + id + "/invitations", {
                    email: email.trim(),
                  });
                  router.replace(("/circle/" + id) as Href);
                })
              }
            />
          </>
        )
      }
    >
      <AuthGate returnTo={"/circle/" + id + "/invite"}>
        <Title>Make room for your people.</Title>
        <Muted>
          They can review the invitation in their Inbox and choose whether to
          join.
        </Muted>
        <Field
          label="Their email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Muted>
          For local testing, this person needs an account on this backend. No
          email is sent.
        </Muted>
      </AuthGate>
    </Shell>
  );
}
