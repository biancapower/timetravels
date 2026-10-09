# 0006. Visual foundations: reset, typeface, colour tokens

**Context.** The first screen needs a starting point for browser styles, a typeface and the five semantic colour tokens decision 0003 names, with light and dark values. Open Props is already chosen for the scales (decision 0003).

**Decision.**
- **Reset:** Andy Bell's [A (more) modern CSS reset](https://piccalil.li/blog/a-more-modern-css-reset/), copied unchanged into `src/styles/reset.css` with its credit. It is licensed under [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/), not MIT, and the README's licence line says so.
- **Typeface:** the device's system font, through Open Props' `--font-system-ui` stack. No web font.
- **Colour tokens,** from Open Props' gray and indigo scales, switching with `prefers-color-scheme`:

| Token | Light | Dark |
|---|---|---|
| `ground` | gray-0 `#f8f9fa` | gray-11 `#0d0f12` |
| `surface` | `#ffffff` | gray-10 `#16191d` |
| `text` | gray-9 `#212529` | gray-1 `#f1f3f5` |
| `muted` | gray-7 `#495057` | gray-5 `#adb5bd` |
| `accent` | indigo-8 `#3b5bdb` | indigo-3 `#91a7ff` |

**Alternatives.** A reset installed as a package, such as modern-normalize, which would be a new dependency. A self-hosted web font, which costs a download and needs caching for offline use. Another accent hue.

**Reasons.** The copied reset is short and readable and adds no dependency; the licence cost is one credit. The system font renders immediately, offline, and looks native on Android and desktop, at the price of looking slightly different on each. The token values pass WCAG AA for text against the ground in both themes: text 14.6 and 17.3, muted 7.8 and 9.3, accent 5.4 and 8.4 (light and dark), calculated with the [WCAG contrast formula](https://www.w3.org/TR/WCAG22/#contrast-minimum).

**Consequences.** Components take colours only from the five tokens. One file in the repository is under a licence other than MIT. Changing a token value is a change to this decision.

**Status.** Proposed jointly by @biancapower and Claude; approved by @biancapower, 2026-10-09.
