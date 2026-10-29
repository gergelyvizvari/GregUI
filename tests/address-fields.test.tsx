import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import {
  AddressFields,
  LocaleProvider,
  type AddressValue,
  type AddressFieldConfig,
} from '@gregui/react';
const value: AddressValue = {
  recipient: 'Sam',
  addressLine1: '12 Example Lane',
  addressLine2: '',
  locality: 'London',
  region: 'Draft county',
  postalCode: 'SW1A 1AA',
  countryCode: 'GB',
};
const fields: AddressFieldConfig[] = [
  { key: 'countryCode', label: 'Country', placeholder: 'Choose a country', required: true },
  { key: 'addressLine1', label: 'Street', required: true },
  { key: 'locality', label: 'City' },
  { key: 'postalCode', label: 'Postcode', hint: 'As written on your address', required: true },
];
const countries = [
  { value: 'GB', label: 'United Kingdom' },
  { value: 'FR', label: 'France' },
];
it('emits a complete value and changed field, preserving whitespace, hidden data and focus across country changes', async () => {
  const changed = vi.fn();
  function Fixture() {
    const [address, setAddress] = useState(value);
    return (
      <AddressFields
        label="Address"
        value={address}
        fields={fields.map((field) =>
          field.key === 'postalCode'
            ? { ...field, label: address.countryCode === 'FR' ? 'Postal code' : 'Postcode' }
            : field,
        )}
        countries={countries}
        onChange={(next, key) => {
          setAddress(next);
          changed(next, key);
        }}
      />
    );
  }
  render(<Fixture />);
  const user = userEvent.setup();
  await user.selectOptions(screen.getByRole('combobox', { name: /^Country/ }), 'FR');
  expect(changed).toHaveBeenLastCalledWith({ ...value, countryCode: 'FR' }, 'countryCode');
  expect(screen.getByRole('combobox')).toHaveFocus();
  expect(screen.getByRole('textbox', { name: /^Postal code/ })).toHaveValue('SW1A 1AA');
  await user.clear(screen.getByRole('textbox', { name: /^Street/ }));
  await user.type(screen.getByRole('textbox', { name: /^Street/ }), '  Rue exemple  ');
  expect(changed.mock.lastCall?.[0]).toEqual({
    ...value,
    countryCode: 'FR',
    addressLine1: '  Rue exemple  ',
  });
});
it('associates per-field errors and hints, supports form names/autocomplete and reports blur', async () => {
  const blur = vi.fn();
  const { container } = render(
    <form>
      <AddressFields
        label="Address"
        hint="Delivery details"
        value={value}
        fields={fields}
        countries={countries}
        onChange={() => {}}
        onBlur={blur}
        errors={{ postalCode: 'Check the postcode' }}
        namePrefix="delivery"
        autoComplete="shipping"
      />
    </form>,
  );
  const postcode = screen.getByRole('textbox', { name: /^Postcode/ });
  expect(postcode).toHaveAccessibleDescription('As written on your address Check the postcode');
  expect(postcode).toBeInvalid();
  expect(postcode).toBeRequired();
  expect(postcode.getAttribute('autocomplete')).toMatch(/^section-\w+ shipping postal-code$/);
  expect(new FormData(container.querySelector('form')!).get('delivery.countryCode')).toBe('GB');
  const user = userEvent.setup();
  await user.click(postcode);
  await user.tab();
  expect(blur).toHaveBeenCalledWith('postalCode');
});
it('isolates multiple addresses, disables all controls and preserves unknown country codes', () => {
  const { rerender } = render(
    <>
      <AddressFields
        label="One"
        value={value}
        fields={fields}
        countries={countries}
        onChange={() => {}}
      />
      <AddressFields
        label="Two"
        value={value}
        fields={fields}
        countries={countries}
        onChange={() => {}}
      />
    </>,
  );
  const [first, second] = screen.getAllByRole('textbox', { name: /^Street/ });
  expect(first.id).not.toBe(second.id);
  expect(first.getAttribute('name')).not.toBe(second.getAttribute('name'));
  expect(first.getAttribute('autocomplete')).not.toBe(second.getAttribute('autocomplete'));
  rerender(
    <AddressFields
      label="One"
      value={{ ...value, countryCode: 'ZZ' }}
      fields={fields}
      countries={countries}
      onChange={() => {}}
      disabled
      autoComplete="off"
    />,
  );
  expect(screen.getByRole('combobox')).toHaveValue('ZZ');
  expect(screen.getByRole('combobox')).toBeDisabled();
  expect(screen.getByRole('textbox', { name: /^Street/ })).toBeDisabled();
  expect(screen.getByRole('textbox', { name: /^Street/ })).toHaveAttribute('autocomplete', 'off');
});
it('hydrates translated RTL fields with stable labels and IDs', async () => {
  const tree = (
    <LocaleProvider direction="rtl" messages={{ required: 'kötelező' }}>
      <AddressFields
        label="Cím"
        value={value}
        fields={[{ key: 'postalCode', label: 'Irányítószám', required: true }]}
        countries={countries}
        onChange={() => {}}
      />
    </LocaleProvider>
  );
  const container = document.createElement('div');
  container.innerHTML = renderToString(tree);
  document.body.append(container);
  const initialId = container.querySelector('input')!.id;
  const recover = vi.fn();
  let root: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(container, tree, { onRecoverableError: recover });
  });
  expect(container.querySelector('input')!.id).toBe(initialId);
  expect(screen.getByRole('textbox', { name: 'Irányítószám (kötelező)' })).toBeRequired();
  expect(recover).not.toHaveBeenCalled();
  await act(async () => root!.unmount());
  container.remove();
});

it('supports an optional dependent locality without changing existing required address keys', async () => {
  const changed = vi.fn();
  render(
    <AddressFields
      label="Address"
      value={value}
      fields={[
        { key: 'dependentLocality', label: 'Village' },
        { key: 'postalCode', label: 'Postal code', inputMode: 'numeric' },
      ]}
      countries={countries}
      onChange={changed}
    />,
  );
  expect(screen.getByRole('textbox', { name: 'Village' })).toHaveValue('');
  expect(screen.getByRole('textbox', { name: 'Village' }).getAttribute('autocomplete')).toContain(
    'address-level3',
  );
  expect(screen.getByRole('textbox', { name: 'Postal code' })).toHaveAttribute('type', 'text');
  expect(screen.getByRole('textbox', { name: 'Postal code' })).toHaveAttribute(
    'inputmode',
    'numeric',
  );
  await userEvent.type(screen.getByRole('textbox', { name: 'Village' }), 'A');
  expect(changed).toHaveBeenCalledWith({ ...value, dependentLocality: 'A' }, 'dependentLocality');
});

it('keeps an unlisted saved country selectable so native form posts include it', () => {
  const { container } = render(
    <form>
      <AddressFields
        label="Address"
        namePrefix="ship"
        value={{ ...value, countryCode: 'XK' }}
        onChange={() => {}}
        fields={[{ key: 'countryCode', label: 'Country' }]}
        countries={[{ value: 'GB', label: 'United Kingdom' }]}
      />
    </form>,
  );
  expect(screen.getByRole('option', { name: 'XK' })).not.toBeDisabled();
  expect(new FormData(container.querySelector('form')!).get('ship.countryCode')).toBe('XK');
});
