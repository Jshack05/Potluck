import { Title, Action, go } from "@/design/system";
import { useClient } from "@/services/client";
import { CardContext } from "@/features/potluck/card-context";
import { CardPersonRow, CardPeopleInfo } from "@/features/potluck/card-people";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import {
  cardPeopleParent,
  cardPeopleRoute,
  returnToRoute,
} from "@/services/route-return";
import { CardScene, CardLine } from "@/features/potluck/card-scene";
export default function CardPeople() {
  const { user } = useClient();
  const { id, source } = useLocalSearchParams<{
    id: string;
    source?: string;
  }>();
  const navigation = useNavigation();
  usePreventRemove(true, ({ data }) => {
    if (data.action.type === "GO_BACK" || data.action.type === "POP")
      returnToRoute(cardPeopleParent(id, source));
    else navigation.dispatch(data.action);
  });
  return (
    <CardScene
      title="Trusted Spenders"
      backTo={cardPeopleParent(id, source)}
      hideNavigation
      headerTitleSize={26}
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
          <CardContext
            card={card}
            fullName={user?.name ?? ""}
            roleLabel={card.role === "host" ? "HOST" : "TRUSTED SPENDER"}
          />
          <Title>
            {card.role === "host"
              ? "People and permissions"
              : "Your spending permissions"}
          </Title>
          {card.spenders.map((person) => (
            <CardPersonRow
              key={person.id}
              name={person.name}
              detail={person.status}
            />
          ))}
          {!card.spenders.length && (
            <CardLine
              icon="circles"
              title="No Trusted Spenders yet"
              detail="Spending invitations require an approved issuing program. No one has been given card access."
            />
          )}
          <CardPeopleInfo>
            Card access and Bill contributions are managed separately.
          </CardPeopleInfo>
        </>
      )}
    </CardScene>
  );
}
