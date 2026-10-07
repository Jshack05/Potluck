# Circle flow restoration — October 6, 2026

This restores the approved Circle flow in the local Expo app. Circle membership remains independent of Card ownership, Bill agreements, spending grants and bank setup. No financial operation is introduced.

## Source mapping

Figma file `1hAy3kcZAEvqq8ZNjKU7CD`; live design context and screenshots were inspected before implementation.

| App route / state | Figma source |
| --- | --- |
| `/circles` | 7:423 |
| `/create/circle`, selected people | 335:506, 542:1632 |
| Add people bottom sheet, compact / expanded | 488:1203, 488:1272 |
| `/circle/:id` | 218:314 |
| `/circle/:id/settings` | 2019:38309 |
| `/circle/:id/members` | 2019:38472 |
| `/circle/:id/invite`, review | 2019:38539, 2019:38592 |
| `/invitation/:id`, pending / canceled | 2019:38651, 2019:38713 |
| `/circle/:id/handover`, review | 2019:38862, 2019:38923 |
| `/circle-transfer/:id`, pending / recipient / accepted / declined | 2019:38973, 2019:39029, 2019:39103, 2019:39149 |
| `/circle/:id/leave`, completed | 2019:39313, 2019:39363 |
| `/circle/:id/privacy` | 2019:39408 |

## Persisted behavior

- Circle creation records selected users and email recipients as invitations in the same transaction as the new Circle. Every recipient must already have an account in this local build. A missing recipient rolls the whole operation back. Duplicate recipients are deduplicated by user ID and the combined selection is limited to 20.
- Existing Circles retain host-only invitations. The restored creation screen explicitly selects member invitations and host approval by default. A normal Circle member can suggest someone only while the stored setting permits it. Anonymous Circle invitations always require the Circle Host to initiate them.
- A suggestion moves from `awaiting_host_approval` to `pending` only through the current host's version-checked approval. The recipient must separately accept before membership exists. Host approval does not accept for the recipient. The original sender must remain a member and current invitation permissions, blocking and expiry are checked again.
- Sender/current host cancellation records `revoked`. Accepted, declined, canceled and expired outcomes remain readable to authorized actors. Host-handover pending and terminal records remain accessible to involved accepted members. No membership action transfers Card or Bill ownership.
- Anonymous members see themselves and the Circle Host; other members remain redacted. Member count is aggregate. Financial arrangement projections remain actor-scoped and are loaded separately.
- New assets and exact dimensions are documented in `my-app/assets/potluck/circle-flow/README.md`. All data-dependent names, invitation status, counts and amounts come from the API. Healthy financial faces and funded cards are not fabricated for unissued setup shells.
- A definitive API rejection (400/401/403/404/422) unlocks a creation draft for correction. Transport uncertainty, timeouts, server failures and idempotency conflict preserve the exact request for retry.

## Migration and rollback

`0006_circle_flow_settings.sql` adds icon/color and invitation settings with safe defaults for existing rows, and extends the invitation state constraint and active-invitation unique index. No records are deleted. Revert the UI/server code while retaining the columns and history; pending member suggestions must be resolved explicitly rather than silently promoted. No provider configuration is required.

## Limits and validation

The restored appearance choice uses the original people icon with persisted colors; uploading personal photos is not supported by the installed native dependencies or current profile API. Exact email lookup and permitted contact-name lookup are provided by `/people`; there is no phone or username directory. Invites arrive through Potluck Inbox; no email delivery is claimed. No finance-ready status is derived from a saved Circle or unissued Card.

Meaningful tests cover atomic creation and idempotent retry, member suggestion/host approval/recipient consent, actor spoofing, stale versions, expired suggestions, canceled invitations, transfer cancellation, anonymous redaction and preserved settings for older edit clients. Mobile tests cover deduplication/removal, invitation states, safe count text and creation-draft rejection/retry behavior. Integration-wide visual QA and physical-device verification are separate from these automated checks.
