# 0019. "At a time" in the address

**Context.** "At a time" asks what time it is somewhere when it's a chosen time, perhaps in another place: "What time will it be here when it's 10 am in London?" It has a chosen time and whose time it is, but no length. The address format of [0017](0017-question-in-the-address.md) can be added to but not changed in a way that breaks existing addresses.

**Decision.** This extends 0017; nothing in it changes.

- `when=at` asks about a chosen time. It takes `at`, `day` and `at-in` as `after` and `before` do, and no `for`; a `for` in such an address is ignored.
- `day` means what it does for `after` and `before`: no `day` is today in the chosen time's place, even when that time has passed there, and the question then reads in the past ("when it was 6:00").

For example, `timetravels.dev/?in=Australia/Sydney&when=at&at=10:00&at-in=Europe/London`.

**Alternatives.** No `day` meaning the next such time, today's or tomorrow's: closer to what "when it's 10 am in London" usually means, but the time picker still showed "Today" while the answer used tomorrow, so the screen contradicted itself. Presetting "Tomorrow" when a place is picked whose time has passed: visible, but the app would then choose the day itself depending on the clock. A separate parameter for the time, such as `when-its=10:00`: it would duplicate `at`.

**Reasons.** Reusing `at`, `day` and `at-in`, with the same meanings, keeps one way to write a chosen time. The sentence, the time picker and the answer always agree, and the sentence's tense says whether the time has passed.

**Consequences.** Existing addresses keep their meaning. An "at" address opened later can give a different day, as "10 hours from now" does: the address holds the question, not a moment.

**Status.** Proposed by Claude, first with no `day` meaning the next such time. The maintainer found that contradicted the time picker while testing, and chose today; approved by @biancapower, 2026-10-18.
