# Full-app capability register

Snapshot: October 4, 2026, during implementation. Local records are real persisted development records. This register must be updated with final validation evidence; it is not a claim that the master plan is complete.

| Capability | Current status | Remaining boundary |
|---|---|---|
| Four-tab shell, shared identity and Inbox | Implemented locally; browser checked at 430px and 320px | Physical-device and hosted validation |
| Local accounts, sessions, role authorization | Implemented; API tests | Real email/Apple account setup and recovery |
| Circles, invitations, separate membership | Implemented; API and browser checks | External invitation delivery |
| Circle privacy, leave/remove, hosting transfer, archive | Implemented; transfer and independent-ownership tests | Complete UI verification |
| Bill proposals, equal/custom shares, Fixed/Flexible maximum | Implemented; integer cents and role tests | Provider-specific variable-payment execution is separate |
| Individual accept/decline/cancel and revised terms | Implemented; stale-consent and history tests | Provider-specific payment authorization remains separate |
| Bill connection, end, month/week planning | Implemented; date tests | Payment occurrences/settlement require provider facts |
| Card setup and connection | Implemented; no issued credential or fake balance | Approved issuer program |
| Funding, automatic contributions and money movement | Unavailable, denied by server | Written approval, provider integration and lifecycle tests |
| Card controls, real-time authorization, ledger reservations | Not active | Documented provider identifiers, response codes, timeout/fallback and clearing behavior |
| Trusted Spender credentials | Unavailable | Separate issuer eligibility/grant/consent and secure display |
| Managed/minor spenders | Pending qualification | Explicit supported household/minor program; never inferred from an adult card |
| Goal/Pledge variants | Inventoried, not enabled | Accepted goal/final-payment specification and net-settled provider events |
| Brand directory, real listings, public profiles, saved items | Implemented locally | Public launch moderation and eligibility review |
| Requests → conversations → separate Circle invitation | Implemented; API and browser review | Push/email delivery and production abuse operations |
| Listing drafts/edit/publish/close | Implemented locally | Production media storage and verification |
| Housing publication | Drafts only | Real identity-verification adapter and private media/location handling |
| Reporting/blocking | Stored and enforced for interactions | Operational moderation owner and case handling before public launch |
| Bill import and external account data | Not connected | Source-specific consent, provider/import specification and deduplication |
| Plus/Premium | Deliberately not implemented | Explicit later approval; core remains ungated |

Changing a Circle connection does not grant a financial role. Circle hosting transfers do not transfer Cards, Bills or provider accounts. Removing membership never erases independent agreements. No module may fabricate provider state to make a downstream screen appear complete.

## Validation checkpoint

The full validation command passed formatting, both strict type checks, mobile lint, 21 backend tests, 13 mobile/model tests and iOS/Android/web exports before the final additional blocked-invitation regression. That regression also passed independently. The release gate failed on the mobile dependency audit: 30 findings (19 high, 11 moderate); backend audit found zero. Final independent review and any resulting fixes are recorded in the delivery status.

Browser checks used disposable QA identities: guest category discovery, contextual sign-in, Circle invitation acceptance with private Card/Bill isolation, Circle-to-Bill creation, selecting an existing Card setup, individual agreement acceptance, and accepted-share planning at 320px. These are browser observations, not native-device or financial-program certification.

Remaining work includes the full legacy authentication/import/role screen audit, production account recovery/Apple sign-in, private media and housing verification, unread/delivery operations, provider-backed occurrences and funding, and physical-device validation. No master milestone covering these is marked complete.
