import { Title, Muted, Action, Link, go } from "@/design/system";
import { CardScene } from "@/features/potluck/card-scene";
export default function CardActivity() {
  return (
    <CardScene
      title="Card activity"
      footer={(card) => (
        <>
          <Action label="Back to card" onPress={() => go("/card/" + card.id)} />
          {card.role === "host" && (
            <Link onPress={() => go("/card/" + card.id + "/people")}>
              Trusted Spenders
            </Link>
          )}
        </>
      )}
    >
      {(card) => (
        <>
          <Title>
            {card.role === "host"
              ? "Shared card activity"
              : "Your card activity"}
          </Title>
          <Muted>
            {card.name} ·{" "}
            {card.role === "host" ? "Host view" : "Your assigned card"}
          </Muted>
          <Muted>
            This Card has not been issued. No spending or transfer activity is
            available.
          </Muted>
        </>
      )}
    </CardScene>
  );
}
