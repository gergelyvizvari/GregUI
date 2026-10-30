import React, { forwardRef, useState, type ComponentPropsWithoutRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LanguageSwitcher, LinkButton, LocaleProvider } from '@gregui/react';

describe('LinkButton', () => {
  it('is a link with button styling and the requested variant', () => {
    render(
      <LinkButton href="/start" variant="secondary" size="large">
        Start
      </LinkButton>,
    );
    const link = screen.getByRole('link', { name: 'Start' });
    expect(link).toHaveAttribute('href', '/start');
    expect(link).toHaveClass('g-button');
    expect(link).toHaveAttribute('data-variant', 'secondary');
    expect(link).toHaveAttribute('data-size', 'large');
  });

  it('renders through a framework link component', () => {
    const RouterLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>(
      function RouterLink(props, ref) {
        return <a {...props} ref={ref} data-router="yes" />;
      },
    );
    render(
      <LinkButton href="/contacts" component={RouterLink}>
        Contacts
      </LinkButton>,
    );
    const link = screen.getByRole('link', { name: 'Contacts' });
    expect(link).toHaveAttribute('data-router', 'yes');
    expect(link).toHaveClass('g-button');
  });
});

const languages = [
  { value: 'hu', label: 'Magyar', lang: 'hu' },
  { value: 'en', label: 'English', lang: 'en' },
];

describe('LanguageSwitcher', () => {
  it('uses the translated default label and marks each name with its language', () => {
    render(
      <LocaleProvider locale="hu-HU">
        <LanguageSwitcher options={languages} defaultValue="hu" />
      </LocaleProvider>,
    );
    const select = screen.getByRole('combobox', { name: 'Nyelv' });
    expect(select).toHaveValue('hu');
    expect(select).toHaveAttribute('lang', 'hu');
    expect(screen.getByRole('option', { name: 'English' })).toHaveAttribute('lang', 'en');
  });

  it('works controlled and keeps a hidden label accessible', async () => {
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState('hu');
      return (
        <LanguageSwitcher
          options={languages}
          value={value}
          hideLabel
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
        />
      );
    }
    render(<Controlled />);
    const select = screen.getByRole('combobox', { name: 'Language' });
    await userEvent.selectOptions(select, 'en');
    expect(onValueChange).toHaveBeenCalledWith('en');
    expect(select).toHaveValue('en');
    expect(select).toHaveAttribute('lang', 'en');
  });
});
