import { IntlProvider } from 'react-intl';
import styles from './App.module.css';
import { catalogues, pickLocale, type Locale } from './i18n/messages';
import { LiveAnswer } from './sentence/LiveAnswer';
import { Sentence } from './sentence/Sentence';

interface AppProps {
  /** The device's own zone when omitted. */
  zone?: string;
  /** The device's preferred language with messages when omitted. */
  locale?: Locale;
}

export function App({
  zone = Temporal.Now.timeZoneId(),
  locale = pickLocale(navigator.languages),
}: AppProps) {
  return (
    <IntlProvider locale={locale} messages={catalogues[locale]}>
      <main className={styles.page}>
        <Sentence />
        <LiveAnswer zone={zone} />
      </main>
    </IntlProvider>
  );
}
