'use client';
import { useId, useMemo } from 'react';
import { useLocale } from '@gregui/localization';
import { Field, Input, Select } from './forms';

export interface MonthDayValue {
  /** 1–12, or null when not chosen. */
  month: number | null;
  /** 1–31, or null when not chosen. */
  day: number | null;
  /** Optional year; null or undefined when unknown. */
  year?: number | null;
}

export interface MonthDayFieldProps {
  /** Group label, for example "Birthday". */
  label: string;
  value: MonthDayValue;
  onChange: (value: MonthDayValue) => void;
  hint?: string;
  /** Application error for the whole date. */
  error?: string;
  /** Show an optional year input (for "turns 40" messages or first anniversaries). */
  withYear?: boolean;
  required?: boolean;
  disabled?: boolean;
  /** Prefix for native form names: `<name>.month`, `<name>.day`, `<name>.year`. */
  name?: string;
}

/** Days in a month; without a year, February has 29 so leap-day birthdays can be saved. */
export function daysInMonth(month: number, year?: number | null) {
  return new Date(year ?? 2000, month, 0).getDate();
}

/**
 * A recurring date without (or with an optional) year: birthdays, name days, anniversaries.
 * Month names and the month/day order follow the active locale. Choosing a shorter month
 * moves a day that no longer exists to the month's last day.
 */
export function MonthDayField({
  label,
  value,
  onChange,
  hint,
  error,
  withYear = false,
  required = false,
  disabled,
  name,
}: MonthDayFieldProps) {
  const { locale, messages } = useLocale();
  const id = useId();
  const prefix = name ?? id;

  const { monthNames, dayFirst } = useMemo(() => {
    const months = new Intl.DateTimeFormat(locale, { month: 'long' });
    const parts = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric' }).formatToParts(
      new Date(2000, 2, 15),
    );
    return {
      monthNames: Array.from({ length: 12 }, (_, index) => months.format(new Date(2000, index, 1))),
      dayFirst:
        parts.findIndex((part) => part.type === 'day') <
        parts.findIndex((part) => part.type === 'month'),
    };
  }, [locale]);

  const maxDay = value.month ? daysInMonth(value.month, value.year) : 31;
  const update = (next: Partial<MonthDayValue>) => {
    const merged = { ...value, ...next };
    if (merged.month && merged.day) {
      merged.day = Math.min(merged.day, daysInMonth(merged.month, merged.year));
    }
    onChange(merged);
  };
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ');

  const month = (
    <Field label={messages.month} required={required}>
      {(control) => (
        <Select
          {...control}
          name={`${prefix}.month`}
          value={value.month ?? ''}
          required={required}
          aria-invalid={error ? true : undefined}
          onChange={(event) =>
            update({ month: event.target.value ? Number(event.target.value) : null })
          }
        >
          <option value="">{messages.notSelected}</option>
          {monthNames.map((monthName, index) => (
            <option key={monthName} value={index + 1}>
              {monthName}
            </option>
          ))}
        </Select>
      )}
    </Field>
  );
  const day = (
    <Field label={messages.day} required={required}>
      {(control) => (
        <Select
          {...control}
          name={`${prefix}.day`}
          value={value.day ?? ''}
          required={required}
          aria-invalid={error ? true : undefined}
          onChange={(event) =>
            update({ day: event.target.value ? Number(event.target.value) : null })
          }
        >
          <option value="">{messages.notSelected}</option>
          {Array.from({ length: maxDay }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </Select>
      )}
    </Field>
  );

  return (
    <fieldset
      className="g-month-day-field"
      disabled={disabled}
      aria-describedby={describedBy || undefined}
    >
      <legend>{label}</legend>
      {hint && (
        <p id={`${id}-hint`} className="g-hint">
          {hint}
        </p>
      )}
      <div className="g-month-day-grid" data-with-year={withYear || undefined}>
        {dayFirst ? day : month}
        {dayFirst ? month : day}
        {withYear && (
          <Field label={messages.year} hint={messages.optional}>
            {(control) => (
              <Input
                {...control}
                name={`${prefix}.year`}
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={value.year ?? ''}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, '');
                  update({ year: digits ? Number(digits) : null });
                }}
              />
            )}
          </Field>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="g-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
