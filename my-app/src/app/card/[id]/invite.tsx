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
  ErrorText,
  money,
  theme,
} from "@/design/system";
import { useCard } from "@/features/potluck/card-scene";
import { CardContext } from "@/features/potluck/card-context";
import {
  CardPeopleInfo,
  CardPersonHeading,
  CardPersonRow,
  CardPermissionRow,
} from "@/features/potluck/card-people";
import { useResource } from "@/services/client";
import type { Circle, Person } from "@/features/potluck/types";
import { moneyInput } from "@/features/potluck/calendar-model";

export default function InviteSpender() {
  const card = useCard();
  return (
    <CardInvitationDraft
      key={`${card.user?.id ?? "anonymous"}:${card.id}`}
      card={card}
    />
  );
}

function CardInvitationDraft({ card }: { card: ReturnType<typeof useCard> }) {
  const circle = useResource<Circle>(
    card.data?.circleId ? "/circles/" + card.data.circleId : null,
  );
  const [person, setPerson] = useState<Person | null>(null);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"pick" | "permissions" | "review">("pick");
  const [error, setError] = useState("");
  const allowed = card.data?.role === "host" && card.data.status !== "closed";
  const { source } = useLocalSearchParams<{ source?: string }>();
  const navigation = useNavigation();
  const cancel = () => {
    setPerson(null);
    setAmount("");
    setStep("pick");
    setError("");
    returnToRoute(cardPeopleRoute(card.id, source));
  };
  const back = () => {
    setError("");
    if (step === "review") setStep("permissions");
    else if (step === "permissions") setStep("pick");
    else cancel();
  };
  usePreventRemove(true, ({ data }) => {
    if (data.action.type === "GO_BACK" || data.action.type === "POP") back();
    else navigation.dispatch(data.action);
  });
  const pick = (next: Person) => {
    if (person?.id !== next.id) setAmount("");
    setPerson(next);
    setError("");
    setStep("permissions");
  };
  return (
    <Shell
      title={
        step === "review"
          ? "Review spending access"
          : step === "permissions"
            ? "Spending permissions"
            : "Invite trusted spender"
      }
      back
      hideNavigation
      headerTitleSize={26}
      active="Cards"
      onBack={back}
      keyboardContentOnly
      footer={
        allowed && (
          <>
            <ErrorText text={error} />
            {person && step === "permissions" && (
              <Action
                label="Review spending access"
                onPress={() => {
                  try {
                    if (moneyInput(amount) <= 0)
                      throw new Error("Enter a positive monthly limit.");
                    setError("");
                    setStep("review");
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              />
            )}
            {step === "review" && (
              <Action
                label="Invitation unavailable"
                disabled
                onPress={() => {}}
              />
            )}
            {step === "pick" ? (
              <Action label="Cancel" onPress={cancel} />
            ) : (
              <Link onPress={cancel}>
                {step === "review" ? "Back to people" : "Cancel"}
              </Link>
            )}
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
            <CardContext
              card={card.data}
              fullName={card.user?.name ?? ""}
              roleLabel="HOST"
            />
            {step === "pick" ? (
              <>
                <Title>Who would you like to invite?</Title>
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
                    <CardPersonRow
                      key={p.id}
                      name={p.name}
                      detail="Circle member · No card access"
                      onPress={() => pick(p)}
                    />
                  ))}
                {/* Existing unavailable/empty copy is preserved pending a Figma counterpart. */}
                {!circle.loading &&
                  !circle.error &&
                  (!circle.data ||
                    circle.data.people.every(
                      (p) => p.id === card.user?.id,
                    )) && (
                    <Muted>
                      There are no other accepted Circle members to choose. Add
                      people to a Circle separately before planning spending
                      access.
                    </Muted>
                  )}
                <CardPeopleInfo>
                  Being in your Circle does not automatically give someone a
                  card.
                </CardPeopleInfo>
              </>
            ) : (
              person && (
                <>
                  <CardPersonHeading name={person.name}>
                    {step === "review"
                      ? "Invite " + person.name
                      : person.name + "’s monthly limit"}
                  </CardPersonHeading>
                  {step === "review" ? (
                    <>
                      <View
                        style={{
                          backgroundColor: "white",
                          borderRadius: 22,
                          padding: 20,
                          gap: 8,
                        }}
                      >
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
                      </View>
                      <CardPermissionRow
                        icon="shield"
                        title="Permitted purchases"
                        detail="To be configured with the issuing program."
                      />
                      <CardPermissionRow
                        icon="circles"
                        title="Activation"
                        detail={
                          person.name +
                          " must accept and complete required issuer approval."
                        }
                      />
                      <Muted>
                        No invitation has been sent. Potluck’s issuing program
                        is not connected, so spending access cannot be granted.
                      </Muted>
                      <CardPeopleInfo>
                        This invitation would not request contributions or share
                        your credential.
                      </CardPeopleInfo>
                    </>
                  ) : (
                    <>
                      {/* Preserve the existing custom amount input; Figma only specifies preset edits. */}
                      <Field
                        label="Monthly spending limit"
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        value={amount}
                        onChangeText={(value) => {
                          setAmount(value);
                          setError("");
                        }}
                      />
                      {[150, 200, 250].map((limit) => (
                        <CardPermissionRow
                          key={limit}
                          icon="cards"
                          title={money(limit * 100) + " per month"}
                          detail="Choose this limit"
                          onPress={() => {
                            setAmount(String(limit));
                            setError("");
                          }}
                        />
                      ))}
                      <CardPeopleInfo>
                        Changing a spending limit does not authorize a bank
                        transfer or change a Bill contribution.
                      </CardPeopleInfo>
                    </>
                  )}
                </>
              )
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
