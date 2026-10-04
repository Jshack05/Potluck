export type Category =
  | "housing"
  | "memberships"
  | "plans"
  | "subscriptions"
  | "all";
export const categoryLabels: Record<Category, string> = {
  housing: "Spaces",
  memberships: "Memberships",
  plans: "Plans",
  subscriptions: "Subscriptions",
  all: "All opportunities",
};
export type Listing = {
  id: string;
  category: Category;
  title: string;
  location: string;
  shareMinor: number;
  totalMinor?: number;
  host: string;
  hostId: string;
  moveIn?: string;
  facts: string;
  availability: string;
  description: string;
  image: "apartment" | "fitness" | "service";
  subcategory?: string;
  status?: "Active" | "Starts when full";
};
// Explicitly labeled Figma examples, never live inventory or provider state.
export const listings: Listing[] = [
  ...(
    [
      ["screentime", "ScreenTime Plus", "TV & movies", 1000, 4000],
      ["soundclub", "SoundClub", "Music", 600, 2400],
      ["clouddesk", "CloudDesk", "Software", 1000, 4000],
    ] as const
  ).map(
    ([id, title, subcategory, shareMinor, totalMinor]): Listing => ({
      id,
      title,
      subcategory,
      shareMinor,
      totalMinor,
      category: "subscriptions",
      image: "service",
      location: "",
      host: "Alex Morgan",
      hostId: "alex",
      status: "Active",
      facts: `${subcategory} · Monthly`,
      availability: "1 open · 3 of 4 filled",
      description:
        "Illustrative shared-plan listing from the design. Discuss access and provider eligibility with the organizer before deciding. Potluck is not partnered with this sample service.",
    }),
  ),
  {
    id: "connect-mobile",
    category: "plans",
    title: "Connect Mobile",
    subcategory: "Phone plans",
    location: "",
    shareMinor: 3500,
    host: "Taylor Reed",
    hostId: "taylor",
    image: "service",
    facts: "Phone plan · Monthly",
    availability: "Discuss available places with the organizer",
    description:
      "Illustrative phone-plan opportunity. Confirm independent access, eligibility, and the actual plan terms with the organizer before deciding.",
  },
  {
    id: "north-loop",
    category: "housing",
    title: "North Loop · Austin",
    location: "North Loop, Austin",
    shareMinor: 80000,
    totalMinor: 240000,
    host: "Alex Morgan",
    hostId: "alex",
    moveIn: "Jan 15, 2027",
    facts: "3 beds · 2 baths · 12-month lease",
    availability: "Looking for 2 roommates",
    description:
      "Looking for people interested in renting this home together. Let’s talk about timing, routines, and what we each want in a shared place.",
    image: "apartment",
  },
  {
    id: "hyde-park",
    category: "housing",
    title: "Hyde Park · Austin",
    location: "Hyde Park, Austin",
    shareMinor: 90000,
    totalMinor: 270000,
    host: "Jordan Lee",
    hostId: "jordan",
    moveIn: "Jan 20, 2027",
    facts: "3 beds · 2 baths · 12-month lease",
    availability: "Looking for 2 roommates",
    description:
      "A shared home with space to relax, cook, and have friends over. Interested in a thoughtful group that talks things through before committing.",
    image: "apartment",
  },
  {
    id: "west-campus",
    category: "housing",
    title: "West Campus · Austin",
    location: "West Campus, Austin",
    shareMinor: 75000,
    totalMinor: 225000,
    host: "Jordan Lee",
    hostId: "jordan",
    moveIn: "Feb 1, 2027",
    facts: "3 beds · 2 baths · 12-month lease",
    availability: "Looking for 2 roommates",
    description:
      "Another home I’m considering. This is an alternative to my Hyde Park post, not a second commitment. Message me to talk through what might work.",
    image: "apartment",
  },
  {
    id: "fitness",
    category: "memberships",
    title: "Fitness membership · Austin",
    location: "Austin",
    shareMinor: 4000,
    host: "Taylor Reed",
    hostId: "taylor",
    facts: "Group membership · Monthly",
    availability: "Looking for 1 person",
    description:
      "Looking for someone interested in a shared fitness plan. We can discuss schedules, access, and the provider’s eligibility requirements before deciding.",
    image: "fitness",
  },
];
export function findListing(id: string) {
  return listings.find((item) => item.id === id);
}
export function filterListings(
  items: Listing[],
  category: Category,
  query: string,
  maxMinor: number | null,
  subcategory = "All",
) {
  const term = query.trim().toLocaleLowerCase();
  return items.filter(
    (item) =>
      (category === "all" || item.category === category) &&
      (subcategory === "All" || item.subcategory === subcategory) &&
      (maxMinor === null || item.shareMinor <= maxMinor) &&
      `${item.title} ${item.location} ${item.facts}`
        .toLocaleLowerCase()
        .includes(term),
  );
}
export function planSavings(item: Pick<Listing, "shareMinor" | "totalMinor">) {
  if (item.totalMinor === undefined || item.totalMinor < item.shareMinor)
    return null;
  const monthly = item.totalMinor - item.shareMinor;
  return { monthly, annual: monthly * 12 };
}
export function toggleSaved(ids: string[], id: string) {
  if (!findListing(id)) return ids;
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
}
export type Conversations = Record<string, string[]>;
export function appendMessage(
  current: Conversations,
  id: string,
  text: string,
): Conversations {
  const body = text.trim();
  if (!findListing(id) || !body || body.length > 2000) return current;
  return { ...current, [id]: [...(current[id] ?? []), body] };
}
export function money(minor: number) {
  return `$${(minor / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}
