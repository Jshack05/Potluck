# Potluck onboarding: research and approved direction

Recorded September 23, 2026 at the user's request. Image prototypes only are authorized by this task; no Figma or application implementation is claimed.

## Approved direction

- First opening: choose ONE category: Plans, Memberships, Subscriptions, or Spaces. This selects a starting destination, not permanent account preferences.
- Show relevant opportunities immediately after that selection. Eliminate the mandatory broad personalization questionnaire and separate streaming-preferences gate. Category and service controls belong on discovery screens.
- Plans focus on phone plans, not internet. Memberships may include theme-park passes, fitness, and clubs; examples are interests, not blanket eligibility approval for any provider's products.
- Explain Potluck's value through visible price comparisons: a comparable individual option costs X per month; this shared arrangement costs Y per person per month. Consider an annual savings amount.
- Keep category switching accessible after entry. Users can explore other categories later without restarting onboarding.
- Retain the discovery-first launch: no banking, virtual cards, automatic collection, or pooled funds promised.
- Preserve the brand distinction confirmed by the user: Potluck green/teal, Splitfinder blue. Purple in generated prototypes is not approved. Use existing theme tokens and dark readable headings.
- Subscription listings show numeric filled/open spots without faces or organizer names; introduce the organizer on detail. Use one Change action without a duplicate category dropdown arrow.
- Preserve the five listing decision questions and supporting studies in [the listing-card research and critique](2026-09-23-listing-card-research-and-critique.md). Layout measurements remain proposals to test, not universal research findings.

## Evidence and limitations

1. **Introductory tutorials:** Nielsen Norman Group tested four mobile apps with 70 participants (35 per condition). Task success was 91% with tutorials and 94% without; the difference was not statistically significant (p=.443). Perceived ease was 4.92 vs 5.49 out of 7, favoring skipping (p=.047). These were relatively simple tasks; this does not establish that tutorials never help. Prefer contextual assistance over mandatory welcome slides. [Original study](https://www.nngroup.com/articles/mobile-tutorials/)

2. **Clear outcome wording:** Duolingo reports that changing the Japanese onboarding wording from taking a placement test to checking one's English level doubled placement tests taken and improved retention. Sample size and retention lift were not disclosed. Subsequent global experiments also improved placement completion and retention. This supports testing relevant, understandable wording, not predicting a 2x improvement for Potluck. [Duolingo experiment](https://blog.duolingo.com/lessons-from-asia-turning-local-research-into-global-experiments/)

3. **Account friction:** Baymard reports 19% citing forced account creation as a checkout-abandonment reason. This is ecommerce survey evidence, not a causal app-onboarding conversion estimate. Recommend allowing public browsing and requesting an account for contact or publication while retaining the user's intended action. [Baymard](https://baymard.com/blog/reduce-cart-abandonment)

4. **Choice overload is conditional:** A 2010 meta-analysis of 50 experiments and 5,036 participants found an average effect near zero with substantial variation. A 2015 analysis of 99 observations and 7,202 participants identified complexity, task difficulty, preference uncertainty, and decision goal as moderators. Four categories are not inherently too many. Single select is approved as focused routing, not a scientifically proven universal optimum. [2010 study](https://doi.org/10.1086/651235), [2015 study](https://doi.org/10.1016/j.jcps.2014.08.002)

5. **Early engagement:** Amplitude's 2025 report covers roughly 10,600 products and 2,600 companies, using September 2023–September 2024 data. 69% of top-quartile seven-day activation performers were also top-quartile three-month retention performers. This is cross-product correlation; the activation measure concerns returning users, not finishing onboarding. [Report](https://info.amplitude.com/rs/138-CDN-550/images/the-product-benchmark-report.pdf)

6. **Contextual setup and permissions:** Apple recommends postponing nonessential customization and providing contextual instruction. Android recommends asking for permissions when the relevant feature is used. These are platform guidelines, not measured conversion lifts. [Apple](https://developer.apple.com/design/human-interface-guidelines/onboarding), [Android](https://developer.android.com/training/permissions/requesting)

## Recommended first-use behavior

First screen: “What would you like to split first?” Four clear tiles with examples; tap advances immediately. Optional Browse everything and returning-user sign-in. No required account, tutorial, or all-category interest form before public opportunities.

Category selection opens its real discovery screen. Subscriptions show groups plus service/type filters; Plans show phone-plan groups; Memberships show relevant pass/fitness/club arrangements; Spaces show housing and roommate opportunities with an editable location and move-in filters. A campus default must be visibly changeable and justified by entry context, not silently inferred from precise location. Preserve direct links to particular listings.

Use action-specific buttons such as View group, View place, or Message organizer. Keep selection/filtering optional where useful results are already available. Do not insert additional preference steps solely to fill onboarding.

Account creation at contact/publication, restoration of listing/draft afterward, contextual notification prompts, and optional manual location entry are design recommendations. Previously approved residential poster ID verification remains at Publish; inquiry senders do not need ID verification for browsing/contact. Do not silently extend residential verification rules to other categories.

## Honest savings presentation

Lead with the actual estimated shared price and billing period: “$10 / person / month.” Follow with a clearly described baseline, e.g. “Individual option: $18 / month.” Show “Save $8 / month” and, when supportable, “Potential savings: $96 / year.”

- Compare genuinely comparable plans, access, eligibility, region, currency, taxes, and fees. Do not compare a shared seat to a higher-tier individual product without explaining differences.
- Distinguish provider individual-plan price from the total cost of a shared plan. Do not label a whole apartment's rent as what a person would normally pay for an equivalent room alone.
- For housing, show total property rent, total occupants used in the estimate, and per-person estimate. Omit an annual savings badge unless a defensible comparable solo-housing baseline exists. Roommates needed is not necessarily total occupants.
- Include applicable fees in the shared cost or clearly state exclusions. Student discounts, promotions, or bundled benefits can change the best individual alternative.
- Annual potential savings = (comparable monthly individual cost minus monthly shared cost) × 12, only if those prices apply for 12 months. State the assumption; annualized savings are not a guaranteed outcome.
- Annual-billed passes must disclose the amount due annually if showing a monthly equivalent. Seasonal or limited-duration arrangements must not be projected as full-year savings without qualification.
- Prices may depend on filling all seats; make this visible. For existing versus planned groups, distinguish current price from the estimate at full occupancy.
- Production comparisons require a source, last-checked date, and supported eligibility. Do not fabricate live listings, partners, verified badges, provider prices, or savings.

## Prototype fixtures, not live offers

Use fictional unbranded services and a visible “Illustrative listings and prices” label for these image concepts:

| Fixture | Individual option/month | Shared cost/person/month | Monthly saving | Potential yearly saving |
|---|---:|---:|---:|---:|
| ScreenTime Plus streaming | $18 | $10 | $8 | $96 |
| SoundClub music | $12 | $6 | $6 | $72 |
| Connect Mobile phone plan | $60 | $35 | $25 | $300 |
| ParkCircle membership | $40 | $28 | $12 | $144 |

All calculations assume the same rates for 12 months and illustrative monthly billing. These fictional fixtures make no claim about any real provider's sharing permissions. Housing example: total rent $2,400/month, 3 occupants, estimated $800/person/month; utilities excluded; no fabricated individual-rent comparison.

## Validation

## Generated concept images

- [Single-select entry, subscription discovery, and group detail](ui-concepts/2026-09-23-onboarding/single-select-to-subscription-opportunities.png)
- [Plans, Memberships, and Spaces discovery destinations](ui-concepts/2026-09-23-onboarding/plans-memberships-spaces.png)

These are raster visual explorations, not implemented screens. Final UI should reconcile avatar counts with actual membership and show price-at-full-occupancy assumptions consistently. Navigation shown is conceptual, not a finalized launch navigation decision.

## Measurement

Measure first-open to relevant listing view, inquiry/post creation, time to useful content, inquiry replies, and successful signup return to intended action. Separate categories, supply availability, and traffic sources. Onboarding completion alone is not activation; successful housing users may naturally stop searching. Test savings comprehension as well as click-through: can users identify actual payment, baseline, headcount assumptions, billing period, and whether annual savings are conditional?

No universal screen count, conversion promise, or optimal completion-time benchmark was established by the research. The winning experience should be determined by meaningful contacts and completed arrangements, with accurate pricing and user comprehension as guardrails.
