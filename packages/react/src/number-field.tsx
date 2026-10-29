'use client';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useLocale } from '@gregui/localization';
import { Field } from './forms';
import { Icon } from './icons';
import { useControllableState } from './controllable';

export interface NumberFieldProps {
  label: string;
  hint?: string;
  /** Application error. Replaces the built-in invalid and out-of-range feedback while set. */
  error?: string;
  /** Controlled value; `null` means empty. */
  value?: number | null;
  /** Initial value when uncontrolled. */
  defaultValue?: number | null;
  /**
   * Called with the parsed number while the person types, or `null` when the text is empty or
   * not a number. Values outside `min`/`max` are reported as typed and flagged with feedback.
   */
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Amount for the buttons and ArrowUp/ArrowDown. Defaults to 1, or 0.01 (1%) for percent. */
  step?: number;
  /** Amount for PageUp/PageDown. Defaults to ten steps. */
  largeStep?: number;
  /**
   * Display format, for example `{ style: 'currency', currency: 'GBP' }`, `{ style: 'percent' }` or
   * `{ style: 'unit', unit: 'kilogram' }`. Percent values are fractions: 0.25 shows as 25%.
   */
  formatOptions?: Intl.NumberFormatOptions;
  disabled?: boolean;
  required?: boolean;
  /** Submits the unformatted number through a hidden input. */
  name?: string;
  id?: string;
  placeholder?: string;
}

const whitespace = /[\s  ]/g;
const minus = /[−‒–—﹣－]/g;
/** Locale-aware number parsing that accepts the same text the formatter produces, and more. */
export function numberParser(locale: string, options?: Intl.NumberFormatOptions) {
  const formatter = new Intl.NumberFormat(locale, options);
  const separators = new Intl.NumberFormat(locale).formatToParts(-12345.6);
  const group = separators.find((part) => part.type === 'group')?.value ?? ',';
  const decimal = separators.find((part) => part.type === 'decimal')?.value ?? '.';
  const affixes = [
    ...new Set(
      formatter
        .formatToParts(-12345.6)
        .filter((part) => ['currency', 'percentSign', 'unit', 'literal'].includes(part.type))
        .map((part) => part.value.replace(whitespace, ''))
        .filter(Boolean),
    ),
  ].sort((a, b) => b.length - a.length);
  const percent = options?.style === 'percent';
  return {
    format: (value: number) => formatter.format(value),
    /** `null` for empty text, `NaN` for text that is not a number. */
    parse(text: string): number | null {
      let source = text.replace(whitespace, '');
      if (!source) return null;
      for (const affix of affixes) source = source.split(affix).join('');
      source = source.replace(minus, '-');
      if (!/\s/.test(group)) source = source.split(group).join('');
      if (decimal !== '.') {
        // Accept a full stop as the decimal mark where it cannot be a grouping separator.
        if (!source.includes(decimal) && group !== '.') source = source.replace('.', decimal);
        // Any other full stop is invalid; a repeated decimal mark fails the pattern below.
        source = source.split('.').join('#').split(decimal).join('.');
      }
      if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(source)) return NaN;
      const parsed = Number(source);
      return percent ? parsed / 100 : parsed;
    },
  };
}
const decimals = (value: number) => {
  const [, fraction = ''] = String(value).split('.');
  return fraction.length;
};
const same = (parsed: number | null, value: number | null) =>
  parsed === null || Number.isNaN(parsed) ? value === null : parsed === value;

/** Numeric text input with locale-aware parsing, stepping buttons and range feedback. */
export function NumberField({
  label,
  hint,
  error,
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  step: providedStep,
  largeStep,
  formatOptions,
  disabled,
  required,
  name,
  id,
  placeholder,
}: NumberFieldProps) {
  const { locale, messages } = useLocale();
  const step = providedStep ?? (formatOptions?.style === 'percent' ? 0.01 : 1);
  const optionsKey = JSON.stringify(formatOptions ?? {});
  // Keyed by the serialised options so inline option objects do not rebuild the parser.
  const parser = useMemo(() => numberParser(locale, formatOptions), [locale, optionsKey]);
  const [current, setCurrent] = useControllableState(value, defaultValue, onValueChange);
  const [text, setText] = useState(() => (current === null ? '' : parser.format(current)));
  const [validated, setValidated] = useState(false);
  const focused = useRef(false);
  // Outside changes (a reset, a stepped value) replace the text; typing never does.
  useEffect(() => {
    if (!same(parser.parse(text), current)) setText(current === null ? '' : parser.format(current));
  }, [current]);
  useEffect(() => {
    if (!focused.current && current !== null) setText(parser.format(current));
  }, [parser]);

  const parsed = parser.parse(text);
  const problem = Number.isNaN(parsed)
    ? messages.numberInvalid
    : parsed !== null && min !== undefined && parsed < min
      ? messages.numberTooLow.replace('{min}', parser.format(min))
      : parsed !== null && max !== undefined && parsed > max
        ? messages.numberTooHigh.replace('{max}', parser.format(max))
        : undefined;
  const commit = (next: number | null) => {
    if (next !== current) setCurrent(next);
  };
  const stepBy = (delta: number) => {
    const base = parsed !== null && !Number.isNaN(parsed) ? parsed : null;
    let next =
      base === null ? (min ?? (max !== undefined && max < 0 ? max : 0)) : base + delta * step;
    const precision = Math.max(
      decimals(step),
      decimals(min ?? 0),
      base === null ? 0 : decimals(base),
    );
    next = Number(next.toFixed(Math.min(precision, 20)));
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    setText(parser.format(next));
    commit(next);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const amount = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[event.key];
    if (amount === undefined) return;
    event.preventDefault();
    const large = (largeStep ?? step * 10) / step;
    stepBy(Math.abs(amount) === 10 ? Math.sign(amount) * large : amount);
  };
  const atMin = current !== null && min !== undefined && current <= min;
  const atMax = current !== null && max !== undefined && current >= max;
  return (
    <Field
      label={label}
      hint={hint}
      error={error ?? (validated ? problem : undefined)}
      required={required}
      id={id}
    >
      {(field) => (
        <div className="g-number-field">
          <input
            {...field}
            className="g-input g-number-input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={placeholder}
            disabled={disabled}
            value={text}
            onFocus={() => {
              focused.current = true;
            }}
            onChange={(event) => {
              const next = event.currentTarget.value;
              setText(next);
              const result = parser.parse(next);
              commit(result === null || Number.isNaN(result) ? null : result);
            }}
            onBlur={() => {
              focused.current = false;
              setValidated(true);
              if (parsed === null || Number.isNaN(parsed)) return;
              // Normalise to the display format; keep the value it shows.
              const formatted = parser.format(parsed);
              const shown = parser.parse(formatted);
              setText(formatted);
              commit(shown === null || Number.isNaN(shown) ? parsed : shown);
            }}
            onKeyDown={onKeyDown}
          />
          <button
            type="button"
            className="g-number-step"
            tabIndex={-1}
            aria-label={messages.numberDecrease}
            aria-controls={field.id}
            disabled={disabled || atMin}
            onClick={() => {
              setValidated(true);
              stepBy(-1);
            }}
          >
            <Icon name="minus" />
          </button>
          <button
            type="button"
            className="g-number-step"
            tabIndex={-1}
            aria-label={messages.numberIncrease}
            aria-controls={field.id}
            disabled={disabled || atMax}
            onClick={() => {
              setValidated(true);
              stepBy(1);
            }}
          >
            <Icon name="plus" />
          </button>
          {name && <input type="hidden" name={name} value={current ?? ''} />}
        </div>
      )}
    </Field>
  );
}
