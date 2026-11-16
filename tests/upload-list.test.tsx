import React, { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload, LocaleProvider, UploadList, type UploadItem } from '@gregui/react';

const files: UploadItem[] = [
  { id: 'a', name: 'photo.jpg', size: 2_400_000, status: 'uploading', progress: 40 },
  { id: 'b', name: 'photo.jpg', size: 800, status: 'complete' },
  { id: 'c', name: 'notes.pdf', size: 120_000, status: 'error', error: 'The server said no.' },
  { id: 'd', name: 'card.png', status: 'queued' },
  { id: 'e', name: 'old.png', status: 'cancelled' },
];

function Harness({ initial = files }: { initial?: UploadItem[] }) {
  const [items, setItems] = useState(initial);
  return (
    <>
      <button type="button">Before</button>
      <UploadList
        label="Attachments"
        items={items}
        onRemove={(id) => setItems((list) => list.filter((item) => item.id !== id))}
        onCancel={(id) =>
          setItems((list) =>
            list.map((item) => (item.id === id ? { ...item, status: 'cancelled' } : item)),
          )
        }
        onRetry={vi.fn()}
      />
    </>
  );
}

describe('UploadList', () => {
  it('shows each file with size, status, progress and the actions that apply', () => {
    render(<Harness />);
    const list = screen.getByRole('group', { name: 'Attachments' });
    expect(within(list).getByText('1 of 5 uploaded')).toBeInTheDocument();
    const rows = within(list).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('2.4 MB');
    expect(rows[0]).toHaveTextContent('Uploading, 40%');
    expect(within(rows[0]!).getByRole('progressbar', { name: 'photo.jpg (1)' })).toHaveAttribute(
      'value',
      '40',
    );
    // Duplicate names get a number so every button is distinct.
    expect(
      screen.getByRole('button', { name: 'Cancel upload: photo.jpg (1)' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove file: photo.jpg (1)' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Remove file: photo.jpg (2)' })).toBeInTheDocument();
    expect(rows[1]).toHaveTextContent('800 byte');
    expect(rows[2]).toHaveTextContent('Upload failed');
    expect(rows[2]).toHaveTextContent('The server said no.');
    expect(screen.getByRole('button', { name: 'Retry upload: notes.pdf' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel upload: card.png' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove file: card.png' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry upload: old.png' })).toBeInTheDocument();
  });

  it('shows an indeterminate bar when progress is unknown', () => {
    render(<UploadList label="Files" items={[{ id: 'x', name: 'a.txt', status: 'uploading' }]} />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('value');
    expect(screen.getByText('Uploading')).toBeInTheDocument();
  });

  it('moves focus to the file now in place after removal, then the previous, then the list', async () => {
    render(
      <Harness
        initial={[
          { id: 'a', name: 'one.txt', status: 'complete' },
          { id: 'b', name: 'two.txt', status: 'complete' },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remove file: one.txt' }));
    expect(screen.getByRole('button', { name: 'Remove file: two.txt' })).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'Remove file: two.txt' }));
    expect(screen.getByRole('group', { name: 'Attachments' })).toHaveFocus();
  });

  it('keeps focus on the row after cancelling and offers retry there', async () => {
    render(<Harness initial={[{ id: 'a', name: 'one.txt', status: 'uploading', progress: 5 }]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel upload: one.txt' }));
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry upload: one.txt' })).toBeInTheDocument();
  });

  it('announces finished and failed files once', () => {
    const { rerender } = render(
      <UploadList
        label="Files"
        items={[
          { id: 'a', name: 'a.txt', status: 'uploading', progress: 90 },
          { id: 'b', name: 'b.txt', status: 'uploading', progress: 10 },
        ]}
      />,
    );
    const live = screen.getByRole('status');
    expect(live).toBeEmptyDOMElement();
    rerender(
      <UploadList
        label="Files"
        items={[
          { id: 'a', name: 'a.txt', status: 'complete' },
          { id: 'b', name: 'b.txt', status: 'error' },
        ]}
      />,
    );
    expect(live).toHaveTextContent('a.txt uploaded. b.txt could not be uploaded.');
  });

  it('is translated and formats numbers for the locale', () => {
    render(
      <LocaleProvider locale="hu-HU">
        <UploadList
          label="Fotók"
          items={[
            { id: 'a', name: 'kép.jpg', size: 1_500_000, status: 'uploading', progress: 50 },
            { id: 'b', name: 'b.jpg', status: 'complete' },
          ]}
          onCancel={vi.fn()}
        />
      </LocaleProvider>,
    );
    expect(screen.getByText('2 fájlból 1 feltöltve')).toBeInTheDocument();
    expect(screen.getByText(/Feltöltés folyamatban: 50\s?%/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Feltöltés megszakítása: kép.jpg' })).toBeVisible();
  });

  it('lets FileUpload hide its own selection when a list shows the files', async () => {
    render(<FileUpload label="Files" onFiles={vi.fn()} showSelection={false} />);
    await userEvent.upload(
      screen.getByLabelText(/Files/),
      new File(['x'], 'one.txt', { type: 'text/plain' }),
    );
    expect(screen.queryByText('one.txt')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Clear selected files' })).toBeNull();
  });
});
