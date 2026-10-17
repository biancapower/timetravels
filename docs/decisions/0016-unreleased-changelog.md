# 0016. Each pull request adds to an Unreleased changelog section

**Context.** `docs/releasing.md` had the changelog entry written in the release pull request, from whatever had merged by then. After 0.1.0, 17 pull requests merged with `CHANGELOG.md` untouched, so the 0.2.0 entry would have to be rebuilt from pull request titles and diffs long after the work, by a session that didn't do it.

**Decision.** `CHANGELOG.md` keeps an Unreleased section at the top. A pull request with a change a user would notice adds a line to it, in plain words for a reader of the app, under Keep a Changelog's headings: Added, Changed, Deprecated, Removed, Fixed, Security. Changes a user wouldn't notice get no line: test-only, tooling, process and dependency updates, including Dependabot's. The release pull request turns the section into the release's entry, in the reader-facing shape the 0.1.0 entry has, and starts a new, empty Unreleased section. The 0.1.0 entry stays as it is.

**Alternatives.** Keep writing the entry at release time: one sitting, but from memory and diffs, which is where 0.2.0 stood. A line for every pull request, or a generated list of them: complete, but noise, and it would read as a log of steps, not a release.

**Reasons.** Keep a Changelog 1.1.0 recommends the Unreleased section: "Keep an `Unreleased` section at the top to track upcoming changes", so that "People can see what changes they might expect in upcoming releases", and "At release time, you can move the `Unreleased` section changes into a new release version section". It warns against the alternative of listing everything: "Using commit log diffs as changelogs is a bad idea: they're full of noise", since an entry is "to document the noteworthy difference, often across multiple commits". It gives the six headings above. Adding the line in the pull request itself is this project's own choice, not the guide's: the line is written while the change is fresh, by the session that made it, and a reviewer sees it with the change.

Source: [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), read on 2026-10-17.

**Consequences.** Two open pull requests that both add a line conflict on `CHANGELOG.md`; the second to merge resolves it when its branch is brought up to date. The release pull request becomes editing, not writing. `CLAUDE.md` and `docs/releasing.md` say this.

**Status.** Raised by a Claude planning session, which found the changelog untouched since 0.1.0; the shape (a line only for what a user would notice, edited at release) was recommended by Claude; approved by @biancapower, 2026-10-17.
