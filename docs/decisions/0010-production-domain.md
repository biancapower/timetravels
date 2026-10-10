# 0010. Production lives at timetravels.dev

**Context.** Cloudflare Pages is the host (decision 0003). Issue #9 left open which hostname is public and when `timetravels.dev` is attached, pending the trade mark searches decision 0001 called for.

**Decision.** From release 0.1.0, production is served at `https://timetravels.dev`, attached to the Cloudflare Pages project as a custom domain. Every push to `main` deploys it. Pull requests get preview deployments on Cloudflare's own `*.pages.dev` addresses, which are not advertised.

**Alternatives.** Launching on the `*.pages.dev` address and attaching the domain later.

**Reasons.** The domain is registered on the maintainer's Cloudflare account and the trade mark searches are clear, so there is no reason to launch on a temporary address and move people later. A stable address also matters for an installable app: an installed copy belongs to the address it was installed from.

**Consequences.** The README gives `https://timetravels.dev` as the app's address. The Cloudflare side, connecting the project and adding the domain, is done by the maintainer; Claude never holds the credentials or deploys.

**Status.** Proposed by @biancapower; approved by @biancapower, 2026-10-10.
