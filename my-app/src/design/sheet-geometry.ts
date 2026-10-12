/** Match 380/700 Figma snaps when space permits; never put the top off-screen. */
export function sheetGeometry(
  viewport: number,
  topInset: number,
  bottomInset: number,
  keyboard: number,
) {
  const bottom = keyboard > 0 ? keyboard + 12 : Math.max(bottomInset, 32);
  const available = Math.max(
    1,
    viewport - Math.max(topInset, 12) - bottom - 12,
  );
  return {
    bottom,
    compact: Math.min(380, available),
    expanded: Math.min(700, available),
  };
}
export function sheetRelease(
  height: number,
  velocityY: number,
  compact: number,
  expanded: number,
): "closed" | "compact" | "expanded" {
  const projected = height - velocityY * 160;
  if (projected < compact * 0.6) return "closed";
  return projected > (compact + expanded) / 2 ? "expanded" : "compact";
}
