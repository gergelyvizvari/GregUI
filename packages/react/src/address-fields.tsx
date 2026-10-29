'use client';
import { useId } from 'react';
import { Field, Input, Select } from './forms';

/** Country codes and address text are application-owned; no normalisation is applied. */
export interface AddressValue {
  recipient: string;
  addressLine1: string;
  addressLine2: string;
  locality: string;
  /** Optional village/district below the post-town level. */
  dependentLocality?: string;
  region: string;
  postalCode: string;
  countryCode: string;
}
export type AddressFieldKey = keyof AddressValue;
export interface AddressFieldConfig {
  key: AddressFieldKey;
  label: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  inputMode?: 'text' | 'numeric';
}
export interface AddressCountryOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface AddressFieldsProps {
  label: string;
  hint?: string;
  value: AddressValue;
  onChange: (value: AddressValue, field: AddressFieldKey) => void;
  /** Ordered, unique field keys. Omitted fields retain their controlled values. */
  fields: readonly AddressFieldConfig[];
  countries: readonly AddressCountryOption[];
  errors?: Partial<Record<AddressFieldKey, string>>;
  onBlur?: (field: AddressFieldKey) => void;
  disabled?: boolean;
  namePrefix?: string;
  autoComplete?: 'shipping' | 'billing' | 'off';
}
const autocomplete: Record<AddressFieldKey, string> = {
  recipient: 'name',
  addressLine1: 'address-line1',
  addressLine2: 'address-line2',
  locality: 'address-level2',
  dependentLocality: 'address-level3',
  region: 'address-level1',
  postalCode: 'postal-code',
  countryCode: 'country',
};
/** Provider-independent address entry. Applications supply country policy and validation. */
export function AddressFields({
  label,
  hint,
  value,
  onChange,
  fields,
  countries,
  errors,
  onBlur,
  disabled,
  namePrefix,
  autoComplete,
}: AddressFieldsProps) {
  const id = useId();
  const section = `section-${id.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <fieldset
      className="g-address-fields"
      disabled={disabled}
      aria-describedby={hint ? `${id}-hint` : undefined}
    >
      <legend>{label}</legend>
      {hint && (
        <p id={`${id}-hint`} className="g-hint">
          {hint}
        </p>
      )}
      <div className="g-address-grid">
        {fields.map((field) => {
          const shared = {
            name: `${namePrefix ?? id}.${field.key}`,
            value: value[field.key] ?? '',
            autoComplete:
              autoComplete === 'off'
                ? 'off'
                : [section, autoComplete, autocomplete[field.key]].filter(Boolean).join(' '),
            onBlur: () => onBlur?.(field.key),
          };
          return (
            <div
              key={field.key}
              data-wide={[
                'countryCode',
                'recipient',
                'addressLine1',
                'addressLine2',
                'dependentLocality',
              ].includes(field.key)}
            >
              <Field
                id={`${id}-${field.key}`}
                label={field.label}
                hint={field.hint}
                error={errors?.[field.key]}
                required={field.required}
              >
                {(control) =>
                  field.key === 'countryCode' ? (
                    <Select
                      {...shared}
                      {...control}
                      onChange={(event) =>
                        onChange({ ...value, countryCode: event.target.value }, 'countryCode')
                      }
                    >
                      <option value="">{field.placeholder ?? field.label}</option>
                      {value.countryCode &&
                        !countries.some((country) => country.value === value.countryCode) && (
                          // Kept selectable: browsers leave disabled options out of form posts.
                          <option value={value.countryCode}>{value.countryCode}</option>
                        )}
                      {countries.map((country) => (
                        <option
                          key={country.value}
                          value={country.value}
                          disabled={country.disabled}
                        >
                          {country.label}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      {...shared}
                      {...control}
                      type="text"
                      inputMode={field.inputMode}
                      placeholder={field.placeholder}
                      onChange={(event) =>
                        onChange({ ...value, [field.key]: event.target.value }, field.key)
                      }
                    />
                  )
                }
              </Field>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
