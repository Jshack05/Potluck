import { router } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import {
  filterListings,
  listings,
  categoryLabels,
} from "@/features/splitfinder/model";
import { usePreview } from "@/features/splitfinder/state";
import {
  Button,
  colors,
  Heading,
  ListingCard,
  Note,
  Panel,
  Screen,
  s,
  Txt,
} from "@/features/splitfinder/ui";
import { SearchRow } from "@/features/splitfinder/search-row";
export default function Discovery() {
  const state = usePreview();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [subcategory, setSubcategory] = useState("All");
  const activeSubtype =
    state.category === "subscriptions" ? subcategory : "All";
  const [limit, setLimit] = useState<number | null>(null);
  const results = filterListings(
    listings,
    state.category,
    state.query,
    state.maxMinor,
    activeSubtype,
  );
  return (
    <Screen
      title="Splitfinder"
      hero
      back={false}
      headerContent={
        <SearchRow
          value={state.query}
          onChangeText={state.setQuery}
          placeholder={`Search ${state.category === "housing" ? "spaces" : state.category === "all" ? "opportunities" : state.category}`}
          filtered={state.maxMinor !== null}
          onOpenFilters={() => {
            setLimit(state.maxMinor);
            setFiltersOpen(true);
          }}
        />
      }
    >
      <View style={[s.row, { justifyContent: "space-between" }]}>
        <Heading style={{ fontSize: 24, flex: 1 }}>
          {categoryLabels[state.category]}
        </Heading>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change category"
          onPress={() => {
            setSubcategory("All");
            router.push({ pathname: "/", params: { change: "1" } });
          }}
          style={{
            minHeight: 44,
            justifyContent: "center",
            paddingHorizontal: 8,
          }}
        >
          <Txt style={{ color: colors.blue, fontWeight: "600" }}>Change</Txt>
        </Pressable>
      </View>
      {state.category === "subscriptions" && (
        <View style={[s.row, { gap: 8, flexWrap: "wrap" }]}>
          {["All", "TV & movies", "Music", "Software"].map((value) => (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityState={{ selected: subcategory === value }}
              onPress={() => setSubcategory(value)}
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <View
                style={{
                  backgroundColor:
                    subcategory === value ? colors.blue : "white",
                  borderRadius: 17,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                }}
              >
                <Txt
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: subcategory === value ? "white" : colors.ink,
                  }}
                >
                  {value}
                </Txt>
              </View>
            </Pressable>
          ))}
        </View>
      )}
      {results.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
      {!results.length && (
        <Panel>
          <Heading>No matches yet.</Heading>
          <Note>Try another search or remove a filter.</Note>
          <Button
            label="Clear search and filters"
            onPress={() => {
              state.setQuery("");
              setSubcategory("All");
              state.setMaxMinor(null);
            }}
          />
        </Panel>
      )}
      <Button
        label={`View saved listings${state.saved.length ? ` (${state.saved.length})` : ""}`}
        secondary
        onPress={() => router.push("/saved")}
      />
      <Note>
        Illustrative listings from the designs. Live opportunities will appear
        when the backend is connected.
      </Note>
      <Modal
        visible={filtersOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFiltersOpen(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "#172B3D66",
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close filters"
            onPress={() => setFiltersOpen(false)}
            style={{ flex: 1 }}
          />
          <Panel
            style={{
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              paddingBottom: 36,
            }}
          >
            <Heading>Monthly share</Heading>
            <Note>Maximum estimated amount per person</Note>
            {(state.category === "housing"
              ? [null, 80000, 90000]
              : [null, 1000, 3000, 4000]
            ).map((value) => (
              <Button
                key={String(value)}
                label={`${limit === value ? "Selected: " : ""}${value === null ? "Any amount" : `$${value / 100} or less`}`}
                secondary={limit !== value}
                onPress={() => setLimit(value)}
              />
            ))}
            <Button
              label={`Show ${filterListings(listings, state.category, state.query, limit, activeSubtype).length} results`}
              onPress={() => {
                state.setMaxMinor(limit);
                setFiltersOpen(false);
              }}
            />
            <Button label="Reset" secondary onPress={() => setLimit(null)} />
          </Panel>
        </View>
      </Modal>
    </Screen>
  );
}
