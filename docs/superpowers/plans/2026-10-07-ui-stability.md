# Shared UI stability implementation plan

Approved in chat on October 7. Continue existing flows; no new product flows.

## Scope and safeguards

Audience: authenticated organizers and invited members. Promise: consistent navigation and truthful loading, without losing your place. Free/core; existing invitations support acquisition, reliable recurring organization supports retention, and connected Circles distinguish Potluck from a passive tracker. Paid conversion remains deferred. Measure tab layout stability, first-content latency and successful creation/import entry.

Presentation only: preserve authentication, permissions, optional banking, integer amounts, consent, provider boundaries and stored records. No migration, provider operation or new dependency is intended. Goals are removed from Cards; future Bills/Circle placement is not implemented.

## Tasks

1. Shared layout: one persistent main-tab navigation, reusable header actions, 430 reference viewport, no cream inset border, unchanged public routes and keyboard-independent navigation.
2. People sheet: immediate stationary scrim and independently animated sheet, reduced motion, inside/outside tap safety.
3. Bills states: persistent All bills / Shared tabs, Shared default, original scoped empty artwork, one 284x66 responsive Figma import button; remove Your Goals from both Cards states.
4. Loading: shared accessible skeleton primitives with screen-specific geometry; initial/empty/error/refresh distinctions, no false financial zeroes, no loss of drafts on refresh.
5. Figma: update source components and linked instances, remove verified obsolete navigation layers, normalize relevant backgrounds/header placement, update empty Bills tabs and loading examples; render and inspect.
6. Verification: targeted behavioral tests per batch, phone-sized browser checks, full repository gate, fresh final review, intentional commits. Physical iPhone animation/keyboard verification must be explicitly distinguished from browser/export evidence.

## Review focus

- Delayed empty response must not show a populated summary or change chrome.
- Refresh and failed refresh must preserve only the current user's already authorized data.
- Rapid navigation, keyboard and large text must not resize or hide controls.
- Modal dismissal/reopening must not retain a stale animation callback or allow tap-through.
- Figma component changes must not break prototype targets or detach instances.

## Rollback

Starting commit: 4eccded321e21a05a6bb4c8c0c66c91b5290eb02. Revert this branch's UI commits without deleting local databases, migrations, arrangements or audit records. Record Figma before/after IDs in the implementation report; restore prior component geometry and affected frame layers through Figma version history if needed. Do not merge automatically.
