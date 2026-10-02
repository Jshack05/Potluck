export const features = ["splitfinder", "cards", "bills", "circles"] as const;
export type Feature = (typeof features)[number];

export const pages = {
  "/": {
    title: "Potluck — Your bills. Your people. All together.",
    description:
      "Meet Splitfinder, Cards, Bills and Circles. A more connected way to share life’s plans and expenses.",
  },
  "/splitfinder/": {
    title: "Splitfinder — People to split with. | Potluck",
    description:
      "Explore Potluck’s planned discovery experience for spaces, plans, subscriptions and memberships.",
  },
  "/cards/": {
    title: "Cards — Shared plans. Purposeful spending. | Potluck",
    description:
      "Explore Potluck’s planned host-controlled card experience. Financial features are not yet available and require provider approval.",
  },
  "/bills/": {
    title: "Bills — Less chasing. More clarity. | Potluck",
    description:
      "See Potluck’s planned experience for shared bills, agreed contributions and clear statuses.",
  },
  "/circles/": {
    title: "Circles — Your people, all together. | Potluck",
    description:
      "Discover reusable groups that connect people, Cards and Bills while keeping individual permissions clear.",
  },
  "/credits/": {
    title: "Credits | Potluck",
    description: "The design, artwork and motion behind the Potluck website.",
  },
  "/404/": {
    title: "Page not found | Potluck",
    description: "Find your way back to Potluck.",
  },
};
export type PagePath = keyof typeof pages;
export function normalizePath(pathname: string): PagePath {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.at(-1) === "index.html") segments.pop();
  const path = `/${segments.join("/")}${segments.length ? "/" : ""}`;
  return Object.hasOwn(pages, path) ? (path as PagePath) : "/404/";
}
export const financialNotice =
  "Planned financial experience. Not yet available; subject to provider and program approval.";
export const sampleNotice =
  "Illustrative listings, prices and availability. Service eligibility and sharing rules apply. Potluck is not affiliated with the services shown.";
