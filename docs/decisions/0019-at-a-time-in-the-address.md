# 0019. "At a time" in the address

**Context.** "At a time" asks what time it is somewhere when it's a chosen time, perhaps in another place: "What time will it be here when it's 10 am in London?" It has a chosen time and whose time it is, but no length. The address format of [0017](0017-question-in-the-address.md) can be added to but not changed in a way that breaks existing addresses.

**Decision.** This extends 0017; nothing in it changes.

- `when=at` asks about a chosen time. It takes `at`, `day` and `at-in` as `after` and `before` do, and no `for`; a `for` in such an address is ignored.
- With `when=at` and no `day`, the chosen time is the next one in that place: today's if it is still to come there, otherwise tomorrow's. `day=tomorrow` and `day=yesterday` mean what they do for `after` and `before`.

For example, `timetravels.dev/?in=Australia/Sydney&when=at&at=10:00&at-in=Europe/London`.

**Alternatives.** No `day` meaning today in that place, as for `after` and `before`: consistent, but someone asking "when it's 10 am in London" almost always means the coming one, and today's may already have passed there. A separate parameter for the time, such as `when-its=10:00`: it would duplicate `at`.

**Reasons.** Reusing `at`, `day` and `at-in` keeps one way to write a chosen time. Taking the next occurrence follows what the question means in everyday speech, while `day` still allows a particular day.

**Consequences.** Existing addresses keep their meaning. An "at" address opened later can give a different day, as "10 hours from now" does: the address holds the question, not a moment.

**Status.** Proposed by Claude; approved by @biancapower, 2026-10-18.
