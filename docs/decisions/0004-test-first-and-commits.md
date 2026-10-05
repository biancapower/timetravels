# 0004. Test-first for the time logic, and how red and green land

**Decision.** `src/time/` is developed test-first: a failing test is committed, then the implementation that makes it pass, as separate commits inside the pull request. The interface is test-alongside: build, check live, then write the Playwright test from the issue's acceptance criteria. Pull requests land on `main` with a merge commit, so `main` is green commit by commit on its first-parent line and `git bisect --first-parent` works.

**Alternatives.** One commit per red-green-refactor cycle; squash-merging with the test-first order stated in the PR description; red commits directly on `main`.

**Reasons.** Test-driven development is defined as the red-green-refactor cycle and says nothing about commits (Fowler, [Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)), so separate red and green commits are a presentation choice. The sources that do speak to shared history agree that every commit on a shared branch should pass its tests: Git's own [SubmittingPatches](https://git-scm.com/docs/SubmittingPatches) ("make sure that each commit is a self-contained, buildable, testable unit"), Google's [small CLs guide](https://google.github.io/eng-practices/review/developer/small-cls.html), and Git's [bisect documentation](https://git-scm.com/docs/git-bisect) on skipping commits that cannot be tested. Separate red and green commits inside a PR show test-first plainly; landing the PR with a merge commit keeps the shared line green on its first parent.

**Status.** Approved by the maintainer, 2026-10-05.
