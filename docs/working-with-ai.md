# Working with AI

Claude Code is used on this repository. This is what that means in practice.

- Claude drafts code and tests against issues the maintainer has written or approved. It does not open issues to match work already done.
- Every pull request is reviewed and merged by the maintainer. Claude never merges, tags, deploys or changes the repository's visibility.
- Decisions with consequences are made by the maintainer and recorded in [`docs/decisions/`](decisions/) as they happen, with the alternatives and the reasons.
- Commits that Claude wrote or co-wrote carry a `Co-Authored-By` trailer naming the model. The commit history is the audit trail.
- The rules Claude works under are in [`CLAUDE.md`](../CLAUDE.md), including the things it never does and how those are enforced.
