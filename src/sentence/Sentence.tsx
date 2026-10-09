import type { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import styles from './Sentence.module.css';

function slot(chunks: ReactNode[]) {
  return <span className={styles.slot}>{chunks}</span>;
}

/** The question. Its slots are shown as slots but are not interactive yet. */
export function Sentence() {
  return (
    <h1 className={styles.sentence}>
      <FormattedMessage
        id="sentence.nowHere"
        values={{ now: slot, here: slot }}
      />
    </h1>
  );
}
