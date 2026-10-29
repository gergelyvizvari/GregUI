'use client';
import { Field, Select, Checkbox } from './forms';
import { useLocale } from '@gregui/localization';
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export interface DocumentPreviewPage {
  id: string;
  label: string;
  content: ReactNode;
  direction?: 'ltr' | 'rtl';
  /** Standard padding is 8mm; use none for edge-to-edge artwork. */
  padding?: 'none' | 'standard';
}
export interface DocumentPreviewProps {
  label: string;
  pages: readonly DocumentPreviewPage[];
  pageId: string;
  onPageChange: (id: string) => void;
  widthMm: number;
  heightMm: number;
  safeAreaMm?: number;
  labels: { page: string; zoom: string; fit: string; guides: string };
}
const warn = (message: string) => {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return;
  console.warn(message);
};
/** Screen proofing only. The application owns composition, asset quality and print/export. */
export function DocumentPreview({
  label,
  pages,
  pageId,
  onPageChange,
  widthMm,
  heightMm,
  safeAreaMm,
  labels,
}: DocumentPreviewProps) {
  const { direction } = useLocale();
  const id = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  const [zoom, setZoom] = useState('fit');
  const [guides, setGuides] = useState(false);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const update = () => setAvailable(Math.max(0, element.clientWidth - 32));
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  if (![widthMm, heightMm].every((n) => Number.isFinite(n) && n > 0))
    throw new Error('DocumentPreview dimensions must be positive finite millimetres.');
  if (!pages.length) throw new Error('DocumentPreview needs at least one page.');
  // Runtime data (a removed page, a typed safe area) must not take the whole screen down.
  const safeAreaValid =
    safeAreaMm === undefined ||
    (Number.isFinite(safeAreaMm) &&
      safeAreaMm >= 0 &&
      safeAreaMm * 2 < Math.min(widthMm, heightMm));
  const safeArea = safeAreaValid ? safeAreaMm : undefined;
  const requested = pages.find((item) => item.id === pageId);
  const page = requested ?? pages[0]!;
  const problem = !requested
    ? `DocumentPreview pageId "${pageId}" is not a supplied page; showing the first page.`
    : !safeAreaValid
      ? 'DocumentPreview safe area must fit inside the page; guides are hidden.'
      : '';
  useEffect(() => {
    if (problem) warn(problem);
  }, [problem]);
  const width = (widthMm * 96) / 25.4;
  const height = (heightMm * 96) / 25.4;
  const scale = zoom === 'fit' ? (available ? Math.min(1, available / width) : 1) : Number(zoom);
  return (
    <section className="g-document-preview" aria-label={label}>
      <div className="g-document-toolbar">
        <Field label={labels.page}>
          {(field) => (
            <Select
              {...field}
              value={page.id}
              onChange={(event) => onPageChange(event.target.value)}
            >
              {pages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={labels.zoom}>
          {(field) => (
            <Select {...field} value={zoom} onChange={(event) => setZoom(event.target.value)}>
              <option value="fit">{labels.fit}</option>
              <option value="0.5">50%</option>
              <option value="1">100%</option>
              <option value="1.5">150%</option>
              <option value="2">200%</option>
            </Select>
          )}
        </Field>
        {safeArea !== undefined && (
          <Checkbox
            label={labels.guides}
            checked={guides}
            onChange={(event) => setGuides(event.target.checked)}
          />
        )}
      </div>
      <div
        ref={viewport}
        className="g-document-viewport"
        tabIndex={0}
        role="region"
        aria-labelledby={`${id}-page`}
      >
        <div
          className="g-document-footprint"
          style={{ width: width * scale, height: height * scale }}
        >
          <div
            className="g-document-sheet"
            dir={page.direction ?? direction}
            data-padding={page.padding ?? 'standard'}
            style={
              {
                width,
                height,
                transform: `scale(${scale})`,
                '--g-document-safe': `${safeArea ?? 0}mm`,
              } as CSSProperties
            }
          >
            <div className="g-document-content" key={page.id}>
              {page.content}
            </div>
            {guides && safeArea !== undefined && (
              <div className="g-document-guides" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
      <p className="g-document-caption" id={`${id}-page`} aria-live="polite">
        {page.label} · {widthMm} × {heightMm} mm
      </p>
    </section>
  );
}

export interface DocumentSpreadPanel {
  label: string;
  content: ReactNode;
}
export interface DocumentSpreadProps {
  label: string;
  panels: readonly [DocumentSpreadPanel, DocumentSpreadPanel];
  showFold?: boolean;
}
/** Two equal, fixed document panels. Use inside a zero-padding DocumentPreview page. */
export function DocumentSpread({ label, panels, showFold = false }: DocumentSpreadProps) {
  return (
    <div className="g-document-spread" role="group" aria-label={label}>
      {panels.map((panel, index) => (
        <section className="g-document-panel" key={index} aria-label={panel.label}>
          {panel.content}
        </section>
      ))}
      {showFold && <div className="g-document-fold" aria-hidden="true" />}
    </div>
  );
}
