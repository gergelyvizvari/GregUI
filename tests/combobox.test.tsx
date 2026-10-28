import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Combobox, LocaleProvider, Button, type ComboboxProps } from '@gregui/react';

const options = [
  { value: 'uk', label: 'United Kingdom' },
  { value: 'fr', label: 'France' },
  { value: 'fi', label: 'Finland', disabled: true },
];
const base = { label: 'Country', value: 'uk', options, onChange: vi.fn() };

it('renders external results unchanged, keeps query controlled and resets it after a selection', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn(),
    onQueryChange = vi.fn();
  const { rerender } = render(
    <Combobox
      {...base}
      filterMode="external"
      query="French"
      onQueryChange={onQueryChange}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('combobox');
  await user.click(input);
  expect(screen.getAllByRole('option')).toHaveLength(3);
  await user.type(input, 'x');
  expect(onQueryChange).toHaveBeenLastCalledWith('Frenchx');
  expect(input).toHaveValue('French');
  rerender(
    <Combobox
      {...base}
      filterMode="external"
      query="French"
      onQueryChange={onQueryChange}
      onChange={onChange}
      options={[options[1]]}
    />,
  );
  await user.keyboard('{Enter}');
  expect(onChange).toHaveBeenCalledWith('fr');
  expect(onQueryChange).toHaveBeenLastCalledWith(null);
  expect(input).toHaveAttribute('aria-expanded', 'false');
});

it('restores an explicit selected label after Escape or blur when selection is absent from results', async () => {
  const user = userEvent.setup();
  function Host() {
    const [query, setQuery] = useState<string | null>(null);
    return (
      <>
        <Combobox
          {...base}
          options={[options[1]]}
          filterMode="external"
          query={query}
          onQueryChange={setQuery}
          selectedLabel="United Kingdom"
        />
        <Button>Outside</Button>
      </>
    );
  }
  render(<Host />);
  const input = screen.getByRole('combobox');
  await user.type(input, 'French');
  await user.keyboard('{Escape}');
  expect(input).toHaveValue('United Kingdom');
  expect(input).toHaveFocus();
  expect(input).not.toHaveAttribute('aria-activedescendant');
  await user.type(input, 'x');
  await user.tab();
  expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
  expect(input).toHaveValue('United Kingdom');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});

it('blocks stale results during loading and failure, announces translations, and retries with input focus', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn(),
    onQueryChange = vi.fn(),
    onRetry = vi.fn();
  const view = (loading: boolean, loadError?: string) => (
    <LocaleProvider messages={{ loading: 'Betöltés', retry: 'Újra' }}>
      <Combobox
        {...base}
        onChange={onChange}
        filterMode="external"
        query="search"
        onQueryChange={onQueryChange}
        loading={loading}
        loadError={loadError}
        onRetry={onRetry}
      />
    </LocaleProvider>
  );
  const { rerender } = render(view(true, 'Request failed'));
  const input = screen.getByRole('combobox');
  await user.click(input);
  expect(screen.getByRole('status')).toHaveTextContent('Betöltés');
  expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
  expect(input).not.toHaveAttribute('aria-activedescendant');
  expect(screen.queryByRole('option')).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(onChange).not.toHaveBeenCalled();
  await user.type(input, 'x');
  expect(onQueryChange).toHaveBeenLastCalledWith('searchx');
  rerender(view(false, 'Request failed'));
  expect(screen.getByRole('alert')).toHaveTextContent('Request failed');
  const errorId = input.getAttribute('aria-describedby')!;
  expect(document.getElementById(errorId)).toHaveTextContent('Request failed');
  expect(screen.queryByText('No results found.')).not.toBeInTheDocument();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Újra' })).toHaveFocus();
  expect(input).toHaveAttribute('aria-expanded', 'true');
  await user.keyboard('{Enter}');
  expect(onRetry).toHaveBeenCalledOnce();
  expect(input).toHaveFocus();
  expect(input).toHaveValue('search');
  await user.click(screen.getByRole('button', { name: 'Újra' }));
  expect(input).toHaveFocus();
  expect(onRetry).toHaveBeenCalledTimes(2);
  rerender(view(false));
  expect(screen.getAllByRole('option')).toHaveLength(3);
});

it('preserves active choice by ID across reordering and safely falls back after removal or disabling', async () => {
  const user = userEvent.setup();
  const props = {
    ...base,
    filterMode: 'external' as const,
    query: '' as string | null,
    onQueryChange: vi.fn(),
  };
  const { rerender } = render(<Combobox {...props} />);
  const input = screen.getByRole('combobox');
  await user.click(input);
  await user.keyboard('{ArrowDown}');
  const active = () => document.getElementById(input.getAttribute('aria-activedescendant')!);
  expect(active()).toHaveTextContent('France');
  rerender(<Combobox {...props} options={[options[1], options[0]]} />);
  expect(active()).toHaveTextContent('France');
  rerender(<Combobox {...props} options={[{ ...options[1], disabled: true }, options[0]]} />);
  expect(active()).toHaveTextContent('United Kingdom');
  rerender(<Combobox {...props} options={[]} />);
  expect(input).not.toHaveAttribute('aria-activedescendant');
  expect(screen.getByRole('status')).toHaveTextContent('No results found.');
  rerender(<Combobox {...props} options={[options[0]]} disabled />);
  expect(input).toBeDisabled();
  expect(input).toHaveAttribute('aria-expanded', 'false');
});

it('links field hint and validation separately from service failures and uses provider locale filtering in RTL', async () => {
  const user = userEvent.setup();
  render(
    <LocaleProvider locale="tr-TR" direction="rtl">
      <Combobox
        {...base}
        value=""
        options={[
          { value: 'tr', label: 'ISPARTA' },
          { value: 'fi', label: 'Izmir', disabled: true },
        ]}
        hint="Choose a country"
        error="A country is required"
      />
    </LocaleProvider>,
  );
  const input = screen.getByRole('combobox');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription('Choose a country A country is required');
  await user.type(input, 'ısp');
  expect(screen.getByRole('option')).toHaveTextContent('ISPARTA');
  const description = input.getAttribute('aria-describedby');
  await user.keyboard('{Escape}');
  expect(input).toHaveAccessibleDescription('Choose a country A country is required');
  expect(input.getAttribute('aria-describedby')).toBe(description);
});

it('keeps Escape inside an open popup, skips disabled options and does not select during IME composition', async () => {
  const user = userEvent.setup();
  const onKeyDown = vi.fn(),
    onChange = vi.fn();
  render(
    <div onKeyDown={onKeyDown}>
      <Combobox {...base} onChange={onChange} />
    </div>,
  );
  const input = screen.getByRole('combobox');
  await user.click(input);
  await user.keyboard('{End}');
  expect(document.getElementById(input.getAttribute('aria-activedescendant')!)).toHaveTextContent(
    'France',
  );
  fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
  expect(onChange).not.toHaveBeenCalled();
  onKeyDown.mockClear();
  await user.keyboard('{Escape}');
  expect(onKeyDown).not.toHaveBeenCalled();
  await user.keyboard('{Escape}');
  expect(onKeyDown).toHaveBeenCalledOnce();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(onChange).toHaveBeenCalledWith('uk');
});

function typeContracts() {
  // @ts-expect-error external filtering requires a controlled query and its callback
  const external: ComboboxProps = { ...base, filterMode: 'external' };
  // @ts-expect-error controlled local query requires its callback
  const local: ComboboxProps = { ...base, query: '' };
  return [external, local];
}
void typeContracts;
