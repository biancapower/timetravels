import { Combobox } from '@base-ui/react/combobox';
import { useMemo, useState, type ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { filterPlaces, type Place } from '../places/places';
import styles from './PlacePicker.module.css';

type Choice = 'here' | Place;

function keyOf(choice: Choice): string {
  return choice === 'here' ? 'here' : `${choice.city}|${choice.zone}`;
}

interface PlacePickerProps {
  place: Place | null;
  places: readonly Place[];
  onChange: (place: Place | null) => void;
  className?: string;
  /** The slot's text, from the sentence's message. */
  children: ReactNode;
}

/** The place slot: a button that opens a search over every place, with "Here" first. */
export function PlacePicker({
  place,
  places,
  onChange,
  className,
  children,
}: PlacePickerProps) {
  const intl = useIntl();
  const [query, setQuery] = useState('');
  const hereLabel = intl.formatMessage({ id: 'placePicker.here' });
  const searchLabel = intl.formatMessage({ id: 'placePicker.search' });

  const choices = useMemo<Choice[]>(() => ['here', ...places], [places]);
  const shown = useMemo<Choice[]>(() => {
    const matches = filterPlaces(places, query);
    return query.trim() ? matches : ['here', ...matches];
  }, [places, query]);

  return (
    <Combobox.Root<Choice>
      items={choices}
      filteredItems={shown}
      value={place ?? 'here'}
      onValueChange={(choice) => {
        onChange(choice === 'here' || choice === null ? null : choice);
      }}
      inputValue={query}
      onInputValueChange={setQuery}
      onOpenChange={(open) => {
        if (!open) setQuery('');
      }}
      itemToStringLabel={(choice) =>
        choice === 'here' ? hereLabel : choice.city
      }
      isItemEqualToValue={(a, b) => keyOf(a) === keyOf(b)}
    >
      <Combobox.Trigger className={className} role="button">
        {children}
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner align="start" sideOffset={8}>
          <Combobox.Popup
            className={styles.popup}
            aria-label={intl.formatMessage({ id: 'placePicker.label' })}
          >
            <Combobox.Input
              className={styles.input}
              placeholder={searchLabel}
              aria-label={searchLabel}
            />
            <Combobox.Empty className={styles.empty}>
              {intl.formatMessage({ id: 'placePicker.empty' })}
            </Combobox.Empty>
            <Combobox.List className={styles.list}>
              {(choice: Choice) => (
                <Combobox.Item
                  key={keyOf(choice)}
                  value={choice}
                  className={styles.item}
                >
                  {choice === 'here' ? hereLabel : choice.city}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
