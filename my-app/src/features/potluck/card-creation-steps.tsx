import { Pressable, View } from "react-native";
import { Label, theme } from "@/design/system";
import { CardPreview, cardLooks } from "./card-preview";
import {
  cardAppearances,
  cardAppearanceCategories,
  type CardAppearanceCategory,
} from "./card-appearance-catalog";
import {
  CardCircleChoice,
  CardCreateCircle,
  CardReviewRow,
  CardSelection,
  CardHeading,
  CardHint,
} from "./card-ui";
import type { Card, Circle } from "./types";

// Existing creation frames: combined details 854:3466, Circle 854:3495,
// attached review 855:3408 and standalone review 861:3572.
// Presentation only: the creation route owns draft state and navigation.
export function CardAppearancePicker({
  name,
  design,
  disabled,
  onSelect,
  expandedCategories,
  onToggleCategory,
}: {
  name: string;
  design: Card["design"];
  disabled: boolean;
  onSelect: (design: Card["design"]) => void;
  expandedCategories: readonly CardAppearanceCategory[];
  onToggleCategory: (category: CardAppearanceCategory) => void;
}) {
  return (
    <>
      <CardPreview name={name} design={design} />
      <Label
        style={{
          textAlign: "center",
          color: theme.muted,
          fontSize: 14,
        }}
      >
        {`${cardLooks[design] ?? "Saved appearance"} selected`}
      </Label>
      {cardAppearanceCategories.map((category) => {
        const looks = Object.values(cardAppearances).filter(
          (look) => look.category === category.id,
        );
        const expanded = expandedCategories.includes(category.id);
        const visible = expanded ? looks : looks.slice(0, 2);
        const hiddenSelection = looks.find(
          (look) => look.id === design && !visible.includes(look),
        );
        return (
          <View key={category.id} style={{ gap: 8 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Label
                accessibilityRole="header"
                style={{
                  flex: 1,
                  fontSize: 18,
                  lineHeight: 22,
                  fontFamily: "Inter_700Bold",
                }}
              >
                {category.label}
              </Label>
              {looks.length > 2 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${expanded ? "See less" : "See all"} ${category.label}`}
                  accessibilityState={{ expanded }}
                  onPress={() => onToggleCategory(category.id)}
                  style={{
                    minHeight: 44,
                    minWidth: 44,
                    justifyContent: "center",
                    alignItems: "flex-end",
                  }}
                >
                  <Label
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: theme.muted,
                    }}
                  >
                    {expanded ? "See less" : "See all"}
                  </Label>
                </Pressable>
              )}
            </View>
            {hiddenSelection && (
              <Label
                style={{ fontSize: 13, color: theme.muted }}
              >{`${hiddenSelection.label} selected`}</Label>
            )}
            {Array.from({ length: Math.ceil(visible.length / 2) }, (_, row) => (
              <View
                key={row}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 20,
                }}
              >
                {visible.slice(row * 2, row * 2 + 2).map((look) => (
                  <Pressable
                    key={look.id}
                    accessibilityLabel={look.label}
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked: design === look.id,
                      disabled,
                    }}
                    aria-checked={design === look.id}
                    disabled={disabled}
                    onPress={() => onSelect(look.id)}
                    style={{ flex: 1, maxWidth: 176, gap: 6 }}
                  >
                    <CardPreview name={name} design={look.id} compact />
                    <View style={{ position: "absolute", top: 8, right: 8 }}>
                      <CardSelection selected={design === look.id} />
                    </View>
                    <Label
                      style={{
                        fontSize: 12,
                        textAlign: "center",
                        color: theme.muted,
                      }}
                    >
                      {look.label}
                    </Label>
                  </Pressable>
                ))}
                {visible.slice(row * 2, row * 2 + 2).length === 1 && (
                  <View style={{ flex: 1, maxWidth: 176 }} />
                )}
              </View>
            ))}
          </View>
        );
      })}
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
