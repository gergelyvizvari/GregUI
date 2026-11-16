'use client';
import React, { useId, useMemo } from 'react';
import { messagesFor, useLocale, type Messages } from '@gregui/localization';
import {
  addDays,
  addMonths,
  DatePicker,
  daysBetween,
  isCalendarDate,
  todayDate,
  yearlyDate,
  type CalendarDate,
  type LeapDayRule,
} from './calendar';
import { Field, Select } from './forms';
import { NumberField } from './number-field';
import { SegmentedControl } from './segmented-control';
import { Text } from './typography';

export type RecurrenceFrequency = 'once' | 'yearly' | 'monthly' | 'custom';
export type RecurrenceUnit = 'day' | 'week' | 'month' | 'year';
export interface RecurrenceValue {
  frequency: RecurrenceFrequency;
  /** The first (or only) date, `YYYY-MM-DD`; null until chosen. */
  start: CalendarDate | null;
  /** `custom` only: repeat every `interval` units. Defaults to 1. */
  interval?: number;
  /** `custom` only. Defaults to `week`. */
  unit?: RecurrenceUnit;
  /** Days before each date the application acts, such as sending a card. 0 or unset: on the day. */
  leadDays?: number;
}
export interface RecurrenceOccurrence {
  date: CalendarDate;
  /** `date` minus `leadDays`. */
  leadDate: CalendarDate;
  /** 0 for the first date, 1 for the next and so on. */
  index: number;
}
const rule = (value: RecurrenceValue): { unit: RecurrenceUnit; step: number } | null => {
  if (value.frequency === 'yearly') return { unit: 'year', step: 1 };
  if (value.frequency === 'monthly') return { unit: 'month', step: 1 };
  if (value.frequency === 'custom')
    return {
      unit: value.unit ?? 'week',
      step: Math.max(1, Math.trunc(value.interval ?? 1) || 1),
    };
  return null;
};
function nth(
  start: CalendarDate,
  unit: RecurrenceUnit,
  count: number,
  leapDay: LeapDayRule,
): CalendarDate {
  if (unit === 'day') return addDays(start, count);
  if (unit === 'week') return addDays(start, count * 7);
  if (unit === 'month') return addMonths(start, count);
  return yearlyDate(start, Number(start.slice(0, 4)) + count, leapDay);
}
/**
 * The dates of `value` from `from` to `to` (inclusive), each with its lead date. Monthly dates
 * on the 29th–31st fall on the last day of shorter months; yearly 29 February follows `leapDay`.
 * Returns at most `limit` dates (default 500).
 */
export function recurrenceDates(
  value: RecurrenceValue,
  from: CalendarDate,
  to: CalendarDate,
  { leapDay = 'feb28', limit = 500 }: { leapDay?: LeapDayRule; limit?: number } = {},
): RecurrenceOccurrence[] {
  const start = value.start;
  if (!start || !isCalendarDate(start) || to < from) return [];
  const lead = Math.max(0, Math.trunc(value.leadDays ?? 0) || 0);
  const make = (date: CalendarDate, index: number) => ({
    date,
    leadDate: addDays(date, -lead),
    index,
  });
  const r = rule(value);
  if (!r) return start >= from && start <= to ? [make(start, 0)] : [];
  // Skip whole steps before `from` instead of walking from the first date.
  const gap =
    r.unit === 'day' || r.unit === 'week'
      ? daysBetween(start, from) / (r.unit === 'week' ? 7 : 1)
      : r.unit === 'month'
        ? (Number(from.slice(0, 4)) - Number(start.slice(0, 4))) * 12 +
          Number(from.slice(5, 7)) -
          Number(start.slice(5, 7))
        : Number(from.slice(0, 4)) - Number(start.slice(0, 4));
  let index = Math.max(0, Math.floor(gap / r.step) - 1);
  const found: RecurrenceOccurrence[] = [];
  while (found.length < limit) {
    const date = nth(start, r.unit, index * r.step, leapDay);
    if (date > to) break;
    if (date >= from) found.push(make(date, index));
    index += 1;
  }
  return found;
}
/** The first date of `value` on or after `from` (default today), or null. */
export function nextRecurrence(
  value: RecurrenceValue,
  from: CalendarDate = todayDate(),
  options: { leapDay?: LeapDayRule } = {},
): RecurrenceOccurrence | null {
  if (!value.start || !isCalendarDate(value.start)) return null;
  const r = rule(value);
  const base = value.start > from ? value.start : from;
  const span = r ? { day: 1, week: 7, month: 31, year: 366 }[r.unit] * r.step + 1 : 0;
  return recurrenceDates(value, from, addDays(base, span), { ...options, limit: 1 })[0] ?? null;
}
const parse = (date: CalendarDate) =>
  new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10)));
/**
 * A short localised sentence such as "Every year on 12 March, 7 days before". Pass `messages`
 * when the application overrides package messages; otherwise the locale's catalogue is used.
 */
export function recurrenceSummary(
  value: RecurrenceValue,
  { locale = 'en-GB', messages }: { locale?: string; messages?: Messages } = {},
): string {
  const m = messages ?? messagesFor(locale);
  if (!value.start || !isCalendarDate(value.start)) return '';
  const date = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options }).format(parse(value.start!));
  const full = date({ day: 'numeric', month: 'long', year: 'numeric' });
  const count = (template: string, n: number) =>
    template.replace('{count}', new Intl.NumberFormat(locale).format(n));
  let text: string;
  if (value.frequency === 'once') text = m.recurSummaryOnce.replace('{date}', full);
  else if (value.frequency === 'yearly')
    text = m.recurSummaryYearly.replace('{date}', date({ day: 'numeric', month: 'long' }));
  else if (value.frequency === 'monthly') {
    const day = Number(value.start.slice(8, 10));
    text =
      day >= 31
        ? m.recurSummaryMonthlyLast
        : m.recurSummaryMonthly.replace('{day}', new Intl.NumberFormat(locale).format(day));
  } else {
    const r = rule(value)!;
    const one = {
      day: m.recurEveryDay,
      week: m.recurEveryWeek,
      month: m.recurEveryMonth,
      year: m.recurEveryYear,
    };
    const many = {
      day: m.recurEveryDays,
      week: m.recurEveryWeeks,
      month: m.recurEveryMonths,
      year: m.recurEveryYears,
    };
    text = m.recurSummaryFrom
      .replace('{rule}', r.step === 1 ? one[r.unit] : count(many[r.unit], r.step))
      .replace('{date}', full);
  }
  const lead = Math.max(0, Math.trunc(value.leadDays ?? 0) || 0);
  if (lead > 0) text += `, ${lead === 1 ? m.recurLeadDay : count(m.recurLeadDays, lead)}`;
  return text;
}

export interface RecurrenceFieldProps {
  /** Group label, such as "When to send". */
  label: string;
  value: RecurrenceValue;
  onChange: (value: RecurrenceValue) => void;
  hint?: string;
  /** Application error for the whole rule. */
  error?: string;
  /** Frequencies offered, in order. Defaults to all four. */
  frequencies?: readonly RecurrenceFrequency[];
  /** Units offered for `custom`. Defaults to all four. */
  units?: readonly RecurrenceUnit[];
  /** Shows the lead-time input. Defaults to true. */
  lead?: boolean;
  /** Label for the lead time, such as "Send this many days before". */
  leadLabel?: string;
  leadHint?: string;
  /** Largest lead time in days. Default 365. */
  maxLeadDays?: number;
  /** Shows the summary and next date under the inputs. Defaults to true. */
  summary?: boolean;
  /** Counts "next" from this date. Defaults to today. */
  today?: CalendarDate;
  min?: CalendarDate;
  max?: CalendarDate;
  leapDay?: LeapDayRule;
  required?: boolean;
  disabled?: boolean;
  /** Prefix for native form names: `<name>.frequency`, `<name>.start`, and so on. */
  name?: string;
}

/**
 * Chooses when something happens: once, yearly, monthly or every N days/weeks/months/years,
 * with an optional lead time. Controlled; the application stores the value and schedules work.
 */
export function RecurrenceField({
  label,
  value,
  onChange,
  hint,
  error,
  frequencies = ['once', 'yearly', 'monthly', 'custom'],
  units = ['day', 'week', 'month', 'year'],
  lead = true,
  leadLabel,
  leadHint,
  maxLeadDays = 365,
  summary = true,
  today,
  min,
  max,
  leapDay = 'feb28',
  required = false,
  disabled = false,
  name,
}: RecurrenceFieldProps) {
  const { locale, messages: m } = useLocale();
  const id = useId();
  const prefix = name ?? id;
  const update = (next: Partial<RecurrenceValue>) => onChange({ ...value, ...next });
  const names: Record<RecurrenceFrequency, string> = {
    once: m.recurOnce,
    yearly: m.recurYearly,
    monthly: m.recurMonthly,
    custom: m.recurCustom,
  };
  const unitNames: Record<RecurrenceUnit, string> = {
    day: m.recurUnitDays,
    week: m.recurUnitWeeks,
    month: m.recurUnitMonths,
    year: m.recurUnitYears,
  };
  const text = useMemo(() => recurrenceSummary(value, { locale, messages: m }), [value, locale, m]);
  const next = useMemo(
    () => (value.start ? nextRecurrence(value, today ?? todayDate(), { leapDay }) : null),
    [value, today, leapDay],
  );
  const format = (date: CalendarDate) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parse(date));
  const describedBy = [
    hint && `${id}-hint`,
    summary && text && `${id}-summary`,
    error && `${id}-error`,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <fieldset
      className="g-recurrence-field"
      disabled={disabled}
      aria-describedby={describedBy || undefined}
    >
      <legend>{label}</legend>
      {hint && (
        <p id={`${id}-hint`} className="g-hint">
          {hint}
        </p>
      )}
      <div className="g-recurrence-grid">
        {frequencies.length > 1 && (
          <SegmentedControl
            label={m.recurRepeats}
            name={`${prefix}.frequency`}
            options={frequencies.map((frequency) => ({
              value: frequency,
              label: names[frequency],
            }))}
            value={value.frequency}
            onValueChange={(frequency) => update({ frequency: frequency as RecurrenceFrequency })}
            disabled={disabled}
            variant="chips"
          />
        )}
        <DatePicker
          label={value.frequency === 'once' ? m.recurDate : m.recurFirstDate}
          name={`${prefix}.start`}
          value={value.start}
          onChange={(start) => update({ start })}
          min={min}
          max={max}
          leapDay={leapDay}
          required={required}
          disabled={disabled}
          today={today}
        />
        {value.frequency === 'custom' && (
          <div className="g-recurrence-every">
            <NumberField
              label={m.recurEvery}
              name={`${prefix}.interval`}
              min={1}
              max={999}
              value={value.interval ?? 1}
              onValueChange={(interval) => update({ interval: interval ?? 1 })}
              disabled={disabled}
            />
            <Field label={m.recurUnit}>
              {(control) => (
                <Select
                  {...control}
                  name={`${prefix}.unit`}
                  value={value.unit ?? 'week'}
                  onChange={(event) => update({ unit: event.target.value as RecurrenceUnit })}
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unitNames[unit]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        )}
        {lead && (
          <NumberField
            label={leadLabel ?? m.recurLead}
            hint={leadHint}
            name={`${prefix}.leadDays`}
            min={0}
            max={maxLeadDays}
            value={value.leadDays ?? 0}
            onValueChange={(leadDays) => update({ leadDays: leadDays ?? 0 })}
            disabled={disabled}
          />
        )}
      </div>
      {summary && text && (
        <div id={`${id}-summary`} className="g-recurrence-summary">
          <Text weight="strong">{text}</Text>
          <Text size="small" tone="muted">
            {next
              ? next.leadDate !== next.date
                ? m.recurNextLead
                    .replace('{date}', format(next.date))
                    .replace('{lead}', format(next.leadDate))
                : m.recurNext.replace('{date}', format(next.date))
              : m.recurNone}
          </Text>
        </div>
      )}
      {error && (
        <p id={`${id}-error`} className="g-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
