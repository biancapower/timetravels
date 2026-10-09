# 0003. Tooling

Decided one point at a time on 2026-10-05, each after weighing the alternatives. Summary, with the reason for each:

1. **Package manager: pnpm**, declared in `package.json` via `packageManager`; Node pinned to the current LTS (24) in `.node-version` and `engines`. Reasons: a shared content-addressable store like Bundler's; no phantom dependencies; what the current frontend tooling's own repos use.
2. **Repository shape: a single package** with a clearly separated time-logic folder, `src/time/`, no React imports, its own tests. Workspaces only when a second consumer exists (a CLI is the likely one).
3. **Build tool: Vite.** Dev server with hot module replacement; static output for Cloudflare Pages. Next.js rejected as a server framework the app would not use.
4. **React 19 with TypeScript `strict: true` plus `noUncheckedIndexedAccess`.** Start strict; any loosening is a 🟡 item with its reason.
5. **Tests: Vitest** for `src/time/` and components (Testing Library); **Playwright** for browser interactions, at phone and desktop viewports, before the first release. No sleeps, no retries, random order, flakiness fixed before merge.
6. **Lint and format: ESLint 10** (flat config, typescript-eslint, react-hooks) **with Prettier**. Biome considered and set aside for reviewer familiarity and type-aware rules.
7. **PWA: vite-plugin-pwa**; offline from release 1; the default update prompt rather than automatic reload, because a half-built sentence is a form.
8. **CSS: custom CSS with CSS modules**, a modern reset, and **Open Props** for scales under the project's own five semantic tokens; no Tailwind, no classless base (Skeleton is unmaintained; Pico is archived).
9. **Component library: a headless one** (React Aria or Radix, chosen at the first picker issue) for picker behaviour only; styling stays in the project's CSS.
10. **CI: one GitHub Actions workflow** running `pnpm check`; path filters so docs-only changes skip tests; a single required gate job; 15-minute timeouts; a weekly scheduled run; Cloudflare preview deploys per PR.

**Status.** Approved by @biancapower, 2026-10-05. Point 9 superseded by [0008](0008-headless-component-library.md) on 2026-10-09.
