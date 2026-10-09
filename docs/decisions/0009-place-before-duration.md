# 0009. English word order: the place first, and "right now"

**Context.** The spec and the issues put the time before the place: "What time is it now in London?" and "What time will it be 10 hours from now in London?". Trying the app, the maintainer found that order less natural than putting the place first.

**Decision.** In English, the place comes first in every sentence, before the time slots, and the default time slot reads "right now":
- "What time is it in London right now?" and "What time is it here right now?"
- "What time will it be in London 10 hours from now?" and "What time will it be here 10 hours from now?"
- "What time was it in London 8 hours ago?" and "What time was it here 8 hours ago?"
- Sentence 5 follows: "What time will it be in London 10 hours after 3 pm today?"

The time slot's menu reads "right now", "from now" and "ago". The README's example sentence follows the new order.

**Alternatives.** Keeping the spec's order, duration first, with "now" before the place in sentences 1 and 2.

**Reasons.** It reads more naturally: the place sets the scene, then the question says when. "Right now" is what people say; "What time is it here now?" is stiff. With the place first everywhere, the time slot is in the same part of every sentence, and the place slot never moves when the time slot changes. Each sentence is one ICU message (decision 0007), so the order is a property of the English text, and other languages set their own.

**Consequences.** Issues #3, #4, #5 and #6 describe the old order; the code and README follow this one. Decision 0001 lists the sentences as they were written at the time.

**Status.** Proposed by @biancapower after trying the app; approved by @biancapower, 2026-10-10.
