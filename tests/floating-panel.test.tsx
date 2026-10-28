import React, { useState } from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import {
  Button,
  Dialog,
  FloatingPanel,
  LocaleProvider,
  TextField,
  ThemeProvider,
} from '@gregui/react';
import { createTheme } from '@gregui/tokens';

afterEach(() => vi.unstubAllGlobals());
function viewport(compact: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    matches: compact,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  };
  vi.stubGlobal('matchMedia', () => media);
  return (next: boolean) =>
    act(() => {
      media.matches = next;
      listeners.forEach((change) => change());
    });
}
const base = {
  trigger: <Button>Open inspector</Button>,
  title: 'Inspector',
  description: 'Adjust the selected item.',
};

it('keeps desktop content interactive outside the panel and inherits theme/RTL through its portals', async () => {
  viewport(false);
  const user = userEvent.setup(),
    outside = vi.fn();
  render(
    <LocaleProvider locale="ar" direction="rtl" messages={{ close: 'إغلاق' }}>
      <ThemeProvider theme={createTheme('glass', 'dark')}>
        <Button onClick={outside}>Outside action</Button>
        <FloatingPanel {...base}>
          <TextField label="Setting" />
        </FloatingPanel>
      </ThemeProvider>
    </LocaleProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Open inspector' });
  await user.click(trigger);
  const panel = screen.getByRole('dialog', { name: 'Inspector' });
  expect(panel).not.toHaveAttribute('aria-modal', 'true');
  expect(panel.closest('.g-theme')).toHaveAttribute('dir', 'rtl');
  expect(panel.closest('.g-theme')).toHaveAttribute('data-mode', 'dark');
  expect(within(panel).getByRole('button', { name: 'إغلاق' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Outside action' }));
  expect(outside).toHaveBeenCalledOnce();
  expect(panel).toBeInTheDocument();
  await user.type(screen.getByLabelText('Setting'), 'Draft');
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
});

it('uses a modal focus trap on narrow viewports, closes on Escape and returns launcher focus', async () => {
  viewport(true);
  const user = userEvent.setup();
  render(
    <ThemeProvider>
      <Button>Background action</Button>
      <FloatingPanel {...base}>
        <TextField label="Setting" />
      </FloatingPanel>
    </ThemeProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Open inspector' });
  await user.click(trigger);
  const panel = screen.getByRole('dialog', { name: 'Inspector' });
  expect(panel).toHaveAttribute('aria-modal', 'true');
  expect(screen.queryByRole('button', { name: 'Background action' })).not.toBeInTheDocument();
  for (let step = 0; step < 4; step++) {
    await user.tab();
    expect(panel.contains(document.activeElement)).toBe(true);
  }
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
});

it('delegates controlled state and retains consumer-owned drafts when responsive presentation changes', async () => {
  const resize = viewport(false),
    change = vi.fn();
  const user = userEvent.setup();
  function Host({ open }: { open: boolean }) {
    const [value, setValue] = useState('');
    return (
      <FloatingPanel {...base} open={open} onOpenChange={change}>
        <TextField
          label="Setting"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </FloatingPanel>
    );
  }
  const { rerender } = render(<Host open={false} />);
  await user.click(screen.getByRole('button', { name: 'Open inspector' }));
  expect(change).toHaveBeenCalledWith(true);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  rerender(<Host open />);
  await user.type(screen.getByLabelText('Setting'), 'Persistent draft');
  resize(true);
  expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  expect(screen.getByLabelText('Setting')).toHaveValue('Persistent draft');
  resize(false);
  expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal', 'true');
  expect(screen.getByLabelText('Setting')).toHaveValue('Persistent draft');
  await user.click(screen.getByRole('button', { name: 'Close' }));
  expect(change).toHaveBeenLastCalledWith(false);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  rerender(<Host open={false} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('closes a nested modal first and restores panel focus before collapsing the inspector', async () => {
  viewport(false);
  const user = userEvent.setup();
  render(
    <ThemeProvider>
      <FloatingPanel {...base} closeLabel="Collapse inspector">
        <Dialog
          trigger={<Button>Import</Button>}
          title="Import data"
          description="Paste your data."
        >
          <TextField label="Data" />
        </Dialog>
      </FloatingPanel>
    </ThemeProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Open inspector' }));
  await user.click(screen.getByRole('button', { name: 'Import' }));
  expect(screen.getByRole('dialog', { name: 'Import data' })).toBeInTheDocument();
  await user.keyboard('{Escape}');
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Import data' })).not.toBeInTheDocument(),
  );
  expect(screen.getByRole('dialog', { name: 'Inspector' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Import' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Collapse inspector' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open inspector' })).toHaveFocus();
});
