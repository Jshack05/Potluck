# October 2 app flow audit evidence

Start with [APP_FLOW_MAP.md](../APP_FLOW_MAP.md). This directory preserves a **partial** Figma inspection, not a completed implementation specification.

## Files

| File | Purpose |
|---|---|
| `index.html` | Standalone searchable explorer with embedded data; no network request is needed to read the captured data. Open normally in a browser. |
| `2026-10-02-screen-register.md` | All 786 captured frame/instance records with direct Figma links. |
| `2026-10-02-screen-inventory.json` | 495 direct frame/instance children of 03 Screens plus 291 continuation frames. |
| `2026-10-02-screen-reactions.json` | Complete extracted reaction trees for the first 240 records, with visible text and control visibility at capture. |
| `2026-10-02-connection-map.json` | Generated merged register and flattened transitions. |
| `2026-10-02-connections.csv` | One row per transition reference, including hidden controls and conditional branches. |
| `2026-10-02-coverage.json` | Counts, limitations, missing sections, and repository document hashes. The document hash index is not a claim that every indexed file was reviewed in full. |
| `2026-10-02-figma-inventory.json` | All 512 direct children of 03 Screens, including labels, sections, and decoration. |
| `2026-10-02-continuation-inventory.json` | All 293 direct children of the October 2 continuation section, including two text labels. |
| `2026-10-02-prototype-variables.json` | Partial dictionary: 162 of 612 non-color variables. Missing variable IDs must not be assumed false, empty, or unused. |

## Rebuild and validate

From the repository root:

```powershell
node docs/flow-audit/build-flow-audit.mjs
node docs/flow-audit/validate-flow-audit.mjs
```

The builder reads local snapshots only. It makes no Figma calls and changes no application code. Domain labels are automatic search aids; the human-written map distinguishes recommended product routing from captured wiring.

Validation on October 2 passed: inventory uniqueness and reaction coverage, embedded JSON counts, embedded JavaScript syntax, 461 Figma IDs used in the human map, 23 local document links, and 18 selected direct-transition claims. These checks do not verify the 546 uninspected reaction trees, live prototype clicks, visual layout, or backend behavior. Browser rendering of this HTML was not verified; the automated browser rejected local `file:` navigation.

## Resume without repeating completed extraction

The next reaction capture should start with the 546 IDs in `screen-inventory.json` that do not appear in `screen-reactions.json`, not reread the first 240. Also expand Authentication `955:4752`, Getting started `985:4904`, and Bill import `1052:5011`, and inspect for additional nested screen containers. Read review guide `2034:44493` and prototype notes before selecting canonical continuation variants.

Preserve full ordered actions, branch conditions, trigger types, control visibility, and the complete variable/binding dictionary. Capture source component IDs and parent relationships for referenced component targets. Do not label unresolved references as broken without looking up the target.

After obtaining the missing evidence, verify both actors and failure/return paths through live prototype interactions. Only then replace partial-coverage language with measured complete coverage. Figma quota exhaustion is the reason this audit stopped; no account upgrade or permission change was performed.
