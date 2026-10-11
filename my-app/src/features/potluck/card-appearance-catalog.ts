import type { ImageSource } from "expo-image";
import type { Card } from "./types";

export const cardAppearanceCategories = [
  { id: "finishes", label: "Finishes" },
  { id: "solid", label: "Solid colors" },
  { id: "gradients", label: "Gradients" },
  { id: "panels", label: "Potluck panels" },
  { id: "artwork", label: "Artwork" },
] as const;
export type CardAppearanceCategory =
  (typeof cardAppearanceCategories)[number]["id"];
type CardAppearance = {
  id: Card["design"];
  label: string;
  category: CardAppearanceCategory;
  sourceNode: string;
  background: string;
  foreground: "#FFFFFF" | "#273232" | "#273432";
  image?: ImageSource;
  panel?: string;
};

// Editable gradient fills from Figma 915:4016 and 915:4033.
function gradient(colors: string[]): ImageSource {
  return {
    uri:
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="330" height="176" viewBox="0 0 330 176"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="19.21" y1="-24.56" x2="310.79" y2="200.56"><stop offset="6.6667%" stop-color="${colors[0]}"/><stop offset="48.333%" stop-color="${colors[1]}"/><stop offset="90%" stop-color="${colors[2]}"/></linearGradient></defs><rect width="330" height="176" fill="url(#g)"/></svg>`,
      ),
  };
}

// Stable saved IDs; source components, not sample Card instances, define each look.
// Artwork assets contain only the fill. Names, balances and roles remain native.
export const cardAppearances: Record<Card["design"], CardAppearance> = {
  graphite: {
    id: "graphite",
    label: "Graphite",
    category: "finishes",
    sourceNode: "1583:19448",
    background: "#263433",
    foreground: "#FFFFFF",
    image: require("../../../assets/potluck/card-graphite.png"),
  },
  brushed_silver: {
    id: "brushed_silver",
    label: "Brushed Silver",
    category: "finishes",
    sourceNode: "1583:19412",
    background: "#D9E0DE",
    foreground: "#273232",
    image: require("../../../assets/potluck/card-appearances/brushed-silver.png"),
  },
  frosted_glass: {
    id: "frosted_glass",
    label: "Frosted Glass",
    category: "finishes",
    sourceNode: "1583:19430",
    background: "#D9E0DE",
    foreground: "#273232",
    image: require("../../../assets/potluck/card-appearances/frosted-glass.png"),
  },
  champagne: {
    id: "champagne",
    label: "Champagne",
    category: "finishes",
    sourceNode: "1583:19466",
    background: "#D9E0DE",
    foreground: "#273232",
    image: require("../../../assets/potluck/card-appearances/champagne.png"),
  },
  satin_teal: {
    id: "satin_teal",
    label: "Satin Teal",
    category: "finishes",
    sourceNode: "1583:19484",
    background: "#053838",
    foreground: "#FFFFFF",
    image: require("../../../assets/potluck/card-appearances/satin-teal.png"),
  },
  teal: {
    id: "teal",
    label: "Evergreen",
    category: "solid",
    sourceNode: "916:4034",
    background: "#006D67",
    foreground: "#FFFFFF",
  },
  coral: {
    id: "coral",
    label: "Coral",
    category: "solid",
    sourceNode: "916:4051",
    background: "#F36F55",
    foreground: "#273432",
  },
  aurora_gradient: {
    id: "aurora_gradient",
    label: "Aurora gradient",
    category: "gradients",
    sourceNode: "915:4016",
    background: "#263433",
    foreground: "#FFFFFF",
    image: gradient(["#006D67", "#2663CB", "#8E52B6"]),
    panel: "rgba(255,255,255,0.22)",
  },
  sunset: {
    id: "sunset",
    label: "Sunset gradient",
    category: "gradients",
    sourceNode: "915:4033",
    background: "#263433",
    foreground: "#FFFFFF",
    image: gradient(["#F76F55", "#E0418F", "#5A3CAE"]),
    panel: "rgba(255,255,255,0.22)",
  },
  ocean: {
    id: "ocean",
    label: "Ocean",
    category: "panels",
    sourceNode: "917:4052",
    background: "#1C3F98",
    foreground: "#FFFFFF",
    panel: "rgba(12,166,154,0.52)",
  },
  berry: {
    id: "berry",
    label: "Violet",
    category: "panels",
    sourceNode: "917:4069",
    background: "#5B21A6",
    foreground: "#FFFFFF",
    panel: "rgba(243,111,85,0.52)",
  },
  aurora: {
    id: "aurora",
    label: "Northern lights",
    category: "artwork",
    sourceNode: "1583:19232",
    background: "#263433",
    foreground: "#FFFFFF",
    image: require("../../../assets/potluck/card-aurora.png"),
  },
  ocean_artwork: {
    id: "ocean_artwork",
    label: "Ocean artwork",
    category: "artwork",
    sourceNode: "1583:19250",
    background: "#053838",
    foreground: "#FFFFFF",
    image: require("../../../assets/potluck/card-appearances/ocean-artwork.png"),
  },
  sunset_artwork: {
    id: "sunset_artwork",
    label: "Sunset artwork",
    category: "artwork",
    sourceNode: "1583:19268",
    background: "#053838",
    foreground: "#FFFFFF",
    image: require("../../../assets/potluck/card-appearances/sunset-artwork.png"),
  },
  botanical: {
    id: "botanical",
    label: "Botanical",
    category: "artwork",
    sourceNode: "1583:19286",
    background: "#053838",
    foreground: "#FFFFFF",
    image: require("../../../assets/potluck/card-appearances/botanical.png"),
  },
  midnight: {
    id: "midnight",
    label: "Midnight",
    category: "artwork",
    sourceNode: "1583:19304",
    background: "#053838",
    foreground: "#FFFFFF",
    image: require("../../../assets/potluck/card-appearances/midnight.png"),
  },
  terracotta: {
    id: "terracotta",
    label: "Terracotta",
    category: "artwork",
    sourceNode: "1583:19322",
    background: "#053838",
    foreground: "#FFFFFF",
    image: require("../../../assets/potluck/card-appearances/terracotta.png"),
  },
  alpine: {
    id: "alpine",
    label: "Alpine",
    category: "artwork",
    sourceNode: "1583:19340",
    background: "#053838",
    foreground: "#FFFFFF",
    image: require("../../../assets/potluck/card-appearances/alpine.png"),
  },
  prism: {
    id: "prism",
    label: "Prism",
    category: "artwork",
    sourceNode: "1583:19358",
    background: "#053838",
    foreground: "#FFFFFF",
    image: require("../../../assets/potluck/card-appearances/prism.png"),
  },
  orbit: {
    id: "orbit",
    label: "Orbit",
    category: "artwork",
    sourceNode: "1583:19376",
    background: "#053838",
    foreground: "#FFFFFF",
    image: require("../../../assets/potluck/card-appearances/orbit.png"),
  },
  lagoon: {
    id: "lagoon",
    label: "Lagoon",
    category: "artwork",
    sourceNode: "1583:19394",
    background: "#053838",
    foreground: "#FFFFFF",
    image: require("../../../assets/potluck/card-appearances/lagoon.png"),
  },
};
