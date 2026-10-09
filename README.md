# TimeTravels

A time calculator you talk to in one sentence.

> What time will it be in **London** **10 hours** **from now**?

Tap an underlined word to change it; the answer sits underneath and updates as you go. Time-zone conversion, hours from now and ago, and warnings when a daylight-saving change is about to move the goalposts. A web app you can install on your phone, which works offline.

**Status:** pre-release. The app answers what time it is now, a number of hours from now or ago, or a number of hours after or before a chosen time, here or in another place; the rest of release 0.1.0 is being worked through.

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
- react-intl, with every sentence an ICU message so translations can reorder the slots
- Vitest and Playwright
- ESLint and Prettier
- pnpm
- Custom CSS with Open Props; Base UI, a headless component library, for the pickers
- Cloudflare Pages

Time-zone rules come from the browser's own `Intl` data, or from the polyfill where Temporal isn't native. That's why the app works offline, and why zone rules update with the browser rather than with the app.

## Documentation

1. [Decisions](docs/decisions/): why the project is shaped the way it is, one short record per decision
2. [Working with AI](docs/working-with-ai.md): how Claude is used on this repository and what the commit history shows

## Licence

MIT for the code, except `src/styles/reset.css`, which is Andy Bell's CSS reset under [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/).
