import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it } from 'vitest';
import { useState } from 'react';
import { ImageRegion, type ImageRegionValue } from '../packages/react/src/image-region';
it('creates, moves, resizes and clears a region using the keyboard', () => {
  function Demo() {
    const [value, setValue] = useState<ImageRegionValue | null>(null);
    return (
      <>
        <ImageRegion
          src="test.png"
          alt="Reference"
          label="Mark region"
          help="Keyboard help"
          value={value}
          onChange={setValue}
        />
        <output>{JSON.stringify(value)}</output>
      </>
    );
  }
  render(<Demo />);
  const editor = screen.getByRole('group', { name: 'Mark region' });
  fireEvent.keyDown(editor, { key: 'Enter' });
  expect(screen.getByRole('status')).toHaveTextContent('"x":25');
  fireEvent.keyDown(editor, { key: 'ArrowRight' });
  expect(screen.getByRole('status')).toHaveTextContent('"x":26');
  fireEvent.keyDown(editor, { key: 'ArrowDown', shiftKey: true });
  expect(screen.getByRole('status')).toHaveTextContent('"height":51');
  fireEvent.keyDown(editor, { key: 'Delete' });
  expect(screen.getByRole('status')).toHaveTextContent('null');
});

it('keeps annotation geometry when compact is requested on an editable image', () => {
  const { rerender } = render(<ImageRegion src="test.png" alt="Preview" compact />);
  expect(screen.getByRole('img', { name: 'Preview' }).closest('figure')).toHaveAttribute(
    'data-compact',
    'true',
  );
  rerender(<ImageRegion src="test.png" alt="Preview" compact onChange={() => {}} />);
  expect(screen.getByRole('img', { name: 'Preview' }).closest('figure')).toHaveAttribute(
    'data-compact',
    'false',
  );
  rerender(
    <ImageRegion
      src="test.png"
      alt="Preview"
      compact
      value={{ x: 0, y: 0, width: 50, height: 50 }}
    />,
  );
  expect(screen.getByRole('img', { name: 'Preview' }).closest('figure')).toHaveAttribute(
    'data-compact',
    'false',
  );
});
