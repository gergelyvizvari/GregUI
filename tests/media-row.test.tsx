import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { Button, Dialog, MediaRow } from '@gregui/react';

it('shows a picture-led row and a dialog opened without its own trigger', async () => {
  function Row() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <MediaRow
          media={<img src="card.png" alt="" />}
          actions={<Button onClick={() => setOpen(true)}>More</Button>}
        >
          <strong>Anna</strong>
        </MediaRow>
        <Dialog open={open} onOpenChange={setOpen} title="Report" description="What happened?">
          <p>Form</p>
        </Dialog>
      </>
    );
  }
  render(<Row />);
  expect(screen.getByText('Anna')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'More' }));
  expect(screen.getByRole('dialog', { name: 'Report' })).toBeInTheDocument();
});
