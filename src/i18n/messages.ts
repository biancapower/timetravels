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
