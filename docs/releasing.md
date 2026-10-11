# Releasing

A release is a version number in `package.json`, an entry in `CHANGELOG.md`, and a tag on `main`. The maintainer tags; Claude prepares everything before that.

## The version number

`package.json` holds the version, and nothing else does. The build reads it into the About page, and `e2e/pages.spec.ts` checks that About shows exactly that version. A release changes it in one place and nowhere else.

## Steps

1. **Close or move the milestone's issues.** Every issue in the release's milestone is closed, or moved to another milestone with a comment saying why.
2. **User test.** Claude drafts a test script from the issues' acceptance criteria. The maintainer works through it on a real phone and a real desktop browser, online and offline. Claude files every finding as an issue, verbatim, labelled `severity:1` to `severity:3`, and fixes nothing without an issue (see `CLAUDE.md`).
3. **Release pull request.** Claude sets the version in `package.json`, adds the release's entry to `CHANGELOG.md`, and puts a draft of the GitHub release notes in the pull request description. Merging it deploys the release to timetravels.dev, because Cloudflare builds every change to `main`.
4. **Release review.** A fresh Claude session reviews the release with the maintainer. It writes nothing.
5. **Tag and publish.** The maintainer tags the merge commit `v` plus the version (for example `v0.1.0`) and publishes the release notes on GitHub. If that happens on a later day than the changelog says, the date in `CHANGELOG.md` is corrected in the next pull request.

Claude never tags or publishes a release; the guard hook in `.claude/settings.json` blocks it.
