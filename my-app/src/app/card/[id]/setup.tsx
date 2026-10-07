import { Title, Muted, Row, Action, go } from "@/design/system";
import { CardScene } from "@/features/potluck/card-scene";
import { CardPreview } from "@/features/potluck/card-preview";
export default function CardSetup() {
  return (
    <CardScene
      title="Card settings"
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
          <Title small>
            {card.status === "closed" ? "Setup closed" : "Finish card setup"}
          </Title>
          <Muted>
            Your setup is saved. Issuance, bank funding and spending permissions
            require Potluck’s approved issuing program.
          </Muted>
          {card.role === "host" && card.status !== "closed" && (
            <>
              <Row
                title="Activation"
                subtitle="Issuing program is not connected"
                icon="cards"
                onPress={() => go("/card/" + card.id + "/details")}
              />
              <Row
                title="Spending controls"
                icon="cards"
                onPress={() => go("/card/" + card.id + "/controls")}
              />
              <Row
                title="People and permissions"
                icon="circles"
                onPress={() => go("/card/" + card.id + "/people")}
              />
              <Row
                title="Manage arrangement"
                subtitle="Attach a Circle or close this setup."
                onPress={() => go("/manage/cards/" + card.id)}
              />
            </>
          )}
          <Row
            title="Balance details"
            onPress={() => go("/card/" + card.id + "/balance")}
          />
          <Row
            title="Card activity"
            onPress={() => go("/card/" + card.id + "/activity")}
          />
        </>
      )}
    </CardScene>
  );
}
