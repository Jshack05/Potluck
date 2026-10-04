# Splitfinder search prototypes — September 17, 2026

**Removed at the user's request:** The 12 screen frames listed below were deleted and their three starting points removed. September 15 header preview links were restored to their earlier destinations. The implementation record below is historical. The user clarified that “prototype” means image-generated visual concepts; Figma implementation requires an explicit request.

Created the four requested states for Spaces, Experiences, and Memberships: 12 screens with reusable body components and existing shell/listing-card instances. The approved search-header previews now link to these flows.

| Category | State | Figma node |
| --- | --- | --- |
| Spaces | Search entry | `1702:22982` |
| Spaces | Filters | `1702:23060` |
| Spaces | Results | `1702:23146` |
| Spaces | No results | `1702:23234` |
| Experiences | Search entry | `1702:23314` |
| Experiences | Filters | `1702:23392` |
| Experiences | Results | `1702:23476` |
| Experiences | No results | `1702:23564` |
| Memberships | Search entry | `1702:23644` |
| Memberships | Filters | `1702:23722` |
| Memberships | Results | `1702:23806` |
| Memberships | No results | `1702:23894` |

Prototype behavior: query examples and clearing; suggestions and recent-search selection/clearing; selectable budget, type, and timing examples; Apply and Reset; result count; removable price/type/timing chips; Recommended versus Price: low to high; lower-budget no-results path; adjust filters, change query, and clear-all recovery. Spaces links to the previously built detailed housing filters. Existing post-detail screens remain the card destinations.

Boundaries: these are Figma fixtures, not live free-text search or backend matching. Query-field taps fill a category example. One listing per result state demonstrates the flow; sorting changes the selected sort label but does not demonstrate reordering a multi-listing dataset. Housing's detailed filter demonstration remains a separate existing flow. Filters use fixed example values; no production search policy, inventory, ranking, or eligibility is established.

Validation: 72 stored-reaction and viewport checks passed (query clear/fill, suggestions, matching/restrictive budgets, chip removal, type/timing toggles, sort toggling, recent clearing, reset/recovery, post links, 430 × 932 size and vertical scrolling). Visually reviewed all 12 screens. This is model-level reaction evaluation and screenshot QA, not browser or backend E2E testing.

Purpose: help discovery users reach relevant posts and conversations. Core access stays ungated; no payments, consent, or publishing verification changes. Search-to-inquiry conversion remains the suggested measurement. Original production discovery screens remain unchanged; September 15 preview entry points are connected to this new flow.
