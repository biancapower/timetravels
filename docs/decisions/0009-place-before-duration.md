# 0009. English word order: the place before the duration

**Context.** The spec and the issues for sentences 3 to 5 put the duration before the place: "What time will it be 10 hours from now in London?". Trying the app, the maintainer found that order less natural than putting the place first.

**Decision.** In English, the place comes before the duration and direction:
- "What time will it be in London 10 hours from now?" and "What time will it be here 10 hours from now?"
- "What time was it in London 8 hours ago?" and "What time was it here 8 hours ago?"
- Sentence 5 follows: "What time will it be in London 10 hours after 3 pm today?"

Sentences 1 and 2 already end with the place and are unchanged. The README's example sentence follows the new order.

**Alternatives.** Keeping the spec's order, duration first.

**Reasons.** It reads more naturally: the place sets the scene, then the question says how far to move. Each sentence is one ICU message (decision 0007), so the order is a property of the English text, and other languages set their own.

**Consequences.** Issue #6 describes sentence 5 in the old order; it is implemented in the new one. Decision 0001 lists the sentences as they were written at the time.

**Status.** Approved by @biancapower, 2026-10-10.
