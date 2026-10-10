import { useIntl } from 'react-intl';
import { useRegisterSW } from 'virtual:pwa-register/react';
import styles from './UpdateNotice.module.css';

const hour = 60 * 60 * 1000;

/**
 * Offers a new version when one has downloaded. It never reloads on its own,
 * because the sentence being built would be lost.
 */
export function UpdateNotice() {
  const intl = useIntl();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // An installed app can stay open for days without navigating, which is
    // when the browser would otherwise look for a new version.
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      setInterval(() => {
        void registration.update();
      }, hour);
    },
  });
  // The status region is always present, so screen readers announce the
  // notice when it appears inside it.
  return (
    <div role="status">
      {needRefresh && (
        <aside className={styles.notice}>
          <p>{intl.formatMessage({ id: 'update.available' })}</p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                void updateServiceWorker();
              }}
            >
              {intl.formatMessage({ id: 'update.reload' })}
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                setNeedRefresh(false);
              }}
            >
              {intl.formatMessage({ id: 'update.later' })}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
