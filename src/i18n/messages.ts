// Every piece of interface text, in ICU MessageFormat. A slot is a named
// tag, such as <now>now</now>, so a translation can move it.
const en = {
  'app.title': 'TimeTravels',
  'app.loadFailed':
    'TimeTravels could not load. Check your connection and reload the page.',
  'sentence.nowHere':
    'What time is it <place>here</place> <direction>right now</direction>?',
  'sentence.nowIn':
    'What time is it {kind, select, home {at <place>home</place>} named {at <place>{name}</place>} other {in <place>{city}</place>}} <direction>right now</direction>?',
  'sentence.laterHere':
    'What time will it be <place>here</place> <duration>{length}</duration> <direction>from now</direction>?',
  'sentence.laterIn':
    'What time will it be {kind, select, home {at <place>home</place>} named {at <place>{name}</place>} other {in <place>{city}</place>}} <duration>{length}</duration> <direction>from now</direction>?',
  'sentence.earlierHere':
    'What time was it <place>here</place> <duration>{length}</duration> <direction>ago</direction>?',
  'sentence.earlierIn':
    'What time was it {kind, select, home {at <place>home</place>} named {at <place>{name}</place>} other {in <place>{city}</place>}} <duration>{length}</duration> <direction>ago</direction>?',
  'sentence.afterHere':
    '{tense, select, past {What time was it} other {What time will it be}} <place>here</place> <duration>{length}</duration> <direction>after</direction> {anchorTense, select, past {} other {it’s }}<anchor>{anchorText}</anchor>?',
  'sentence.afterIn':
    '{tense, select, past {What time was it} other {What time will it be}} {kind, select, home {at <place>home</place>} named {at <place>{name}</place>} other {in <place>{city}</place>}} <duration>{length}</duration> <direction>after</direction> {anchorTense, select, past {} other {it’s }}<anchor>{anchorText}</anchor> <anchorPlace>{anchorPlaceText}</anchorPlace>?',
  'sentence.beforeHere':
    '{tense, select, past {What time was it} other {What time will it be}} <place>here</place> <duration>{length}</duration> <direction>before</direction> {anchorTense, select, past {} other {it’s }}<anchor>{anchorText}</anchor>?',
  'sentence.beforeIn':
    '{tense, select, past {What time was it} other {What time will it be}} {kind, select, home {at <place>home</place>} named {at <place>{name}</place>} other {in <place>{city}</place>}} <duration>{length}</duration> <direction>before</direction> {anchorTense, select, past {} other {it’s }}<anchor>{anchorText}</anchor> <anchorPlace>{anchorPlaceText}</anchorPlace>?',
  'answer.relativeDay': '{relativeDay}, {time}',
  'answer.named': '{name} ({city}, {offset})',
  'answer.yourTime': '{time} your time',
  'answer.transition':
    '{city}’s clocks {tense, select, past {went} other {go}} {direction, select, forward {forward} other {back}} {amount, plural, =60 {an hour} other {# minutes}} at {time} on {date}, so {whose, select, answer {the answer} other {the time in {city}}} is {amount, plural, =60 {an hour} other {# minutes}} {shift, select, later {later} other {earlier}} than counting {count, select, back {back on} other {on}} the clock gives.',
  'answer.transitionCalendar':
    '{city}’s clocks {tense, select, past {went} other {go}} {direction, select, forward {forward} other {back}} {amount, plural, =60 {an hour} other {# minutes}} at {time} on {date}{reach, select, later {, so {span} from now is {actual} away} earlier {, so {span} ago was {actual} ago} after {, so {span} after {anchor} is {actual} after it} before {, so {span} before {anchor} is {actual} before it} other {}}.',
  'answer.calendarKept':
    'Calculations done in days or longer keep the clock time, so the answer is the same time of day.',
  'answer.landingSkipped':
    '{tense, select, past {There was no} other {There’s no}} {time} in {city} on {date}: the clocks {tense, select, past {went} other {go}} forward. This counts from {actual}.',
  'answer.landingRepeated':
    '{time} {tense, select, past {happened} other {happens}} twice in {city} on {date}, when the clocks {tense, select, past {went} other {go}} back. This counts from the first, at {offset}.',
  'answer.skipped':
    'There was no {time} in {city} that day: the clocks went forward. This counts from {actual}.',
  'answer.repeated':
    '{time} happened twice in {city} that day, when the clocks went back. This counts from the first, at {offset}.',
  'anchor.today': '{time}',
  'anchor.tomorrow': '{time} tomorrow',
  'anchor.yesterday': '{time} yesterday',
  'anchorPlace.mine': 'here',
  'anchorPlace.theirs': 'in {city}',
  'anchorPlace.other': 'another place…',
  'anchorPlacePicker.label': 'Whose time',
  'anchorPicker.label': 'Choose a time',
  'anchorPicker.time': 'Time',
  'anchorPicker.day': 'Day',
  'anchorPicker.yesterday': 'Yesterday',
  'anchorPicker.today': 'Today',
  'anchorPicker.tomorrow': 'Tomorrow',
  'anchorPicker.set': 'Set',
  'anchorPicker.invalid': 'Choose a time',
  'duration.hours': '{hours, plural, one {# hour} other {# hours}}',
  'duration.minutes': '{minutes, plural, one {# minute} other {# minutes}}',
  'duration.years': '{years, plural, one {# year} other {# years}}',
  'duration.months': '{months, plural, one {# month} other {# months}}',
  'duration.weeks': '{weeks, plural, one {# week} other {# weeks}}',
  'duration.days': '{days, plural, one {# day} other {# days}}',
  'directionPicker.label': 'Choose when',
  'directionPicker.now': 'right now',
  'directionPicker.later': 'from now',
  'directionPicker.earlier': 'ago',
  'directionPicker.after': 'after a time',
  'directionPicker.before': 'before a time',
  'durationPicker.label': 'Choose how long',
  'durationPicker.input': 'Type a duration',
  'durationPicker.placeholder': 'e.g. 90m, 1h30 or 6mo',
  'durationPicker.set': 'Set',
  'durationPicker.unreadable': 'Couldn’t read that. Try 90m, 1h30 or 6mo.',
  'durationPicker.notWhole':
    'Days, weeks, months and years take whole numbers, such as 2 days.',
  'durationPicker.zero': 'Make it at least 1 minute.',
  'durationPicker.tooLong':
    'That’s too long. Keep it under {limit, number} {unit, select, years {years} months {months} weeks {weeks} days {days} other {hours}}.',
  'durationPicker.quick': 'Common durations',
  'update.available': 'A new version of TimeTravels is ready.',
  'update.reload': 'Update now',
  'update.later': 'Later',
  'placePicker.label': 'Choose a place',
  'placePicker.search': 'Search for a city',
  'placePicker.here': 'Here',
  'placePicker.home': 'Home',
  'placePicker.empty': 'No matching places',
  'placePicker.homeUnset': 'not set up',
  'placePicker.add': 'Name a place',
  'placePicker.edit': 'Edit {name}',
  'placePicker.editShort': 'Edit',
  'namedPlace.addTitle': 'Name a place',
  'namedPlace.editTitle': 'Change {name}',
  'namedPlace.homeTitle': 'Where is home?',
  'namedPlace.name': 'Name',
  'namedPlace.place': 'Place',
  'namedPlace.placeMissing': 'Choose a place for it.',
  'namedPlace.preview': 'It will read',
  'namedPlace.save': 'Save',
  'namedPlace.remove': 'Remove',
  'namedPlace.clearHome': 'Clear home',
  'namedPlace.cancel': 'Cancel',
  'namedPlace.nameEmpty': 'Give the place a name.',
  'namedPlace.nameLong': 'Keep the name to {max} characters or fewer.',
  'namedPlace.nameReserved':
    '“{name}” is already one of the choices. Try another name.',
  'namedPlace.nameTaken': 'You already have a place called “{name}”.',
  'nav.help': 'Help',
  'nav.close': 'Close',
  'nav.pageTitle': '{page} · TimeTravels',
  'help.title': 'How TimeTravels works',
  'help.intro':
    'Your question is written as an everyday sentence, the way you’d say it out loud. The underlined words are the parts you can change: tap one, pick something else, and the answer updates straight away.',
  'help.choicesTitle': 'What you can change',
  'help.place':
    '<b>The place</b>, “here” at first: search for a city to ask about its time. The answer gives your own time too, when the clocks differ. Your choice is remembered on this device.',
  'help.named':
    '<b>Your own places</b>, in the same list: set up “Home”, or use “Name a place” to give a place a name of your own, such as “Mark’s place”, so the question reads “at Mark’s place”. Use Edit beside one to rename it, move it or remove it.',
  'help.direction':
    '<b>When</b>, “right now” at first: choose “from now” or “ago” to count a length of time from now, or “after a time” or “before a time” to count from a time you choose.',
  'help.duration':
    '<b>How long</b>, once you choose “from now”, “ago”, “after a time” or “before a time”: pick a common length or type one, such as 10 (hours), 1.5h, 90m, 1h30, 1:30, 3d, 2 weeks, 6 months or 1y. Hours and minutes are exact; days and longer keep the clock time, so 1 day from now is this time tomorrow even if the clocks change. In “1 day 2 hours”, the day comes first, then the hours.',
  'help.anchor':
    '<b>The time to count from</b>, such as “3 pm”, with “after a time” or “before a time”: set a time and whether it is yesterday, today or tomorrow.',
  'help.anchorPlace':
    '<b>Whose time</b>, “here” at first: with a place chosen, say whether that time is yours, the place’s, or another place’s, such as “3 pm in Tokyo”.',
  'help.questionsTitle': 'Questions it can answer',
  'help.question1': 'What time is it here right now?',
  'help.question2': 'What time is it in London right now?',
  'help.question3': 'What time will it be in London 10 hours from now?',
  'help.question4': 'What time was it in London 8 hours ago?',
  'help.question5':
    'What time will it be in London 10 hours after it’s 3 pm here?',
  'help.clocks':
    'If the clocks change during the time you ask about, a note under the answer says so.',
  'help.offline':
    'TimeTravels works offline once it has loaded, and you can add it to your home screen.',
  'help.more':
    '<about>About TimeTravels</about>, including <privacy>privacy</privacy> and credits.',
  'about.title': 'About TimeTravels',
  'about.what':
    'TimeTravels is a time calculator you ask in plain words, the way you’d ask a person.',
  'about.version': 'Version {version}',
  'about.source':
    'The source code is on <link>GitHub</link>, under the MIT licence.',
  'about.feedback':
    'Found a problem, or have an idea? <link>Open an issue on GitHub</link>.',
  'about.accessibilityTitle': 'Accessibility',
  'about.accessibility':
    'Every screen is checked against WCAG 2.2 AA in light and dark themes, and every choice works from the keyboard. <link>How it was checked</link>.',
  'about.privacyTitle': 'Privacy',
  'about.privacyStorage':
    'There are no accounts. The places you choose, your home and the places you name are saved in your browser on this device, and are never sent anywhere. Your browser also keeps a copy of the app itself, so it works offline.',
  'about.privacyAnalytics':
    'The site uses Cloudflare Web Analytics to count page views and measure page speed. It sets no cookies, and Cloudflare says it does not collect or use visitors’ personal data.',
  'about.creditsTitle': 'Credits',
  'about.credits':
    'Built with React, react-intl, Base UI, temporal-polyfill and Open Props. The CSS reset is <reset>A (more) modern CSS reset</reset> by Andy Bell, under <licence>CC BY 3.0</licence>.',
  'about.licences':
    '<link>Licences for all the code TimeTravels includes</link>',
} as const;

export type MessageId = keyof typeof en;
export type Messages = Record<MessageId, string>;

export const catalogues = { en } satisfies Record<string, Messages>;
export type Locale = keyof typeof catalogues;

const fallback: Locale = 'en';

function hasCatalogue(language: string): language is Locale {
  return Object.hasOwn(catalogues, language);
}

/** The first preferred language with messages, or English. */
export function pickLocale(preferred: readonly string[]): Locale {
  for (const tag of preferred) {
    let language: string;
    try {
      language = new Intl.Locale(tag).language;
    } catch {
      continue; // A malformed tag, such as "en_US", names no language.
    }
    if (hasCatalogue(language)) return language;
  }
  return fallback;
}
