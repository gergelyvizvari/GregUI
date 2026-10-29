'use client';
import { Alert } from './feedback';
import { Field, Select, Checkbox } from './forms';
import { useLocale } from '@gregui/localization';
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export interface DocumentPreviewPage {
  id: string;
  label: string;
  content: ReactNode;
  direction?: 'ltr' | 'rtl';
  /**
   * Standard padding is 8mm inside the trim; none fills the trimmed page; bleed fills the
   * page and its bleed so edge-to-edge artwork survives trimming.
   */
  padding?: 'none' | 'standard' | 'bleed';
  /** Raster images placed on this page, checked against `imageResolution`. */
  images?: readonly DocumentPreviewImage[];
}
export interface DocumentPreviewImage {
  label: string;
  /** Pixel size of the source image, for example its naturalWidth and naturalHeight. */
  widthPx: number;
  heightPx: number;
  /** Printed size. Defaults to the full page including bleed. */
  widthMm?: number;
  heightMm?: number;
}
export interface DocumentImageResolutionIssue {
  label: string;
  /** Effective print density, rounded down. */
  dpi: number;
  minimumDpi: number;
}
export interface DocumentImageResolution {
  /** Images below this effective density are reported. Defaults to 300. */
  minimumDpi?: number;
  title: string;
  describe: (issue: DocumentImageResolutionIssue) => string;
}
export interface DocumentPreviewProps {
  label: string;
  pages: readonly DocumentPreviewPage[];
  pageId: string;
  onPageChange: (id: string) => void;
  widthMm: number;
  heightMm: number;
  safeAreaMm?: number;
  /** Extra artwork beyond each trimmed edge; adds trim and crop marks to the guides. */
  bleedMm?: number;
  imageResolution?: DocumentImageResolution;
  labels: { page: string; zoom: string; fit: string; guides: string };
}
/**
 * Effective print density of an image covering a printed area. Cover-fit scaling uses the
 * lower of the two axes, so a cropped image is never reported sharper than it prints.
 */
export function documentImageDpi(
  image: Pick<DocumentPreviewImage, 'widthPx' | 'heightPx'>,
  widthMm: number,
  heightMm: number,
) {
  return Math.floor(Math.min((image.widthPx * 25.4) / widthMm, (image.heightPx * 25.4) / heightMm));
}
const positive = (n: number) => Number.isFinite(n) && n > 0;
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
  bleedMm,
  imageResolution,
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
  if (![widthMm, heightMm].every(positive))
    throw new Error('DocumentPreview dimensions must be positive finite millimetres.');
  if (!pages.length) throw new Error('DocumentPreview needs at least one page.');
  // Runtime data (a removed page, a typed safe area) must not take the whole screen down.
  const safeAreaValid =
    safeAreaMm === undefined ||
    (Number.isFinite(safeAreaMm) &&
      safeAreaMm >= 0 &&
      safeAreaMm * 2 < Math.min(widthMm, heightMm));
  const safeArea = safeAreaValid ? safeAreaMm : undefined;
  const bleedValid = bleedMm === undefined || (Number.isFinite(bleedMm) && bleedMm >= 0);
  const bleed = bleedValid ? (bleedMm ?? 0) : 0;
  const hasGuides = safeArea !== undefined || bleed > 0;
  const requested = pages.find((item) => item.id === pageId);
  const page = requested ?? pages[0]!;
  const problem = !requested
    ? `DocumentPreview pageId "${pageId}" is not a supplied page; showing the first page.`
    : !safeAreaValid
      ? 'DocumentPreview safe area must fit inside the page; guides are hidden.'
      : !bleedValid
        ? 'DocumentPreview bleed must be a nonnegative number of millimetres; bleed is ignored.'
        : '';
  useEffect(() => {
    if (problem) warn(problem);
  }, [problem]);
  const sheetWidthMm = widthMm + bleed * 2;
  const sheetHeightMm = heightMm + bleed * 2;
  const width = (sheetWidthMm * 96) / 25.4;
  const height = (sheetHeightMm * 96) / 25.4;
  const minimumDpi = imageResolution?.minimumDpi ?? 300;
  const issues: DocumentImageResolutionIssue[] = [];
  if (imageResolution)
    for (const image of page.images ?? []) {
      const placedWidth = image.widthMm ?? sheetWidthMm;
      const placedHeight = image.heightMm ?? sheetHeightMm;
      // Unknown or not-yet-loaded sizes are skipped rather than reported as 0 dpi.
      if (![image.widthPx, image.heightPx, placedWidth, placedHeight].every(positive)) continue;
      const dpi = documentImageDpi(image, placedWidth, placedHeight);
      if (dpi < minimumDpi) issues.push({ label: image.label, dpi, minimumDpi });
    }
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
        {hasGuides && (
          <Checkbox
            label={labels.guides}
            checked={guides}
            onChange={(event) => setGuides(event.target.checked)}
          />
        )}
      </div>
      {imageResolution && issues.length > 0 && (
        <div className="g-document-notices">
          <Alert title={imageResolution.title} tone="warning">
            <ul>
              {issues.map((issue, index) => (
                <li key={index}>{imageResolution.describe(issue)}</li>
              ))}
            </ul>
          </Alert>
        </div>
      )}
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
                '--g-document-bleed': `${bleed}mm`,
              } as CSSProperties
            }
          >
            <div className="g-document-content" key={page.id}>
              {page.content}
            </div>
            {guides && bleed > 0 && (
              <div className="g-document-trim" aria-hidden="true">
                {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(
                  (corner) => (
                    <span key={corner} className="g-document-crop" data-corner={corner} />
                  ),
                )}
              </div>
            )}
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
