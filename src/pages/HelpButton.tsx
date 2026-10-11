import { useIntl } from 'react-intl';
import styles from './HelpButton.module.css';

interface HelpButtonProps {
  onOpen: (hash: string, opener: HTMLElement) => void;
}

export function HelpButton({ onOpen }: HelpButtonProps) {
  const intl = useIntl();
  return (
    <button
      type="button"
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
