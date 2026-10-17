import type { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import type { MessageId } from '../i18n/messages';
import { Page } from './Page';
import styles from './Page.module.css';

const repository = 'https://github.com/biancapower/timetravels';

const linkTo = (href: string) => (chunks: ReactNode[]) => (
  <a href={href}>{chunks}</a>
);

interface AboutProps {
  section?: string;
  onClose: () => void;
}

/** What TimeTravels is, who made it, privacy, credits and licences. */
export function About({ section, onClose }: AboutProps) {
  const intl = useIntl();
  const text = (id: MessageId) => intl.formatMessage({ id });
  return (
    <Page title={text('about.title')} section={section} onClose={onClose}>
      <p>{text('about.what')}</p>
      <p className={styles.muted}>
        {intl.formatMessage(
          { id: 'about.version' },
          { version: __APP_VERSION__ },
        )}
      </p>
      <p>
        {intl.formatMessage(
          { id: 'about.source' },
          { link: linkTo(repository) },
        )}
      </p>
      <p>
        {intl.formatMessage(
          { id: 'about.feedback' },
          { link: linkTo(`${repository}/issues`) },
        )}
      </p>

      <h2>{text('about.accessibilityTitle')}</h2>
      <p>
        {intl.formatMessage(
          { id: 'about.accessibility' },
          { link: linkTo(`${repository}/blob/main/docs/accessibility.md`) },
        )}
      </p>

      <h2 id="privacy" tabIndex={-1}>
        {text('about.privacyTitle')}
      </h2>
      <p>{text('about.privacyStorage')}</p>
      <p>{text('about.privacyAnalytics')}</p>

      <h2>{text('about.creditsTitle')}</h2>
      <p>
        {intl.formatMessage(
          { id: 'about.credits' },
          {
            reset: linkTo('https://piccalil.li/blog/a-more-modern-css-reset/'),
            licence: linkTo('https://creativecommons.org/licenses/by/3.0/'),
          },
        )}
      </p>
      <p>
        {intl.formatMessage(
          { id: 'about.creditsPlaces' },
          {
            tz: linkTo('https://www.iana.org/time-zones'),
            geonames: linkTo('https://www.geonames.org/'),
            licence: linkTo('https://creativecommons.org/licenses/by/4.0/'),
          },
        )}
      </p>
      <p>
        {intl.formatMessage(
          { id: 'about.licences' },
          { link: linkTo('third-party-licences.txt') },
        )}
      </p>
    </Page>
  );
}
