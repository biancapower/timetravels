# 0005. Dependabot patch and minor updates merge themselves after the gate

**Context.** Every pull request was to be reviewed and merged by the maintainer. Dependabot will open a pull request each week for dependency and GitHub Actions updates, with every version pinned exactly, so most of those pull requests are routine patch and minor bumps.

**Decision.** Dependabot pull requests for patch and minor updates merge automatically once the `gate` check passes, with a merge commit. Major updates are left for the maintainer to review and merge. Every other pull request is still reviewed and merged by the maintainer.

**Alternatives.** No auto-merge, so the maintainer merges every Dependabot pull request by hand. This keeps the "every pull request is merged by the maintainer" rule without exception, at the cost of a small weekly chore.

**Reasons.** Patch and minor updates of pinned dependencies are low risk once `pnpm check` passes in CI; browser tests run only in the weekly scheduled run, and a 7-day cooldown keeps a freshly published bad release out. Merging them automatically keeps dependencies current without a weekly chore, and leaves the maintainer's review for the changes that need judgement.

**Consequences.** Two repository settings make this safe and are set by the maintainer by hand: "Allow auto-merge" on, and a rule on `main` requiring the `gate` check. Without the required check, an auto-merge would not wait for CI. [Working with AI](../working-with-ai.md) states the exception.

**Status.** Approved by @biancapower, 2026-10-09.
