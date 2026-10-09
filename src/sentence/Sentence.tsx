import { useState, type ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import type { Place } from '../places/places';
import type { Duration } from '../time';
import { DirectionPicker, type When } from './DirectionPicker';
import { DurationPicker } from './DurationPicker';
import { formatDuration } from './formatDuration';
import { PlacePicker } from './PlacePicker';
import styles from './Sentence.module.css';

interface SentenceProps {
  when: When;
  duration: Duration;
  place: Place | null;
  places: readonly Place[];
  onWhenChange: (when: When) => void;
  onDurationChange: (duration: Duration) => void;
  onPlaceChange: (place: Place | null) => void;
}

/** The question, with each slot a picker. Which sentence it is follows the slots. */
export function Sentence({
  when,
  duration,
  place,
  places,
  onWhenChange,
  onDurationChange,
  onPlaceChange,
}: SentenceProps) {
  const intl = useIntl();
  // react-intl keys each slot by its position in the message, so choosing
  // "from now" or "ago" moves the direction slot and remounts it. Refocus it.
  const [directionChosen, setDirectionChosen] = useState(false);
  const chooseWhen = (chosen: When) => {
    setDirectionChosen(true);
    onWhenChange(chosen);
  };
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
          length: formatDuration(intl, duration),
          city: place?.city,
        }}
      />
    </h1>
  );
}
