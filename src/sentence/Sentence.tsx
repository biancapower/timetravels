import styles from './Sentence.module.css';

/** The question. Its slots are shown as slots but are not interactive yet. */
export function Sentence() {
  return (
    <h1 className={styles.sentence}>
      What time is it <span className={styles.slot}>now</span>{' '}
      <span className={styles.slot}>here</span>?
    </h1>
  );
}
