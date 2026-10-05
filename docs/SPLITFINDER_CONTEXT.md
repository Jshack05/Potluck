# Splitfinder

## October 5, 2026 — Entry in the combined app

The founder now requires account entry and bank connection before any full-app destination, including Splitfinder. This supersedes browse-first/contextual registration for the current combined app. A future Splitfinder-only release can revisit that policy through an explicit decision. Brand-only discovery, individual listings, requests opening conversations, and separate Circle invitations are unchanged. See `PRODUCT_CONTEXT.md` for provider-confirmation and consent boundaries.

## September 24, 2026 — Header and listing refinements

For the new subscription listing screen (`1763:24097`), the header should blend with the feed canvas rather than end in a contrasting decorative banner. The card status must retain right padding and an unclipped green dot. These refinements are scoped to the new reference-card screen/component, not a replacement of every existing Splitfinder header.

**Future app behavior:** hide the discovery header as the user scrolls down; reveal it as they scroll up. Keep it visible at the top of the feed. This is a saved interaction requirement, not implemented direction-aware scrolling in Figma or application code. Define animation thresholds and keyboard/focus handling during implementation.

**Latest pricing clarification:** compare the total shared plan bill with the person's share; savings equal total monthly bill minus that share, annualized at unchanged rates for 12 months. Do not require a database of individual-subscription prices. This supersedes the individual-option baseline in earlier research notes below. Listing status can be Active, Starts when full, or a specific start date. The additional Needs X more people to start explanation belongs on detail after opening the listing.

## September 23, 2026 — Onboarding and listing priorities

First opening offers single-select Plans, Memberships, Subscriptions, and Spaces, then immediately opens opportunities in the chosen category. Plans focus on phone plans, not internet. Users can switch categories later using Change; do not duplicate it with a dropdown arrow. This supersedes older category/onboarding descriptions for the current launch direction.

Scrolling subscription listings prioritize service/plan identity, per-person monthly cost, whether that cost depends on filling the group, filled/open spots and active/forming status, and savings versus a comparable individual option. No faces or organizer names on these listings; introduce the organizer on detail. Show material price conditions readably and label annual savings assumptions. Do not invent occupancy, live prices, savings baselines, or trust signals.

**User-confirmed brand:** Potluck green/teal; Splitfinder blue. Purple in the September 23 generated prototypes was assistant drift and is not approved. Use existing theme tokens and dark headings. Earlier blue/lilac decorative artwork does not authorize purple controls or prices.

The [onboarding record](2026-09-23-onboarding-research-and-decisions.md) and [listing-card research](2026-09-23-listing-card-research-and-critique.md) preserve sources, limitations, and proposed refinements. Exact spacing, smaller service identifiers, and CTA treatments remain suggestions to test. These notes do not implement or authorize new screens.

## September 20, 2026 — Splitfinder-first launch scope

**Launch with Splitfinder for housing and bills**, including subscription/membership group discovery, starting campus by campus from Georgia Tech. Full financial Potluck remains the longer-term destination, contingent on funding, provider/bank support, consent and implementation readiness. Experiences are possible later scope. Initial launch does not promise virtual cards, banking, pooled funds or automated collection. The intermediate coordination release and discovery-only navigation remain open.

Read the [consolidated launch and conversation decisions](2026-09-20-launch-and-conversation-decisions.md) for features, design preferences, naming candidates, dated branding research and unresolved questions. This update supersedes conflicting older initial-product assumptions below; it records decisions only and does not implement screens or services.

## Naming shortlist and shared-purpose direction — September 18, 2026

The user's strongest replacement-name contenders for Splitfinder are **Team Up**, **Gather**, and **Make Plans**. **Find Your People** remains a possible alternative, but the user considers it a bit long. No final name is selected; do not rename the app navigation or Figma screens yet. Experiences remains acceptable as a category name.

The section brings people together around a shared purpose, including students finding company for campus events, concerts, housing, and shared memberships or bills. The user confirmed an opportunity-first path: find an event, then find the people attached to it. Whether invitations should be grouped under a common event in search remains unresolved; do not treat the proposed grouped-event model as approved.

## Search and discovery direction — September 17, 2026

**Later explicit implementation request:** The user approved implementing the image-generated search boards in Figma. Twelve new category search, filter, results, and empty-state screens are recorded in [the approved search screen map](ui-concepts/2026-09-17-splitfinder-approved-search-screens.md). Spaces includes a Map button with no destination, as requested. Actual search services remain future app work. The earlier record-only restriction below describes the original request, not this later authorization.

**Saved requirements only.** The user intends these features for the actual app. This request authorizes recording the direction, not creating screens or implementing behavior now. When screen work is requested later, design the actual destination pages and reusable controls that the app will use. Do not substitute feature-demonstration pages, fixed example-query buttons, fake result counts, or controls that merely cycle labels for the intended interface. Design states can show illustrative content, but must not be represented as working search. “Prototype” means image-generated visual concepts; build in Figma only when explicitly requested.

### Features to carry into future app work

- Search across Spaces, Experiences, and Memberships, positioned in the header space formerly occupied by People / Plans / Possibility and the decorative smiley. Include an in-field clear control, suggestions, and recent searches.
- Compact quick filters plus an All filters control. Use category-specific fields within a consistent layout. Include Apply/Show results and Reset, selected-filter chips with individual removal, Clear all, result counts, and a separate Sort control.
- Photo-led listing cards occupying most of the results screen. Show estimated share per person with an explicit time basis; show total rent secondarily for housing. Housing cards include primary photo, neighborhood, beds/baths, move-in timing, and roommates sought.
- Spaces: location/distance, estimated monthly share, move-in date/range, beds, baths, roommates sought, and lease length. Preserve the requested up-arrow / number / down-arrow controls for beds, baths, and roommates. List/Map viewing is a future app requirement; exact-address exposure remains subject to the existing unresolved privacy decision.
- Experiences: destination/location, estimated share per person, date/range, activity type, group size, and planning/ready-to-join status.
- Memberships: service/type, estimated recurring share, billing frequency, online/location-based, availability, and planning/ready-to-join status.
- Sorting: Recommended, Newest, Lowest estimated share, and Nearest where meaningful. Ranking policy remains unspecified.
- No-results recovery through editing the query, broadening criteria, or removing filters. Preserve the user's query and criteria through navigation and recoverable errors.
- Saved searches and optional new-match alerts are intended future capabilities. Shared saved-place shortlists are a later collaborative capability, distinct from a poster's separate alternative-property posts. Release sequencing remains open.

### Future screen design scope

Design discovery/results pages, the focused search-entry state, the filter panel, list/map views for Spaces, saved-search/shortlist destinations when scheduled, and appropriate empty/loading/error states. These should be the actual app surfaces and elements with clear intended behavior, not separate stand-in demonstrations of each feature. This note does not authorize any new design or code work today.

Purpose: help people find relevant shared arrangements and reach useful conversations. Keep the core discovery experience ungated. Saved searches support repeat discovery, and shared shortlists support group decisions; search-to-inquiry conversion is a proposed measure, not a validated outcome. No new paywalls, verification policy, financial consent, or money-movement behavior is introduced.

## Residential rental discovery — September 15, 2026

### Follow-up: exact move-in timing and search filters

The user superseded the earlier messaging-only move-in decision: residential posts now support an exact move-in date, particularly for students and renters with fixed timing. The date is shown on the post and in discovery/profile cards. A move-in field and reusable calendar are added to all three property-entry paths. Whether the date must be mandatory for every production post was not separately decided.

Housing browse now includes Filters. The prototype supports a move-in range (from/through, inclusive; the same day means an exact-date search), maximum estimated monthly share, minimum beds/baths, and minimum roommates sought. Clear filters, combined matching, an invalid-range message, and a no-results state are included. Calendar examples cover January and February 2027; full runtime calendar/input behavior is future application work. There are now 24 connected residential screens. See the [updated implementation record](ui-concepts/2026-09-15-residential-splitfinder-implementation.md).

**Figma implementation:** The approved residential flow now has 21 connected screens, documented in the [screen map and validation record](ui-concepts/2026-09-15-residential-splitfinder-implementation.md). The housing form uses the requested vertical up-arrow / number / down-arrow controls for beds, baths, and roommates. Reusable sources remain in 02 Components and linked screens in 03 Screens. The new Spaces discovery entry opens housing browse (`1662:23381`); the existing Living planning choice opens property entry (`1662:22425`). Figma demonstrates counters, post alternatives, profile selection, inquiries, ID gating, and manual removal; operational services and arbitrary form input remain unimplemented.

**Status:** Approved user decisions with the Figma implementation described above; backend behavior remains future work. This section supersedes conflicting older residential discovery requirements below; financial verification and consent rules remain separate.

### Purpose and structure

Primarily for students, renters, and people seeking roommates before committing to a rental, not joint property purchase. Working wording: **I'm looking to split this**; the final feature name is not locked. A poster chooses **1–3 properties** they would live in and creates the posts together. **Each property appears as an individual post in search.** Search and individual post details do not reveal the poster's other options. Related posts may be grouped on the public profile, where a visitor can express interest in multiple places at once. Each property has its own price and roommates-needed information; these are alternative homes, not multiple commitments.

### Saved answers

**September 15 verification presentation follow-up:** Introduce ID verification only after the poster finishes composing and taps Publish. Do not display an up-front verification disclaimer in the form or review. Verified posters publish directly; unverified posters enter verification with their draft preserved. Verification remains required before a post becomes public.

1. **Posting:** Anyone may post, including prospective roommates, existing tenants, landlords, agents, and apartment communities, subject to poster ID verification. Apartment partnerships are a future ambition, not an existing arrangement.
2. **Contact:** Users can immediately send a DM and get started, without acceptance before chatting. Preserve property context in the existing Splitfinder inquiry channel.
3. **Verification:** **Only posters require ID verification for residential discovery.** Browsers and people sending inquiries do not require ID verification for those actions. This supersedes the earlier suggestion that message senders must be verified and older blanket discovery verification language. ID is the current scope; additional checks may be planned later. The intent is to reduce scams; ID verification is not a guarantee of conduct or proof of property authority. No verification provider/process was selected. Separate financial-feature verification requirements are unchanged.
4. **Price:** Show **total rent and estimated share**. Potluck calculates the estimate and the poster may override it. The automatic calculation's default headcount/denominator remains to be specified; do not invent an assumption that the poster always lives there or all occupants are being recruited. An advertised estimate is not an accepted contribution agreement.
5. **Required fields:** Address, rent, roommates needed, and lease length. Introduction is optional. The later move-in timing decision above adds exact-date entry/display and search filtering, superseding the original messaging-only treatment. Mandatory-date policy remains unspecified.
6. **Property entry:** Address and optional website; an original rental listing URL is not required. Public exact-address visibility was not decided by these answers; retain the existing approximate-location display pending a separate decision. Photo requirements were not reconsidered here.
7. **Closure:** The user takes down the post once all roommates are found. No automatic spot countdown, matching confirmation, or automatic closure is required for this flow.
8. **Visibility:** Posts are public and active housing posts are visible on the poster's profile. Older generic audience choices do not add a private-audience option to this residential flow.
9. **Boundary:** Introductions and planning only. Applications, leases, deposits, and purchases are outside this approved flow. Potluck may advise use of its cards and shared bills afterward, but use is optional. Interest/messages do not create a Circle, obligation, or spending permission.

### Product purpose and open work

The promise is to find people interested in the same rental before committing. Separate searchable posts bring renters into conversations; optional apartment partnerships are a future acquisition opportunity. Voluntary transition to Circles/cards/shared bills supports recurring use. Keep the existing core discovery scope without new paid gates. Suggested measures are qualified inquiries, successful group formation, and separately voluntary shared-bill adoption; no new metric threshold is approved. Before implementation, specify the estimate denominator/override presentation and verification operations. These saved decisions do not imply newly implemented Figma screens or backend services.

## Planned profiles and reputation — September 13, 2026

User-requested profile features: name, profile picture, an optional short bio, a Potluck-generated contribution-behavior measure for Splitfinder (temporarily called **reliability**), and a separate member-to-member rating/review feature. These are distinct signals; member ratings do not replace recorded contribution behavior. Profiles use Potluck green with warm neutral backgrounds across entry points, rather than Splitfinder blue. The public bio is hidden when empty, with its space collapsed.

The approved profile prototypes are implemented in Figma as Member profile (`1540:19118`), Contribution track record (`1540:19120`), and Member reviews (`1540:19122`). Reusable sources remain on `02 Components`, with undetached instances on `03 Screens`. The member profile links to the two detail screens and the existing Jordan Lee direct conversation. Names, bio, review text, and portrait fills are editable; the identity component exposes a Show bio property. This is a Figma implementation only, not a production reputation or messaging service. Displayed counts, dates, tiers, and reviews are illustrative. Calculation-help, review-policy help, and overflow-menu destinations are not implemented in this three-screen scope.

The approved visual direction uses a descriptive contribution tier supported by counts and a timeframe, separate from member-review stars. Open decisions include tier thresholds, calculation rules, evidence requirements, review eligibility, privacy/visibility, appeals, and whether private or non-Splitfinder arrangements count. The prototype does not establish approved scoring policy.

For the comprehensive feature reference, category fields, decision history, visual previews, full screen inventory, implementation boundaries, and open questions, see [splitfinder.md](../splitfinder.md). Keep that reference synchronized with this concise approved context.

Approved product decisions, September 8, 2026. These decisions supersede earlier discussion that limited discovery to imported bills or placed Circles in the center of a three-tab navigation.

## Purpose and placement

Splitfinder connects people who are open to sharing an arrangement with people they do not already know. Its categories are **Spaces, Experiences, and Memberships**. Spaces covers living and working arrangements, including apartments, offices, and studios. Experiences includes trips and activities. Memberships covers suitable shared plans. Routine grocery splitting is not a discovery category. Joint property ownership is not part of the approved scope.

The navigation is **Circles · Cards · Bills · Splitfinder**. Circles is leftmost and remains the default. Splitfinder is independent of the other destinations; publishing or messaging does not automatically create a Circle, Card, Bill, spending right, or financial obligation.

Page headings retain dark text. The green/blue heading-color experiment was reverted at the user's request; do not reapply it. The user subsequently approved a distinct Splitfinder title and font size: Splitfinder-titled screens now use a reusable 36px Inter Bold wordmark in dark ink (#172B3D), while other page headings retain their existing typography. Body text and global Inbox headings remain charcoal.

Splitfinder now uses the approved light-blue palette for its canvas, prices, active tabs, action buttons, icon accents, and selected navigation state. The `Splitfinder / Light blue` mode in `Potluck Theme Tokens` is applied only to Splitfinder screens and its inquiry inbox. Accent #287AAA, selected surface #E4F1FC, canvas #F2F9FD. Headings stay charcoal. Circles, Cards, Bills, general messages, and invitations keep the default Potluck palette. Shared components retain their sources and respond to the screen's theme mode.

The approved blue/lilac style is now implemented: all three discovery categories use a 228px reusable banner with overlapping connection shapes, the promise “Find your next shared plan,” and blue Lucky. Other Splitfinder screens use a compact 112px crop of the same background. The listing cards use 192px photos, 24px corners, stronger headings, and commitment counts. Host names and avatars appear only after opening a listing's details; other participants remain anonymous. Existing listing, saved, category, create, and navigation actions are preserved. The generated preview's search/filter controls are not implemented by this visual update.

Reusable sources: `Splitfinder / Lucky / Blue` (`1271:11104`), `Splitfinder / Brand backdrop` (`1272:11096`), `Splitfinder / Discovery banner` (`1272:11100`), `Splitfinder / Wordmark` (`1272:11117`), and `Splitfinder / Listing host` (`1273:11386`), all in `02 Components`. Brand color, wordmark-size, photo-height, and card-radius tokens are in `Splitfinder / Brand` (`VariableCollectionId:1271:11096`). Lucky is decorative brand artwork here, not a financial-readiness indicator.

Validation of the style update: interaction snapshots match across all 56 affected Splitfinder frames; screen dimensions and checked navigation positions are unchanged; the non-Splitfinder screen comparison is unchanged; the two introduction wordmarks both sit at x20/y47 with a 186 x 44 size. Source-placement checks found no overlaps. The subsequent host-row removal leaves all four listing cards at 390 x 339, preserves host identities in details, and retains interaction snapshots across the three discovery screens, Saved, and four detail screens. See the [implemented Figma screenshot](ui-concepts/2026-09-08-splitfinder-brand-figma-v2.png).

**First visit:** opening Splitfinder for the first time shows an introductory landing page with a unified illustration of people sharing a table. Continue opens a second screen explaining Spaces, Experiences, and Memberships. Explore Splitfinder on that second screen records completion and opens discovery. Back returns to the first step. Later visits open discovery directly. Production persistence belongs to the authenticated user's account; the Figma boolean only demonstrates the routing state.

## Listings and discovery

- Listings come first. Hosts choose structured details; Potluck generates the heading. There is no freeform title field. Descriptions are allowed.
- The host may offer an existing arrangement or something still being planned. Use distinct Ready to join and Planning together states.
- Every listing requires at least one photo. Inspiration photos must not imply that an unconfirmed space or booking is secured.
- Audience choices are Friends, Friends of friends, and Public. Friends means contacts using Potluck. Public means eligible verified Potluck users.
- Identity verification is required to use Potluck. A verified identity is not a guarantee of conduct or a claim that scams are impossible.
- Office listings show an exact address. Apartment listings show an approximate location; exact addresses can be shared privately.
- People may privately save listings without contacting the host.

## Inbox and conversations

The global Inbox sits next to You wherever that account control is present. It has three separate sections:

1. Messages: ordinary direct conversations and Circle messages.
2. Splitfinder: listing inquiries, kept separate from ordinary conversations, like a marketplace inbox.
3. Invites: Circle invitations and their review actions.

Conversation identity: direct messages and Splitfinder inquiries use the other person's profile avatar, with their initial as the fallback. Circle conversation rows and headers use that Circle's own icon. Individual messages inside a Circle still identify their sender with a person avatar. The September 8 Figma update applies these identities across the inbox and conversation screens using `Messaging / Conversation row` (`1260:11050`) and reusable sender-avatar message components. The current fixtures use existing initial avatars; the interchangeable avatar property supports profile-photo sources.

Sending an inquiry starts a conversation immediately; acceptance is not required to start chatting. An inquiry retains its listing context. Sending a message does not join a group or accept contribution terms. Circle chats appear when the first message is sent. New Circle members see messages sent after they join.

Only the listing host approves joiners. A Circle is created or connected after people find each other. Joining and financial acceptance remain separate.

## Price and start conditions

- Show the maximum expected per-person share after splitting, including whether it is one-time or recurring and the billing period. More participants may lower it.
- Show the host's public identity and each person's portion to interested viewers. Other members use generic icons without names or photos until the viewer joins. Private bank details, identity documents, and unnecessary contact information remain private.
- Hosts may require a minimum number of people before contributions start. Count people who accepted the current contribution terms, including the host only after accepting their own terms. Interest or Circle membership alone does not count.
- Reaching the minimum does not automatically start collection. The host confirms the start; the accepted schedule, funding source, effective date, calculation method, and maximum still govern collection.
- Listings can remain open while the group forms. The host chooses whether to keep a listing open after starting.
- Falling below the minimum before starting blocks the start. The host may revise the arrangement and split rates, but affected people must accept the new terms before they count toward readiness.
- A higher share requires renewed acceptance and an updated advertised maximum. Never silently increase an obligation.
- Public per-person portions must not override existing anonymous-Circle privacy. Linking those arrangements needs a separately resolved consent/privacy design.
- Legally binding contracts between users remain undecided. No legal enforceability or provider approval is asserted by the Figma UI.

## Marketable purpose

- Target user: hosts with a suitable shared arrangement and people seeking a compatible group; payment for optional future convenience is unresolved.
- Promise: find people to share a space, experience, or membership with clear costs before committing.
- Acquisition: discovery and shareable listings bring new people into conversations, then consensual Circles and arrangements.
- Core placement: Free must provide a complete discovery, messaging, and consent path. No paid entitlements or upgrade UI are approved here.
- Future conversion hypothesis: optional scale, organization, and convenience after core adoption; never paid safety or consent.
- Retention: saved opportunities, ongoing conversations, and recurring arrangements reduce repeated coordination.
- Differentiation: combines finding a group with transparent portions and the subsequent consent-based shared-expense workflow.
- Primary metric: qualified inquiry to mutually accepted arrangement activation; track saved-listing return and successful group formation as supporting metrics.

## Current Figma scope

File: `1hAy3kcZAEvqq8ZNjKU7CD`. Reusable sources live in `02 Components`; linked instances live in `03 Screens`.

The implementation includes welcome, category discovery, office/apartment/experience/membership details, saved listings, separate inbox sections, inquiry composition and sent states, ordinary conversation views, and the category-specific listing creation flows below. Form fields and message drafts are populated, editable Figma design examples; keyboard entry, persistent drafts, uploads, publishing, and chat services are not implemented application features. Detailed host approval, contribution acceptance, moderation, and operational identity flows remain subsequent design work.

Key screens:

| Screen | Node |
| --- | --- |
| First-visit landing | 1209:6717 |
| Category introduction (step 2) | 1224:8773 |
| Spaces discovery | 1209:6796 |
| Experiences discovery | 1209:6860 |
| Memberships discovery | 1209:6924 |
| Office detail | 1209:6988 |
| Apartment detail | 1212:8306 |
| Messages | 1209:7268 |
| Splitfinder inquiries | 1209:7339 |
| Invites | 1209:7402 |
| Saved | 1209:7461 |
| New listing categories | 1209:8066 |

First-visit variable: `VariableID:1207:6491`. Saved-state variables: `VariableID:1211:8140`, `VariableID:1211:8141`, `VariableID:1211:8149`, `VariableID:1212:8297`. They represent Figma session state only.

Shared screen layout: the original 58 screens carrying the four-tab navigation, plus the 33 listing-creation screens below, use a 430 × 932 viewport and a 390 × 72 bar at x20/y832, leaving a 28px bottom margin. The bar is bottom constrained; long Bill and Splitfinder content scrolls inside an inner frame. Expanded Card screens previously placed the bar 8px lower. Screen and navigation dimensions are bound to the `Potluck / Shared screen layout` variable collection. Repeated Splitfinder information rows, price summaries, message panels, and listing setup panels use 12 reusable source components with text properties, replacing 58 repeated frames. Screen-specific conversation actions remain on screen instances.

Listing imagery uses illustrative Unsplash assets: photo-1497366754035-f200968a6e72, photo-1522708323590-d24dbb6b0267, photo-1464822759023-fed622ff2c3b, photo-1534438327276-14e5300c3a48. They are visual fixtures, not verified listings or confirmation of a provider's sharing rules.

## September 8, 2026 - Listing creation

The New listing category screen (`1209:8066`) now enters 33 linked screens. These use 33 reusable body components and a reusable labeled field (`1243:8767`) in `02 Components`, with undetached instances in `03 Screens`. Splitfinder retains its light blue theme; choosing an imported membership opens the green Bills context. All new screens use the shared 430 x 932 viewport, fixed header/footer, scrolling form body, and navigation at x20/y832.

### Category details

- **Spaces:** Living or Working; existing place or planning a search. Existing homes ask for street address, unit, city/region/postal code, country, and public neighborhood while keeping the exact address private. Workspaces show the business address publicly. Planned spaces collect search area and flexibility instead of implying a secured address. Living details cover room/home type, rooms, furnishings, amenities, accessibility, and practical household rules. Working details cover workspace type, capacity, area, access, facilities, and permitted uses. Both cover availability, term, deposit, cancellation/notice, and description.
- **Experiences:** Type, planning/ready status, optional organizer/provider, description, destination, country, venue or meeting point, travel arrangements, start/end dates and times, timezone, flexibility, decision deadline, inclusions/exclusions, accessibility/difficulty, booking/cancellation, and room arrangements where relevant.
- **Memberships:** Choose an imported bill or enter a provider/plan manually. Imported memberships route to Bills to select a charge or import another bill, then return to membership setup. Both paths collect provider/plan, description, local/online access, service area, individual access method, eligibility/sharing restrictions, renewal cadence, minimum commitment, cancellation, and price-change terms. An imported charge verifies the source of a bill, not permission to share a provider's plan.

### Shared completion steps

Pricing collects currency, total, cadence, inclusions, deposits, and excluded/uncertain costs. Group setup records minimum and maximum headcount including the host. The split summary shows the maximum advertised portion at minimum headcount, the host's portion, and the potential lower share at capacity. Listing prices describe a proposal; they do not activate a contribution agreement.

At least one photo is required. The gallery demonstrates photo selection using existing illustrative assets. Audience choices are Friends, Friends of friends, and Public. Review uses generated headings rather than a freeform title and allows category, price, photo, and audience edits. Publication requires accuracy and authority confirmations. The completion screen leads to listing management and inquiries; publication does not create a Circle or start collection.

Save and exit records the current step for Resume listing. Figma variables retain draft choices within the design session only. The photo gate, two publication confirmations, audience, plan status, selected imported bill, and resume routing are interactive. Populated form fields remain design specifications for later application input and validation.

| Flow entry or checkpoint | Node |
| --- | --- |
| Spaces: Living / Working | 1246:7862 |
| Home address | 1246:8105 |
| Workspace address | 1246:8186 |
| Experiences | 1246:8693 |
| Membership source | 1246:9031 |
| Bills selection for membership | 1246:10496 |
| Shared pricing | 1246:9457 |
| Group minimum / maximum | 1246:9552 |
| Split summary | 1246:9633 |
| Photos | 1246:9721 |
| Audience | 1246:9859 |
| Review | 1246:9955 |
| Publication confirmations | 1246:10077 |
| Published / manage | 1246:10251 / 1246:10323 |
| Saved draft / resume | 1246:10438 |

Validation: 46 evaluated Figma reaction cases passed, covering all 30 saved-step returns, photo requirement, all four confirmation combinations, category return paths, and ordinary versus membership-originated import completion with/without a selected bill. New navigation targets resolve; screen and source placement scans found no overlap. Representative forms and review were rendered for visual inspection. This validates the Figma design wiring, not production financial or form behavior.

