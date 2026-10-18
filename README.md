# Hero Academy MoneyQuest: The Lantern Trail

A playable static adventure about earning, spending, saving and looking after your future self. Original story and environments; uses the hero, Pip and icon from the user's Hero Academy Reading repository. Working product name, not a trademark-clearance claim.

## Play

Thirty sequential stops across Meadowbrook, Willow Woods, Harbour Hollow, Cloudpeak and Lantern Isle. Twenty money decisions alternate with ten action challenges: stepping stones, firefly catching, pipe repairs, matching pairs, a harbour maze and gliding. Completing each region lights its beacon. Completed stops can be replayed for fun without changing money or earning extra XP.

Wallet, savings, borrowing and time carry through the journey. Each stop takes one to three game days; food and camp cost two currency units per day. Choice previews show the resulting wallet and savings. Children earn 50 XP for a first money stop and 25 for a first action stop, totalling 1,250 XP. No timers on money decisions, lost lives, daily-streak pressure, ads, purchases, analytics or third-party scripts. Quiet by default; speech starts on request. Pip can finish action challenges with the child.

For roughly ages 7–11, with adult support for younger children. Topics include needs and wants, income after expenses, unit prices, fees, recurring costs, repairs, savings, a simplified one-off interest bonus, borrowing, scams, profit, giving and goals. Outcomes are simplified game scenarios, not financial advice, a curriculum certification or an assessment of mastery. The academy provides support if necessary so money shortages do not prevent finishing.

## Learn, practise, then play

Every one of the 20 financial decision stops now opens a short illustrated concept lesson **before** the decision. Pip introduces the idea with a pair of visual examples and an optional Hear lesson button. A three-option, no-penalty check gives gentle help for wrong answers; a correct choice unlocks the actual stop. Practice never changes the wallet, savings, time, XP or cloud saves. Returning to a completed money stop repeats the lesson before replaying choices. The ten action stops continue as before.

The lessons are independent of save-format version 1; no database migration is required. The lesson module is pre-cached for offline journeys. Run `npm test` and `npm run check` before deployment. On real iPhones and iPads, verify the learning dialog fits at 1.3x text size, VoiceOver navigation, optional speech and touch focus.

## Run and host

No runtime dependencies or build. Serve **dist/** with any static host. ES modules need HTTP(S), so do not open index.html as a file URL. For a local server, run `python3 -m http.server 8000 --directory dist` from this folder and visit http://localhost:8000.

Cloudflare Pages build command: leave blank. Output directory: `dist`. GitHub Pages can deploy the contents of `dist/`. All asset paths are relative. `dist/_headers` contains optional Cloudflare security headers. No API secret is required in the game. A service worker supports offline visits after its first successful installation and caching; ChoreQuest requests always go to the network and never enter the asset cache.

One local hero is saved per browser profile. Grown-ups can choose GBP, EUR or USD display, adjust text, reduce animation, slow action challenges, export a token-free backup or restore one. Changing currency changes symbols only. Restore and reset require a connected hero to be disconnected first. Separate browser profiles are needed for different local children.

## Optional ChoreQuest

The recommended route is the [central Hero Academy account](docs/CENTRAL-ACCOUNT.md): open Games in ChoreQuest and launch MoneyQuest for the selected hero. Existing code-based links remain available; see [docs/CHOREQUEST.md](docs/CHOREQUEST.md). The game remains playable without linking. ChoreQuest runs the account backend; MoneyQuest remains static. Pretend game money never becomes pocket money.

## Verification

`npm test` checks progression, money arithmetic, 100 full journeys, save validation, offline queues, identity isolation, duplicate submissions, conflicts and revocation. `npm run check` checks JavaScript syntax. A DOM-based walkthrough exercised all 30 stops, help, rewards, settings, hero customisation, the connection form and replay. ChoreQuest's Miniflare tests exercise the real Worker and SQL migrations, including cross-device saves and existing NumberQuest regression tests.

No browser rendering or physical iPhone/Android test has been completed in this environment. Moving challenges need actual-device review for comfort, layout, speech and touch. A signed-in production parent/child connection has not been exercised end to end; production endpoint smoke checks are recorded in the handoff.

## Source and assets

Brand reference: https://github.com/mightora/hero-academy-reading/blob/main/BRAND.md. Hero, Pip and app icon are adapted/reused from that user-owned repository; original money scenarios, adventure map and minigames are provided here. No new open-source licence is asserted for the inherited artwork. Keep connection tokens and backups out of Git.
