# Optional ChoreQuest integration

## Parent flow

1. Sign in to ChoreQuest as a parent and create/select a child hero.
2. Open https://chorequest.heroacademy.app/api/games/moneyquest/link.
3. Select the household and hero, then create a MoneyQuest code.
4. In MoneyQuest choose **My hero → Connect ChoreQuest** and enter it.
5. On a new device, make a new parent-approved code for the same child. Choose **Continue ChoreQuest save** and confirm. Existing local progress can be exported before replacement.

The parent page includes a link back to existing NumberQuest connections. Codes are single use and expire in ten minutes. Tokens are scoped to a child, game and approved origin, expire after ninety days and can be revoked on the parent page. No email is needed by a child. Neither a parent session nor a household identifier is stored in MoneyQuest.

## What synchronises

The latest chosen MoneyQuest journey includes position, completed stops, day, wallet, savings, debt, practice records, nickname, outfit and local XP. Device access settings remain local. New first-stop completions credit **Hero XP**, never a money ledger or spendable chore balance. Earlier local XP is not credited when a hero first connects.

Save revisions protect against two devices replacing each other's work. Conflicts pause upload until the user explicitly selects a journey. Offline progress and stable XP events are kept on the device and retried. A token-free backup is available. A daily XP ceiling does not block saving position; pending events retry later.

Only one MoneyQuest reward per child/stop can be credited, including after retries and reconnects. Rewards are decided on the server from the stop number. The server ignores supplied point amounts and recipient IDs. It shares ChoreQuest's 5,000 game XP daily ceiling across NumberQuest and MoneyQuest. These remain self-reported game achievements, not verified learning or financially valuable rewards.

## Backend extension

API base: `https://chorequest.heroacademy.app/api/games/moneyquest`.

| Route | Purpose |
| --- | --- |
| GET /link, /link.js, /link.css | Same-origin parent management page and assets |
| GET/POST/DELETE /links | Existing authenticated parent/session, household permission and CSRF checks |
| POST /connect | Exchange one-time code; return game-only token, public hero fields and existing save |
| GET /profile | Public fields for the selected hero and XP totals |
| POST /events | `{id: "moneyquest:stop:00", level: 0}`; stable per-child/stop reward |
| GET /save | Read selected child's MoneyQuest save and revision |
| POST /save | `{expectedRevision: 1, state: {...}}`; reject stale revision with 409 and current save |
| POST /disconnect | Revoke this device's capability |

Approved game origins: the private playable Site and `https://moneyquest.heroacademy.app`. Localhost is enabled only in a development Worker. A different future host must be explicitly allowed before linking will work there. No broad CORS changes to parent or money APIs.

The accompanying ChoreQuest files are an additive extension. Apply **0012_moneyquest.sql only** to an existing database already using 0011. Do not reapply a recovered baseline to production. Preserve current Worker secrets, bindings and `AUTH_ENABLED=true`; deploy the updated index/games modules plus moneyquest.js and moneyquest-page.js. Existing NumberQuest connections and chores remain in their original tables. Tests require ChoreQuest's existing dev dependencies.

Game-only tokens live in a separate localStorage key, never in exported snapshots or URLs. The frontend includes no client secret. JSON saves are bounded, validated and scoped on the server; arbitrary extra fields are discarded. There is no claim of anti-cheat verification. Revoke unwanted connections in ChoreQuest; disconnecting retains the local journey. Clearing browser data removes local progress and connection capability but does not revoke a server-side connection, which a parent can revoke separately.
