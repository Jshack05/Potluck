import { Title, Muted, Action, go, Avatar } from "@/design/system";
import { useLocalSearchParams } from "expo-router";
import { cardPeopleParent, cardPeopleRoute } from "@/services/route-return";
import { View } from "react-native";
import { CardScene, CardLine } from "@/features/potluck/card-scene";
export default function CardPeople() {
  const { id, source } = useLocalSearchParams<{
    id: string;
    source?: string;
  }>();
  return (
    <CardScene
      title="Trusted Spenders"
      backTo={cardPeopleParent(id, source)}
      hideNavigation
      headerVariant="centered"
      footer={(card) => (
        <>
          {card.role === "host" && card.status !== "closed" && (
            <Action
              label="Invite trusted spender"
              onPress={() => go(cardPeopleRoute(card.id, source, "invite"))}
            />
          )}
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
