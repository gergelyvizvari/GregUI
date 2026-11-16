'use client';
import { useLocale } from '@gregui/localization';
import { Icon } from './icons';

export interface QuantityStepperProps {
  /** What is counted, for assistive technology, for example the design's name. */
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

/**
 * A compact "− 2 +" count for small whole numbers beside a picture or a line, such as how many
 * of a card to order. Use `NumberField` when people type the number.
 */
export function QuantityStepper({
  label,
  value,
  onValueChange,
  min = 0,
  max = 99,
  disabled,
}: QuantityStepperProps) {
  const { messages } = useLocale();
  const change = (next: number) => onValueChange(Math.max(min, Math.min(max, next)));
  return (
    <div className="g-quantity-stepper" role="group" aria-label={label}>
      <button
        type="button"
        className="g-quantity-stepper-button"
        aria-label={`${messages.numberDecrease}: ${label}`}
        disabled={disabled || value <= min}
        onClick={() => change(value - 1)}
      >
        <Icon name="minus" />
      </button>
      <output className="g-quantity-stepper-value" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className="g-quantity-stepper-button"
        aria-label={`${messages.numberIncrease}: ${label}`}
        disabled={disabled || value >= max}
        onClick={() => change(value + 1)}
      >
        <Icon name="plus" />
      </button>
    </div>
  );
}
