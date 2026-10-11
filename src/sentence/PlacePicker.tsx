import { Combobox } from '@base-ui/react/combobox';
import { useMemo, useState, type ReactNode } from 'react';
import { useIntl } from 'react-intl';
import type { Where } from '../places/named';
import { filterPlaces, type Place } from '../places/places';
import styles from './PlacePicker.module.css';

type Choice = 'here' | Place;

function keyOf(choice: Choice): string {
  return choice === 'here' ? 'here' : `${choice.city}|${choice.zone}`;
}

interface PlacePickerProps {
  where: Where | null;
  places: readonly Place[];
  onChange: (where: Where | null) => void;
  className?: string;
  /** The slot's text, from the sentence's message. */
  children: ReactNode;
}

/** The place slot: a button that opens a search over every place, with "Here" first. */
export function PlacePicker({
  where,
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
    const typed = query.trim().toLocaleLowerCase(intl.locale);
    const offersHere = hereLabel
      .toLocaleLowerCase(intl.locale)
      .startsWith(typed);
    return offersHere ? ['here', ...matches] : matches;
  }, [places, query, hereLabel, intl.locale]);

  return (
    <Combobox.Root<Choice>
      items={choices}
      filteredItems={shown}
      value={where?.kind === 'city' ? where.place : 'here'}
      onValueChange={(choice) => {
        onChange(
          choice === 'here' || choice === null
            ? null
            : { kind: 'city', place: choice },
        );
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
      <Combobox.Trigger
        className={className}
        role="button"
        onKeyDown={(event) => {
          // On a closed trigger, Base UI picks the first place starting with
          // a typed letter, silently changing the answer, and has no option
          // to turn that off. This skips its handler for the same keys.
          const letter =
            event.key.length === 1 &&
            event.key !== ' ' &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey;
          if (letter) event.preventBaseUIHandler();
        }}
      >
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
