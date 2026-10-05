import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { AccentLink, ChipLink } from '../packages/react/src/index';
it('rejects unreadable or injected action palettes and preserves native link semantics', () => {
  expect(() =>
    AccentLink({
      href: '/discover',
      palette: { background: '#ffffff', text: '#ffffff' },
      children: 'Go',
    }),
  ).toThrow();
  expect(() =>
    AccentLink({
      href: '/discover',
      palette: { background: 'red;position:fixed', text: '#ffffff' },
      children: 'Go',
    }),
  ).toThrow();
  render(
    <AccentLink href="/discover" palette={{ background: '#ff654f', text: '#0f3029' }}>
      Explore
    </AccentLink>,
  );
  expect(screen.getByRole('link', { name: 'Explore' })).toHaveAttribute('href', '/discover');
});
it('exposes the selected collection to assistive technology', () => {
  render(
    <ChipLink active href="/free">
      Free discoveries
    </ChipLink>,
  );
  expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page');
});
