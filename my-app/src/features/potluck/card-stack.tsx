import { useEffect, useState } from "react";
import { Animated, Easing, Pressable, View } from "react-native";
import { useReducedMotion } from "@/design/loading";
import { CardPreview } from "./card-preview";
import { cardStackLayout } from "./card-stack-layout";
import type { Card } from "./types";

function StackCard({
  card,
  y,
  index,
  expanded,
  single,
  hostId,
  select,
  open,
}: {
  card: Card;
  y: number;
  index: number;
  expanded: boolean;
  single: boolean;
  hostId?: string;
  select: () => void;
  open: () => void;
}) {
  const [position] = useState(() => new Animated.Value(y));
  const reduced = useReducedMotion();
  useEffect(() => {
    const motion = Animated.timing(position, {
      toValue: y,
      duration: reduced ? 0 : 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    motion.start();
    return () => motion.stop();
  }, [position, y, reduced]);
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        zIndex: index,
        transform: [{ translateY: position }],
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${expanded || single ? "Open" : "Expand"} ${card.name}`}
        accessibilityState={{ expanded }}
        onPress={expanded || single ? open : select}
      >
        <CardPreview
          name={card.name}
          design={card.design}
          role={card.hostId === hostId ? "host" : null}
        />
      </Pressable>
    </Animated.View>
  );
}

/** One measured stack owns placement, animation and its complete scroll extent. */
export function CardStack({
  cards,
  hostId,
  selectedId,
  onSelect,
  onOpen,
}: {
  cards: readonly Card[];
  hostId?: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onOpen: (id: string) => void;
}) {
  const [width, setWidth] = useState(330);
  const layout = cardStackLayout(
    cards.length,
    (Math.min(width, 330) * 176) / 330,
    cards.findIndex((c) => c.id === selectedId),
  );
  const [extent] = useState(() => new Animated.Value(layout.height));
  const reduced = useReducedMotion();
  useEffect(() => {
    const motion = Animated.timing(extent, {
      toValue: layout.height,
      duration: reduced ? 0 : 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    motion.start();
    return () => motion.stop();
  }, [extent, layout.height, reduced]);
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ paddingTop: 20 }}
    >
      <Animated.View style={{ height: extent }}>
        {selectedId && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Collapse cards"
            onPress={() => onSelect(null)}
            style={{
              position: "absolute",
              top: -20,
              bottom: -16,
              left: 0,
              right: 0,
            }}
          />
        )}
        {cards.map((card, index) => (
          <StackCard
            key={card.id}
            card={card}
            index={index}
            y={layout.positions[index]}
            expanded={card.id === selectedId}
            single={cards.length === 1}
            hostId={hostId}
            select={() => onSelect(card.id)}
            open={() => onOpen(card.id)}
          />
        ))}
      </Animated.View>
    </View>
  );
}
