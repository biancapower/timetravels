import { useIntl } from 'react-intl';
import styles from './HelpButton.module.css';

interface HelpButtonProps {
  onOpen: (hash: string, opener: HTMLElement) => void;
}

export function HelpButton({ onOpen }: HelpButtonProps) {
  const intl = useIntl();
  return (
    // Safari's default Tab order skips buttons without a tabindex. The
    // pickers' buttons set one, so this does too, or Tab would stop at them.
    <button
      type="button"
      tabIndex={0}
      className={styles.help}
      aria-label={intl.formatMessage({ id: 'nav.help' })}
      onClick={(event) => {
        onOpen('#help', event.currentTarget);
      }}
    >
      ?
    </button>
  );
}
