import { Combobox } from '@base-ui/react/combobox';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useIntl } from 'react-intl';
import type { MessageId } from '../i18n/messages';
import type { SavedPlaces, Where } from '../places/named';
import { filterPlaces, fold, type Place } from '../places/places';
import { NamedPlaceForm, type Editing } from './NamedPlaceForm';
import styles from './PlacePicker.module.css';

type Item =
  | { kind: 'here' }
  | { kind: 'home' }
  | { kind: 'named'; name: string; place: Place }
  | { kind: 'city'; place: Place }
  | { kind: 'add' }
  | { kind: 'edit'; editing: Editing };

function keyOf(item: Item): string {
  switch (item.kind) {
    case 'named':
      return `named|${item.name}`;
    case 'city':
      return `city|${item.place.city}|${item.place.zone}`;
    case 'edit':
      return `edit|${item.editing.kind === 'home' ? '' : (item.editing.original?.name ?? '')}`;
    default:
      return item.kind;
  }
}

function itemOf(where: Where | null): Item {
  if (!where) return { kind: 'here' };
  return where.kind === 'home' ? { kind: 'home' } : where;
}

interface PlacePickerProps {
  where: Where | null;
  places: readonly Place[];
  saved: SavedPlaces;
  /** Where home starts when it is set up: the device's own place. */
  homeDefault?: Place;
  onChange: (where: Where | null) => void;
  /** Home or a named place was saved or removed, and this is now the choice. */
  onSavedChange: (saved: SavedPlaces, where: Where | null) => void;
  className?: string;
  /** The slot's text, from the sentence's message. */
  children: ReactNode;
}

/**
 * The place slot: a button that opens a search over every place. "Here",
 * home and the person's named places come first, each named one with an
 * Edit option beside it, then a way to name a new one.
 */
export function PlacePicker({
  where,
  places,
  saved,
  homeDefault,
  onChange,
  onSavedChange,
  className,
  children,
}: PlacePickerProps) {
  const intl = useIntl();
  const slot = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState('');
  // The form opens once the list has closed, so the list's own return of
  // focus to the slot can't pull focus out of the form.
  const pending = useRef<Editing | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const text = (id: MessageId) => intl.formatMessage({ id });
  const hereLabel = text('placePicker.here');
  const homeLabel = text('placePicker.home');
  const addLabel = text('placePicker.add');
  const searchLabel = text('placePicker.search');

  const label = (item: Item): string => {
    switch (item.kind) {
      case 'here':
        return hereLabel;
      case 'home':
        return homeLabel;
      case 'named':
        return item.name;
      case 'city':
        return item.place.city;
      case 'add':
        return addLabel;
      case 'edit':
        return intl.formatMessage(
          { id: 'placePicker.edit' },
          {
            name:
              item.editing.kind === 'home'
                ? homeLabel
                : (item.editing.original?.name ?? ''),
          },
        );
    }
  };

  const mine = useMemo<Item[]>(() => {
    const items: Item[] = [{ kind: 'home' }];
    if (saved.home) items.push({ kind: 'edit', editing: { kind: 'home' } });
    for (const entry of saved.named) {
      items.push({ kind: 'named', ...entry });
      items.push({ kind: 'edit', editing: { kind: 'named', original: entry } });
    }
    return items;
  }, [saved]);
  const cities = useMemo<Item[]>(
    () => places.map((place) => ({ kind: 'city', place })),
    [places],
  );
  const items = useMemo<Item[]>(
    () => [{ kind: 'here' }, ...mine, { kind: 'add' }, ...cities],
    [mine, cities],
  );
  const shown = useMemo<Item[]>(() => {
    const typed = fold(query.trim());
    if (!typed) return items;
    const starts = (name: string) => fold(name).startsWith(typed);
    const found: Item[] = [];
    if (starts(hereLabel)) found.push({ kind: 'here' });
    // The app's own words match from their start, as Here always has; a
    // name the person chose matches anywhere in it, as a city does. An Edit
    // option stays beside the place it edits.
    let keep = false;
    for (const item of mine) {
      if (item.kind === 'home') keep = starts(homeLabel);
      else if (item.kind === 'named') keep = fold(item.name).includes(typed);
      if (keep) found.push(item);
    }
    if (starts(addLabel)) found.push({ kind: 'add' });
    for (const place of filterPlaces(places, query))
      found.push({ kind: 'city', place });
    return found;
  }, [items, mine, places, query, hereLabel, homeLabel, addLabel]);

  const choose = (item: Item | null) => {
    if (!item) return;
    switch (item.kind) {
      case 'here':
        onChange(null);
        return;
      case 'city':
      case 'named':
        onChange(item);
        return;
      case 'home':
        if (saved.home) onChange({ kind: 'home', place: saved.home });
        else pending.current = { kind: 'home' };
        return;
      case 'add':
        pending.current = { kind: 'named' };
        return;
      case 'edit':
        pending.current = item.editing;
        return;
    }
  };

  const detail = (city: string) => (
    <>
      {' '}
      <span className={styles.detail}>{city}</span>
    </>
  );

  return (
    <>
      <Combobox.Root<Item>
        items={items}
        filteredItems={shown}
        value={itemOf(where)}
        onValueChange={choose}
        inputValue={query}
        onInputValueChange={setQuery}
        onOpenChange={(open) => {
          if (!open) setQuery('');
        }}
        onOpenChangeComplete={(open) => {
          if (open || !pending.current) return;
          setEditing(pending.current);
          pending.current = null;
        }}
        itemToStringLabel={label}
        itemToStringValue={label}
        isItemEqualToValue={(a, b) => keyOf(a) === keyOf(b)}
      >
        <Combobox.Trigger
          ref={slot}
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
              aria-label={text('placePicker.label')}
            >
              <Combobox.Input
                className={styles.input}
                placeholder={searchLabel}
                aria-label={searchLabel}
              />
              <Combobox.Empty className={styles.empty}>
                {text('placePicker.empty')}
              </Combobox.Empty>
              <Combobox.List className={styles.list}>
                {(item: Item) => (
                  <Combobox.Item
                    key={keyOf(item)}
                    value={item}
                    className={[
                      styles.item,
                      item.kind === 'edit' && styles.edit,
                      item.kind === 'add' && styles.add,
                      (item.kind === 'named' ||
                        (item.kind === 'home' && saved.home)) &&
                        styles.editable,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-label={item.kind === 'edit' ? label(item) : undefined}
                  >
                    {item.kind === 'edit'
                      ? text('placePicker.editShort')
                      : label(item)}
                    {item.kind === 'named' && detail(item.place.city)}
                    {item.kind === 'home' &&
                      detail(saved.home?.city ?? text('placePicker.homeUnset'))}
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
      {editing && (
        <NamedPlaceForm
          editing={editing}
          where={where}
          saved={saved}
          places={places}
          homeDefault={homeDefault}
          anchor={slot}
          onDone={(next) => {
            setEditing(null);
            if (next) onSavedChange(next.saved, next.where);
          }}
        />
      )}
    </>
  );
}
