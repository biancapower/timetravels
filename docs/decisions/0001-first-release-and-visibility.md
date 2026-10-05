# 0001. First release scope, repository visibility, name

**Context.** A small side project in React and TypeScript, built for interest, with its decisions written down as it goes.

**Decision.**
- Release 0.1.0 is sentence group A only, the five sentences 1 to 5 of the spec: "What time is it [now] [here]?", "…in [London]?", "What time will it be [10 hours] [from now]…?", "What time was it [8 hours] [ago]…?", "What time will it be [10 hours] [after | before] [3 pm today]…?". The daylight-saving warning line ships in 0.1.0 only if it falls out of the work cheaply.
- The repository is created private, then made public by the maintainer after reviewing the first commits. Once public, it stays public; nothing personal is committed at any point.
- The name is **TimeTravels**, one word as identifier and wordmark; "Time Travels" in prose. Chosen knowing the phrase is crowded in stores and search, because it fits the brief: time-travel flavoured without being sci-fi, and "time" says what it does.

**Alternatives.** A larger first release (groups A and B, or A to C); public from the first commit; the names Elsetime, Thenabouts, Traveller's Clock, Got the Time, and others ruled out by conflicts (Anywhen, Elsewhen, Whenabouts, Temporal).

**Reasons.** The smallest honest release gets a URL and a tag soonest. Private-first lets the first commits be reviewed before anyone reads them, at no cost since nothing personal is involved. The name is the one the maintainer wanted, with the findability cost accepted and offset by a distinctive domain and a listing that leads with the function.

**Consequences.** Trademark searches (IP Australia, USPTO) and registering `timetravels.dev` happen by hand before anything is public under the name.

**Status.** Approved by the maintainer, 2026-10-05.
