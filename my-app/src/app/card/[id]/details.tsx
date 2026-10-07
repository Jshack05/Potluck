import { Title, Muted, Action, go } from "@/design/system";
import { CardScene, CardLine } from "@/features/potluck/card-scene";
import { CardPreview } from "@/features/potluck/card-preview";
export default function CredentialDetails() {
  return (
    <CardScene
      title="Card details"
      footer={(card) => (
        <Action label="Back to card" onPress={() => go("/card/" + card.id)} />
      )}
    >
      {(card) => (
        <>
          <CardPreview
            name={card.name}
            design={card.design}
            role={card.role}
            closed={card.status === "closed"}
          />
          <Title small>No card details yet</Title>
          <Muted>
            This is an unissued Card setup. Card number, expiry and security
            code will be available only through an approved secure issuer
            display.
          </Muted>
          <CardLine
            title="Card status"
            detail={
              card.status === "closed" ? "Setup closed" : "Setup required"
            }
          />
          <CardLine
            title="Access"
            detail={card.role === "host" ? "Host" : "Trusted Spender"}
          />
          <CardLine title="Credentials" detail="Not issued" />
        </>
      )}
    </CardScene>
  );
}
