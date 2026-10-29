import { expect, it } from 'vitest';
import {
  initialPostcardAddress,
  postcardAddressFields,
  postcardAddressLines,
  validatePostcardAddress,
  formatUKPostcode,
} from '../apps/playground/src/postcard-address';

it('defaults to Hungary and renders domestic Hungarian city/street/details/postcode order with accents intact', () => {
  expect(initialPostcardAddress.countryCode).toBe('HU');
  expect(
    postcardAddressLines(
      {
        ...initialPostcardAddress,
        locality: 'Győr',
        addressLine1: 'Árvíz utca 12/A',
        addressLine2: 'B épület, II. em. 4.',
        postalCode: '9021',
      },
      'HU',
    ),
  ).toEqual(['GYŐR', 'Árvíz utca 12/A', 'B épület, II. em. 4.', '9021']);
  expect(postcardAddressLines(initialPostcardAddress, 'GB').at(-1)).toBe('HUNGARY');
  expect(postcardAddressFields('HU').find((field) => field.key === 'postalCode')?.inputMode).toBe(
    'numeric',
  );
});
const uk = {
  ...initialPostcardAddress,
  countryCode: 'GB',
  locality: 'London',
  addressLine1: '28 Sample Road',
  addressLine2: 'Flat 4',
  dependentLocality: 'Sample village',
  region: 'Unused county',
  postalCode: 'sw1a2aa',
};
it('renders UK sub-building, street, dependent locality, capitalised post town and canonical postcode without county', () => {
  expect(postcardAddressLines(uk, 'GB')).toEqual([
    'Flat 4',
    '28 Sample Road',
    'Sample village',
    'LONDON',
    'SW1A 2AA',
  ]);
  expect(postcardAddressLines(uk, 'HU').at(-1)).toBe('EGYESÜLT KIRÁLYSÁG / UNITED KINGDOM');
  expect(uk.postalCode).toBe('sw1a2aa');
  expect(postcardAddressFields('GB').some((field) => field.key === 'region')).toBe(false);
});
it('checks Hungarian four-digit syntax and UK postcode shapes without claiming address verification', () => {
  expect(validatePostcardAddress(initialPostcardAddress)).toEqual({});
  for (const code of ['123', '12345', 'H-1117', 'AB12'])
    expect(
      validatePostcardAddress({ ...initialPostcardAddress, postalCode: code }).postalCode,
    ).toBeTruthy();
  for (const code of ['M25BQ', 'M345AB', 'CR02YR', 'DN169AA', 'W1A4ZZ', 'EC1A1HQ', 'gir0aa'])
    expect(validatePostcardAddress({ ...uk, postalCode: code })).toEqual({});
  for (const code of ['1117', 'SW1A', 'ABC123', 'SW1A-1AA'])
    expect(validatePostcardAddress({ ...uk, postalCode: code }).postalCode).toBeTruthy();
  expect(formatUKPostcode('  ec1a   1hq ')).toBe('EC1A 1HQ');
  expect(validatePostcardAddress({ ...uk, countryCode: 'FR' }).countryCode).toBeTruthy();
});

it('uses sender labels and sender-specific required feedback without changing recipient defaults', () => {
  expect(
    postcardAddressFields('HU', 'sender').find((field) => field.key === 'recipient')?.label,
  ).toBe('Sender name');
  expect(
    validatePostcardAddress({ ...initialPostcardAddress, recipient: '' }, 'sender').recipient,
  ).toBe('Enter sender name.');
  expect(postcardAddressFields('HU').find((field) => field.key === 'recipient')?.label).toBe(
    'Recipient name',
  );
});
