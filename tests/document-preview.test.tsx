import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import {
  DocumentPreview,
  DocumentSpread,
  LocaleProvider,
  documentImageDpi,
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
it('rejects impossible dimensions but recovers from a stale page or an oversized safe area', () => {
  expect(() => renderToString(<DocumentPreview {...props} widthMm={0} />)).toThrow(/dimensions/);
  expect(() => renderToString(<DocumentPreview {...props} pages={[]} />)).toThrow(/page/);
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.stubGlobal('ResizeObserver', undefined);
  const { rerender } = render(<DocumentPreview {...props} pageId="back" />);
  rerender(<DocumentPreview {...props} pageId="back" pages={[props.pages[0]!]} />);
  expect(screen.getByText('Artwork')).toBeInTheDocument();
  expect(screen.getByLabelText('Side')).toHaveValue('front');
  expect(warn).toHaveBeenCalledWith(expect.stringMatching(/pageId "back"/));
  rerender(<DocumentPreview {...props} safeAreaMm={60} />);
  expect(screen.queryByLabelText('Safe area')).not.toBeInTheDocument();
  expect(warn).toHaveBeenCalledWith(expect.stringMatching(/safe area/));
  warn.mockRestore();
});

it('grows the sheet by the bleed and draws trim, crop marks and the safe area inside the trim', async () => {
  const { container } = render(
    <DocumentPreview
      {...props}
      bleedMm={3}
      pages={[
        { id: 'front', label: 'Front', padding: 'bleed', content: 'Artwork' },
        { id: 'back', label: 'Back', padding: 'none', content: 'Message' },
      ]}
    />,
  );
  const sheet = container.querySelector<HTMLElement>('.g-document-sheet')!;
  // 154 × 111 mm at CSS's 96 px per inch.
  expect(parseFloat(sheet.style.width)).toBeCloseTo((154 * 96) / 25.4);
  expect(parseFloat(sheet.style.height)).toBeCloseTo((111 * 96) / 25.4);
  expect(sheet.style.getPropertyValue('--g-document-bleed')).toBe('3mm');
  expect(sheet).toHaveAttribute('data-padding', 'bleed');
  expect(container.querySelector('.g-document-trim')).toBeNull();
  await userEvent.setup().click(screen.getByLabelText('Safe area'));
  const trim = container.querySelector('.g-document-trim')!;
  expect(trim).toHaveAttribute('aria-hidden', 'true');
  expect(
    [...trim.querySelectorAll('.g-document-crop')].map((mark) => mark.getAttribute('data-corner')),
  ).toEqual(['top-left', 'top-right', 'bottom-left', 'bottom-right']);
  expect(container.querySelector('.g-document-guides')).toBeInTheDocument();
  // The caption keeps naming the trimmed size.
  expect(screen.getByRole('region', { name: 'Front · 148 × 105 mm' })).toBeInTheDocument();
});

it('offers guides for bleed alone and ignores an invalid bleed', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const { container, rerender } = render(
    <DocumentPreview {...props} safeAreaMm={undefined} bleedMm={3} />,
  );
  expect(screen.getByLabelText('Safe area')).toBeInTheDocument();
  rerender(<DocumentPreview {...props} safeAreaMm={undefined} bleedMm={-2} />);
  expect(screen.queryByLabelText('Safe area')).not.toBeInTheDocument();
  expect(
    container
      .querySelector<HTMLElement>('.g-document-sheet')!
      .style.getPropertyValue('--g-document-bleed'),
  ).toBe('0mm');
  expect(warn).toHaveBeenCalledWith(expect.stringMatching(/bleed/));
  warn.mockRestore();
});

it('computes effective density from the axis that limits a cover-fit image', () => {
  expect(documentImageDpi({ widthPx: 1800, heightPx: 1800 }, 152.4, 101.6)).toBe(300);
  expect(documentImageDpi({ widthPx: 1200, heightPx: 801 }, 154, 111)).toBe(183);
});

it('warns about low-resolution images on the shown page using translated copy', async () => {
  const resolution = {
    title: 'Image may print blurry',
    describe: ({ label, dpi, minimumDpi }: { label: string; dpi: number; minimumDpi: number }) =>
      `${label}: ${dpi} dpi, needs ${minimumDpi}`,
  };
  const pages = [
    {
      id: 'front',
      label: 'Front',
      padding: 'bleed' as const,
      content: 'Artwork',
      images: [
        { label: 'Lake photo', widthPx: 1200, heightPx: 801 },
        { label: 'Sharp logo', widthPx: 1200, heightPx: 1200, widthMm: 40, heightMm: 40 },
        { label: 'Loading', widthPx: 0, heightPx: 0 },
      ],
    },
    { id: 'back', label: 'Back', content: 'Message' },
  ];
  function Fixture({ minimumDpi }: { minimumDpi?: number }) {
    const [pageId, onPageChange] = useState('front');
    return (
      <DocumentPreview
        {...props}
        bleedMm={3}
        pages={pages}
        pageId={pageId}
        onPageChange={onPageChange}
        imageResolution={{ ...resolution, minimumDpi }}
      />
    );
  }
  const { rerender } = render(<Fixture />);
  expect(screen.getByText('Image may print blurry')).toBeInTheDocument();
  expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
    'Lake photo: 183 dpi, needs 300',
  ]);
  rerender(<Fixture minimumDpi={150} />);
  expect(screen.queryByText('Image may print blurry')).not.toBeInTheDocument();
  rerender(<Fixture />);
  await userEvent.setup().selectOptions(screen.getByLabelText('Side'), 'back');
  expect(screen.queryByText('Image may print blurry')).not.toBeInTheDocument();
});

it('does not check images unless resolution copy is supplied', () => {
  render(
    <DocumentPreview
      {...props}
      pages={[
        {
          id: 'front',
          label: 'Front',
          content: 'A',
          images: [{ label: 'Tiny', widthPx: 10, heightPx: 10 }],
        },
      ]}
    />,
  );
  expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
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
