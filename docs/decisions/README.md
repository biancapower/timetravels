# Decisions

Short records of decisions with their reasons, written when they were made. Format: context, decision, alternatives considered, reasons, consequences, status. The maintainer makes and signs off every decision; Claude may draft.

| # | Decision | Status |
|---|---|---|
| [0001](0001-first-release-and-visibility.md) | First release scope, repository visibility, name | Approved 2026-10-05 |
| [0002](0002-time-library.md) | Temporal with a polyfill where missing | Approved 2026-10-05 |
| [0003](0003-tooling.md) | The tooling: pnpm, single package, Vite, strict TypeScript, Vitest and Playwright, ESLint and Prettier, PWA plugin, custom CSS with Open Props, a headless library for pickers, one CI workflow | Approved 2026-10-05; point 9 superseded by 0008; Pages hosting by 0011 |
| [0004](0004-test-first-and-commits.md) | Test-first for the time logic; every commit green | Approved 2026-10-09 |
| [0005](0005-dependabot-auto-merge.md) | Dependabot patch and minor updates merge themselves after the gate | Approved 2026-10-09 |
| [0006](0006-visual-foundations.md) | Visual foundations: the CSS reset, the system font, the five colour tokens | Approved 2026-10-09 |
| [0007](0007-translation-library.md) | Translation library: react-intl, with ICU messages and slots as named tags | Approved 2026-10-09 |
| [0008](0008-headless-component-library.md) | Headless component library: Base UI, superseding 0003 point 9 | Approved 2026-10-09 |
| [0009](0009-place-before-duration.md) | English word order: the place first, and "right now" | Approved 2026-10-10 |
| [0010](0010-production-domain.md) | Production lives at timetravels.dev | Approved 2026-10-10 |
| [0011](0011-cloudflare-workers.md) | Host on Cloudflare Workers static assets, with Wrangler; supersedes 0003's Pages | Approved 2026-10-10 |
| [0012](0012-web-analytics.md) | Cloudflare Web Analytics on timetravels.dev | Approved 2026-10-10 |
