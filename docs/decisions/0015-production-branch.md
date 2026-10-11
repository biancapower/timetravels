# 0015. Production deploys from a production branch

**Context.** Under decision 0011, every merge to `main` deployed straight to timetravels.dev. A release then gated nothing: the user test and the release review looked at work that was already live, the version on the About page lagged behind what was deployed, and Dependabot's self-merging updates (decision 0005) reached production with no person looking at them. Release 0.1.0 showed this: its release review was planned for after the merge that put it live.

**Decision.** Cloudflare's production branch is `production`, set in the dashboard under Settings, Build, Branch control. Only the maintainer moves it, to the release commit, once a release has passed its user test and review; then they tag that commit. `main` and every other branch get preview builds as before, so the head of `main` is always on a staging preview address. This supersedes decisions 0010 and 0011 where they say `main` deploys production; the rest of both stands.

**Alternatives.** Keep deploying every merge and treat releases as labels on history: simplest, but the release steps would gate nothing. Release branches such as `release/0.2`: they earn their keep when one version is being stabilised while work continues, or when several versions are supported, neither of which applies to one person and one live version.

**Reasons.** It makes the release process mean what it says: what goes live is what was tested and reviewed, and About's version matches it. A fix that can't wait still reaches production quickly as a patch release. The cost is one step per release, which the maintainer takes anyway when tagging.

Source: Cloudflare's [Workers Builds branch control](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/), read on 2026-10-11.

**Consequences.** Merging a pull request no longer changes timetravels.dev, and Dependabot's auto-merged updates reach staging and go live only with a release. The switch is the maintainer's, in this order: create `production` at the commit that is live, then set it as the production branch in the dashboard, so Cloudflare always has a branch to build. The guard hook blocks Claude from pushing to `production`, as moving it is deploying. `docs/releasing.md` gives the steps.

**Status.** Proposed by Claude after the maintainer asked whether releases meant anything when every merge deploys; approved by @biancapower, 2026-10-11.
