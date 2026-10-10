# 0002. Time library: Temporal, with a polyfill where it is missing

**Context.** The app's whole job is arithmetic over zoned date-times, instants and durations, with daylight-saving transitions as the hard cases.

**Decision.** Use the `Temporal` API. Load `temporal-polyfill` only when `globalThis.Temporal` is absent. The time logic lives in `src/time/` and depends on Temporal.

**Alternatives.** Luxon (mature, MIT, 3.7.2 as of 2026-09); date-fns with date-fns-tz; the browser's `Intl` APIs alone with hand-written arithmetic.

**Reasons.** Temporal's model, plain time, zoned time, instant, duration, is the vocabulary the write-ups and the tests want, and it is native in current Chrome and Firefox as of 2026-10 (not Safari 27, hence the polyfill for iOS). `temporal-polyfill` 1.0.5 is MIT, about 1 MB unpacked, widely used.

**Consequences.** Measure the polyfill's cost on iOS before 0.1.0. The first tests are the daylight-saving cases. Measured on 2026-10-10: the polyfill chunk is 58.9 KB, 19.9 KB gzipped. Browsers with native Temporal never run it, but the offline cache (issue #8) downloads it once for every install so the app works offline anywhere; load time on a real iPhone is checked in the user test before 0.1.0.

**Status.** Recommended by a research subagent; approved by @biancapower, 2026-10-05.
