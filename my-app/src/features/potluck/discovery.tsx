import { useState } from "react";
import { Image } from "expo-image";
import { Pressable, View, Modal, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Shell,
  Title,
  Label,
  Muted,
  Field,
  Action,
  Link,
  Empty,
  ResourceState,
  Avatar,
  go,
  money,
  theme,
  styles,
} from "@/design/system";
import { SearchRow } from "@/features/splitfinder/search-row";
import { useResource } from "@/services/client";
import { usePreview } from "@/features/splitfinder/state";
import type { Listing, Collection } from "./types";

export function BrandMark({
  brand,
  generic = process.env.EXPO_PUBLIC_BRAND_ICONS === "generic",
  size = 40,
}: {
  brand: string;
  generic?: boolean;
  size?: number;
}) {
  const marks: Record<string, number> = {
    netflix: require("../../../assets/splitfinder/netflix.svg"),
    spotify: require("../../../assets/splitfinder/spotify.svg"),
    dropbox: require("../../../assets/splitfinder/dropbox.svg"),
  };
  const source = !generic
    ? (marks[brand.toLowerCase()] ??
      require("../../../assets/splitfinder/category-tv.svg"))
    : require("../../../assets/splitfinder/category-tv.svg");
  return (
    <Image
      source={source}
      contentFit="contain"
      style={{ width: size, height: size }}
      accessibilityLabel={generic ? "Service" : brand}
    />
  );
}
export function ListingRow({ listing }: { listing: Listing }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={"Open " + listing.title + " by " + listing.hostName}
      onPress={() => go("/listing/" + listing.id)}
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        gap: 12,
      }}
    >
      <View style={styles.row}>
        <Avatar name={listing.hostName ?? "You"} size={32} />
        <Muted>{listing.hostName ?? "You"}</Muted>
        <View style={{ flex: 1 }} />
        <Label style={{ color: theme.teal }}>›</Label>
      </View>
      <Title small>{listing.title}</Title>
      <View
        style={[
          styles.row,
          { justifyContent: "space-between", flexWrap: "wrap" },
        ]}
      >
        <Label
          style={{
            color: theme.blue,
            fontSize: 23,
            fontFamily: "Inter_700Bold",
          }}
        >
          {money(listing.shareMinor)} / month
        </Label>
        <Muted>
          {listing.capacity - listing.filled} open · {listing.filled} of{" "}
          {listing.capacity} filled
        </Muted>
      </View>
      {listing.location ? <Muted>{listing.location}</Muted> : null}
    </Pressable>
  );
}
const categoryTitles = {
  subscriptions: "Subscriptions",
  memberships: "Memberships",
  plans: "Phone plans",
  housing: "Spaces",
  all: "Discover",
};
export default function Discovery() {
  const state = usePreview();
  const params = useLocalSearchParams<{ brand?: string; category?: string }>();
  const [brand, setBrand] = useState(params.brand ?? ""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState(false),
    [limit, setLimit] = useState(""),
    [max, setMax] = useState<number | null>(null);
  const category =
    params.category && params.category in categoryTitles
      ? (params.category as keyof typeof categoryTitles)
      : params.brand && state.category === "housing"
        ? "subscriptions"
        : state.category;
  const [kind, setKind] = useState("");
  const directory = category !== "housing" && category !== "all";
  const filters = new URLSearchParams({
    ...(category === "all" ? {} : { category }),
    ...(max !== null ? { maxMinor: String(max) } : {}),
    ...(kind && category === "subscriptions" ? { serviceKind: kind } : {}),
  });
  const brands = useResource<Collection<{ name: string; serviceKind: string }>>(
    directory ? "/brands?" + filters + "&q=" + encodeURIComponent(query) : null,
  );
  const list = useResource<Collection<Listing>>(
    "/listings?" +
      filters +
      "&" +
      new URLSearchParams({
        ...(brand ? { brand } : {}),
        ...(!directory && query ? { q: query } : {}),
      }),
  );
  return (
    <Shell
      title="Splitfinder"
      blue
      active="Splitfinder"
      footer={
        <>
          <Muted>
            {brand
              ? "Have a spot to share?"
              : "Bring people to your arrangement."}
          </Muted>
          <Action
            label="+ Create a listing"
            onPress={() =>
              go(
                "/create/listing?category=" +
                  category +
                  "&brand=" +
                  encodeURIComponent(brand),
              )
            }
          />
        </>
      }
    >
      <SearchRow
        value={query}
        onChangeText={(value) => {
          setQuery(value);
          setBrand("");
        }}
        placeholder={
          category === "housing" ? "Search by location" : "Search brands"
        }
        filtered={max !== null}
        onOpenFilters={() => setFilter(true)}
      />
      <View style={[styles.row, { justifyContent: "space-between" }]}>
        <Title>{brand || categoryTitles[category]}</Title>
        <Link onPress={() => (brand ? setBrand("") : go("/?change=1"))}>
          {brand ? "All brands" : "Change"}
        </Link>
      </View>
      {category === "subscriptions" && !brand && (
        <View style={styles.row}>
          {[
            {
              key: "tv",
              label: "TV & movies",
              icon: require("../../../assets/splitfinder/category-tv.svg"),
            },
            {
              key: "music",
              label: "Music",
              icon: require("../../../assets/splitfinder/category-music.svg"),
            },
            {
              key: "software",
              label: "Software",
              icon: require("../../../assets/splitfinder/category-software.svg"),
            },
          ].map((x) => (
            <Pressable
              key={x.key}
              accessibilityRole="button"
              accessibilityState={{ selected: kind === x.key }}
              aria-selected={kind === x.key}
              onPress={() => setKind(kind === x.key ? "" : x.key)}
              style={{
                flex: 1,
                minHeight: 76,
                borderRadius: 12,
                backgroundColor: kind === x.key ? theme.paleBlue : "white",
                borderWidth: 1,
                borderColor: kind === x.key ? theme.blue : "transparent",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: 8,
              }}
            >
              <Image
                source={x.icon}
                contentFit="contain"
                style={{ width: 26, height: 26 }}
              />
              <Label
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  textAlign: "center",
                }}
              >
                {x.label}
              </Label>
            </Pressable>
          ))}
        </View>
      )}
      {directory && !brand ? (
        <>
          <ResourceState {...brands} retry={brands.reload} />
          {!query &&
            list.data?.items
              .filter((x) => !x.brand)
              .map((x) => <ListingRow key={x.id} listing={x} />)}
          {brands.data?.items.map((item) => (
            <Pressable
              key={item.name}
              accessibilityRole="button"
              onPress={() => {
                setBrand(item.name);
                setQuery("");
              }}
              style={[
                styles.row,
                {
                  padding: 16,
                  backgroundColor: "white",
                  borderRadius: 12,
                },
              ]}
            >
              <BrandMark brand={item.name} />
              <View style={{ flex: 1 }}>
                <Title small>{item.name}</Title>
                <Muted>
                  {{
                    tv: "TV & movies",
                    music: "Music",
                    software: "Software",
                    other: "Community service",
                  }[item.serviceKind] ?? categoryTitles[category]}
                </Muted>
              </View>
              <Label>›</Label>
            </Pressable>
          ))}
          {brands.data?.items.length === 0 && (
            <Empty
              title={
                query ? "No matching brands yet" : "Make the first connection"
              }
              detail="Create a listing for a service you can share. Its brand will appear here."
              icon="discover"
            />
          )}
        </>
      ) : (
        <>
          <ResourceState {...list} retry={list.reload} />
          {list.data?.items.map((item) => (
            <ListingRow key={item.id} listing={item} />
          ))}
          {list.data?.items.length === 0 && (
            <Empty
              title="Room for something new"
              detail="There aren’t any listings here yet. Share an arrangement and invite people to explore it."
              icon="discover"
            />
          )}
        </>
      )}
      <Muted>
        Community listings. Potluck is not affiliated with the brands listed.
      </Muted>
      <Modal
        visible={filter}
        transparent
        animationType="slide"
        onRequestClose={() => setFilter(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#0006",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.blueCanvas,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              gap: 20,
              maxHeight: "85%",
            }}
          >
            <ScrollView contentContainerStyle={{ gap: 20 }}>
              <Title>Make it a good fit</Title>
              <Field
                label="Maximum monthly share ($)"
                keyboardType="decimal-pad"
                value={limit}
                onChangeText={setLimit}
              />
              <Action
                label="Show matches"
                onPress={() => {
                  const n = Number(limit);
                  if (!limit || (Number.isFinite(n) && n >= 0)) {
                    setMax(limit ? Math.round(n * 100) : null);
                    setFilter(false);
                  }
                }}
              />
              <Action
                secondary
                label="Clear filters"
                onPress={() => {
                  setLimit("");
                  setMax(null);
                  setFilter(false);
                }}
              />
              <Link onPress={() => setFilter(false)}>Close filters</Link>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Shell>
  );
}
