'use client';
import { useId, forwardRef, type ReactNode, type ComponentPropsWithoutRef } from 'react';
import { useLocale } from '@gregui/localization';
import type { Clean } from './internal-types';
import { Icon } from './icons';
import { Inline } from './layout';
interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  id?: string;
  children: (props: {
    id: string;
    'aria-describedby'?: string;
    'aria-invalid'?: true;
    required?: boolean;
  }) => ReactNode;
}
export function Field({ label, hint, error, required, id: provided, children }: FieldProps) {
  const uid = useId();
  const id = provided ?? uid;
  const { messages } = useLocale();
  return (
    <div className="g-field">
      <label className="g-label" htmlFor={id}>
        {label}
        {required && <span className="g-required"> ({messages.required})</span>}
      </label>
      {hint && (
        <p className="g-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {children({
        id,
        'aria-describedby':
          [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? true : undefined,
        required,
      })}
      {error && (
        <p className="g-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
export const Input = forwardRef<HTMLInputElement, Clean<ComponentPropsWithoutRef<'input'>>>(
  function Input(props, ref) {
    return <input {...props} ref={ref} className="g-input" />;
  },
);
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  Clean<ComponentPropsWithoutRef<'textarea'>>
>(function Textarea(props, ref) {
  return <textarea rows={3} {...props} ref={ref} className="g-input g-textarea" />;
});
export const Select = forwardRef<HTMLSelectElement, Clean<ComponentPropsWithoutRef<'select'>>>(
  function Select(props, ref) {
    if (props.multiple || (props.size ?? 0) > 1) {
      return <select {...props} ref={ref} className="g-input g-select" />;
    }
    return (
      <span className="g-select-wrap">
        <select {...props} ref={ref} className="g-input g-select" />
        <span className="g-select-chevron" aria-hidden="true">
          <Icon name="chevron" />
        </span>
      </span>
    );
  },
);
export function TextField({
  label,
  hint,
  error,
  ...props
}: Clean<ComponentPropsWithoutRef<'input'>> & { label: string; hint?: string; error?: string }) {
  return (
    <Field label={label} hint={hint} error={error} required={props.required} id={props.id}>
      {(field) => <Input {...props} {...field} />}
    </Field>
  );
}
export function Checkbox({
  label,
  hint,
  hideLabel = false,
  ...props
}: Omit<Clean<ComponentPropsWithoutRef<'input'>>, 'type'> & {
  label: string;
  hint?: string;
  hideLabel?: boolean;
}) {
  const uid = useId();
  const id = props.id ?? uid;
  return (
    <div className="g-check-field">
      <label className="g-check-label">
        <input
          {...props}
          id={id}
          type="checkbox"
          className="g-checkbox"
          aria-describedby={
            [props['aria-describedby'], hint && `${id}-hint`].filter(Boolean).join(' ') || undefined
          }
        />
        <span className={hideLabel ? 'g-sr-only' : undefined}>{label}</span>
      </label>
      {hint && (
        <p className="g-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}
export function Switch({
  label,
  ...props
}: Omit<Clean<ComponentPropsWithoutRef<'input'>>, 'type' | 'role'> & { label: string }) {
  return (
    <label className="g-check-label g-switch-label">
      <span>{label}</span>
      <input {...props} className="g-switch" type="checkbox" role="switch" />
    </label>
  );
}
export function RadioGroup({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <fieldset className="g-fieldset">
      <legend className="g-label">{legend}</legend>
      <Inline>
        {options.map((option) => (
          <label className="g-check-label" key={option.value}>
            <input
              type="radio"
              name={name ?? id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </Inline>
    </fieldset>
  );
}
