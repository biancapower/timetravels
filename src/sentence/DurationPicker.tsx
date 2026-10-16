import { Popover } from '@base-ui/react/popover';
import { useId, useState, type ReactNode, type SubmitEvent } from 'react';
import { useIntl } from 'react-intl';
import { readDuration, type Duration, type DurationProblem } from '../time';
import { formatDuration } from './formatDuration';
import styles from './Picker.module.css';

const common: readonly Duration[] = [
  { hours: 0, minutes: 30 },
  ...[1, 2, 3, 6, 8, 10, 12, 24].map((hours) => ({ hours, minutes: 0 })),
  { days: 1, hours: 0, minutes: 0 },
  { weeks: 1, hours: 0, minutes: 0 },
  { months: 1, hours: 0, minutes: 0 },
];

interface DurationPickerProps {
  value: Duration;
  onChange: (duration: Duration) => void;
  className?: string;
  /** The slot's text, from the sentence's message. */
  children: ReactNode;
}

/** The duration slot: type a duration, or pick a common one. */
export function DurationPicker({
  value,
  onChange,
  className,
  children,
}: DurationPickerProps) {
  const intl = useIntl();
  const errorId = useId();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [problem, setProblem] = useState<DurationProblem | null>(null);

  const choose = (duration: Duration) => {
    onChange(duration);
    setOpen(false);
  };
  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const read = readDuration(text);
    if ('duration' in read) choose(read.duration);
    else setProblem(read);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setText('');
          setProblem(null);
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
                  setProblem(null);
                }}
                aria-label={intl.formatMessage({ id: 'durationPicker.input' })}
                placeholder={intl.formatMessage({
                  id: 'durationPicker.placeholder',
                })}
                aria-invalid={problem !== null}
                aria-describedby={problem ? errorId : undefined}
                autoComplete="off"
              />
              {/* tabIndex puts it in Safari's default Tab order, like the slots. */}
              <button className={styles.set} type="submit" tabIndex={0}>
                {intl.formatMessage({ id: 'durationPicker.set' })}
              </button>
            </form>
            {/* Always present, so screen readers announce the text when it appears. */}
            <p id={errorId} className={styles.error} role="alert">
              {problem
                ? intl.formatMessage(
                    { id: `durationPicker.${problem.problem}` },
                    problem.problem === 'tooLong'
                      ? { unit: problem.unit, limit: problem.limit }
                      : undefined,
                  )
                : null}
            </p>
            <div
              className={styles.choices}
              role="group"
              aria-label={intl.formatMessage({ id: 'durationPicker.quick' })}
            >
              {common.map((duration) => (
                <button
                  key={formatDuration(intl, duration)}
                  className={styles.choice}
                  type="button"
                  tabIndex={0}
                  aria-current={sameDuration(duration, value) || undefined}
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

function sameDuration(a: Duration, b: Duration): boolean {
  const units = [
    'years',
    'months',
    'weeks',
    'days',
    'hours',
    'minutes',
  ] as const;
  return units.every((unit) => (a[unit] ?? 0) === (b[unit] ?? 0));
}
