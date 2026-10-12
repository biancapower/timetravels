import { isValidElement, useState, type ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import type { SavedPlaces, Where } from '../places/named';
import type { Place } from '../places/places';
import { formatClockTime, type AnchorDay, type Duration } from '../time';
import { AnchorPicker } from './AnchorPicker';
import { AnchorPlacePicker } from './AnchorPlacePicker';
import { DirectionPicker, type When } from './DirectionPicker';
import { DurationPicker } from './DurationPicker';
import { formatDuration } from './formatDuration';
import { PlacePicker } from './PlacePicker';
import type { AnchorSetting } from './resolveAnswer';
import styles from './Sentence.module.css';

interface SentenceProps {
  when: When;
  duration: Duration;
  where: Where | null;
  places: readonly Place[];
  saved: SavedPlaces;
  /** Where home starts when it is set up. */
  homeDefault?: Place;
  anchor: AnchorSetting;
  /** Whether the answer is in the past, which sets the verb of sentence 5. */
  tense: 'past' | 'future';
  /** Whether the chosen time, or the answer, is past, which drops "it's" before it. */
  anchorTense: 'past' | 'future';
  onWhenChange: (when: When) => void;
  onDurationChange: (duration: Duration) => void;
  onPlaceChange: (where: Where | null) => void;
  onSavedChange: (saved: SavedPlaces, where: Where | null) => void;
  onAnchorChange: (anchor: AnchorSetting) => void;
}

const anchorDayMessage = {
  [-1]: 'anchor.yesterday',
  0: 'anchor.today',
  1: 'anchor.tomorrow',
} as const satisfies Record<AnchorDay, string>;

/** The question, with each slot a picker. Which sentence it is follows the slots. */
export function Sentence({
  when,
  duration,
  where,
  places,
  saved,
  homeDefault,
  anchor,
  tense,
  anchorTense,
  onWhenChange,
  onDurationChange,
  onPlaceChange,
  onSavedChange,
  onAnchorChange,
}: SentenceProps) {
  const intl = useIntl();
  // react-intl keys each slot by its position in the message, so a choice
  // that changes the sentence can move the direction slot and remount it.
  // Refocus it.
  const [directionChosen, setDirectionChosen] = useState(false);
  const chooseWhen = (chosen: When) => {
    setDirectionChosen(true);
    onWhenChange(chosen);
  };
  const anchorText = intl.formatMessage(
    { id: anchorDayMessage[anchor.day] },
    { time: formatClockTime(anchor.time, { locale: intl.locale }) },
  );
  const anchorPlaceText =
    anchor.whose === 'mine'
      ? intl.formatMessage({ id: 'anchorPlace.mine' })
      : intl.formatMessage(
          { id: 'anchorPlace.theirs' },
          {
            city:
              anchor.whose === 'theirs' ? where?.place.city : anchor.whose.city,
          },
        );

  return (
    <h1 className={styles.sentence}>
      <FormattedMessage
        id={`sentence.${when}${where ? 'In' : 'Here'}`}
        values={{
          direction: (chunks: ReactNode[]) => (
            <DirectionPicker
              value={when}
              onChange={chooseWhen}
              focusOnMount={directionChosen}
              className={styles.slot}
            >
              {chunks}
            </DirectionPicker>
          ),
          duration: (chunks: ReactNode[]) => (
            <DurationPicker onChange={onDurationChange} className={styles.slot}>
              {chunks}
            </DurationPicker>
          ),
          place: (chunks: ReactNode[]) => (
            <PlacePicker
              where={where}
              places={places}
              saved={saved}
              homeDefault={homeDefault}
              onChange={onPlaceChange}
              onSavedChange={onSavedChange}
              className={styles.slot}
            >
              {chunks}
            </PlacePicker>
          ),
          anchor: (chunks: ReactNode[]) => (
            <AnchorPicker
              time={anchor.time}
              day={anchor.day}
              onChange={(time, day) => {
                onAnchorChange({ ...anchor, time, day });
              }}
              className={styles.slot}
            >
              {chunks}
            </AnchorPicker>
          ),
          anchorPlace: (chunks: ReactNode[]) => (
            <AnchorPlacePicker
              whose={anchor.whose}
              city={where?.place.city ?? ''}
              places={places}
              onChange={(whose) => {
                onAnchorChange({ ...anchor, whose });
              }}
              className={styles.slot}
            >
              {chunks}
            </AnchorPlacePicker>
          ),
          length: formatDuration(intl, duration),
          kind: where?.kind,
          city: where?.place.city,
          name: where?.kind === 'named' ? where.name : undefined,
          anchorText,
          anchorPlaceText,
          tense,
          anchorTense,
        }}
      >
        {(nodes) => <>{keepEndTogether(nodes)}</>}
      </FormattedMessage>
    </h1>
  );
}

/**
 * Groups the last slot with the punctuation after it, such as the closing
 * "?", so the punctuation can't wrap onto a line of its own. Safari breaks
 * between a button and the text after it; Chrome doesn't. It applies when a
 * message ends with a slot followed by text, as every sentence does now; a
 * message ending any other way is left as it is.
 */
function keepEndTogether(nodes: ReactNode[]): ReactNode[] {
  const end = nodes.at(-1);
  const slot = nodes.at(-2);
  if (typeof end !== 'string' || !isValidElement(slot)) return nodes;
  return [
    ...nodes.slice(0, -2),
    <span key="end" className={styles.end}>
      {slot}
      {end}
    </span>,
  ];
}
