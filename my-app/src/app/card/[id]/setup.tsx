import { View } from "react-native";
import { Row, go, dateLabel } from "@/design/system";
import { useResource } from "@/services/client";
import { CardScene, type CardDetail } from "@/features/potluck/card-scene";
import { CardPreview } from "@/features/potluck/card-preview";
import {
  CardHeading,
  CardSettingsGroup,
  CardSetting,
} from "@/features/potluck/card-ui";
import type { Circle } from "@/features/potluck/types";

export default function CardSetup() {
  return (
    <CardScene title="Card settings">
      {(card) => <Settings card={card} />}
    </CardScene>
  );
}
function Settings({ card }: { card: CardDetail }) {
  const circle = useResource<Circle>(
    card.circleId ? "/circles/" + card.circleId : null,
  );
  return (
    <>
      <CardPreview
        name={card.name}
        design={card.design}
        role={card.role}
        availableMinor={card.availableMinor}
        closed={card.status === "closed"}
      />
      <View style={{ marginTop: 4, gap: 8 }}>
        <CardHeading>Details</CardHeading>
        <CardSettingsGroup>
          <CardSetting title="Card name" value={card.name} />
          <CardSetting
            title="Circle"
            value={card.circleId ? (circle.data?.name ?? "—") : "No Circle"}
          />
          <CardSetting
            title="Status"
            value={card.status === "closed" ? "Setup closed" : "Setup required"}
          />
          <CardSetting title="Virtual card" value="Not issued" />
          <CardSetting title="Created" value={dateLabel(card.createdAt)} last />
        </CardSettingsGroup>
      </View>
      {card.role === "host" && (
        <View style={{ gap: 8 }}>
          <CardHeading>Controls</CardHeading>
          <CardSettingsGroup>
            <CardSetting
              title="Spending limit"
              description="Maximum spend before review"
            />
            <CardSetting
              title="Trusted spenders"
              description="People allowed to use this card"
              value={`${card.spenders.length} ${card.spenders.length === 1 ? "person" : "people"}`}
              onPress={() => go("/card/" + card.id + "/people")}
            />
            <CardSetting
              title="Merchant controls"
              description="Where this card is allowed"
              last
            />
          </CardSettingsGroup>
        </View>
      )}
      {/* Keep existing close/connection access until its Figma counterpart is
        resolved. Never replace it with a new destructive-action design. */}
      {card.role === "host" && card.status !== "closed" && (
        <Row
          title="Manage arrangement"
          subtitle="Attach a Circle or close this setup."
          onPress={() => go("/manage/cards/" + card.id)}
        />
      )}
    </>
  );
}
