import React, { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Button, Dialog, ThemeProvider, useSystemMode, useTheme } from '@gregui/react';
import { createTheme, switchMode, themeVariables } from '@gregui/tokens';

let dark = false;
const listeners = new Set<() => void>();
const matchMedia = vi.fn((query: string) => ({
  get matches() {
    return query === '(prefers-color-scheme: dark)' && dark;
  },
  media: query,
  addEventListener: (_: string, listener: () => void) => listeners.add(listener),
  removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
}));
function setSystem(next: 'light' | 'dark') {
  dark = next === 'dark';
  for (const listener of [...listeners]) listener();
}
beforeEach(() => {
  dark = false;
  listeners.clear();
  matchMedia.mockClear();
  vi.stubGlobal('matchMedia', matchMedia);
});
afterEach(() => vi.unstubAllGlobals());

function Report() {
  const theme = useTheme();
  const system = useSystemMode();
  return (
    <p data-testid="report">
      {theme.mode} {theme.colors.background} {system ?? 'unknown'}
    </p>
  );
}
function ThemeOnly() {
  const theme = useTheme();
  return <p data-testid="report">{`${theme.mode} ${theme.colors.background}`}</p>;
}
const frame = (container: HTMLElement) => container.querySelector<HTMLElement>('.g-theme')!;
const light = createTheme('flat', 'light', 'cobalt');
const darkVariant = switchMode(light, 'dark');

describe('ThemeProvider colorScheme', () => {
  it('keeps the theme mode and inline variables by default', () => {
    dark = true;
    const theme = createTheme('flat', 'dark');
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ThemeOnly />
      </ThemeProvider>,
    );
    const element = frame(container);
    expect(element).toHaveAttribute('data-mode', 'dark');
    expect(element).not.toHaveAttribute('data-color-scheme');
    expect(element).not.toHaveAttribute('data-g-scheme');
    expect(element.style.getPropertyValue('--g-background')).toBe(theme.colors.background);
    expect(container.querySelector('style')).toBeNull();
    expect(matchMedia).not.toHaveBeenCalled();
    expect(screen.getByTestId('report')).toHaveTextContent(`dark ${theme.colors.background}`);
  });

  it('follows the device preference and its live changes', () => {
    dark = true;
    const { container } = render(
      <ThemeProvider theme={light} colorScheme="system">
        <Report />
      </ThemeProvider>,
    );
    const element = frame(container);
    expect(element).toHaveAttribute('data-mode', 'dark');
    expect(element).toHaveAttribute('data-color-scheme', 'system');
    expect(screen.getByTestId('report')).toHaveTextContent(
      `dark ${darkVariant.colors.background} dark`,
    );
    // Mode-dependent variables come from the scoped stylesheet, not inline values.
    expect(element.style.getPropertyValue('--g-background')).toBe('');
    expect(element.style.getPropertyValue('--g-radius')).toBe(themeVariables(light)['--g-radius']);
    const css = container.querySelector('style')!.textContent!;
    const id = element.getAttribute('data-g-scheme')!;
    expect(css).toContain(`[data-g-scheme="${id}"]{`);
    expect(css).toContain(`--g-background:${light.colors.background} !important;`);
    expect(css).toContain(
      `@media (prefers-color-scheme: dark){[data-g-scheme="${id}"]{--g-background:${darkVariant.colors.background} !important;`,
    );

    act(() => setSystem('light'));
    expect(element).toHaveAttribute('data-mode', 'light');
    expect(screen.getByTestId('report')).toHaveTextContent(
      `light ${light.colors.background} light`,
    );
  });

  it('derives the dark variant with switchMode from a dark or light theme', () => {
    const custom = { ...createTheme('glass', 'dark'), name: 'Night owl' };
    render(
      <ThemeProvider theme={custom} colorScheme="system">
        <Report />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('report')).toHaveTextContent(
      `light ${switchMode(custom, 'light').colors.background} light`,
    );
    act(() => setSystem('dark'));
    expect(screen.getByTestId('report')).toHaveTextContent(`dark ${custom.colors.background} dark`);
  });

  it('shares the resolved mode with nested providers and portals', () => {
    dark = true;
    const { container } = render(
      <ThemeProvider theme={light} colorScheme="system">
        <ThemeProvider>
          <Report />
          <Dialog
            open
            onOpenChange={() => {}}
            trigger={<Button>Open</Button>}
            title="Settings"
            description="Theme portal"
          >
            Portal body
          </Dialog>
        </ThemeProvider>
      </ThemeProvider>,
    );
    const [outer, nested] = container.querySelectorAll<HTMLElement>('.g-theme');
    expect(container.querySelectorAll('style')).toHaveLength(1);
    expect(nested).toHaveAttribute('data-g-scheme', outer!.getAttribute('data-g-scheme')!);
    expect(nested).toHaveAttribute('data-mode', 'dark');
    const portal = screen.getByRole('dialog').closest<HTMLElement>('.g-portal')!;
    expect(portal).toHaveAttribute('data-mode', 'dark');
    expect(portal).toHaveAttribute('data-g-scheme', outer!.getAttribute('data-g-scheme')!);
    expect(portal.style.getPropertyValue('--g-background')).toBe('');
    act(() => setSystem('light'));
    expect(portal).toHaveAttribute('data-mode', 'light');
  });

  it('lets a nested provider opt out with its own theme', () => {
    dark = true;
    const fixed = createTheme('paper', 'light');
    const { container } = render(
      <ThemeProvider theme={light} colorScheme="system">
        <ThemeProvider theme={fixed}>
          <Report />
        </ThemeProvider>
      </ThemeProvider>,
    );
    const nested = container.querySelectorAll<HTMLElement>('.g-theme')[1]!;
    expect(nested).toHaveAttribute('data-mode', 'light');
    expect(nested).not.toHaveAttribute('data-g-scheme');
    expect(nested.style.getPropertyValue('--g-background')).toBe(fixed.colors.background);
  });

  it('renders both variants on the server and hydrates without a mismatch', async () => {
    const tree = (
      <ThemeProvider theme={light} colorScheme="system">
        <Report />
      </ThemeProvider>
    );
    const html = renderToString(tree);
    expect(html).toContain('data-mode="system"');
    expect(html).toContain('@media (prefers-color-scheme: dark)');
    expect(html).toContain('unknown');
    dark = true;
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);
    const recover = vi.fn();
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, tree, { onRecoverableError: recover });
    });
    expect(recover).not.toHaveBeenCalled();
    expect(frame(container)).toHaveAttribute('data-mode', 'dark');
    expect(container.querySelector('[data-testid="report"]')).toHaveTextContent(
      `dark ${darkVariant.colors.background} dark`,
    );
    await act(async () => root.unmount());
    container.remove();
  });
});
