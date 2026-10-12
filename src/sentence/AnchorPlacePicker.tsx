import { Menu } from '@base-ui/react/menu';
import type { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import styles from './Picker.module.css';
import type { AnchorSetting } from './resolveAnswer';

interface AnchorPlacePickerProps {
  whose: AnchorSetting['whose'];
  city: string;
  onChange: (whose: AnchorSetting['whose']) => void;
  className?: string;
  /** The slot's text, from the sentence's message. */
  children: ReactNode;
}

/** Whose time the chosen time is: "my time" or, say, "London time". */
export function AnchorPlacePicker({
  whose,
  city,
  onChange,
  className,
  children,
}: AnchorPlacePickerProps) {
  const intl = useIntl();
  return (
    <Menu.Root>
      <Menu.Trigger className={className}>{children}</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="start" sideOffset={8}>
          <Menu.Popup
            className={styles.popup}
            aria-label={intl.formatMessage({ id: 'anchorPlacePicker.label' })}
          >
            <Menu.RadioGroup value={whose} onValueChange={onChange}>
              <Menu.RadioItem value="mine" closeOnClick className={styles.item}>
                {intl.formatMessage({ id: 'anchorPlace.mine' })}
              </Menu.RadioItem>
              <Menu.RadioItem
                value="theirs"
                closeOnClick
                className={styles.item}
              >
                {intl.formatMessage({ id: 'anchorPlace.theirs' }, { city })}
              </Menu.RadioItem>
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
