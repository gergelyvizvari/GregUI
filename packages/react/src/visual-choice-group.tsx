'use client';
import { useId, type ReactNode } from 'react';

export interface VisualChoiceOption {
  value: string;
  label: string;
  description?: string;
  /** Decorative preview; the radio label and description provide the accessible text. Optional with the `notes` layout. */
  preview?: ReactNode;
  disabled?: boolean;
  /** Supply translated pending/unavailable feedback alongside disabled. */
  status?: string;
}
export interface VisualChoiceGroupProps {
  label: string;
  /** Keep the label for assistive technology only, when a heading above already asks it. */
  hideLabel?: boolean;
  options: readonly VisualChoiceOption[];
  value: string | null;
  onChange: (value: string) => void;
  name?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  /**
   * `gallery`: previews keep their own shape at one height, like prints laid out on a table;
   * the chosen one is ringed and ticked. Suits pictures of different proportions.
   * `tiles`: big centred choices with a small preview (an avatar, icon or picture) above the
   * label, for quick choices such as who or how.
   * `notes`: text choices as small note cards, the label as a title and the description as the
   * text, for picking among written suggestions.
   */
  layout?: 'grid' | 'gallery' | 'tiles' | 'notes';
}
/** Controlled native radio selection with consistent directional keyboard navigation. */
export function VisualChoiceGroup({
  label,
  hideLabel = false,
  options,
  value,
  onChange,
  name,
  hint,
  error,
  disabled,
  required,
  layout = 'grid',
}: VisualChoiceGroupProps) {
  const id = useId();
  const feedback =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <fieldset
      className="g-visual-choice-group"
      data-layout={layout}
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
        {options.map((option, index) => (
          <label className="g-visual-choice" key={option.value} data-disabled={!!option.disabled}>
            <input
              type="radio"
              name={name ?? id}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              required={required}
              aria-labelledby={`${id}-${index}-label`}
              aria-invalid={error ? true : undefined}
              aria-describedby={
                [
                  option.description && `${id}-${index}-description`,
                  option.status && `${id}-${index}-status`,
                  feedback,
                ]
                  .filter(Boolean)
                  .join(' ') || undefined
              }
              onChange={() => onChange(option.value)}
              onKeyDown={(event) => {
                if (
                  !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                const radios = Array.from(
                  event.currentTarget
                    .closest('fieldset')!
                    .querySelectorAll<HTMLInputElement>('input[type="radio"]:not(:disabled)'),
                );
                const current = radios.indexOf(event.currentTarget);
                const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
                const forward =
                  event.key === 'ArrowDown' || event.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
                const next =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? radios.length - 1
                      : (current + (forward ? 1 : -1) + radios.length) % radios.length;
                radios[next]?.focus();
                if (radios[next] && radios[next].value !== value) onChange(radios[next].value);
              }}
            />
            {option.preview !== undefined && (
              <span className="g-visual-choice-preview" aria-hidden="true">
                {option.preview}
              </span>
            )}
            <span className="g-visual-choice-caption">
              <strong id={`${id}-${index}-label`}>{option.label}</strong>
              {option.description && (
                <span id={`${id}-${index}-description`}>{option.description}</span>
              )}
              {option.status && <span id={`${id}-${index}-status`}>{option.status}</span>}
            </span>
          </label>
        ))}
      </div>
      {/* One persistent live region, so status changes are announced reliably. */}
      <p className="g-sr-only" role="status">
        {options
          .filter((option) => option.status)
          .map((option) => `${option.label}: ${option.status}`)
          .join('. ')}
      </p>
      {error && (
        <p id={`${id}-error`} className="g-visual-choice-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
