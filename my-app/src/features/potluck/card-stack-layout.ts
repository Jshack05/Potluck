/** Figma 547:1625 and its four expanded variants, in logical pixels. */
export function cardStackLayout(
  count: number,
  cardHeight: number,
  selected: number,
) {
  const expanded = count > 1 && selected >= 0 && selected < count;
  const positions = Array.from(
    { length: count },
    (_, i) =>
      i * 58 +
      (expanded
        ? -20 + (i === selected ? 14 : i > selected ? cardHeight - 34 : 0)
        : 0),
  );
  return { positions, height: count ? Math.max(...positions) + cardHeight : 0 };
}
