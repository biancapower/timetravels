# Accessibility

TimeTravels' interface is unusual: the question is a sentence, and some of its words are controls. This page records how that was checked before release 0.1.0, what was found, and what is still to be checked by a person.

## How the sentence reads

The question is the page's main heading. Each slot is a button inside it, named by its current value, so a screen reader reads the sentence as a sentence and announces, for example, "here, button, collapsed". Each slot opens a labelled popup:

| Slot | Opens | Pattern |
|---|---|---|
| The place ("here", "London") | "Choose a place" dialog with a search combobox and a listbox | WAI-ARIA combobox |
| The time ("right now", "from now", "ago", "after", "before") | "Choose when" menu of radio items | Menu with radio items |
| The duration ("1 hour") | "Choose how long" dialog with a text field and common durations | Dialog with a form |
| The chosen time ("3 pm") | "Choose a time" dialog with a time field and a day choice | Dialog with a form |
| Whose time ("my time", "London time") | "Whose time" menu of radio items | Menu with radio items |

Errors in the duration and time pickers appear in an alert region that is always present, so they are announced when they appear.

## Checks and results

**Automated rules.** Every screen is checked with axe (`@axe-core/playwright`) against WCAG 2.2 AA in light and dark themes, on a phone and a desktop: the sentence, each picker open (including the place list with results and the "Whose time" menu), the duration and time pickers' errors, the clock-change note, and sentence 5. Contrast that axe cannot measure fails the check too, except text covered by an open popup, which is checked where nothing covers it. No violations were found, and none needed fixing. These are in `e2e/accessibility.spec.ts` and run in `pnpm check:full`. Lighthouse 13.5.0 gave the live site an accessibility score of 100 on 2026-10-10.

**Keyboard.** Tab reaches every slot in reading order; Enter opens each slot, Escape closes it, and focus returns to the slot, in every sentence. These are in `e2e/keyboard.spec.ts`.

**Contrast.** The text contrast is in [decision 0006](decisions/0006-visual-foundations.md). For the rest, against WCAG's 3:1 for interface parts and 4.5:1 for text:

| Element | Light | Dark |
|---|---|---|
| Slot text and underline on the ground | 5.4 | 8.4 |
| Focus ring | 5.4 | 8.4 |
| Popup, input and note borders | 8.2 | 8.5 |
| Note accent bar | 5.7 | 7.7 |
| Highlighted list item, and Set and Update buttons | 5.7 | 7.7 |

**Motion.** The app has no animations or transitions, so there is nothing for `prefers-reduced-motion` to reduce. Any added later must respect it.

## Fixes made for this release

Made in this pass:

- **The answer is announced when a choice changes it**, from a hidden status region, but not on the minute tick, which would interrupt a screen reader every minute. The announcement clears five seconds later, so no stale copy stays on the page.

Made earlier, while building the sentences:

- **Focus stays on the time slot** after choosing "from now", "ago" or a chosen time, even though the slot moves within the sentence.
- **Error messages and the update notice** sit in regions that are always present, so screen readers announce them reliably.
- **The place slot announces as a button** with its value, as the place picker's issue asked, rather than as a combobox.

## Still to be checked by a person

Automated checks cannot judge how the sentence sounds. Before release, with a screen reader:

1. **VoiceOver on an iPhone.** Swipe through the sentence: does it read as one question, with each slot announced as a button with its value? Open each slot, choose something, and check the new answer is read out once.
2. **NVDA on Windows or Orca on Linux.** The same, with the keyboard only.
3. **TalkBack on Android.** The same; Base UI, the picker library, publishes no screen-reader test results ([decision 0008](decisions/0008-headless-component-library.md)), so this matters.
