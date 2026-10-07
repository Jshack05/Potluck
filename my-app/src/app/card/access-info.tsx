import { router } from "expo-router";
import { Shell, Title, Muted, Action } from "@/design/system";
import { CardLine } from "@/features/potluck/card-scene";
export default function AccessInfo() {
  return (
    <Shell
      title="Trusted Spenders"
      back
      active="Cards"
      footer={
        <Action label="Back to card setup" onPress={() => router.back()} />
      }
    >
      <Title>Separate access, their own card</Title>
      <CardLine
        icon="circles"
        title="Invite a person"
        detail="Circle membership and contributions do not grant spending rights."
      />
      <CardLine
        icon="cards"
        title="Their own assigned credential"
        detail="The person must accept and complete the issuer’s required approval."
      />
      <CardLine
        icon="pending"
        title="Approval is not connected yet"
        detail="You can organize your Card setup. Spending invitations and credentials are not available yet."
      />
      <Muted>
        The host remains financially responsible. No one receives your card
        credentials.
      </Muted>
    </Shell>
  );
}
