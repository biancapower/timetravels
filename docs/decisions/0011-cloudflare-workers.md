# 0011. Host on Cloudflare Workers static assets, with Wrangler

**Context.** Decision 0003 chose Cloudflare Pages for hosting and preview deploys. When the maintainer came to connect the repository, Cloudflare's dashboard offered Workers as its main path and labelled Pages "the legacy Pages workflow". Workers serves a static site such as this one as "static assets", with no server code.

**Decision.** The app is hosted on Cloudflare Workers as static assets, configured by `wrangler.jsonc` in the repository: it serves `dist/`, attaches `timetravels.dev` as a custom domain (decision 0010), and turns on preview URLs. Cloudflare's GitHub integration builds every push: `main` deploys production with Wrangler's deploy command, and every other branch gets a preview, whose URL Cloudflare posts on the pull request. `wrangler` 4.149.0 is a pinned development dependency, as Cloudflare's build runs the version in `package.json`. Two of its dependencies, `esbuild` and `workerd`, ship install scripts; pnpm is told not to run them (`allowBuilds` in `pnpm-workspace.yaml`), because serving static assets needs neither and running install scripts is a supply-chain risk.

This supersedes decision 0003 where it names Cloudflare Pages (points 3 and 10).

**Alternatives.** Cloudflare Pages, as first planned: it would work today, but Cloudflare already presents it as legacy. Deploying from GitHub Actions instead of Cloudflare's own build: it would need a Cloudflare API token stored in the repository's secrets.

**Reasons.** Choosing the platform's current path avoids a migration soon after launch. Keeping the configuration in the repository makes the domain and preview settings reviewable, rather than living only in the dashboard. Cloudflare's own build keeps credentials out of the repository; Claude never holds them and never deploys.

Sources: Cloudflare's [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/), [static assets headers](https://developers.cloudflare.com/workers/static-assets/headers/), [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) and [preview URLs](https://developers.cloudflare.com/workers/previews/), read on 2026-10-10.

**Consequences.** Previews live at `*.workers.dev` addresses and are not advertised. `public/_headers` works unchanged. Static asset requests are free and unlimited; builds are limited to 3,000 minutes a month on the free plan. Dependabot will propose Wrangler updates like any other development dependency.

**Status.** The move to Workers proposed by Claude after the maintainer's dashboard showed Pages as legacy, and the Wrangler dependency recommended by a research subagent; approved by @biancapower, 2026-10-10.
