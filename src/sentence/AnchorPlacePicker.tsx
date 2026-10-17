import { Combobox } from '@base-ui/react/combobox';
import { Menu } from '@base-ui/react/menu';
import { Popover } from '@base-ui/react/popover';
import { useRef, useState, type ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { filterPlaces, type Place } from '../places/places';
import styles from './Picker.module.css';
import search from './PlacePicker.module.css';
import type { AnchorSetting } from './resolveAnswer';

interface AnchorPlacePickerProps {
  whose: AnchorSetting['whose'];
  /** The picked place's city, or nothing when the place is here. */
  city?: string;
  /** The places another place is searched from. */
  places: readonly Place[];
  onChange: (whose: AnchorSetting['whose']) => void;
  className?: string;
  /** The slot's text, from the sentence's message. */
  children: ReactNode;
}

/**
 * Whose time the chosen time is: "here", say "in London" for the picked
 * place when there is one, or another place's, found with the same search
 * as the place slot.
 */
export function AnchorPlacePicker({
  whose,
  city,
  places,
  onChange,
  className,
  children,
}: AnchorPlacePickerProps) {
  const intl = useIntl();
  const slot = useRef<HTMLButtonElement>(null);
  // The search opens once the menu has closed, so the menu's own return of
  // focus to the slot can't pull focus out of the search.
  const pending = useRef(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const other = typeof whose === 'object' ? whose : null;
  const searchLabel = intl.formatMessage({ id: 'placePicker.search' });

  const stopSearching = () => {
    setSearching(false);
    setQuery('');
  };

  return (
    <>
      <Menu.Root
        onOpenChangeComplete={(open) => {
          if (open || !pending.current) return;
          pending.current = false;
          setSearching(true);
        }}
      >
        <Menu.Trigger ref={slot} className={className}>
          {children}
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner align="start" sideOffset={8}>
            <Menu.Popup
              className={styles.popup}
              aria-label={intl.formatMessage({ id: 'anchorPlacePicker.label' })}
            >
              <Menu.RadioGroup
                value={other ? 'other' : whose}
                onValueChange={(value: 'mine' | 'theirs' | 'other') => {
                  if (value !== 'other') onChange(value);
                }}
              >
                <Menu.RadioItem
                  value="mine"
                  closeOnClick
                  className={styles.item}
                >
                  {intl.formatMessage({ id: 'anchorPlace.mine' })}
                </Menu.RadioItem>
                {city && (
                  <Menu.RadioItem
                    value="theirs"
                    closeOnClick
                    className={styles.item}
                  >
                    {intl.formatMessage({ id: 'anchorPlace.theirs' }, { city })}
                  </Menu.RadioItem>
                )}
                {other && (
                  <Menu.RadioItem
                    value="other"
                    closeOnClick
                    className={styles.item}
                  >
                    {intl.formatMessage(
                      { id: 'anchorPlace.theirs' },
                      { city: other.city },
                    )}
                  </Menu.RadioItem>
                )}
              </Menu.RadioGroup>
              <Menu.Item
                className={styles.item}
                onClick={() => {
                  pending.current = true;
                }}
              >
                {intl.formatMessage({ id: 'anchorPlace.other' })}
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      {searching && (
        <Popover.Root
          open
          onOpenChange={(open) => {
            if (!open) stopSearching();
          }}
        >
          <Popover.Portal>
            <Popover.Positioner anchor={slot} align="start" sideOffset={8}>
              <Popover.Popup
                className={search.popup}
                aria-label={intl.formatMessage({ id: 'placePicker.label' })}
                finalFocus={slot}
              >
                <Combobox.Root<Place>
                  inline
                  open
                  items={places}
                  filteredItems={filterPlaces(places, query)}
                  value={null}
                  onValueChange={(next) => {
                    if (!next) return;
                    onChange(next);
                    stopSearching();
                    slot.current?.focus();
                  }}
                  inputValue={query}
                  onInputValueChange={setQuery}
                  itemToStringLabel={(item) => item.city}
                  isItemEqualToValue={(a, b) =>
                    a.city === b.city && a.zone === b.zone
                  }
                >
                  <Combobox.Input
                    className={search.input}
                    placeholder={searchLabel}
                    aria-label={searchLabel}
                  />
                  <Combobox.Empty className={search.empty}>
                    {intl.formatMessage({ id: 'placePicker.empty' })}
                  </Combobox.Empty>
                  <Combobox.List className={search.list}>
                    {(place: Place) => (
                      <Combobox.Item
                        key={`${place.city}|${place.zone}`}
                        value={place}
                        className={search.item}
                      >
                        {place.city}
                      </Combobox.Item>
                    )}
                  </Combobox.List>
                </Combobox.Root>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      )}
    </>
  );
}
