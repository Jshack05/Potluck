# Full Potluck application boundaries

Status: implementing the approved October 4 integration plan. No bank or issuing approval is asserted.

The existing Expo app is the mobile client. A Potluck-owned TypeScript API mediates all mutations. PostgreSQL stores application state. Domain functions accept typed inputs and do not depend on mobile UI, HTTP, database, or provider SDKs. SQL migrations and transactions preserve records and invariants. Supabase Auth is the initial external identity adapter; its configuration is required for real email sign-in. Local development identities must be clearly labeled, explicitly enabled, and rejected in production.

Circles own membership. Bills own occurrences and individually accepted agreements. Cards own setup and separately approved spending roles. Splitfinder owns public listings and conversations. Attachment never implicitly grants another role. A funding Card is private to its host/approved spender; Bill contributors do not receive its balance or credential.

Local integration testing uses PGlite because this machine has no PostgreSQL server or Docker runtime. Deployment uses PostgreSQL through an adapter with the same migrations. Neither local persistence nor automated tests establishes hosted availability, production security review or provider approval.

Use a single TypeScript service plus transactional background work initially. Do not introduce distributed services for each tab. Authentication, delivery, file storage and financial integrations remain replaceable adapters. No direct mobile writes to financial database tables.

All financial capabilities are denied until a supported, approved program is implemented. A Card shell is setup-required, not issued. Agreement acceptance is not automatic bank authorization or settlement. No sample balance appears as real money.

No paid entitlement work. Target: hosts and invited contributors. Promise: bring people and agreed expenses together. Invitations and discovery provide acquisition; recurring clarity provides retention. Core workflow is free. Primary hypothesis: accepted arrangements remain active after 30 days. Safety and financial correctness are guardrails, not paid features.
