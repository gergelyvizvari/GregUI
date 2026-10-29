'use client';
import { useId, type KeyboardEvent } from 'react';
import { useLocale } from '@gregui/localization';
import { renderIcon, type IconSource } from './icons';
import { useControllableState } from './controllable';

export interface SegmentedControlOption {
  value: string;
  /** Always shown beside the optional icon; it is the option's accessible name. */
  label: string;
  /** Decorative icon shown before the label. */
  icon?: IconSource;
  disabled?: boolean;
}
export interface SegmentedControlProps {
  /** Names the group. Shown above the control unless `hideLabel` is set. */
  label: string;
  /** Keep the label for assistive technology only, when the context already makes it clear. */
  hideLabel?: boolean;
  /** Two to five short options. */
  options: readonly SegmentedControlOption[];
  /** Controlled selection. */
  value?: string;
  /** Initial selection when uncontrolled. Defaults to the first enabled option. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Radio group name for native form submission. Generated when omitted. */
  name?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  /** Follows the theme density; `small` uses the small button height. */
  size?: 'small' | 'medium';
  /** Stretch the segments to fill the available width. */
  fullWidth?: boolean;
}
const navigationKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
/** Single choice among a few short options, built from native radio inputs. */
export function SegmentedControl({
  label,
  hideLabel = false,
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  hint,
  error,
  disabled = false,
  size = 'medium',
  fullWidth = false,
}: SegmentedControlProps) {
  const id = useId();
  const { direction } = useLocale();
  const [selected, select] = useControllableState(
    value,
    defaultValue ?? options.find((option) => !option.disabled)?.value ?? '',
    onValueChange,
  );
  const feedback =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!navigationKeys.includes(event.key)) return;
    event.preventDefault();
    const radios = Array.from(
      event.currentTarget
        .closest('.g-segmented')!
        .querySelectorAll<HTMLInputElement>('input[type="radio"]:not(:disabled)'),
    );
    const current = radios.indexOf(event.currentTarget);
    const rtl = (event.currentTarget.closest('[dir]')?.getAttribute('dir') ?? direction) === 'rtl';
    const forward = event.key === 'ArrowDown' || event.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? radios.length - 1
          : (current + (forward ? 1 : -1) + radios.length) % radios.length;
    const target = radios[next];
    if (!target) return;
    target.focus();
    if (target.value !== selected) select(target.value);
  };
  return (
    <fieldset className="g-segmented-field" disabled={disabled} aria-describedby={feedback}>
      <legend className={hideLabel ? 'g-sr-only' : 'g-label'}>{label}</legend>
      {hint && (
        <p className="g-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      <div
        className="g-segmented"
        data-size={size}
        data-full-width={fullWidth}
        data-invalid={error ? true : undefined}
      >
        {options.map((option) => (
          <label className="g-segment" key={option.value}>
            <input
              className="g-segment-input"
              type="radio"
              name={name ?? id}
              value={option.value}
              checked={selected === option.value}
              disabled={option.disabled}
              aria-invalid={error ? true : undefined}
              onChange={() => select(option.value)}
              onKeyDown={onKeyDown}
            />
            <span className="g-segment-face">
              {option.icon && renderIcon(option.icon)}
              <span className="g-segment-label">{option.label}</span>
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p className="g-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
