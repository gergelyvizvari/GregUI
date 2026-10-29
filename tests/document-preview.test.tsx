import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import {
  DocumentPreview,
  DocumentSpread,
  LocaleProvider,
  type DocumentPreviewProps,
} from '@gregui/react';
const disconnect = vi.fn();
const props: DocumentPreviewProps = {
  label: 'Proof',
  widthMm: 148,
  heightMm: 105,
  safeAreaMm: 5,
  pageId: 'front',
  onPageChange: () => {},
  pages: [
    { id: 'front', label: 'Front', content: 'Artwork' },
    { id: 'back', label: 'Back', content: 'Message' },
  ],
  labels: { page: 'Side', zoom: 'Zoom', fit: 'Fit', guides: 'Safe area' },
};
afterEach(() => vi.unstubAllGlobals());
it('switches a controlled side, retains zoom and guides, and disconnects sizing observation', async () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect = disconnect;
    },
  );
  function Fixture() {
    const [pageId, onPageChange] = useState('front');
    return <DocumentPreview {...props} pageId={pageId} onPageChange={onPageChange} />;
  }
  const { container, unmount } = render(<Fixture />);
  const user = userEvent.setup();
  await user.selectOptions(screen.getByLabelText('Zoom'), '2');
  await user.click(screen.getByLabelText('Safe area'));
  await user.selectOptions(screen.getByLabelText('Side'), 'back');
  expect(screen.queryByText('Artwork')).not.toBeInTheDocument();
  expect(screen.getByText('Message')).toBeInTheDocument();
  expect(screen.getByLabelText('Zoom')).toHaveValue('2');
  expect(screen.getByLabelText('Safe area')).toBeChecked();
  expect(container.querySelector('.g-document-sheet')).toHaveStyle({ transform: 'scale(2)' });
  expect(screen.getByRole('region', { name: 'Back · 148 × 105 mm' })).toHaveAttribute(
    'tabindex',
    '0',
  );
  unmount();
  expect(disconnect).toHaveBeenCalled();
});
it('server renders translated controls, page direction and no guides when not configured', () => {
  const html = renderToString(
    <LocaleProvider direction="rtl">
      <DocumentPreview
        {...props}
        safeAreaMm={undefined}
        labels={{ page: 'Oldal', zoom: 'Nagyítás', fit: 'Illesztés', guides: 'Segédvonalak' }}
      />
    </LocaleProvider>,
  );
  expect(html).toContain('dir="rtl"');
  expect(html).toContain('Nagyítás');
  expect(html).not.toContain('type="checkbox"');
});
it('rejects impossible physical dimensions and missing controlled pages', () => {
  expect(() => renderToString(<DocumentPreview {...props} widthMm={0} />)).toThrow(/dimensions/);
  expect(() => renderToString(<DocumentPreview {...props} safeAreaMm={60} />)).toThrow(/safe area/);
  expect(() => renderToString(<DocumentPreview {...props} pageId="missing" />)).toThrow(/pageId/);
});

it('renders two named document panels in reading order with optional decorative fold guidance', () => {
  const panels = [
    { label: 'First panel', content: 'Left message' },
    { label: 'Second panel', content: 'Right message' },
  ] as const;
  const { container, rerender } = render(
    <DocumentSpread label="Open document" panels={panels} showFold />,
  );
  expect(screen.getByRole('group', { name: 'Open document' })).toBeInTheDocument();
  const regions = screen.getAllByRole('region');
  expect(regions.map((region) => region.textContent)).toEqual(['Left message', 'Right message']);
  expect(container.querySelector('.g-document-fold')).toHaveAttribute('aria-hidden', 'true');
  rerender(<DocumentSpread label="Open document" panels={panels} />);
  expect(container.querySelector('.g-document-fold')).toBeNull();
});
