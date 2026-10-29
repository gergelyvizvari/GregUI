'use client';
import { useId, type CSSProperties } from 'react';
import { useFormat, useLocale } from '@gregui/localization';
import { useControllableState } from './controllable';

export interface SliderMark {
  value: number;
  /** Visible text under the mark. Defaults to the formatted value. */
  label?: string;
}
export interface SliderProps {
  label: string;
  hint?: string;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  /** Controlled value. */
  value?: number;
  /** Initial value when uncontrolled. Defaults to `min`. */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Formats the visible value and the announced value text, for example currency or percent. */
  formatOptions?: Intl.NumberFormatOptions;
  /** Labelled reference points under the track. They do not restrict the value; use `step` for that. */
  marks?: readonly SliderMark[];
  /** Hide the formatted value beside the label. The value is still announced. */
  hideValue?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
}
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
/** A native range input with a formatted value, optional marks and field feedback. */
export function Slider({
  label,
  hint,
  error,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  formatOptions,
  marks,
  hideValue = false,
  disabled,
  required,
  name,
  id: provided,
}: SliderProps) {
  const uid = useId();
  const id = provided ?? uid;
  const format = useFormat();
  const { messages } = useLocale();
  const [current, setCurrent] = useControllableState(value, defaultValue ?? min, onValueChange);
  const shown = clamp(current, min, max);
  const span = max - min || 1;
  const position = (point: number) => `${((clamp(point, min, max) - min) / span) * 100}%`;
  const text = format.number(shown, formatOptions);
  const mark = marks?.find((item) => item.value === shown && item.label);
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="g-field g-slider-field" data-disabled={disabled ? true : undefined}>
      <div className="g-slider-header">
        <label className="g-label" htmlFor={id}>
          {label}
          {required && <span className="g-required"> ({messages.required})</span>}
        </label>
        {!hideValue && (
          // Visual only: the input's value text announces the same value.
          <output className="g-slider-value" htmlFor={id} aria-hidden="true">
            {text}
          </output>
        )}
      </div>
      {hint && (
        <p className="g-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      <div className="g-slider" style={{ '--g-slider-fill': position(shown) } as CSSProperties}>
        <input
          className="g-slider-input"
          type="range"
          id={id}
          name={name}
          min={min}
          max={max}
          step={step}
          value={shown}
          disabled={disabled}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          aria-valuetext={mark ? `${text}, ${mark.label}` : text}
          onChange={(event) => setCurrent(Number(event.currentTarget.value))}
        />
        {marks && marks.length > 0 && (
          <div className="g-slider-marks" aria-hidden="true">
            {marks.map((item) => (
              <span
                className="g-slider-mark"
                key={item.value}
                data-active={item.value <= shown ? true : undefined}
                data-edge={item.value <= min ? 'start' : item.value >= max ? 'end' : undefined}
                style={{ '--g-slider-mark': position(item.value) } as CSSProperties}
              >
                <span className="g-slider-mark-label">
                  {item.label ?? format.number(item.value, formatOptions)}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="g-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
