import { Pressable, View } from "react-native";
import { Label, theme } from "@/design/system";
import { CardPreview, cardLooks } from "./card-preview";
import {
  CardCircleChoice,
  CardCreateCircle,
  CardReviewRow,
  CardSelection,
  CardHeading,
  CardHint,
} from "./card-ui";
import type { Card, Circle } from "./types";

// Existing creation frames: appearance 928:4751, Circle 854:3495,
// attached review 855:3408 and standalone review 861:3572.
// Presentation only: the creation route owns draft state and navigation.
export function CardAppearancePicker({
  name,
  design,
  disabled,
  onSelect,
}: {
  name: string;
  design: Card["design"];
  disabled: boolean;
  onSelect: (design: Card["design"]) => void;
}) {
  return (
    <>
      <CardHint>Pick a look that feels like yours.</CardHint>
      <CardPreview name={name} design={design} />
      <Label
        style={{
          textAlign: "center",
          color: theme.teal,
          fontFamily: "Inter_700Bold",
          fontSize: 14,
        }}
      >
        {cardLooks[design]}
      </Label>
      {(
        [
          ["Gradients", ["aurora_gradient", "sunset"]],
          ["Solid colors", ["teal", "coral"]],
          ["Potluck panels", ["ocean", "berry"]],
        ] as [string, Card["design"][]][]
      ).map(([title, looks]) => (
        <View key={title} style={{ gap: 8 }}>
          <Label
            style={{
              fontSize: 18,
              lineHeight: 22,
              fontFamily: "Inter_700Bold",
            }}
          >
            {title}
          </Label>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 20,
            }}
          >
            {looks.map((look) => (
              <Pressable
                key={look}
                accessibilityLabel={cardLooks[look]}
                accessibilityRole="radio"
                accessibilityState={{ checked: design === look }}
                aria-checked={design === look}
                disabled={disabled}
                onPress={() => onSelect(look)}
                style={{ flex: 1, maxWidth: 176 }}
              >
                <CardPreview name={name} design={look} compact />
                <View style={{ position: "absolute", top: 8, right: 8 }}>
                  <CardSelection selected={design === look} light />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

export function CardCirclePicker({
  circles,
  selectedId,
  disabled,
  onSelect,
  onCreate,
}: {
  circles: readonly Pick<Circle, "id" | "name" | "memberCount">[];
  selectedId: string | null;
  disabled: boolean;
  onSelect: (id: string | null) => void;
  onCreate: () => void;
}) {
  return (
    <View style={{ gap: 12 }}>
      {circles.map((circle) => (
        <CardCircleChoice
          key={circle.id}
          title={circle.name}
          subtitle={`${circle.memberCount} ${circle.memberCount === 1 ? "member" : "members"}`}
          disabled={disabled}
          selected={selectedId === circle.id}
          onPress={() => onSelect(circle.id)}
        />
      ))}
      <CardCircleChoice
        title="No Circle — just for me"
        selected={!selectedId}
        disabled={disabled}
        onPress={() => onSelect(null)}
      />
      <CardCreateCircle disabled={disabled} onPress={onCreate} />
    </View>
  );
}

export function CardCreationReview({
  name,
  design,
  circleId,
  circleName,
  onChangeCircle,
}: {
  name: string;
  design: Card["design"];
  circleId: string | null;
  circleName?: string;
  onChangeCircle?: () => void;
}) {
  return (
    <>
      <CardHint>
        {circleId
          ? "Confirm the card and invitations before you create it."
          : "Confirm this card will stay just for you."}
      </CardHint>
      <View style={{ marginTop: 16, gap: 16 }}>
        <CardHeading>{circleId ? "Your card" : "Card"}</CardHeading>
        <CardPreview name={name} design={design} />
        <Label
          style={{
            textAlign: "center",
            color: theme.muted,
            fontSize: 14,
            marginTop: 12,
          }}
        >
          {circleId
            ? `${name} · host-controlled`
            : "Card shell — no shared access"}
        </Label>
      </View>
      {circleId ? (
        <>
          <View style={{ marginTop: 20, gap: 12 }}>
            <CardHeading>Attached Circle</CardHeading>
            <CardReviewRow
              title={circleName ?? "Circle unavailable"}
              circle
              onPress={onChangeCircle}
            />
          </View>
          <CardHeading>Trusted Spender invitations</CardHeading>
          <CardReviewRow title="No invitations sent" />
          <CardHint>
            Card access begins only after each person accepts their invitation.
          </CardHint>
        </>
      ) : (
        <>
          <View style={{ marginTop: 20, gap: 12 }}>
            <CardHeading>Sharing</CardHeading>
            <CardReviewRow
              title="Just for you"
              subtitle="No Circle or invitations"
            />
          </View>
          <View style={{ marginTop: 12 }}>
            <CardHint>
              You can attach a Circle later to invite Trusted Spenders.
            </CardHint>
          </View>
        </>
      )}
    </>
  );
}
