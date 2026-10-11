# Accessibility

TimeTravels' interface is unusual: the question is a sentence, and some of its words are controls. This page records how that was checked, what was found, and what is still to be checked by a person.

## How the sentence reads

The question is the page's main heading. Each slot is a button inside it, named by its current value, so a screen reader reads the sentence as a sentence and announces, for example, "here, button, collapsed". Each slot opens a labelled popup:

| Slot | Opens | Pattern |
|---|---|---|
| The place ("here", "London", "home", "Mark's place") | "Choose a place" dialog with a search combobox and a listbox: Here, Home, the named places, "Name a place", then the cities. Each saved place is followed by its own "Edit" option, named "Edit Mark's place", since an option can't hold a button | WAI-ARIA combobox |
| "Name a place", "Edit" beside a saved place, or Home before it is set up | A dialog titled "Name a place", "Change Mark's place" or "Where is home?", opened against the place slot once the list has closed: a name field (not for home), a place field that shows the chosen city and searches as you type over it, the sentence as it will read, and Save, Remove and Cancel | Dialog with a form |
| The time ("right now", "from now", "ago", "after", "before") | "Choose when" menu of radio items | Menu with radio items |
| The duration ("1 hour") | "Choose how long" dialog with a text field and common durations | Dialog with a form |
| The chosen time ("3 pm") | "Choose a time" dialog with a time field and a day choice | Dialog with a form |
| Whose time ("my time", "London time") | "Whose time" menu of radio items | Menu with radio items |

Errors in the duration and time pickers and the named-place form appear in an alert region that is always present, so they are announced when they appear.

## Checks and results

**Automated rules.** Every screen is checked with axe (`@axe-core/playwright`) against WCAG 2.2 AA in light and dark themes, on a phone and a desktop: the sentence, each picker open (including the place list with results and with saved places, and the "Whose time" menu), the duration and time pickers' errors, the named-place form with and without an error, the clock-change note, sentence 5, a focused slot, and the Help and About pages. Contrast that axe cannot measure fails the check too, except text covered by an open popup, which is checked where nothing covers it. The named-place form lies over the answer's text, so it is checked with the page behind it hidden, and every word of it is measured. No violations were found, and none needed fixing. These are in `e2e/accessibility.spec.ts` and run in `pnpm check:full`. Lighthouse 13.5.0 gave the live site an accessibility score of 100 on 2026-10-10.

**Keyboard.** Tab reaches every slot in reading order; Enter opens each slot, Escape closes it, and focus returns to the slot, in every sentence. These are in `e2e/keyboard.spec.ts`. The named-place form opens from the list by keyboard with focus in its first field, and Escape returns focus to the place slot (`e2e/named-places.spec.ts`). Every button sets `tabindex="0"`, because Safari's default Tab order (with "Press Tab to highlight each item" off) skips buttons without one; the picker library's slot buttons already set it, so without it Tab reached the slots but not the Help button.

**Help and About.** The Help button comes after the sentence in reading order. Help ends with links to About and to its Privacy section. Each page opens with focus on its title, or on the Privacy heading from the Privacy link, and changes the page title. Close, Escape and the browser's Back button each go back one page, and back on the sentence, it is as it was, with focus on the Help button. These are in `e2e/pages.spec.ts` and `src/pages/Pages.test.tsx`.

**Contrast.** The text contrast is in [decision 0006](decisions/0006-visual-foundations.md). For the rest, against WCAG's 3:1 for interface parts and 4.5:1 for text:

| Element | Light | Dark |
|---|---|---|
| Slot text and underline on the ground | 5.4 | 8.4 |
| Focus highlight, and the slot text on it | 5.4 | 8.4 |
| Popup, input and note borders | 8.2 | 8.5 |
| Note accent bar | 5.7 | 7.7 |
| Highlighted list item, and Set, Update and Save buttons | 5.7 | 7.7 |

**Motion.** The app has no animations or transitions, so there is nothing for `prefers-reduced-motion` to reduce. Any added later must respect it.

## Fixes made

Made in the accessibility pass:

- **The answer is announced when a choice changes it**, from a hidden status region, but not on the minute tick, which would interrupt a screen reader every minute. The announcement clears five seconds later, so no stale copy stays on the page.

Made earlier, while building the sentences:

- **Focus stays on the time slot** after choosing "from now", "ago" or a chosen time, even though the slot moves within the sentence.
- **Error messages and the update notice** sit in regions that are always present, so screen readers announce them reliably.
- **The place slot announces as a button** with its value, as the place picker's issue asked, rather than as a combobox.
- **Edit is its own option** beside each saved place, not a button inside it, and Enter in the named-place form's city search picks a city rather than submitting the form.

## Still to be checked by a person

Automated checks cannot judge how the sentence sounds. Nobody has listened to TimeTravels through a screen reader yet: the checks below are tracked in [issue #42](https://github.com/biancapower/timetravels/issues/42), which isn't tied to a release.

1. **TalkBack on Android** (the maintainer's Pixel). Swipe through the sentence: does it read as one question, with each slot announced as a button with its value? Open each slot, choose something, and check the new answer is read out once. Base UI, the picker library, publishes no screen-reader test results ([decision 0008](decisions/0008-headless-component-library.md)), so this matters.
2. **VoiceOver on an iPad** (iPadOS 18.7.5), standing in for an iPhone. The same, with swipes.
3. **VoiceOver with Safari on a Mac.** The same, with the keyboard only, including the Help button and the Help and About pages.
