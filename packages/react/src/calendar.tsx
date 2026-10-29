'use client';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useLocale } from '@gregui/localization';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { IconButton } from './buttons';
import { Field } from './forms';
import { Icon } from './icons';

/** Calendar dates are plain `YYYY-MM-DD` strings; months are `YYYY-MM`. No time zone is applied. */
export type CalendarDate = string;
export type CalendarMonthValue = string;
/** Return a short, translated reason to block a date (for example "Postal holiday"), or nothing. */
export type DateAvailability = (date: CalendarDate) => string | false | null | undefined;

const pattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const toUTC = (date: CalendarDate) => {
  const [, y, m, d] = pattern.exec(date) ?? [];
  return Date.UTC(Number(y), Number(m) - 1, Number(d));
};
const fromUTC = (time: number): CalendarDate => new Date(time).toISOString().slice(0, 10);
const DAY = 86_400_000;
export function isCalendarDate(value: unknown): value is CalendarDate {
  if (typeof value !== 'string' || !pattern.test(value)) return false;
  return fromUTC(toUTC(value)) === value;
}
export function addDays(date: CalendarDate, days: number): CalendarDate {
  return fromUTC(toUTC(date) + days * DAY);
}
/** Moves by whole months, clamping the day (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(date: CalendarDate, months: number): CalendarDate {
  const d = new Date(toUTC(date));
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const last = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(d.getUTCDate(), last));
  return fromUTC(target.getTime());
}
export function todayDate(): CalendarDate {
  const now = new Date();
  return fromUTC(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}
const monthOf = (date: CalendarDate): CalendarMonthValue => date.slice(0, 7);
const weekday = (date: CalendarDate) => new Date(toUTC(date)).getUTCDay();

function useDateFormat() {
  const { locale } = useLocale();
  return useMemo(() => {
    const make = (options: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options });
    const month = make({ month: 'long', year: 'numeric' });
    const full = make({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const medium = make({ day: 'numeric', month: 'short', year: 'numeric' });
    const short = make({ weekday: 'short' });
    const long = make({ weekday: 'long' });
    return {
      month: (value: CalendarMonthValue) => month.format(toUTC(`${value}-01`)),
      full: (date: CalendarDate) => full.format(toUTC(date)),
      medium: (date: CalendarDate) => medium.format(toUTC(date)),
      // 2024-01-01 was a Monday, so day index 0..6 maps to Sunday..Saturday from 2023-12-31.
      weekdayShort: (day: number) => short.format(Date.UTC(2023, 11, 31 + day)),
      weekdayLong: (day: number) => long.format(Date.UTC(2023, 11, 31 + day)),
    };
  }, [locale]);
}

export interface CalendarMonthProps {
  /** Accessible name for the grid, for example "Delivery date". */
  label: string;
  /** Visible month (`YYYY-MM`). */
  month: CalendarMonthValue;
  onMonthChange: (month: CalendarMonthValue) => void;
  value?: CalendarDate | null;
  onSelect?: (date: CalendarDate) => void;
  min?: CalendarDate;
  max?: CalendarDate;
  /** Blocks a date with a reason that is shown on focus and read by screen readers. */
  isDateUnavailable?: DateAvailability;
  /** Extra content inside a day, such as a birthday or a scheduled card. Keep it short. */
  renderDay?: (date: CalendarDate) => ReactNode;
  /** 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1;
  /** Override "today" (useful for tests and server rendering). */
  today?: CalendarDate;
  /** Move focus into the grid on mount (used by DatePicker). */
  autoFocus?: boolean;
}

/** A month grid following the WAI-ARIA date grid pattern. */
export function CalendarMonth({
  label,
  month,
  onMonthChange,
  value,
  onSelect,
  min,
  max,
  isDateUnavailable,
  renderDay,
  weekStartsOn = 1,
  today: todayProp,
  autoFocus = false,
}: CalendarMonthProps) {
  const { messages } = useLocale();
  const format = useDateFormat();
  const id = useId();
  const grid = useRef<HTMLTableElement>(null);
  const today = todayProp ?? todayDate();
  const first = `${month}-01`;
  const inMonth = (date: CalendarDate) => monthOf(date) === month;
  const [focused, setFocused] = useState<CalendarDate>(() =>
    value && inMonth(value) ? value : inMonth(today) ? today : first,
  );
  const [moveFocus, setMoveFocus] = useState(autoFocus);
  const active = inMonth(focused) ? focused : value && inMonth(value) ? value : first;
  const reason = (date: CalendarDate): string | undefined => {
    if (min && date < min) return messages.dateBeforeMin;
    if (max && date > max) return messages.dateAfterMax;
    return isDateUnavailable?.(date) || undefined;
  };
  const start = addDays(first, -((weekday(first) - weekStartsOn + 7) % 7));
  const weeks: CalendarDate[][] = [];
  for (let cursor = start; weeks.length < 6;) {
    const week = Array.from({ length: 7 }, (_, i) => addDays(cursor, i));
    if (weeks.length && !week.some(inMonth)) break;
    weeks.push(week);
    cursor = addDays(cursor, 7);
  }
  useEffect(() => {
    if (!moveFocus) return;
    grid.current?.querySelector<HTMLElement>(`[data-date="${active}"]`)?.focus();
    setMoveFocus(false);
  }, [moveFocus, active]);
  const go = (date: CalendarDate) => {
    if (min && date < min && !inMonth(date)) date = min;
    if (max && date > max && !inMonth(date)) date = max;
    setFocused(date);
    setMoveFocus(true);
    if (!inMonth(date)) onMonthChange(monthOf(date));
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: CalendarDate) => {
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const moves: Record<string, () => CalendarDate> = {
      ArrowLeft: () => addDays(date, rtl ? 1 : -1),
      ArrowRight: () => addDays(date, rtl ? -1 : 1),
      ArrowUp: () => addDays(date, -7),
      ArrowDown: () => addDays(date, 7),
      Home: () => addDays(date, -((weekday(date) - weekStartsOn + 7) % 7)),
      End: () => addDays(date, 6 - ((weekday(date) - weekStartsOn + 7) % 7)),
      PageUp: () => addMonths(date, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(date, event.shiftKey ? 12 : 1),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    go(move());
  };
  const shiftMonth = (by: number) => onMonthChange(monthOf(addMonths(first, by)));
  const canPrevious = !min || monthOf(min) < month;
  const canNext = !max || monthOf(max) > month;
  const order = Array.from({ length: 7 }, (_, i) => (i + weekStartsOn) % 7);
  const activeReason = reason(active);
  return (
    <div className="g-calendar">
      <div className="g-calendar-header">
        <IconButton
          variant="ghost"
          label={messages.previousMonth}
          disabled={!canPrevious}
          onClick={() => shiftMonth(-1)}
        >
          <Icon name="chevron-back" />
        </IconButton>
        <p className="g-calendar-title" id={`${id}-title`} aria-live="polite">
          {format.month(month)}
        </p>
        <IconButton
          variant="ghost"
          label={messages.nextMonth}
          disabled={!canNext}
          onClick={() => shiftMonth(1)}
        >
          <Icon name="chevron" />
        </IconButton>
      </div>
      <table
        ref={grid}
        className="g-calendar-grid"
        role="grid"
        aria-label={`${label}, ${format.month(month)}`}
      >
        <thead>
          <tr>
            {order.map((day) => (
              <th key={day} scope="col" abbr={format.weekdayLong(day)}>
                {format.weekdayShort(day)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]}>
              {week.map((date) => {
                if (!inMonth(date)) return <td key={date} className="g-calendar-outside" />;
                const blocked = reason(date);
                const outOfRange = (!!min && date < min) || (!!max && date > max);
                const selected = value === date;
                const extra = renderDay?.(date);
                return (
                  <td key={date} aria-selected={selected}>
                    <button
                      type="button"
                      className="g-calendar-day"
                      data-date={date}
                      data-today={date === today || undefined}
                      data-selected={selected || undefined}
                      tabIndex={date === active ? 0 : -1}
                      aria-disabled={blocked ? true : undefined}
                      data-unavailable={blocked ? (outOfRange ? 'range' : 'blocked') : undefined}
                      aria-current={date === today ? 'date' : undefined}
                      aria-label={format.full(date)}
                      aria-describedby={blocked ? `${id}-reason-${date}` : undefined}
                      onFocus={() => setFocused(date)}
                      onKeyDown={(event) => onKeyDown(event, date)}
                      onClick={() => {
                        if (!blocked) onSelect?.(date);
                      }}
                    >
                      <span aria-hidden="true" className="g-calendar-number">
                        {Number(date.slice(8))}
                      </span>
                      {extra && <span className="g-calendar-extra">{extra}</span>}
                      {blocked && (
                        <span id={`${id}-reason-${date}`} className="g-sr-only">
                          {blocked}
                        </span>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="g-calendar-note" aria-hidden="true">
        {activeReason ? `${format.medium(active)}: ${activeReason}` : ' '}
      </p>
    </div>
  );
}

export interface DatePickerProps {
  label: string;
  value: CalendarDate | null;
  onChange: (date: CalendarDate | null) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /** Submitted as a hidden `YYYY-MM-DD` input for native forms. */
  name?: string;
  placeholder?: string;
  min?: CalendarDate;
  max?: CalendarDate;
  isDateUnavailable?: DateAvailability;
  renderDay?: (date: CalendarDate) => ReactNode;
  weekStartsOn?: 0 | 1;
  today?: CalendarDate;
}

/** A field that opens a CalendarMonth, so blocked dates and their reasons stay visible. */
export function DatePicker({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  disabled = false,
  name,
  placeholder,
  min,
  max,
  isDateUnavailable,
  renderDay,
  weekStartsOn,
  today,
}: DatePickerProps) {
  const { messages } = useLocale();
  const format = useDateFormat();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => monthOf(value ?? today ?? todayDate()));
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {(field) => (
        <div className="g-date-picker">
          <PopoverPrimitive.Root
            open={open && !disabled}
            onOpenChange={(next) => {
              if (next) setMonth(monthOf(value ?? today ?? todayDate()));
              setOpen(next);
            }}
          >
            <PopoverPrimitive.Trigger asChild>
              <button
                ref={trigger}
                type="button"
                id={field.id}
                className="g-input g-date-picker-trigger"
                disabled={disabled}
                aria-describedby={field['aria-describedby']}
                aria-invalid={field['aria-invalid']}
                aria-haspopup="dialog"
                data-empty={!value || undefined}
              >
                <span>{value ? format.medium(value) : (placeholder ?? messages.chooseDate)}</span>
                <Icon name="calendar" />
              </button>
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Content
              className="g-popover g-date-picker-popover"
              aria-label={label}
              role="dialog"
              sideOffset={8}
              align="start"
              onOpenAutoFocus={(event) => event.preventDefault()}
            >
              <CalendarMonth
                label={label}
                month={month}
                onMonthChange={setMonth}
                value={value}
                min={min}
                max={max}
                isDateUnavailable={isDateUnavailable}
                renderDay={renderDay}
                weekStartsOn={weekStartsOn}
                today={today}
                autoFocus
                onSelect={(date) => {
                  onChange(date);
                  setOpen(false);
                  trigger.current?.focus();
                }}
              />
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Root>
          {name && <input type="hidden" name={name} value={value ?? ''} />}
        </div>
      )}
    </Field>
  );
}
