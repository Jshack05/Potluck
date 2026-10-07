# Blank-first loading follow-up

Approved in chat: replace skeletons with blank content for fast loads, preserving stable headers/navigation and current-resource content during refresh. Potluck keeps its beige canvas; Splitfinder keeps its current canvas. Only requests still pending after 500 ms show a small indicator. Resolved content is never delayed. Errors/retries, authentic empty states and explicit mutation/provider progress remain intact.

Target: all core users browsing their arrangements. Promise: content appears without speculative placeholders or flashing chrome. Free/core polish; no subscription or acquisition flow changes. Clear recurring access supports retention and first-arrangement completion. Measure loader flashes, content latency and layout stability. No financial calculations, authorization, consent, schema or provider changes.

## Implementation

- Replace shared skeleton output with one delayed-feedback component. Keep the sheet's reduced-motion hook.
- Key delayed feedback by resource/user identity; month/scope changes get a fresh delay. Cancel timers on unmount.
- Reuse this behavior in session restoration and Bills summary content. Keep summary controls present.
- Remove skeleton-only variants/tokens and update tests for blank initial rendering.
- Update the three existing Figma loading examples and add delayed-feedback counterparts. Remove skeleton sources only after checking all instance references.
- Verify timer threshold/cancellation, current content on refresh, errors, empty results, native bundle exports and responsive browser rendering; obtain a fresh read-only review.

## Evidence and review focus

Base: 38fe2d2e3897a8010ced8d4e0e7cb69d4a9248c2. Working tree was clean.

Four new tests failed before implementation: delay policy absent and new feedback component absent. After implementation, quick completion cancels feedback, 500 ms triggers feedback once, subsequent requests have independent timers, and the real component renders nothing initially. Existing summary controls/error/retained-total coverage is preserved with its expected first paint updated from skeleton to blank. Initial mobile suite: 50/50.

Review deliberately for stale timers across resource/user changes, accidental empty-state flashes, old month totals under new controls, loss of cached content, duplicate indicators, and incidental mutation/provider progress changes. No extra minimum display time is allowed.

Rollback: revert this follow-up commit; no database operation. Figma changes are separately recorded in the UI stability report and recoverable through version history. Keep the existing draft PR unmerged.

## Completion evidence

Implemented the approved scope. Figma sources/examples and removal evidence are in the UI stability report. Full validation passed 47 backend/domain tests, 50 mobile tests, formatting/lint/types and iOS/Android/web exports; its sole failing check remains the existing 23 mobile dependency-audit findings. Browser/harness checks confirmed blank first paint, no indicator on a 100 ms request, delayed feedback on a pending request, immediate removal on resolution and a fresh delay for subsequent requests. Independent review returned no actionable findings and passed 8/8 focused tests. Physical-device/screen-reader timing remains a manual release check.
