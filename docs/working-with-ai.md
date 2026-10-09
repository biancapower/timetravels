# Working with AI

Claude Code is used on this repository. This is what that means in practice.

- Every change starts from an issue the maintainer has written or approved. The issue is the specification; the pull request answers it. Claude drafts the code and tests against that issue, and nothing else.
- Every pull request is reviewed and merged by the maintainer, with one exception: Dependabot's patch and minor updates merge themselves once CI passes ([decision 0005](decisions/0005-dependabot-auto-merge.md)). Claude never merges, tags, deploys or changes the repository's visibility.
- Decisions with consequences are made by the maintainer and recorded in [`docs/decisions/`](decisions/) as they happen, with the alternatives and the reasons.
- Commits that Claude wrote or co-wrote carry a `Co-Authored-By` trailer naming the model. The commit history is the audit trail.
- The rules Claude works under are in [`CLAUDE.md`](../CLAUDE.md), including the things it never does and how those are enforced.
