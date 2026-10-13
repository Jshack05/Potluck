import { router, type Href } from "expo-router";

/** Expo POP_TO unwinds an existing parent, or replaces the child when absent. */
export function returnToRoute(destination: Href): void {
  router.dismissTo(destination);
}

export function cardPeopleSource(
  source: unknown,
): "card" | "settings" | "manage" {
  return source === "settings" || source === "manage" ? source : "card";
}

export function cardPeopleParent(id: string, source: unknown): Href {
  switch (cardPeopleSource(source)) {
    case "settings":
      return `/card/${id}/setup`;
    case "manage":
      return `/manage/cards/${id}`;
    default:
      return `/card/${id}`;
  }
}

export function cardPeopleRoute(
  id: string,
  source: unknown,
  page: "people" | "invite" = "people",
): Href {
  return `/card/${id}/${page}?source=${cardPeopleSource(source)}`;
}
