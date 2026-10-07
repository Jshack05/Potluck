import { Title, Muted, Action, go } from "@/design/system";
import { CardScene, CardLine } from "@/features/potluck/card-scene";
export default function CardControls() {
  return (
    <CardScene
      title="Spending controls"
      footer={(card) => (
        <Action label="Back to card" onPress={() => go("/card/" + card.id)} />
      )}
    >
      {(card) => (
        <>
          <Title>{card.name}</Title>
          <CardLine
            icon="pending"
            title="Freeze card"
            detail="No issued credential to freeze."
          />
          <CardLine
            icon="cards"
            title="Spending limits"
            detail="Configure supported limits after issuer setup."
          />
          <CardLine
            icon="cards"
            title="Allowed purchases"
            detail="Merchant and category controls depend on the approved issuing program."
          />
          <Muted>
            No card control has been activated. Closing your saved setup is
            available under Manage arrangement.
          </Muted>
        </>
      )}
    </CardScene>
  );
}
