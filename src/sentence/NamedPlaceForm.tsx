import { Combobox } from '@base-ui/react/combobox';
import { Popover } from '@base-ui/react/popover';
import { useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useIntl } from 'react-intl';
import type { MessageId } from '../i18n/messages';
import {
  longestName,
  nameProblem,
  withNamed,
  withoutNamed,
  type NamedPlace,
  type SavedPlaces,
  type Where,
} from '../places/named';
import { filterPlaces, type Place } from '../places/places';
import styles from './NamedPlaceForm.module.css';

/** Home, or a named place: a new one, or `original` being changed. */
export type Editing =
  { kind: 'home' } | { kind: 'named'; original?: NamedPlace };

interface NamedPlaceFormProps {
  editing: Editing;
  /** The sentence's place now, which a save or a removal may change. */
  where: Where | null;
  saved: SavedPlaces;
  places: readonly Place[];
  homeDefault?: Place;
  /** The place slot, which the form opens against. */
  anchor: RefObject<HTMLElement | null>;
  /** Called with the new saved places and choice, or null on cancelling. */
  onDone: (next: { saved: SavedPlaces; where: Where | null } | null) => void;
}

const problemMessage = {
  empty: 'namedPlace.nameEmpty',
  long: 'namedPlace.nameLong',
  reserved: 'namedPlace.nameReserved',
  taken: 'namedPlace.nameTaken',
} as const satisfies Record<string, MessageId>;

/**
 * Sets up or changes home, or names a place: its name, its place from the
 * same search as the picker, and the sentence as it will read.
 */
export function NamedPlaceForm({
  editing,
  where,
  saved,
  places,
  homeDefault,
  anchor,
  onDone,
}: NamedPlaceFormProps) {
  const intl = useIntl();
  const text = (id: MessageId) => intl.formatMessage({ id });
  const isHome = editing.kind === 'home';
  const original = editing.kind === 'named' ? editing.original : undefined;
  const existing = isHome ? saved.home : original?.place;
  const [name, setName] = useState(original?.name ?? '');
  const initial = existing ?? (isHome ? (homeDefault ?? null) : null);
  const [place, setPlace] = useState<Place | null>(initial);
  const [query, setQuery] = useState(place?.city ?? '');
  const placeId = useId();
  const popup = useRef<HTMLDivElement>(null);
  const [tried, setTried] = useState(false);
  const errorId = useId();

  const trimmed = name.trim();
  // The field shows the chosen city's name; typing over it unchooses it.
  const chosen = place && query === place.city ? place : null;
  const problem = isHome
    ? null
    : nameProblem(name, saved, {
        reserved: [text('placePicker.here'), text('placePicker.home')],
        original: original?.name,
      });
  const error = !tried
    ? null
    : problem
      ? intl.formatMessage(
          { id: problemMessage[problem] },
          { max: longestName, name: trimmed },
        )
      : chosen
        ? null
        : text('namedPlace.placeMissing');

  const touched =
    name !== (original?.name ?? '') ||
    chosen?.city !== initial?.city ||
    chosen?.zone !== initial?.zone;

  /** Saves the form, or shows why it can't and reports false. */
  const save = () => {
    setTried(true);
    if (problem || !chosen) return false;
    if (isHome) {
      onDone({
        saved: { ...saved, home: chosen },
        where: { kind: 'home', place: chosen },
      });
      return true;
    }
    onDone({
      saved: withNamed(saved, { name: trimmed, place: chosen }, original?.name),
      where: { kind: 'named', name: trimmed, place: chosen },
    });
    return true;
  };

  const remove = () => {
    if (isHome) {
      onDone({
        saved: { ...saved, home: null },
        where: where?.kind === 'home' ? null : where,
      });
      return;
    }
    if (!original) return;
    onDone({
      saved: withoutNamed(saved, original.name),
      where:
        where?.kind === 'named' && where.name === original.name ? null : where,
    });
  };

  const title = isHome
    ? text('namedPlace.homeTitle')
    : original
      ? intl.formatMessage(
          { id: 'namedPlace.editTitle' },
          { name: original.name },
        )
      : text('namedPlace.addTitle');
  const shown = filterPlaces(places, query);

  return (
    <Popover.Root
      open
      onOpenChange={(open, details) => {
        if (open) return;
        // Tapping or tabbing away keeps a change, as leaving a field
        // does; a change that can't be saved yet keeps the form open.
        const leaving =
          details.reason === 'outside-press' || details.reason === 'focus-out';
        if (!leaving || !touched) onDone(null);
        else if (!save()) details.cancel();
      }}
    >
      <Popover.Portal>
        <Popover.Positioner anchor={anchor} align="start" sideOffset={8}>
          <Popover.Popup
            ref={popup}
            className={styles.popup}
            // A new place starts in its name field; otherwise nothing needs
            // typing yet, and a phone's keyboard would cover the form.
            initialFocus={isHome || original ? popup : true}
            finalFocus={anchor}
          >
            <form
              className={styles.form}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                save();
              }}
            >
              <Popover.Title className={styles.title}>{title}</Popover.Title>
              {!isHome && (
                <label className={styles.field}>
                  {text('namedPlace.name')}
                  <input
                    className={styles.input}
                    value={name}
                    autoComplete="off"
                    aria-invalid={error && problem ? true : undefined}
                    aria-describedby={error && problem ? errorId : undefined}
                    onChange={(event) => {
                      setName(event.target.value);
                    }}
                  />
                </label>
              )}
              <div className={styles.field}>
                <label htmlFor={placeId}>{text('namedPlace.place')}</label>
                <Combobox.Root<Place>
                  inline
                  open
                  items={places}
                  filteredItems={shown}
                  value={chosen}
                  onValueChange={(next) => {
                    if (!next) return;
                    setPlace(next);
                    setQuery(next.city);
                  }}
                  inputValue={query}
                  onInputValueChange={setQuery}
                  itemToStringLabel={(item) => item.city}
                  isItemEqualToValue={(a, b) =>
                    a.city === b.city && a.zone === b.zone
                  }
                >
                  <Combobox.Input
                    id={placeId}
                    className={styles.input}
                    placeholder={text('placePicker.search')}
                    onKeyDown={(event) => {
                      // Enter here picks the highlighted city; it never
                      // submits the form, even with none highlighted.
                      if (event.key === 'Enter') event.preventDefault();
                    }}
                  />
                  {/* Cities are listed only while the field is searched. */}
                  <Combobox.List className={styles.list} hidden={!!chosen}>
                    {(choice: Place) => (
                      <Combobox.Item
                        key={`${choice.city}|${choice.zone}`}
                        value={choice}
                        className={styles.item}
                      >
                        {choice.city}
                      </Combobox.Item>
                    )}
                  </Combobox.List>
                </Combobox.Root>
              </div>
              {(isHome || trimmed) && (
                <div className={styles.preview}>
                  <p className={styles.previewLabel}>
                    {text('namedPlace.preview')}
                  </p>
                  <p className={styles.sentence}>
                    {intl.formatMessage(
                      { id: 'sentence.nowIn' },
                      {
                        kind: isHome ? 'home' : 'named',
                        name: trimmed,
                        city: chosen?.city,
                        place: (chunks: ReactNode[]) => (
                          <span className={styles.slot}>{chunks}</span>
                        ),
                        direction: (chunks: ReactNode[]) => chunks,
                      },
                    )}
                  </p>
                </div>
              )}
              <p id={errorId} className={styles.error} role="alert">
                {error}
              </p>
              <div className={styles.actions}>
                <button type="submit" className={styles.save}>
                  {text('namedPlace.save')}
                </button>
                {existing && (
                  <button
                    type="button"
                    className={styles.button}
                    onClick={remove}
                  >
                    {text(
                      isHome ? 'namedPlace.clearHome' : 'namedPlace.remove',
                    )}
                  </button>
                )}
                <Popover.Close type="button" className={styles.button}>
                  {text('namedPlace.cancel')}
                </Popover.Close>
              </div>
            </form>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
