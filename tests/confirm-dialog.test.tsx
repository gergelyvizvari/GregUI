import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Button, ConfirmDialog, LocaleProvider, ThemeProvider } from '@gregui/react';
import { createTheme } from '@gregui/tokens';

const base = {
  trigger: <Button>Remove item</Button>,
  title: 'Remove this item?',
  description: 'This removes the item from your list.',
  confirmLabel: 'Delete',
  cancelLabel: 'Keep',
};
function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

it('locks duplicate confirmation and dismissal until the promise succeeds, with contained focus', async () => {
  const user = userEvent.setup();
  const request = deferred(),
    onConfirm = vi.fn(() => request.promise);
  render(
    <ThemeProvider>
      <ConfirmDialog {...base} onConfirm={onConfirm} />
    </ThemeProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Remove item' });
  await user.click(trigger);
  const dialog = screen.getByRole('alertdialog');
  expect(screen.getByRole('button', { name: 'Keep' })).toHaveFocus();
  const action = screen.getByRole('button', { name: 'Delete' });
  act(() => {
    action.click();
    action.click();
  });
  expect(onConfirm).toHaveBeenCalledOnce();
  expect(action).toBeDisabled();
  expect(action).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByRole('button', { name: 'Keep' })).toBeDisabled();
  expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Loading');
  expect(dialog).toHaveFocus();
  await user.keyboard('{Escape}{Tab}{Shift>}{Tab}{/Shift}');
  expect(screen.getByRole('alertdialog')).toBe(dialog);
  expect(dialog.contains(document.activeElement)).toBe(true);
  fireEvent.pointerDown(document.querySelector('.g-backdrop')!, { button: 0 });
  expect(screen.getByRole('alertdialog')).toBe(dialog);
  await act(async () => request.resolve());
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
});

it('retains rejected requests for translated retry, inherits dark RTL context and closes after retry succeeds', async () => {
  const user = userEvent.setup();
  const request = deferred();
  const onConfirm = vi
    .fn<() => void | Promise<void>>()
    .mockImplementationOnce(() => request.promise)
    .mockImplementationOnce(() => {});
  render(
    <LocaleProvider
      locale="hu-HU"
      direction="rtl"
      messages={{
        loading: 'Folyamatban',
        retry: 'Újra',
        confirmError: 'Nem sikerült. Próbáld újra.',
      }}
    >
      <ThemeProvider theme={createTheme('glass', 'dark')}>
        <ConfirmDialog {...base} onConfirm={onConfirm} />
      </ThemeProvider>
    </LocaleProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Remove item' }));
  const dialog = screen.getByRole('alertdialog');
  expect(dialog.closest('.g-theme')).toHaveAttribute('dir', 'rtl');
  expect(dialog.closest('.g-theme')).toHaveAttribute('data-mode', 'dark');
  await user.click(screen.getByRole('button', { name: 'Delete' }));
  expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Folyamatban');
  await act(async () => request.reject(new Error('PRIVATE SERVICE DETAILS')));
  expect(screen.getByRole('alert')).toHaveTextContent('Nem sikerült. Próbáld újra.');
  expect(screen.queryByText('PRIVATE SERVICE DETAILS')).not.toBeInTheDocument();
  const retry = screen.getByRole('button', { name: 'Újra: Delete' });
  expect(retry).toHaveFocus();
  expect(screen.getByRole('button', { name: 'Keep' })).toBeEnabled();
  await user.keyboard('{Enter}');
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  expect(onConfirm).toHaveBeenCalledTimes(2);
  expect(screen.getByRole('button', { name: 'Remove item' })).toHaveFocus();
});

it('catches synchronous errors, supports a safe custom message and clears failure on cancel and reopen', async () => {
  const user = userEvent.setup();
  const onConfirm = vi
    .fn()
    .mockImplementationOnce(() => {
      throw new Error('Internal');
    })
    .mockImplementationOnce(() => {});
  render(
    <ConfirmDialog {...base} errorMessage="Could not remove the item." onConfirm={onConfirm} />,
  );
  const trigger = screen.getByRole('button', { name: 'Remove item' });
  await user.click(trigger);
  await user.click(screen.getByRole('button', { name: 'Delete' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Could not remove the item.');
  await user.click(screen.getByRole('button', { name: 'Keep' }));
  expect(trigger).toHaveFocus();
  await user.click(trigger);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Keep' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Delete' }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  expect(onConfirm).toHaveBeenCalledTimes(2);
  expect(trigger).toHaveFocus();
});

it('never confirms on idle cancellation, outside interaction or Escape', async () => {
  const user = userEvent.setup(),
    onConfirm = vi.fn();
  render(<ConfirmDialog {...base} onConfirm={onConfirm} />);
  const trigger = screen.getByRole('button', { name: 'Remove item' });
  await user.click(trigger);
  fireEvent.pointerDown(document.querySelector('.g-backdrop')!, { button: 0 });
  expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  await user.click(trigger);
  await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Keep' }));
  expect(onConfirm).not.toHaveBeenCalled();
});

it('handles a rejected in-flight request after the consumer unmounts', async () => {
  const user = userEvent.setup(),
    request = deferred();
  const onConfirm = vi.fn(() => request.promise);
  const { unmount } = render(<ConfirmDialog {...base} onConfirm={onConfirm} />);
  await user.click(screen.getByRole('button', { name: 'Remove item' }));
  await user.click(screen.getByRole('button', { name: 'Delete' }));
  unmount();
  await act(async () => request.reject(new Error('Unmounted service failure')));
  expect(onConfirm).toHaveBeenCalledOnce();
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
});

it('preserves callbacks that return values and waits for service promises returning data', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<ConfirmDialog {...base} onConfirm={() => false} />);
  const trigger = screen.getByRole('button', { name: 'Remove item' });
  await user.click(trigger);
  await user.click(screen.getByRole('button', { name: 'Delete' }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  const request = deferred();
  rerender(
    <ConfirmDialog {...base} onConfirm={() => request.promise.then(() => ({ id: 'removed' }))} />,
  );
  await user.click(trigger);
  await user.click(screen.getByRole('button', { name: 'Delete' }));
  expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  await act(async () => request.resolve());
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
});
