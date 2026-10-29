import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Badge, Postmark, ThemeProvider } from '@gregui/react';
import { createTheme } from '@gregui/tokens';
it('keeps stamp and label badge text readable and defaults to the standard variant', () => {
  render(
    <>
      <Badge>Draft</Badge>
      <Badge variant="stamp" tone="primary">
        First class
      </Badge>
      <Badge variant="label">Fragile</Badge>
    </>,
  );
  expect(screen.getByText('Draft')).toHaveAttribute('data-variant', 'standard');
  expect(screen.getByText('First class')).toHaveAttribute('data-variant', 'stamp');
  expect(screen.getByText('First class')).toHaveAttribute('data-tone', 'primary');
  expect(screen.getByText('Fragile')).toHaveAttribute('data-variant', 'label');
});
it('renders postmark text while hiding the cancellation waves', () => {
  const { container, rerender } = render(<Postmark place="Szeged" date="29 Oct" detail="2026" />);
  expect(screen.getByText('Szeged')).toBeInTheDocument();
  expect(screen.getByText('29 Oct')).toBeInTheDocument();
  expect(screen.getByText('2026')).toBeInTheDocument();
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  expect(container.querySelector('.g-postmark')).toHaveAttribute('data-tilt', 'true');
  rerender(<Postmark place="Szeged" date="29 Oct" cancellation={false} tilt={false} />);
  expect(container.querySelector('svg')).toBeNull();
  expect(container.querySelector('.g-postmark')).toHaveAttribute('data-tilt', 'false');
});
it('exposes the accent setting on the theme frame', () => {
  const { container, rerender } = render(
    <ThemeProvider theme={createTheme('flat')}>x</ThemeProvider>,
  );
  expect(container.querySelector('.g-theme')).toHaveAttribute('data-accent', 'expressive');
  rerender(
    <ThemeProvider theme={{ ...createTheme('flat'), accent: 'restrained' }}>x</ThemeProvider>,
  );
  expect(container.querySelector('.g-theme')).toHaveAttribute('data-accent', 'restrained');
});
