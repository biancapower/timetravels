# TimeTravels

A time calculator you talk to in one sentence.

> What time will it be **10 hours** **from now** in **London**?

Tap an underlined word to change it; the answer sits underneath and updates as you go. Time-zone conversion, hours from now and ago, and warnings when a daylight-saving change is about to move the goalposts. A web app you can install on your phone, which works offline.

**Status:** pre-release. The app shows a placeholder; the first issues are being worked through.

## Running it

Needs Node 24 and Corepack, which picks the pnpm version from `package.json`.

```sh
corepack enable
pnpm install
pnpm dev         # serves on all interfaces, so a phone on the same network can open it
pnpm check       # typecheck, lint, format check, unit tests, guard hook test
pnpm check:full  # the above plus Playwright browser tests
```

Before the first `pnpm check:full`, install the browser once with `pnpm browsers`.

## Stack

- React 19
- TypeScript
- Vite
- Temporal API, with a polyfill where it's missing
- Vitest and Playwright
- ESLint and Prettier
- pnpm
- Custom CSS with Open Props; a headless component library for the pickers
- Cloudflare Pages

Time-zone rules come from the browser's own `Intl` data, or from the polyfill where Temporal isn't native. That's why the app works offline, and why zone rules update with the browser rather than with the app.

## Documentation

1. [Decisions](docs/decisions/): why the project is shaped the way it is, one short record per decision
2. [Working with AI](docs/working-with-ai.md): how Claude is used on this repository and what the commit history shows

## Licence

MIT for the code, except `src/styles/reset.css`, which is Andy Bell's CSS reset under [Creative Commons Attribution](https://creativecommons.org/licenses/by/4.0/).
