import { Popover } from '@base-ui/react/popover';
import { useId, useState, type ReactNode, type SubmitEvent } from 'react';
import { useIntl } from 'react-intl';
import { parseDuration, type Duration } from '../time';
import { formatDuration } from './formatDuration';
import styles from './Picker.module.css';

const common: readonly Duration[] = [
  { hours: 0, minutes: 30 },
  ...[1, 2, 3, 6, 8, 10, 12, 24].map((hours) => ({ hours, minutes: 0 })),
];

interface DurationPickerProps {
  onChange: (duration: Duration) => void;
  className?: string;
  /** The slot's text, from the sentence's message. */
  children: ReactNode;
}

/** The duration slot: type a duration, or pick a common one. */
export function DurationPicker({
  onChange,
  className,
  children,
}: DurationPickerProps) {
  const intl = useIntl();
  const errorId = useId();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [invalid, setInvalid] = useState(false);

  const choose = (duration: Duration) => {
    onChange(duration);
    setOpen(false);
  };
  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const duration = parseDuration(text);
    if (duration) choose(duration);
    else setInvalid(true);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setText('');
          setInvalid(false);
        }
      }}
    >
      <Popover.Trigger className={className}>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner align="start" sideOffset={8}>
          <Popover.Popup
            className={styles.popup}
            aria-label={intl.formatMessage({ id: 'durationPicker.label' })}
          >
            <form className={styles.form} onSubmit={submit}>
              <input
                className={styles.input}
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setInvalid(false);
                }}
                aria-label={intl.formatMessage({ id: 'durationPicker.input' })}
                placeholder={intl.formatMessage({
                  id: 'durationPicker.placeholder',
                })}
                aria-invalid={invalid}
                aria-describedby={invalid ? errorId : undefined}
                autoComplete="off"
              />
              <button className={styles.set} type="submit">
                {intl.formatMessage({ id: 'durationPicker.set' })}
              </button>
            </form>
            {invalid && (
              <p id={errorId} className={styles.error} role="alert">
                {intl.formatMessage({ id: 'durationPicker.invalid' })}
              </p>
            )}
            <div
              className={styles.choices}
              role="group"
              aria-label={intl.formatMessage({ id: 'durationPicker.quick' })}
            >
              {common.map((duration) => (
                <button
                  key={`${String(duration.hours)}:${String(duration.minutes)}`}
                  className={styles.choice}
                  type="button"
                  onClick={() => {
                    choose(duration);
                  }}
                >
                  {formatDuration(intl, duration)}
                </button>
              ))}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
