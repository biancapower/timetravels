# 0007. Translation library: react-intl

**Context.** The interface is a sentence with tappable slots. Other languages order the slots differently and change the words around them, so each sentence must be one translatable message whose slots are named placeholders a translator can move, with plural rules. Only English ships for now, but the slots in later sentences are built on this pattern.

**Decision.** Use [react-intl](https://formatjs.github.io/docs/react-intl/) from FormatJS, version 12.1.4, with messages in ICU MessageFormat. Each slot is a named tag in the message, rendered by its own React component. No precompile step for now.

**Alternatives.** Researched on 2026-10-09, with sizes measured in a minimal Vite 8 and React 19 app rendering sentence 1:
- **use-intl:** the same ICU parser, argument types inferred from the message text, 11.0 KB gzipped; one major version behind on the parser, and its precompile path is tied to Next.js.
- **Lingui:** the smallest at 3.2 KB gzipped, but needs a compiler plugin and an extract-and-compile workflow.
- **i18next with react-i18next and i18next-icu:** 29.3 KB gzipped; ICU comes through a plugin that disables i18next's own features, and tag-shaped text inside a value was rendered as markup.
- **Paraglide:** its ICU plugin treats tags as plain text, so an ICU message cannot carry the slots. Ruled out.

**Reasons.** ICU MessageFormat is FormatJS's own format, and the other ICU options reuse its parser. Slots as named tags render as components without a build step, and a value that looks like a tag is escaped as text. It adds 13.9 KB gzipped, which a precompile step could roughly halve later if size matters.

**Consequences.** react-intl is licensed BSD-3-Clause, not MIT; that is accepted alongside the project's MIT licence. Every piece of interface text comes from the message catalogue, never from JSX literals. Message argument types are declared by hand rather than inferred. A later precompile step would add `@formatjs/cli` as a development dependency, which is its own decision.

**Status.** Recommended by a research subagent; approved by @biancapower, 2026-10-09.
