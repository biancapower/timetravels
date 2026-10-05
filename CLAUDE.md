# CLAUDE.md

TimeTravels: a time calculator with a one-sentence interface. React 19, TypeScript strict, Vite, Temporal, pnpm. Read `README.md`, then `docs/decisions/README.md`. The decisions are not up for quiet revision.

## Claude never

- Merges, force-pushes, tags a release, deploys, publishes, or changes repository visibility. A human does every one of those.
- Reads `.env*` files. None are expected here; if one appears, ask.
- Starts the dev server unasked. When asked, bind it to `0.0.0.0` so it can be opened from a phone.
- Opens an issue to match work already done. Work only against an issue the maintainer has written or approved.

Enforced by `.claude/settings.json` (a `permissions.deny` for `.env*` reads and a `PreToolUse` hook blocking force-push to `main`, `--no-verify`, `wrangler deploy` and `pnpm publish`), with `scripts/test-hooks.sh` as its regression test. Both land with the scaffold (issue #1). A correction made twice becomes a hook or a line in this file, not a memory.

## Decisions

Decisions have tiers, flagged with emoji that are used for nothing else.

- 🔴 **Must confirm before doing:** architecture and module boundaries, dependencies added or removed, the time library, licences, repository visibility, release tags, deployment targets, anything that changes a claim in the README. Explain the options and the trade-off plainly, get an explicit yes from the maintainer, then record it in `docs/decisions/` with "approved by the maintainer, <date>".
- 🟡 **Review at the PR:** notable but reversible choices inside an issue's scope. List them under a "Decisions in this PR" heading in the PR description. Any loosening of a strictness setting (TypeScript flags, lint rules, the no-retries test policy) is a 🟡 item with its reason.
- Everything else is routine and lands in the PR like normal code.

For any PR with a 🔴 or 🟡 item, offer a short teach-back: the maintainer explains the change back, and gaps are noted. Nothing lands that the maintainer cannot explain. Any technical explanation Claude gives comes with a primary or authoritative source; anything from memory is said to be from memory.

## Testing

- `src/time/` is the time logic: plain TypeScript, no React imports, one entry file, its own tests. **Test-first here**: write the failing test, commit it, then the implementation, as separate commits inside the PR. `main` stays green on its first-parent line because PRs land with a merge commit (decision 0004).
- The interface is test-alongside: build the screen, check it live in Chrome (strategically, about once per screen or tricky interaction, because it is token-heavy), then write the Playwright test from the issue's acceptance criteria, not from what happened to work.
- Flake policy: Vitest `sequence.shuffle` on; Playwright `retries: 0`; a lint rule bans `setTimeout` in tests; web-first assertions, never waits. Flakiness is fixed before merge, not retried.

## Commands

One check entrypoint: `pnpm check` (typecheck, lint, format check, unit tests) and `pnpm check:full` (adds Playwright). Never call `vitest`, `playwright`, `eslint` or `tsc` directly in CI or docs. Verification means running it; "it compiles" is not verification. Before every PR, run `/pre-pr`: a fresh-context review of `git diff origin/main...HEAD` that reports BLOCKING / SHOULD FIX / SUGGESTION / NOTE findings and edits nothing; triage, then checks.

## Commits

- One logical change per commit, in dependency order. The test: if this commit were reverted, would the codebase still be coherent?
- Subject under 50 characters, present tense, saying why; the body carries the reasoning. No WIP commits. Never amend after pushing. Stage files by name. Never `--no-verify`.
- Commits Claude wrote or co-wrote end with `Co-Authored-By: Claude <model> <noreply@anthropic.com>`. That trailer is the audit trail.

## Docs

- Docs describe the current state. No roadmap narration, no "to be written", no issue numbers in code comments.
- `README.md` holds the docs index. `docs/decisions/` holds one record per decision: context, decision, alternatives, reasons, consequences, status, with the index in its README.
- Stack gotchas, filled in as each one bites: Node 24; ESM only (`"type": "module"`); React 19; Vite.
- Emoji appear only as the two decision flags. Nowhere else in code, docs or commits.
