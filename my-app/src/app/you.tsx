import { View } from "react-native";
import { router } from "expo-router";
import {
  Shell,
  AuthGate,
  Avatar,
  Title,
  Muted,
  Row,
  Action,
  ErrorText,
  Divider,
  go,
} from "@/design/system";
import { useAction, useClient } from "@/services/client";
export default function You() {
  const client = useClient(),
    action = useAction();
  return (
    <Shell
      title="You"
      back
      footer={
        client.user && (
          <>
            <ErrorText text={action.error} />
            <Action
              label="Sign out"
              secondary
              disabled={action.busy}
              onPress={() =>
                action.run(async () => {
                  await client.signOut();
                  router.replace("/sign-in");
                })
              }
            />
          </>
        )
      }
    >
      <AuthGate returnTo="/you">
        {client.user && (
          <>
            <View style={{ alignItems: "center", gap: 12, marginVertical: 20 }}>
              <Avatar name={client.user.name} size={88} />
              <Title>{client.user.name}</Title>
              <Muted>{client.user.email}</Muted>
            </View>
            <Row
              title="Your listings"
              subtitle="Drafts and the arrangements you’ve posted"
              icon="discover"
              onPress={() => go("/my-listings")}
            />
            <Row
              title="Saved opportunities"
              icon="check"
              onPress={() => go("/saved")}
            />
            <Row
              title="Sharing Rules"
              subtitle="What to check before sharing a service"
              onPress={() => go("/sharing-rules")}
            />
            <Divider />
            <Muted>
              Local development account. Card issuance, bank connections and
              money movement are not available.
            </Muted>
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
