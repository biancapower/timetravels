# 0012. Cloudflare Web Analytics on timetravels.dev

**Context.** Issue #9 put "analytics of any kind" out of scope for the deploy. On the first live check, Lighthouse found Cloudflare already adding its analytics beacon to the page: free Cloudflare plans turn real user monitoring on automatically. The maintainer, choosing deliberately, kept it on and set up Cloudflare Web Analytics for `timetravels.dev`.

**Decision.** `timetravels.dev` uses Cloudflare Web Analytics, with Cloudflare's automatic setup set to "Enable" for all visitors, including those in the EU: Cloudflare adds its beacon script to the page at the edge, and it reports page views, visits and page-speed measurements to Cloudflare. Nothing in the repository adds or configures it. The README says so.

**Alternatives.** "Enable, excluding visitor data in the EU", which is Cloudflare's own default for free plans. Turning it off for 0.1.0 and deciding on analytics later. Another analytics service, or none at all.

**Reasons.** It shows whether anyone uses the app once 0.1.0 is public, at no cost and with no code. Cloudflare states that "Cloudflare Web Analytics does not collect or use your visitors' personal data" ([About Web Analytics](https://developers.cloudflare.com/web-analytics/about/), read 2026-10-10).

**Consequences.** Visitors' browsers load one script from `static.cloudflareinsights.com` and send measurements to `/cdn-cgi/rum`; Lighthouse counts both against performance. The setting lives in the Cloudflare dashboard (Web Analytics, `timetravels.dev`, Manage site), not in the repository. The app's own code still collects nothing.

**Status.** Proposed by @biancapower; approved by @biancapower, 2026-10-10.
