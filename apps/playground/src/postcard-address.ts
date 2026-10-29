import type { AddressFieldConfig, AddressFieldKey, AddressValue } from '@gregui/react';

// Consumer policy, based on Magyar Posta and UPU addressing guidance.
// See docs/COMPONENTS.md: Hungary and UK postcard addressing.
export type PostcardCountry = 'HU' | 'GB';
export const postcardCountries = [
  { value: 'HU', label: 'Hungary' },
  { value: 'GB', label: 'United Kingdom' },
];
export const initialPostcardAddress: AddressValue = {
  recipient: 'Kovács Anna',
  addressLine1: 'Minta utca 12.',
  addressLine2: '2. em. 4.',
  locality: 'Budapest',
  region: '',
  postalCode: '1117',
  countryCode: 'HU',
};
export function postcardAddressFields(
  country: string,
  role: 'recipient' | 'sender' = 'recipient',
): AddressFieldConfig[] {
  const hungarian = country === 'HU';
  const locality: AddressFieldConfig = {
    key: 'locality',
    label: hungarian ? 'Settlement / city' : 'Post town',
    required: true,
  };
  const postalCode: AddressFieldConfig = {
    key: 'postalCode',
    label: hungarian ? 'Postal code' : 'Postcode',
    required: true,
    hint: hungarian
      ? 'Four digits, for example 1117.'
      : 'For example SW1A 1AA. Lowercase and missing spaces are accepted.',
    inputMode: hungarian ? 'numeric' : 'text',
  };
  const street: AddressFieldConfig = {
    key: 'addressLine1',
    label: hungarian ? 'Street name and house number' : 'Building and street',
    hint: hungarian
      ? 'Include the street type and house number, for example Minta utca 12.'
      : 'Include the building name or number and street, where applicable.',
    required: true,
  };
  const extra: AddressFieldConfig = {
    key: 'addressLine2',
    label: hungarian
      ? 'Building, staircase, floor, door (optional)'
      : 'Flat or sub-building (optional)',
  };
  return [
    { key: 'countryCode', label: 'Country', placeholder: 'Choose a country', required: true },
    {
      key: 'recipient',
      label: role === 'sender' ? 'Sender name' : 'Recipient name',
      hint: 'Use the full name in its usual order.',
      required: true,
    },
    ...(hungarian
      ? [postalCode, locality, street, extra]
      : [
          extra,
          street,
          {
            key: 'dependentLocality' as const,
            label: 'Dependent locality (optional)',
            hint: 'Village or other locality, if part of the postal address.',
          },
          locality,
          postalCode,
        ]),
  ];
}
const compactUK = (code: string) => code.trim().toUpperCase().replace(/\s+/g, '');
// Basic postcode shapes only, not postcode allocation or deliverability checks.
const ukShape = /^(?:GIR0AA|[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2})$/;
export function formatUKPostcode(code: string): string {
  const compact = compactUK(code);
  return ukShape.test(compact)
    ? `${compact.slice(0, -3)} ${compact.slice(-3)}`
    : code.trim().toUpperCase();
}
export function validatePostcardAddress(
  address: AddressValue,
  role: 'recipient' | 'sender' = 'recipient',
): Partial<Record<AddressFieldKey, string>> {
  const errors: Partial<Record<AddressFieldKey, string>> = {};
  for (const field of postcardAddressFields(address.countryCode, role)) {
    if (field.required && !(address[field.key] ?? '').trim())
      errors[field.key] =
        field.key === 'countryCode' ? 'Choose a country.' : `Enter ${field.label.toLowerCase()}.`;
  }
  if (!postcardCountries.some((country) => country.value === address.countryCode))
    errors.countryCode = 'Choose Hungary or the United Kingdom.';
  if (
    address.postalCode.trim() &&
    address.countryCode === 'HU' &&
    !/^\d{4}$/.test(address.postalCode.trim())
  )
    errors.postalCode = 'Enter a four-digit Hungarian postal code.';
  if (
    address.postalCode.trim() &&
    address.countryCode === 'GB' &&
    !ukShape.test(compactUK(address.postalCode))
  )
    errors.postalCode = 'Enter a UK postcode, for example SW1A 1AA.';
  return errors;
}
/** Recipient is rendered separately. Domestic cards omit the country line. */
export function postcardAddressLines(
  address: AddressValue,
  postingFrom: PostcardCountry,
): string[] {
  const clean = (text?: string) => text?.trim() ?? '';
  const town = clean(address.locality).toLocaleUpperCase(
    address.countryCode === 'HU' ? 'hu-HU' : 'en-GB',
  );
  const lines =
    address.countryCode === 'HU'
      ? [town, clean(address.addressLine1), clean(address.addressLine2), clean(address.postalCode)]
      : [
          clean(address.addressLine2),
          clean(address.addressLine1),
          clean(address.dependentLocality),
          town,
          formatUKPostcode(address.postalCode),
        ];
  if (address.countryCode !== postingFrom) {
    if (address.countryCode === 'HU') lines.push('HUNGARY');
    if (address.countryCode === 'GB')
      lines.push(postingFrom === 'HU' ? 'EGYESÜLT KIRÁLYSÁG / UNITED KINGDOM' : 'UNITED KINGDOM');
  }
  return lines.filter(Boolean);
}
