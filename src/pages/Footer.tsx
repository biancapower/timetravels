import type { MouseEvent } from 'react';
import { useIntl } from 'react-intl';
import type { MessageId } from '../i18n/messages';
import styles from './Footer.module.css';

const author = 'https://github.com/biancapower';

const links: [hash: string, label: MessageId][] = [
  ['#help', 'nav.help'],
  ['#about', 'nav.about'],
  ['#privacy', 'nav.privacy'],
];

interface FooterProps {
  onOpen: (hash: string, opener: HTMLElement) => void;
}

export function Footer({ onOpen }: FooterProps) {
  const intl = useIntl();
  return (
    <footer className={styles.footer}>
      <span>
        {intl.formatMessage(
          { id: 'footer.copyright' },
          { link: (chunks) => <a href={author}>{chunks}</a> },
        )}
      </span>
      {links.map(([hash, label]) => (
        <a
          key={hash}
          href={hash}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            onOpen(hash, event.currentTarget);
          }}
        >
          {intl.formatMessage({ id: label })}
        </a>
      ))}
    </footer>
  );
}
