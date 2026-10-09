import { Menu } from '@base-ui/react/menu';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useIntl } from 'react-intl';
import type { Direction } from '../time';
import styles from './Picker.module.css';

/** Whether the sentence asks about now, a time later, or a time earlier. */
export type When = 'now' | Direction;

const choices: readonly When[] = ['now', 'later', 'earlier'];

interface DirectionPickerProps {
  value: When;
  onChange: (when: When) => void;
  className?: string;
  /** Take focus on mount: set when a choice has just remounted this slot. */
  focusOnMount?: boolean;
  /** The slot's text, from the sentence's message. */
  children: ReactNode;
}

export function DirectionPicker({
  value,
  onChange,
  className,
  focusOnMount = false,
  children,
}: DirectionPickerProps) {
  const intl = useIntl();
  const trigger = useRef<HTMLButtonElement>(null);
  const [focusOnFirstRender] = useState(focusOnMount);
  useEffect(() => {
    if (focusOnFirstRender) trigger.current?.focus();
  }, [focusOnFirstRender]);
  return (
    <Menu.Root>
      <Menu.Trigger ref={trigger} className={className}>
        {children}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="start" sideOffset={8}>
          <Menu.Popup
            className={styles.popup}
            aria-label={intl.formatMessage({ id: 'directionPicker.label' })}
          >
            <Menu.RadioGroup
              value={value}
              onValueChange={(chosen: When) => {
                onChange(chosen);
              }}
            >
              {choices.map((choice) => (
                <Menu.RadioItem
                  key={choice}
                  value={choice}
                  closeOnClick
                  className={styles.item}
                >
                  {intl.formatMessage({ id: `directionPicker.${choice}` })}
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
