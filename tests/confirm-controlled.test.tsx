import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, ConfirmDialog } from '@gregui/react';

function Harness({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Drop</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Move it?"
        description="It goes on."
        confirmLabel="Move"
        cancelLabel="Keep"
        onConfirm={onConfirm}
      />
    </>
  );
}

describe('ConfirmDialog without a trigger', () => {
  it('opens from the app, confirms and tells the app when it closes', async () => {
    const onConfirm = vi.fn(async () => {});
    render(<Harness onConfirm={onConfirm} />);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Drop' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Move it?' });
    await userEvent.click(screen.getByRole('button', { name: 'Move' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    // Cancelling also closes through the app's state.
    await userEvent.click(screen.getByRole('button', { name: 'Drop' }));
    await screen.findByRole('alertdialog');
    await userEvent.click(screen.getByRole('button', { name: 'Keep' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
