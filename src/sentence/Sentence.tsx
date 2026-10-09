import type { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import type { Place } from '../places/places';
import { PlacePicker } from './PlacePicker';
import styles from './Sentence.module.css';

function slot(chunks: ReactNode[]) {
  return <span className={styles.slot}>{chunks}</span>;
}

interface SentenceProps {
  place: Place | null;
  places: readonly Place[];
  onPlaceChange: (place: Place | null) => void;
}

/** The question. The place slot is a picker; "now" is not interactive yet. */
export function Sentence({ place, places, onPlaceChange }: SentenceProps) {
  const placeSlot = (chunks: ReactNode[]) => (
    <PlacePicker
      place={place}
      places={places}
      onChange={onPlaceChange}
      className={styles.slot}
    >
      {chunks}
    </PlacePicker>
  );
  return (
    <h1 className={styles.sentence}>
      {place ? (
        <FormattedMessage
          id="sentence.nowIn"
          values={{ now: slot, place: placeSlot, city: place.city }}
        />
      ) : (
        <FormattedMessage
          id="sentence.nowHere"
          values={{ now: slot, place: placeSlot }}
        />
      )}
    </h1>
  );
}
