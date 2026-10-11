# 0014. Screen-reader checks are not tied to a release

**Context.** Decision 0008 chose Base UI, which publishes no screen-reader test matrix, and said the project would check TalkBack and VoiceOver itself "at the latest in the accessibility pass before 0.1.0". That pass (issue #10) finished its automated, keyboard and contrast work, and a guided walkthrough for the listening checks was ready, but the maintainer chose not to do them before 0.1.0.

**Decision.** The screen-reader checks (TalkBack on the Pixel, VoiceOver on the iPad, VoiceOver with Safari on the Mac) are tracked in issue #42, in the Unscheduled milestone, and are not tied to any release. This supersedes the timing in decision 0008's consequences; the rest of 0008 stands.

**Alternatives.** Doing the checks before 0.1.0, as 0008 planned. Scheduling them for 0.2.0.

**Reasons.** The maintainer's call on scope for a small first release. Automated checks with axe, keyboard tests and contrast checks cover what tools can judge.

**Consequences.** 0.1.0 ships without anyone having listened to it through a screen reader, so problems in Base UI's announcements could reach screen-reader users. `docs/accessibility.md` says so plainly. The walkthrough stays ready for when the checks are done.

**Status.** Proposed by @biancapower; approved by @biancapower, 2026-10-11.
