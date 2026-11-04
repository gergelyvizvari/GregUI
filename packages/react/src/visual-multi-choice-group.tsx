'use client';
import { useId, type ReactNode } from 'react';
import type { VisualChoiceOption } from './visual-choice-group';

export interface VisualMultiChoiceOption extends VisualChoiceOption {
  /**
   * Shown under a chosen option, outside its checkbox, such as a `QuantityStepper`. It may hold
   * controls of its own.
   */
  extra?: ReactNode;
}
export interface VisualMultiChoiceGroupProps {
  label: string;
  hideLabel?: boolean;
  hideCaptions?: boolean;
  options: readonly VisualMultiChoiceOption[];
  /** The chosen options' values. */
  values: readonly string[];
  onValuesChange: (values: string[]) => void;
  hint?: string;
  error?: string;
  disabled?: boolean;
  /** `gallery` (default) or `masonry`, with the same look as `VisualChoiceGroup`. */
  layout?: 'gallery' | 'masonry';
}

/**
 * Several pictures picked with a tap, each a native checkbox: the chosen ones are ringed and
 * ticked like in `VisualChoiceGroup`, and can show `extra` controls beneath, such as a count.
 */
export function VisualMultiChoiceGroup({
  label,
  hideLabel = false,
  hideCaptions = false,
  options,
  values,
  onValuesChange,
  hint,
  error,
  disabled,
  layout = 'gallery',
}: VisualMultiChoiceGroupProps) {
  const id = useId();
  const feedback =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const toggle = (value: string, on: boolean) =>
    onValuesChange(
      on
        ? [...values.filter((item) => item !== value), value]
        : values.filter((item) => item !== value),
    );
  return (
    <fieldset
      className="g-visual-choice-group"
      data-layout={layout}
      data-multiple
      disabled={disabled}
      aria-describedby={feedback}
    >
      <legend className={hideLabel ? 'g-sr-only' : undefined}>{label}</legend>
      {hint && (
        <p id={`${id}-hint`} className="g-visual-choice-hint">
          {hint}
        </p>
      )}
      <div className="g-visual-choice-options">
        {options.map((option, index) => {
          const checked = values.includes(option.value);
          return (
            <div className="g-visual-choice-item" key={option.value}>
              <label className="g-visual-choice" data-disabled={!!option.disabled}>
                <input
                  type="checkbox"
                  value={option.value}
                  checked={checked}
                  disabled={option.disabled}
                  aria-labelledby={`${id}-${index}-label`}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={
                    [option.description && `${id}-${index}-description`, feedback]
                      .filter(Boolean)
                      .join(' ') || undefined
                  }
                  onChange={(event) => toggle(option.value, event.target.checked)}
                />
                {option.preview !== undefined && (
                  <span className="g-visual-choice-preview" aria-hidden="true">
                    {option.preview}
                  </span>
                )}
                <span className="g-visual-choice-caption">
                  <strong
                    id={`${id}-${index}-label`}
                    className={hideCaptions ? 'g-sr-only' : undefined}
                  >
                    {option.label}
                  </strong>
                  {option.description && (
                    <span id={`${id}-${index}-description`}>{option.description}</span>
                  )}
                </span>
              </label>
              {checked && option.extra}
            </div>
          );
        })}
      </div>
      {error && (
        <p id={`${id}-error`} className="g-visual-choice-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
