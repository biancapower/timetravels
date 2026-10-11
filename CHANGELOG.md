# Changelog

What changed in each release of TimeTravels, newest first. Versions follow [semantic versioning](https://semver.org/).

## 0.1.0, 2026-10-11

The first release, live at [timetravels.dev](https://timetravels.dev).

### What it does

- **Asks in plain words.** The question is a sentence; tap an underlined word to change it, and the answer updates straight away.
- **Five questions:**
  - What time is it here right now?
  - What time is it in London right now?
  - What time will it be in London 10 hours from now?
  - What time was it in London 8 hours ago?
  - What time will it be in London 10 hours after 3 pm my time?
- **Any time zone.** Search for a city; the list comes from the browser's own time-zone data, with common city names added. Your chosen place is remembered on the device.
- **Durations** picked from a list or typed: 10 (hours), 1.5h, 90m, 1h30 or 1:30, up to 999 hours.
- **Clock changes.** A note under the answer when the clocks change during the time asked about, and when a chosen time is skipped or happens twice that day.
- **Help and About pages,** with privacy, credits, and the licences of the code it includes.
- **Installs and works offline** on phones and desktops, and offers a new version without reloading under you.
- **Light and dark themes,** following your device.
- **Accessibility:** every screen checked against WCAG 2.2 AA with axe in both themes, and every choice usable from the keyboard.

### What it doesn't do yet

- Days, weeks, months or years as units: durations are in hours and minutes.
- Search by country or state: places are found by city name.
- A third place in the "after a time" question.
- Questions whose answer is a length of time, such as "How long until…".
- Languages other than English: the text is ready for translation, but only English exists.
- Screen-reader listening checks: nobody has used it with TalkBack or VoiceOver yet ([issue #42](https://github.com/biancapower/timetravels/issues/42)).
