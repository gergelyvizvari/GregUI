import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { createTheme } from '@gregui/tokens';
import { AppShell, Button, Heading, PageHeader, ThemeProvider } from '@gregui/react';

const frame = (element: HTMLElement) => element.closest<HTMLElement>('.g-theme')!;

it('lets the app set its own display face, inherited by nested providers', () => {
  render(
    <ThemeProvider
      theme={createTheme()}
      displayFont={{ family: 'var(--app-display)', weight: 800 }}
    >
      <Heading level={1}>Outer</Heading>
      <ThemeProvider theme={createTheme('flat', 'dark')}>
        <Heading level={2}>Inner</Heading>
      </ThemeProvider>
    </ThemeProvider>,
  );
  for (const name of ['Outer', 'Inner']) {
    const style = frame(screen.getByRole('heading', { name })).style;
    expect(style.getPropertyValue('--g-display-font')).toBe('var(--app-display)');
    expect(style.getPropertyValue('--g-display-weight')).toBe('800');
  }
});

it('keeps the preset display face without an app font', () => {
  render(
    <ThemeProvider theme={createTheme()}>
      <Heading level={1}>Plain</Heading>
    </ThemeProvider>,
  );
  expect(
    frame(screen.getByRole('heading', { name: 'Plain' })).style.getPropertyValue(
      '--g-display-font',
    ),
  ).not.toBe('var(--app-display)');
});

it('marks a brand page header so it sits on the primary colour block', () => {
  render(
    <ThemeProvider theme={createTheme()}>
      <PageHeader title="Hello" tone="brand" actions={<Button>Send</Button>} />
      <PageHeader title="Plain" />
    </ThemeProvider>,
  );
  expect(screen.getByRole('heading', { name: 'Hello' }).closest('header')).toHaveAttribute(
    'data-tone',
    'brand',
  );
  expect(screen.getByRole('heading', { name: 'Plain' }).closest('header')).not.toHaveAttribute(
    'data-tone',
  );
});

it('marks a brand masthead on the editorial shell', () => {
  const { container } = render(
    <ThemeProvider theme={createTheme()}>
      <AppShell brand="App" nav={null} appearance="editorial" tone="brand">
        <p>Content</p>
      </AppShell>
    </ThemeProvider>,
  );
  const shell = container.querySelector('.g-app-shell')!;
  expect(shell).toHaveAttribute('data-appearance', 'editorial');
  expect(shell).toHaveAttribute('data-tone', 'brand');
});

it('shows overflow toolbar items in the toolbar, not duplicated while the drawer is closed', () => {
  render(
    <ThemeProvider theme={createTheme()}>
      <AppShell
        brand="App"
        nav={null}
        appearance="editorial"
        toolbar={<Button>Bell</Button>}
        toolbarOverflow={<Button>Sign out</Button>}
      >
        <p>Content</p>
      </AppShell>
    </ThemeProvider>,
  );
  expect(screen.getAllByRole('button', { name: 'Sign out' })).toHaveLength(1);
  expect(
    screen.getByRole('button', { name: 'Sign out' }).closest('.g-toolbar-overflow'),
  ).not.toBeNull();
});
