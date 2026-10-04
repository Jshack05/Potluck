# Splitfinder approved search screens — September 17, 2026

The user explicitly requested Figma implementation of the three approved image-generated boards, with a visible Map button that must not navigate anywhere. This is a new implementation, separate from the earlier deleted batch.

## Screen map

| Category | State | Figma node |
| --- | --- | --- |
| Spaces | Search entry | `1720:22982` |
| Spaces | Filters | `1720:23182` |
| Spaces | Results | `1720:23324` |
| Spaces | No results | `1720:23481` |
| Experiences | Search entry | `1720:24882` |
| Experiences | Filters | `1720:25065` |
| Experiences | Results | `1720:25168` |
| Experiences | No results | `1720:25297` |
| Memberships | Search entry | `1720:25417` |
| Memberships | Filters | `1720:25600` |
| Memberships | Results | `1720:25708` |
| Memberships | No results | `1720:25837` |

## Design and behavior

- Twelve 430 × 932 screens on 03 Screens, with linked reusable content sources on 02 Components.
- Search headers, suggestions/recents, category filter fields, photo-led results, and no-results recovery layouts.
- Spaces includes vertical Beds, Baths, and Roommates selectors, move-in timing, lease length, location/distance, and monthly share.
- Experiences and Memberships have their respective category filters and explicit per-person price units.
- Shared navigation connects category results, search entry, filters, and the primary matching suggestion; filter completion returns to the category results.
- Three starting points identify the approved search flows.
- Spaces Map button has zero reactions, including descendants. No map screen exists or is implied.

## Boundaries and validation

### September 18 refinement

Enlarged the actual search icon geometry in all three no-results components, centered the icon in its illustration area, and applied the former pale-blue background color directly to the glyph without the circular fill. Experiences now prompts users to start their own experience: its primary Create an experience action opens the existing experience creation form (`1246:8693`), while Adjust filters remains as the secondary action. Verified the rendered Experiences screen and both navigation destinations.

Native editable Figma content with illustrative listing data. Search input, filter selection/reset, chip removal, sorting, saved-search alerts, and inventory are application implementation work; these layouts do not simulate those services by cycling labels. Existing screens were preserved.

Visual checks covered the three result layouts, all three filter panels, search entry, and empty state. Structural validation confirmed all twelve screen sizes, linked body instances, vertical content viewports, no missing navigation destinations, and zero Map reactions. No application code changed; application tests were not applicable.

## September 22, 2026 — Main discovery search header

Replaced the original Discovery banner on the main Spaces (`1209:6796`), Experiences (`1209:6860`), and Memberships (`1209:6924`) screens with linked instances of the approved search header (`1717:24177`). People / Plans / Possibility, the tagline and banner Lucky no longer appear on those main screens. Category-specific placeholder text replaces the sample query. Search and Filters open the existing corresponding category entry/filter frames. Content viewport starts at y188 and retains its bottom boundary at y816; existing content and bottom navigation remain. Verified the three component links and reactions and rendered Spaces/Memberships. This updates the original prototype entry screens; it is Figma navigation, not runtime search implementation.
