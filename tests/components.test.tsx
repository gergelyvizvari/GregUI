import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import {
  ThemeProvider,
  LocaleProvider,
  TextField,
  Button,
  Dialog,
  DialogClose,
  ConfirmDialog,
  Tabs,
  Checkbox,
} from '@gregui/react';
import { createTheme } from '@gregui/tokens';
describe('interaction contracts', () => {
  it('links field labels, hints and errors without ID collisions', () => {
    render(
      <>
        <TextField label="Email" hint="Work address" error="Enter an email" />
        <TextField label="Other email" />
      </>,
    );
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAccessibleDescription('Work address Enter an email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.id).not.toBe(screen.getByLabelText('Other email').id);
  });
  it('prevents repeated loading actions', async () => {
    const click = vi.fn();
    render(
      <Button loading onClick={click}>
        Save
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(click).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });
  it('inherits theme and RTL through portals and returns focus on Escape', async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider locale="ar" direction="rtl" messages={{ close: 'إغلاق' }}>
        <ThemeProvider theme={createTheme('glass', 'dark')}>
          <Dialog trigger={<Button>Open</Button>} title="Example" description="Edit details">
            <TextField label="Name" />
          </Dialog>
        </ThemeProvider>
      </LocaleProvider>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Example');
    expect(dialog.closest('.g-theme')).toHaveAttribute('data-mode', 'dark');
    expect(dialog.closest('.g-theme')).toHaveAttribute('dir', 'rtl');
    expect(within(dialog).getByRole('button', { name: 'إغلاق' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
  it('starts destructive confirmations on cancel and only confirms on explicit action', async () => {
    const user = userEvent.setup();
    const confirm = vi.fn();
    render(
      <ThemeProvider>
        <ConfirmDialog
          trigger={<Button>Remove</Button>}
          title="Remove item?"
          description="This removes the item."
          confirmLabel="Delete"
          cancelLabel="Keep"
          onConfirm={confirm}
        />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.getByRole('button', { name: 'Keep' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Keep' }));
    expect(confirm).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(confirm).toHaveBeenCalledTimes(1);
  });
  it('moves between tabs with the keyboard', async () => {
    const user = userEvent.setup();
    render(
      <Tabs
        label="Views"
        items={[
          { value: 'a', label: 'First', content: 'First panel' },
          { value: 'b', label: 'Second', content: 'Second panel' },
        ]}
      />,
    );
    screen.getByRole('tab', { name: 'First' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Second' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Second panel');
  });
});

it('merges a Checkbox hint with the aria-describedby the app passes in', () => {
  render(<Checkbox label="Terms" hint="Required" aria-describedby="terms-help" id="terms" />);
  expect(screen.getByRole('checkbox')).toHaveAttribute('aria-describedby', 'terms-help terms-hint');
});
