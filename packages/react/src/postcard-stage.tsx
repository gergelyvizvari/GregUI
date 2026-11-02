'use client';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const pxPerMm = 96 / 25.4;

export interface PostcardStageProps {
  /** Describes the card as it is now (design, words, recipient), for assistive technology. */
  label: string;
  orientation?: 'landscape' | 'portrait';
  /** The side facing the viewer; changing it turns the card over. */
  side?: 'front' | 'back';
  /** The picture side, usually an image filling the card. */
  front: ReactNode;
  /** The writing side: usually a `MailFace` postcard, or the inside of a folded card. */
  back: ReactNode;
  /** A folded card's envelope, usually a `MailFace` envelope, shown behind the card. */
  envelope?: ReactNode;
  /** Card size in millimetres; defaults to A6 (148 × 105). */
  sizeMm?: { width: number; height: number };
  /**
   * Change it (for example to the chosen design's id) to make the card settle with a small
   * bounce, so a change on the visible side is noticed. Not animated with reduced motion.
   */
  changeKey?: string;
}

/**
 * A postcard on the table: one tilted card at true proportions, scaled to the space it has, that
 * turns over between its picture and writing sides. Decorative: `label` carries the meaning.
 */
export function PostcardStage({
  label,
  orientation = 'landscape',
  side = 'front',
  front,
  back,
  envelope,
  sizeMm = { width: 148, height: 105 },
  changeKey,
}: PostcardStageProps) {
  const portrait = orientation === 'portrait';
  const width = (portrait ? sizeMm.height : sizeMm.width) * pxPerMm;
  const height = (portrait ? sizeMm.width : sizeMm.height) * pxPerMm;
  // A C6 envelope peeks out below and to the side of the card; the scale makes room for both.
  const envelopeSize = { width: 162 * pxPerMm, height: 114 * pxPerMm };
  const peek = { x: 200, y: 120 };
  const extent = envelope
    ? {
        width: Math.max(width, envelopeSize.width + 2 * peek.x),
        height: Math.max(height, envelopeSize.height + peek.y),
      }
    : { width, height };
  const room = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useIsomorphicLayoutEffect(() => {
    const element = room.current;
    if (!element) return;
    const measure = () => {
      const available = element.clientWidth;
      const maxHeight = Number.parseFloat(getComputedStyle(element).maxHeight) || height;
      // Leave room for the tilt and the envelope peeking out.
      setScale(Math.min((available * 0.9) / extent.width, (maxHeight * 0.86) / extent.height, 1));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [extent.width, extent.height]);

  // Alternating names restart the settle animation on every change.
  const [settle, setSettle] = useState<'a' | 'b' | undefined>(undefined);
  const firstKey = useRef(changeKey);
  useEffect(() => {
    if (changeKey === firstKey.current) return;
    firstKey.current = changeKey;
    setSettle((current) => (current === 'a' ? 'b' : 'a'));
  }, [changeKey]);

  return (
    <div
      ref={room}
      className="g-postcard-stage"
      role="img"
      aria-label={label}
      data-ready={scale > 0}
      style={{ height: scale ? `${extent.height * scale + 48}px` : undefined }}
    >
      <div
        className="g-postcard-table"
        aria-hidden="true"
        style={{ width: `${width}px`, height: `${height}px`, ['--g-stage-scale' as string]: scale }}
      >
        {envelope && (
          <div
            className="g-postcard-envelope"
            style={{
              width: `${envelopeSize.width}px`,
              height: `${envelopeSize.height}px`,
              translate: `calc(-50% + ${peek.x}px) ${peek.y}px`,
            }}
          >
            {envelope}
          </div>
        )}
        <div className="g-postcard-card" data-side={side} data-settle={settle}>
          <div className="g-postcard-face" data-face="front">
            {front}
          </div>
          <div className="g-postcard-face" data-face="back">
            {back}
          </div>
        </div>
      </div>
    </div>
  );
}
