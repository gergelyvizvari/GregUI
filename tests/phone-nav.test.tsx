import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { AppShell } from '@gregui/react';

it('gives phones a bottom bar of destinations with the current one marked', () => {
  render(
    <AppShell
      brand="KindHello"
      nav={<span />}
      phoneNav={{
        label: 'Main',
        value: 'home',
        items: [
          { id: 'home', label: 'Home', icon: 'home', href: '/home' },
          { id: 'send', label: 'Send', icon: 'mail', href: '/send', primary: true },
          { id: 'contacts', label: 'Contacts', icon: 'users', href: '/contacts' },
        ],
      }}
    >
      <p>Page</p>
    </AppShell>,
  );
  const bar = screen.getByRole('navigation', { name: 'Main' });
  expect(within(bar).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  expect(within(bar).getByRole('link', { name: 'Send' })).toHaveAttribute('href', '/send');
  expect(within(bar).getAllByRole('link')).toHaveLength(3);
});
