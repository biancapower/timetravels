# 0008. Headless component library: Base UI

**Context.** Decision 0003 point 9 chose "a headless one (React Aria or Radix, chosen at the first picker issue) for picker behaviour only". The first picker is the place slot: tapping it opens a search over about 400 time zones, following the WAI-ARIA combobox pattern, with focus returning to the slot. Later slots need similar pickers. All interface text comes from the react-intl catalogue (decision 0007), and styling stays in the project's CSS.

**Decision.** Use [Base UI](https://base-ui.com/) (`@base-ui/react`), version 1.8.0, for picker behaviour. This supersedes decision 0003 point 9, which allowed only React Aria or Radix.

**Alternatives.** Researched on 2026-10-09, with sizes measured in a minimal Vite 8 and React 19 app rendering a combobox, gzipped, above React alone:
- **React Aria Components** (Adobe, Apache-2.0): a standard ComboBox, and the strongest published accessibility evidence, a tested matrix across VoiceOver, TalkBack, JAWS and NVDA. 52 to 59 KB. Its announcements are built in, in 34 languages, rather than coming from our catalogue.
- **Radix Primitives:** no combobox primitive; a combobox would need the third-party cmdk, last published in March 2025.
- **Ariakit:** a good combobox, still before 1.0, and it did not work with the project's Testing Library setup.
- **Headless UI:** no releases since April 2026, and no built-in slot-as-trigger shape.
- **Downshift:** the smallest, at 11 KB, but positioning, dismissal, focus return and the mobile layout would all be ours to write.

**Reasons.** Base UI's combobox supports the shape the place slot needs out of the box: a button opens a popup containing the search input, which carries the combobox role. It ships no interface text, so every word comes from our catalogue. It is MIT-licensed, maintained by the MUI team with regular stable releases, and adds 44 KB gzipped. It worked with Vitest and Testing Library in jsdom without workarounds.

**Consequences.** Base UI publishes no screen-reader test matrix, so the project checks TalkBack and VoiceOver itself, at the latest in the accessibility pass before 0.1.0. Version 1.9.0 was published on the day of this decision, inside pnpm's minimum release age, so 1.8.0 is pinned and Dependabot proposes the next one after the cooldown.

**Status.** Approved by @biancapower, 2026-10-09.
