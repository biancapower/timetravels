import { useEffect, useRef, type ReactNode } from 'react';
import { useIntl } from 'react-intl';
import styles from './Page.module.css';

interface PageProps {
  title: string;
  /** The id of a section to scroll to and focus instead of the title. */
  section?: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * A page over the sentence, such as Help or About. It opens with focus, and
 * so scrolled, on its title or the section asked for. Escape closes it.
 */
export function Page({ title, section, onClose, children }: PageProps) {
  const intl = useIntl();
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = intl.formatMessage(
      { id: 'nav.pageTitle' },
      { page: title },
    );
    return () => {
      document.title = previous;
    };
  }, [intl, title]);

  useEffect(() => {
    const target = section ? document.getElementById(section) : heading.current;
    target?.focus();
  }, [section]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <main className={styles.page}>
      <button type="button" className={styles.close} onClick={onClose}>
        {intl.formatMessage({ id: 'nav.close' })}
      </button>
      <h1 ref={heading} tabIndex={-1} className={styles.title}>
        {title}
      </h1>
      {children}
    </main>
  );
}
