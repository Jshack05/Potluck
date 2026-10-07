import { Title, Muted, Action, Link, go, Avatar } from "@/design/system";
import { View } from "react-native";
import { CardScene, CardLine } from "@/features/potluck/card-scene";
export default function CardPeople() {
  return (
    <CardScene
      title="Trusted Spenders"
      footer={(card) => (
        <>
          {card.role === "host" && card.status !== "closed" && (
            <Action
              label="Invite trusted spender"
              onPress={() => go("/card/" + card.id + "/invite")}
            />
          )}
          <Link onPress={() => go("/card/" + card.id)}>Back to card</Link>
        </>
      )}
    >
      {(card) => (
        <>
          <Title>
            {card.role === "host"
              ? "People and permissions"
              : "Your spending permissions"}
          </Title>
          <Muted>
            {card.name} ·{" "}
            {card.role === "host" ? "You’re the host" : "Your assigned card"}
          </Muted>
          {card.spenders.map((person) => (
            <View
              key={person.id}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Avatar name={person.name} />
              <View style={{ flex: 1 }}>
                <CardLine title={person.name} detail={person.status} />
              </View>
            </View>
          ))}
          {!card.spenders.length && (
            <CardLine
              icon="circles"
              title="No Trusted Spenders yet"
              detail="Spending invitations require an approved issuing program. No one has been given card access."
            />
          )}
          <Muted>
            Card access and Bill contributions are managed separately.
          </Muted>
        </>
      )}
    </CardScene>
  );
}
