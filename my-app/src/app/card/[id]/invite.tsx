import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import { cardPeopleRoute, returnToRoute } from "@/services/route-return";
import {
  Shell,
  Title,
  Muted,
  Action,
  Link,
  Label,
  Field,
  ResourceState,
  Avatar,
  ErrorText,
  money,
  theme,
} from "@/design/system";
import { CardLine, useCard } from "@/features/potluck/card-scene";
import { useResource } from "@/services/client";
import type { Circle, Person } from "@/features/potluck/types";
import { moneyInput } from "@/features/potluck/calendar-model";
export default function InviteSpender() {
  const card = useCard(),
    circle = useResource<Circle>(
      card.data?.circleId ? "/circles/" + card.data.circleId : null,
    );
  const [person, setPerson] = useState<Person | null>(null),
    [amount, setAmount] = useState(""),
    [review, setReview] = useState(false),
    [error, setError] = useState("");
  const allowed = card.data?.role === "host" && card.data.status !== "closed";
  const { source } = useLocalSearchParams<{ source?: string }>();
  const navigation = useNavigation();
  const cancel = () => {
    setPerson(null);
    setAmount("");
    setReview(false);
    setError("");
    returnToRoute(cardPeopleRoute(card.id, source));
  };
  const back = () => {
    setError("");
    if (review) setReview(false);
    else if (person) setPerson(null);
    else cancel();
  };
  usePreventRemove(!!person, ({ data }) => {
    if (data.action.type === "GO_BACK" || data.action.type === "POP") back();
    else navigation.dispatch(data.action);
  });
  return (
    <Shell
      title={
        review
          ? "Review spending access"
          : person
            ? "Spending permissions"
            : "Invite trusted spender"
      }
      back
      hideNavigation
      headerVariant="centered"
      active="Cards"
      onBack={back}
      footer={
        allowed && (
          <>
            <ErrorText text={error} />
            {person && !review && (
              <Action
                label="Review spending access"
                onPress={() => {
                  try {
                    if (moneyInput(amount) <= 0)
                      throw new Error("Enter a positive monthly limit.");
                    setError("");
                    setReview(true);
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              />
            )}
            {review && (
              <Action
                label="Invitation unavailable"
                disabled
                onPress={() => {}}
              />
            )}
            <Link onPress={cancel}>{review ? "Back to people" : "Cancel"}</Link>
          </>
        )
      }
    >
      <ResourceState
        loading={card.loading}
        data={card.data}
        loadingKey={card.loadingKey}
        error={card.error}
        retry={card.reload}
      />
      {card.data &&
        (allowed ? (
          <>
            {!person ? (
              <>
                <Title>Who would you like to invite?</Title>
                <Muted>{card.data.name}</Muted>
                <ResourceState
                  loading={circle.loading}
                  data={circle.data}
                  loadingKey={circle.loadingKey}
                  error={circle.error}
                  retry={circle.reload}
                />
                {circle.data?.people
                  .filter((p) => p.id !== card.user?.id)
                  .map((p) => (
                    <View
                      key={p.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <Avatar name={p.name} />
                      <View style={{ flex: 1 }}>
                        <CardLine
                          title={p.name}
                          detail="Circle member · No card access"
                          onPress={() => setPerson(p)}
                        />
                      </View>
                    </View>
                  ))}
                {(!circle.data ||
                  circle.data.people.every((p) => p.id === card.user?.id)) && (
                  <Muted>
                    There are no other accepted Circle members to choose. Add
                    people to a Circle separately before planning spending
                    access.
                  </Muted>
                )}
                <Muted>
                  Being in your Circle does not automatically give someone a
                  card.
                </Muted>
              </>
            ) : (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 16,
                    alignItems: "center",
                  }}
                >
                  <Avatar name={person.name} />
                  <View style={{ flex: 1 }}>
                    <Title>
                      {review
                        ? "Invite " + person.name
                        : person.name + "’s monthly limit"}
                    </Title>
                    <Muted>{card.data.name} · Trusted Spender</Muted>
                  </View>
                </View>
                {review ? (
                  <>
                    <Muted>Proposed monthly limit</Muted>
                    <Label
                      style={{
                        fontSize: 40,
                        lineHeight: 48,
                        fontFamily: "Inter_700Bold",
                        color: theme.teal,
                      }}
                    >
                      {money(moneyInput(amount))}
                    </Label>
                    <CardLine
                      icon="cards"
                      title="Permitted purchases"
                      detail="To be configured with the issuing program."
                    />
                    <CardLine
                      icon="circles"
                      title="Activation"
                      detail={
                        person.name +
                        " must accept and complete required issuer approval."
                      }
                    />
                    <Muted>
                      No invitation has been sent. Potluck’s issuing program is
                      not connected, so spending access cannot be granted.
                    </Muted>
                    <Muted>
                      This invitation would not request contributions or share
                      your credential.
                    </Muted>
                  </>
                ) : (
                  <>
                    <Field
                      label="Monthly spending limit"
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      value={amount}
                      onChangeText={setAmount}
                    />
                    {[150, 200, 250].map((limit) => (
                      <CardLine
                        key={limit}
                        icon="cards"
                        title={money(limit * 100) + " per month"}
                        detail="Choose this limit"
                        onPress={() => setAmount(String(limit))}
                      />
                    ))}
                    <Muted>
                      Changing a spending limit does not authorize a bank
                      transfer or change a Bill contribution.
                    </Muted>
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <Muted>
            Only the host of an open Card setup can invite a Trusted Spender.
          </Muted>
        ))}
    </Shell>
  );
}
