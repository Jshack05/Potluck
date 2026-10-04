# Figma consistency cleanup — September 12, 2026

File: `1hAy3kcZAEvqq8ZNjKU7CD`.

Updated Foundations, reusable component sources, and screen overrides for Inter typography, semantic teal and canvas colors, bill tiles, bank-account icons, fixture avatar colors, radios, fields, information notices, status badges, and ordinary white card surfaces. The current standards are recorded in `docs/DESIGN_GUIDELINES.md`; they supersede older neutral-background and shadow experiments in flow concept notes.

Preserved the Splitfinder blue theme, custom avatar images, hero artwork, editable component properties, financial state distinctions, and prototype destinations. Compatibility sources remain available for existing instances with consistent visual treatment.

Canonical sources include Internet bill icon `249:446`, compact Internet bill icon `604:2279`, standard field `1077:5650`, neutral information card `1434:14389`, contributor avatar `1425:13538`, radio selected `1340:11932`, primary button `333:474`, and new pending funding summary row `1513:18550`.

Validation:

- Screen page: 243 top-level objects inspected; no non-Inter ordinary interface text remained (artwork and single-character icon glyphs excluded).
- Bill-tile radius checks match the shared proportions; fractional differences from instance scaling are below 0.01px.
- Prototype reactions unchanged: 137 on Components, 1,503 on Screens. Reaction hashes remained 3323206690 and 4103407544 respectively.
- No fixed screen controls exceeded their top-level screen bounds in the boundary scan; scroll containers and overlays were excluded intentionally.
- The added reusable funding status row has no top-level component overlap.
- Rendered representative Circles, Bills, Settings, Inbox, Splitfinder, allocation, proposal review, contribution payment, funding, and stopped-agreement screens, plus reusable control sources and active Foundations.
- Documentation whitespace validation passed. No application code or money-movement behavior changed; runtime tests were not applicable.
