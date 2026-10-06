import { useId, useRef, useState, type PointerEvent } from 'react';
export type ImageRegionValue = { x: number; y: number; width: number; height: number };
/** Percentage coordinates keep annotations aligned at any responsive image size. */
export function ImageRegion({
  src,
  alt,
  value,
  onChange,
  label,
  help,
  compact = false,
}: {
  src: string;
  alt: string;
  value?: ImageRegionValue | null;
  onChange?: (region: ImageRegionValue | null) => void;
  label?: string;
  help?: string;
  /** Bound an unannotated, read-only image without cropping. */
  compact?: boolean;
}) {
  const id = useId();
  const start = useRef<{ x: number; y: number } | null>(null);
  const [draft, setDraft] = useState<ImageRegionValue | null>(null);
  const box = draft || value;
  function point(e: PointerEvent<HTMLDivElement>) {
    const b = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((e.clientX - b.left) / b.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - b.top) / b.height) * 100)),
    };
  }
  function rectangle(e: PointerEvent<HTMLDivElement>) {
    const p = point(e),
      s = start.current!;
    return {
      x: Math.min(s.x, p.x),
      y: Math.min(s.y, p.y),
      width: Math.abs(s.x - p.x),
      height: Math.abs(s.y - p.y),
    };
  }
  return (
    <figure className="g-image-region" data-compact={compact && !onChange && !box}>
      <div
        className="g-image-region-stage"
        data-editable={!!onChange}
        role={onChange ? 'group' : undefined}
        tabIndex={onChange ? 0 : undefined}
        aria-label={onChange ? label : undefined}
        aria-describedby={help ? id : undefined}
        onPointerDown={(e) => {
          if (!onChange || e.button !== 0) return;
          e.preventDefault();
          e.currentTarget.focus();
          start.current = point(e);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (start.current) setDraft(rectangle(e));
        }}
        onPointerUp={(e) => {
          if (!start.current) return;
          const r = rectangle(e);
          start.current = null;
          setDraft(null);
          if (r.width >= 1 && r.height >= 1) onChange?.(r);
        }}
        onPointerCancel={() => {
          start.current = null;
          setDraft(null);
        }}
        onKeyDown={(e) => {
          if (!onChange) return;
          if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            onChange(null);
            return;
          }
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange(value || { x: 25, y: 25, width: 50, height: 50 });
            return;
          }
          if (!value || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key))
            return;
          e.preventDefault();
          const r = { ...value };
          const delta = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
          if (e.shiftKey) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
              r.width = Math.max(1, Math.min(100 - r.x, r.width + delta));
            else r.height = Math.max(1, Math.min(100 - r.y, r.height + delta));
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
            r.x = Math.max(0, Math.min(100 - r.width, r.x + delta));
          else r.y = Math.max(0, Math.min(100 - r.height, r.y + delta));
          onChange(r);
        }}
      >
        <img src={src} alt={alt} draggable={false} />
        {box && (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <rect
              className="g-image-region-outline"
              x={box.x}
              y={box.y}
              width={box.width}
              height={box.height}
            />
            <rect
              className="g-image-region-mark"
              x={box.x}
              y={box.y}
              width={box.width}
              height={box.height}
            />
          </svg>
        )}
      </div>
      {help && <figcaption id={id}>{help}</figcaption>}
    </figure>
  );
}
