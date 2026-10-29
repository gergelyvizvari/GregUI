import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { AccentLink, ChipLink } from '../packages/react/src/index';
it('falls back to theme colours for unreadable or injected palettes and keeps link semantics', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const { rerender } = render(
    <AccentLink href="/discover" palette={{ background: '#ffffff', text: '#ffffff' }}>
      Go
    </AccentLink>,
  );
  expect(screen.getByRole('link', { name: 'Go' })).not.toHaveAttribute('style');
  rerender(
    <AccentLink href="/discover" palette={{ background: 'red;position:fixed', text: '#ffffff' }}>
      Go
    </AccentLink>,
  );
  expect(screen.getByRole('link', { name: 'Go' })).not.toHaveAttribute('style');
  expect(warn).toHaveBeenCalled();
  warn.mockRestore();
  rerender(
    <AccentLink href="/discover" palette={{ background: '#ff654f', text: '#0f3029' }}>
      Explore
    </AccentLink>,
  );
  const link = screen.getByRole('link', { name: 'Explore' });
  expect(link).toHaveAttribute('href', '/discover');
  expect(link.getAttribute('style')).toContain('--g-action-fill: #ff654f');
});
it('exposes the selected collection to assistive technology', () => {
  render(
    <ChipLink active href="/free">
      Free discoveries
    </ChipLink>,
  );
  expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page');
});
