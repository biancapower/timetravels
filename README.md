# TimeTravels

A time calculator you talk to in one sentence.

> What time will it be **10 hours** **from now** in **London**?

Tap an underlined word to change it; the answer sits underneath and updates as you go. Time-zone conversion, hours from now and ago, and warnings when a daylight-saving change is about to move the goalposts. A web app you can install on your phone, which works offline.

**Status:** pre-release. Nothing to run yet; the first issues are being worked through.

## Running it

Comes with the scaffold (issue #1).

## Stack

React 19, TypeScript (strict), Vite, the Temporal API with a polyfill where it's missing, Vitest and Playwright, ESLint and Prettier, pnpm, custom CSS with Open Props, a headless component library for the pickers, Cloudflare Pages.

## Documentation

1. [Decisions](docs/decisions/): why the project is shaped the way it is, one short record per decision
2. [Working with AI](docs/working-with-ai.md): how Claude is used on this repository and what the commit history shows

## Licence

MIT for the code. Time-zone data comes from the IANA Time Zone Database through the browser's own `Intl` support and the Temporal polyfill.
