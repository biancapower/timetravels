# Changelog

What changed in each release of TimeTravels, newest first. Versions follow [semantic versioning](https://semver.org/). Changes not yet released are under Unreleased, grouped as [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) suggests.

## Unreleased

## 0.2.0, 2026-10-18

The place slot grows up: places by country, state or a name of your own, lengths of days to years, a time in a third place, and the question in the address.

### Added

- **Days, weeks, months and years** in the duration. "6 months from now" moves the date and keeps the clock time, using the month's last day when that day doesn't exist; hours and minutes stay exact. The common durations now include a day, a week and a month.
- **Home and your own named places,** such as "Mark's place", set up from the place picker and saved on this device. The question reads "at home" or "at Mark's place", and the answer names the place before its city.
- **Another place's time to count from:** "What time will it be in London 10 hours after 3 pm in Tokyo?"
- **A tick** beside the current choice in every picker.
- **Your own time** under another place's answer: "Saturday 9:41 am your time", naming your day only when it differs from the place's. There's no line when both clocks read the same.
- **The question is kept in the page's address,** so it can be bookmarked or sent to someone, Back and Forward step through your changes, and a reload keeps the whole question. About's privacy section says what the address holds.
- **Search by country and state:** "Japan" or "Tasmania" finds its time, and a country or state across several zones offers each, such as "Australia: Perth". The names of states come from GeoNames, credited in About.
- **A time somewhere else:** "What time will it be here when it's 10 am in London?", by choosing "at a time".

### Changed

- **Clock-change notes** say how the change moves the answer, not how far the clock moved, and a span of days or longer says the clock time is kept.
- **Dates and times follow your preferred language,** not the browser's interface language: an Australian English visitor in a US English browser sees "Sunday 4 October".
- **The chosen time's wording:** "after it's 10 am" while that time is still to come, "after 9 am" once it has passed; "my time" now reads "here", and "London time" reads "in London".
- **A refused duration says why:** it can't be read, days and longer need whole numbers, it's under a minute, or it's over the limit, which it names.
- **A focused word in the question** has a straight underline, and only the word whose picker is open is filled.

### Fixed

- **The page no longer scrolls** when everything fits on the screen.

### What it doesn't do yet

- Questions whose answer is a length of time, such as "How long until…".
- Places for someone who doesn't know where they are: a result doesn't show where in the world it is, continents such as "Africa" and parts of countries such as "England" aren't found, and there's no map ([issues #89](https://github.com/biancapower/timetravels/issues/89) and [#90](https://github.com/biancapower/timetravels/issues/90)).
- Languages other than English.
- Screen-reader listening checks ([issue #42](https://github.com/biancapower/timetravels/issues/42)).

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
- **Places around the world.** Search for a city; the list comes from the browser's own time-zone data, one city per zone, with common city names added. Your chosen place is remembered on the device.
- **Durations** picked from a list or typed: 10 (hours), 1.5h, 90m, 1h30 or 1:30, up to 999 hours.
- **Clock changes.** A note under the answer when the clocks change during the time asked about, and when a chosen time is skipped or happens twice that day.
- **Help and About pages,** with privacy, credits, and the licences of the code it includes.
- **Installs and works offline** on phones and desktops, and offers a new version without reloading under you.
- **Light and dark themes,** following your device.
- **Accessibility:** every screen checked against WCAG 2.2 AA with axe in both themes, and the sentence and its pickers usable from the keyboard alone.

### What it doesn't do yet

- Days, weeks, months or years as units: durations are in hours and minutes.
- Search by country or state: places are found by city name.
- A third place in the "after a time" question.
- Questions whose answer is a length of time, such as "How long until…".
- Languages other than English: the text is ready for translation, but only English exists.
- Screen-reader listening checks: nobody has used it with TalkBack or VoiceOver yet ([issue #42](https://github.com/biancapower/timetravels/issues/42)).
