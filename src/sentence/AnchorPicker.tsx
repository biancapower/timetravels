import { Popover } from '@base-ui/react/popover';
import { useId, useState, type ReactNode, type SubmitEvent } from 'react';
import { useIntl } from 'react-intl';
import type { AnchorDay } from '../time';
import styles from './Picker.module.css';

const days: readonly {
  day: AnchorDay;
  id: 'anchorPicker.yesterday' | 'anchorPicker.today' | 'anchorPicker.tomorrow';
}[] = [
  { day: -1, id: 'anchorPicker.yesterday' },
  { day: 0, id: 'anchorPicker.today' },
  { day: 1, id: 'anchorPicker.tomorrow' },
];

interface AnchorPickerProps {
  time: Temporal.PlainTime;
  day: AnchorDay;
  onChange: (time: Temporal.PlainTime, day: AnchorDay) => void;
  className?: string;
  /** The slot's text, from the sentence's message. */
  children: ReactNode;
}

/** The chosen-time slot in sentence 5: a time of day, and today, tomorrow or yesterday. */
export function AnchorPicker({
  time,
  day,
  onChange,
  className,
  children,
}: AnchorPickerProps) {
  const intl = useIntl();
  const errorId = useId();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [chosenDay, setChosenDay] = useState<AnchorDay>(day);
  const [invalid, setInvalid] = useState(false);

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    let chosen: Temporal.PlainTime;
    try {
      chosen = Temporal.PlainTime.from(text);
    } catch {
      setInvalid(true);
      return;
    }
    onChange(chosen, chosenDay);
    setOpen(false);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setText(time.toString({ smallestUnit: 'minute' }));
          setChosenDay(day);
          setInvalid(false);
        }
      }}
    >
      <Popover.Trigger className={className}>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner align="start" sideOffset={8}>
          <Popover.Popup
            className={styles.popup}
            aria-label={intl.formatMessage({ id: 'anchorPicker.label' })}
          >
            <form className={styles.stack} onSubmit={submit}>
              <label className={styles.field}>
                <span>{intl.formatMessage({ id: 'anchorPicker.time' })}</span>
                <input
                  className={styles.input}
                  type="time"
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);
                    setInvalid(false);
                  }}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? errorId : undefined}
                />
              </label>
              <fieldset className={styles.days}>
                <legend>
                  {intl.formatMessage({ id: 'anchorPicker.day' })}
                </legend>
                {days.map((option) => (
                  <label key={option.day} className={styles.day}>
                    <input
                      type="radio"
                      name="day"
                      checked={chosenDay === option.day}
                      onChange={() => {
                        setChosenDay(option.day);
                      }}
                    />
                    {intl.formatMessage({ id: option.id })}
                  </label>
                ))}
              </fieldset>
              <p id={errorId} className={styles.error} role="alert">
                {invalid
                  ? intl.formatMessage({ id: 'anchorPicker.invalid' })
                  : null}
              </p>
              <button className={styles.set} type="submit">
                {intl.formatMessage({ id: 'anchorPicker.set' })}
              </button>
            </form>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
