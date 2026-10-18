# GitHub Pages publication

Repository: https://github.com/mightora/hero-academy-moneyquest

Canonical game URL: https://moneyquest.heroacademy.app

The repository contains a static `dist/` app and a GitHub Pages deployment workflow. In repository **Settings → Pages**, select **GitHub Actions** as the source. Add **moneyquest.heroacademy.app** as the custom domain, save, and enable **Enforce HTTPS** after GitHub finishes issuing the certificate. Run **Deploy MoneyQuest** from Actions if the initial workflow ran before Pages was enabled.

DNS is a DNS-only CNAME for `moneyquest` to `mightora.github.io`. The CNAME must not include a repository path. The `dist/CNAME` file also records the intended domain, but GitHub ignores CNAME files for Actions deployments: the custom domain must be set in repository Settings.

No build or runtime secrets are required. The workflow runs tests, checks JavaScript and publishes only `dist/`. ChoreQuest API credentials are created interactively for a hero, never put in the repository or Actions secrets.

The existing MoneyQuest parent-code integration remains usable through **My hero → Connect ChoreQuest**. The shared central-account client is included, but it starts only for a central launch or an existing central connection. The coordinated ChoreQuest release in https://github.com/mightora/hero-academy-ChoreQuest/pull/2 must be approved and deployed before the new Games dashboard and private launch QR become available. This publication does not merge or deploy that wider draft release.
