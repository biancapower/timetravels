import { useState, type ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
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
  place: Place | null;
  places: readonly Place[];
  anchor: AnchorSetting;
  /** Whether the answer is in the past, which sets the verb of sentence 5. */
  tense: 'past' | 'future';
  onWhenChange: (when: When) => void;
  onDurationChange: (duration: Duration) => void;
  onPlaceChange: (place: Place | null) => void;
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
  place,
  places,
  anchor,
  tense,
  onWhenChange,
  onDurationChange,
  onPlaceChange,
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
    { time: formatClockTime(anchor.time) },
  );
  const anchorPlaceText = anchor.inPlace
    ? intl.formatMessage({ id: 'anchorPlace.theirs' }, { city: place?.city })
    : intl.formatMessage({ id: 'anchorPlace.mine' });

  return (
    <h1 className={styles.sentence}>
      <FormattedMessage
        id={`sentence.${when}${place ? 'In' : 'Here'}`}
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
              place={place}
              places={places}
              onChange={onPlaceChange}
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
              inPlace={anchor.inPlace}
              city={place?.city ?? ''}
              onChange={(inPlace) => {
                onAnchorChange({ ...anchor, inPlace });
              }}
              className={styles.slot}
            >
              {chunks}
            </AnchorPlacePicker>
          ),
          length: formatDuration(intl, duration),
          city: place?.city,
          anchorText,
          anchorPlaceText,
          tense,
        }}
      />
    </h1>
  );
}
