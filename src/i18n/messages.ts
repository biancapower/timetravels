// Every piece of interface text, in ICU MessageFormat. A slot is a named
// tag, such as <now>now</now>, so a translation can move it.
const en = {
  'app.title': 'TimeTravels',
  'app.loadFailed':
    'TimeTravels could not load. Check your connection and reload the page.',
  'sentence.nowHere':
    'What time is it <direction>now</direction> <place>here</place>?',
  'sentence.nowIn':
    'What time is it <direction>now</direction> in <place>{city}</place>?',
  'sentence.laterHere':
    'What time will it be <duration>{length}</duration> <direction>from now</direction> <place>here</place>?',
  'sentence.laterIn':
    'What time will it be <duration>{length}</duration> <direction>from now</direction> in <place>{city}</place>?',
  'sentence.earlierHere':
    'What time was it <duration>{length}</duration> <direction>ago</direction> <place>here</place>?',
  'sentence.earlierIn':
    'What time was it <duration>{length}</duration> <direction>ago</direction> in <place>{city}</place>?',
  'answer.relativeDay': '{relativeDay}, {time}',
  'duration.hours': '{hours, plural, one {# hour} other {# hours}}',
  'duration.minutes': '{minutes, plural, one {# minute} other {# minutes}}',
  'duration.hoursMinutes':
    '{hours, plural, one {# hour} other {# hours}} {minutes, plural, one {# minute} other {# minutes}}',
  'directionPicker.label': 'Choose when',
  'directionPicker.now': 'now',
  'directionPicker.later': 'from now',
  'directionPicker.earlier': 'ago',
  'durationPicker.label': 'Choose how long',
  'durationPicker.input': 'Type a duration',
  'durationPicker.placeholder': 'For example 90m or 1h30',
  'durationPicker.set': 'Set',
  'durationPicker.invalid': 'Couldn’t read that duration',
  'durationPicker.quick': 'Common durations',
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
