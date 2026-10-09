import styles from './App.module.css';
import { LiveAnswer } from './sentence/LiveAnswer';
import { Sentence } from './sentence/Sentence';

interface AppProps {
  /** The device's own zone when omitted. */
  zone?: string;
}

export function App({ zone = Temporal.Now.timeZoneId() }: AppProps) {
  return (
    <main className={styles.page}>
      <Sentence />
      <LiveAnswer zone={zone} />
    </main>
  );
}
