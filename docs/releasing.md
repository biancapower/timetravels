# Releasing

A release is a version number in `package.json`, an entry in `CHANGELOG.md`, the `production` branch moved to the release commit, and a tag on that commit. Moving `production` deploys timetravels.dev ([decision 0015](decisions/0015-production-branch.md)). The maintainer moves it and tags; Claude prepares everything before that.

## Where things run

- **`production`** is what timetravels.dev serves. Only the maintainer moves it, at a release.
- **`main`** is where pull requests merge. Cloudflare builds it as a preview, which is staging: https://main-timetravels.bianca-83c.workers.dev
- **Every other branch** gets its own preview address, which Cloudflare posts on its pull request.

## The version number

`package.json` holds the version, and nothing else does. The build reads it into the About page, and `e2e/pages.spec.ts` checks that About shows exactly that version. A release changes it in one place and nowhere else.

## Steps

1. **Close or move the milestone's issues.** Every issue in the release's milestone is closed, or moved to another milestone with a comment saying why.
2. **Release pull request.** Claude sets the version in `package.json`, adds the release's entry to `CHANGELOG.md`, and puts a draft of the GitHub release notes in the pull request description. Merging it puts the release candidate on staging.
3. **User test, on staging.** Claude drafts a test script from the issues' acceptance criteria. The maintainer works through it on a real phone and a real desktop browser, online and offline. Claude files every finding as an issue, verbatim, labelled `severity:1` to `severity:3`, and fixes nothing without an issue (see `CLAUDE.md`). Fixes merge to `main` and so reach staging.
4. **Release review, on staging.** A fresh Claude session reviews the release with the maintainer. It writes nothing. Anything it finds is fixed as in step 3.
5. **Go live.** The maintainer moves `production` to the release commit: the exact commit the user test and review ran against, which may not be the head of `main` if Dependabot has merged since. They check timetravels.dev shows the new version on its About page, then tag that commit `v` plus the version (for example `v0.1.0`) and publish the release notes on GitHub. If that happens on a later day than the changelog says, the date in `CHANGELOG.md` is corrected in the next pull request.

A fix that can't wait for the next release is a patch release: the same steps, with a short changelog entry.

Claude never moves `production`, tags or publishes a release; the guard hook in `.claude/settings.json` blocks each of them.
