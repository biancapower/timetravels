// Every piece of interface text, in ICU MessageFormat. A slot is a named
// tag, such as <now>now</now>, so a translation can move it.
const en = {
  'app.title': 'TimeTravels',
  'app.loadFailed':
    'TimeTravels could not load. Check your connection and reload the page.',
  'sentence.nowHere':
    'What time is it <place>here</place> <direction>right now</direction>?',
  'sentence.nowIn':
    'What time is it in <place>{city}</place> <direction>right now</direction>?',
  'sentence.laterHere':
    'What time will it be <place>here</place> <duration>{length}</duration> <direction>from now</direction>?',
  'sentence.laterIn':
    'What time will it be in <place>{city}</place> <duration>{length}</duration> <direction>from now</direction>?',
  'sentence.earlierHere':
    'What time was it <place>here</place> <duration>{length}</duration> <direction>ago</direction>?',
  'sentence.earlierIn':
    'What time was it in <place>{city}</place> <duration>{length}</duration> <direction>ago</direction>?',
  'sentence.afterHere':
    '{tense, select, past {What time was it} other {What time will it be}} <place>here</place> <duration>{length}</duration> <direction>after</direction> <anchor>{anchorText}</anchor>?',
  'sentence.afterIn':
    '{tense, select, past {What time was it} other {What time will it be}} in <place>{city}</place> <duration>{length}</duration> <direction>after</direction> <anchor>{anchorText}</anchor> <anchorPlace>{anchorPlaceText}</anchorPlace>?',
  'sentence.beforeHere':
    '{tense, select, past {What time was it} other {What time will it be}} <place>here</place> <duration>{length}</duration> <direction>before</direction> <anchor>{anchorText}</anchor>?',
  'sentence.beforeIn':
    '{tense, select, past {What time was it} other {What time will it be}} in <place>{city}</place> <duration>{length}</duration> <direction>before</direction> <anchor>{anchorText}</anchor> <anchorPlace>{anchorPlaceText}</anchorPlace>?',
  'answer.relativeDay': '{relativeDay}, {time}',
  'answer.transition':
    '{city}’s clocks {tense, select, past {went} other {go}} {direction, select, forward {forward} other {back}} {amount, plural, =60 {an hour} other {# minutes}} at {time} on {date}, so the clock {tense, select, past {moved} other {moves}} {clock} in these {span}.',
  'answer.skipped':
    'There was no {time} in {city} that day: the clocks went forward. This counts from {actual}.',
  'answer.repeated':
    '{time} happened twice in {city} that day, when the clocks went back. This counts from the first, at {offset}.',
  'anchor.today': '{time}',
  'anchor.tomorrow': '{time} tomorrow',
  'anchor.yesterday': '{time} yesterday',
  'anchorPlace.mine': 'my time',
  'anchorPlace.theirs': '{city} time',
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
  'duration.hoursMinutes':
    '{hours, plural, one {# hour} other {# hours}} {minutes, plural, one {# minute} other {# minutes}}',
  'directionPicker.label': 'Choose when',
  'directionPicker.now': 'right now',
  'directionPicker.later': 'from now',
  'directionPicker.earlier': 'ago',
  'directionPicker.after': 'after a time',
  'directionPicker.before': 'before a time',
  'durationPicker.label': 'Choose how long',
  'durationPicker.input': 'Type a duration',
  'durationPicker.placeholder': 'For example 90m or 1h30',
  'durationPicker.set': 'Set',
  'durationPicker.invalid': 'Couldn’t read that duration',
  'durationPicker.quick': 'Common durations',
  'update.available': 'A new version of TimeTravels is ready.',
  'update.reload': 'Update now',
  'update.later': 'Later',
  'placePicker.label': 'Choose a place',
  'placePicker.search': 'Search for a city',
  'placePicker.here': 'Here',
  'placePicker.empty': 'No matching places',
  'nav.help': 'Help',
  'nav.about': 'About',
  'nav.privacy': 'Privacy',
  'nav.close': 'Close',
  'footer.copyright': '© 2026 <link>the author</link>',
  'help.title': 'How TimeTravels works',
  'help.intro':
    'Ask a question in one sentence. The underlined words are choices: tap one to change it, and the answer updates straight away.',
  'help.choicesTitle': 'What you can change',
  'help.place':
    '<b>The place</b>, “here” at first: search for a city to ask about its time. Your choice is remembered on this device.',
  'help.direction':
    '<b>When</b>, “right now” at first: choose “from now” or “ago” to count a length of time from now, or “after a time” or “before a time” to count from a time you choose.',
  'help.duration':
    '<b>How long</b>, “1 hour” at first: pick a common length or type one, such as 10 (hours), 1.5h, 90m, 1h30 or 1:30, up to 999 hours.',
  'help.anchor':
    '<b>The time to count from</b>, such as “3 pm”: set a time and whether it is yesterday, today or tomorrow.',
  'help.anchorPlace':
    '<b>Whose time</b>, “my time” at first: with a place chosen, say whether that time is yours or the place’s.',
  'help.questionsTitle': 'Questions it can answer',
  'help.question1': 'What time is it here right now?',
  'help.question2': 'What time is it in London right now?',
  'help.question3': 'What time will it be in London 10 hours from now?',
  'help.question4': 'What time was it in London 8 hours ago?',
  'help.question5':
    'What time will it be in London 10 hours after 3 pm my time?',
  'help.clocks':
    'If the clocks change during the time you ask about, a note under the answer says so.',
  'help.offline':
    'TimeTravels works offline once it has loaded, and you can add it to your home screen.',
  'about.title': 'About TimeTravels',
  'about.what': 'TimeTravels is a time calculator you talk to in one sentence.',
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
    'There are no accounts. The place you choose is saved in your browser on this device, and is never sent anywhere.',
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
