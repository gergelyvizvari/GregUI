'use client';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const pxPerMm = 96 / 25.4;

export interface PostcardStageProps {
  /** Describes the card as it is now (design, words, recipient), for assistive technology. */
  label: string;
  orientation?: 'landscape' | 'portrait';
  /** A flat card's side facing the viewer; changing it turns the card over. */
  side?: 'front' | 'back';
  /** The picture side, usually an image filling the card; a folded card's cover. */
  front: ReactNode;
  /**
   * A flat card's writing side, usually a `MailFace` postcard. It is always landscape, like a
   * real postcard: a portrait card turns a quarter as it turns over.
   */
  back?: ReactNode;
  /**
   * A folded card instead of a flat one: `closed` shows the cover from slightly to the side,
   * `open` opens it (sideways when portrait, upwards when landscape) to show `inside`.
   */
  fold?: 'closed' | 'open';
  /** A folded card's inside page with the message, usually a `MailFace` inside. */
  inside?: ReactNode;
  /** A folded card's envelope, usually a `MailFace` envelope, shown behind the card. */
  envelope?: ReactNode;
  /** Card size in millimetres; defaults to A6 (148 × 105). */
  sizeMm?: { width: number; height: number };
  /**
   * Change it (for example to the chosen design's id) to make the card settle with a small
   * bounce, so a change on the visible side is noticed. Not animated with reduced motion.
   */
  changeKey?: string;
  /** Makes the card a button that turns it over or opens and closes it; the app changes `side` or `fold`. */
  onTurn?: () => void;
  /** Names what a press does, for example "Show the back"; required with `onTurn`. */
  turnLabel?: string;
  /** `large` gives the card more room, for a final look before sending. */
  size?: 'default' | 'large';
}

/**
 * A postcard on the table: one tilted card at true proportions, scaled to the space it has. A
 * flat card turns over between its picture and writing sides; a folded card opens to its inside.
 * Decorative unless it can be turned: `label` carries the meaning.
 */
export function PostcardStage({
  label,
  orientation = 'landscape',
  side = 'front',
  front,
  back,
  fold,
  inside,
  envelope,
  sizeMm = { width: 148, height: 105 },
  changeKey,
  onTurn,
  turnLabel,
  size = 'default',
}: PostcardStageProps) {
  const portrait = orientation === 'portrait';
  const long = sizeMm.width * pxPerMm;
  const short = sizeMm.height * pxPerMm;
  const width = portrait ? short : long;
  const height = portrait ? long : short;
  // A C6 envelope peeks out below and to the side of the card; the scale makes room for both.
  const envelopeSize = { width: 162 * pxPerMm, height: 114 * pxPerMm };
  const peek = { x: 200, y: 120 };
  // Room for every shape the card can take: an open folded card is twice as wide (portrait) or
  // tall (landscape); a flat portrait card shows its landscape back.
  const cardExtent = fold
    ? portrait
      ? { width: 2 * width, height }
      : { width, height: 2 * height }
    : portrait
      ? { width: long, height: long }
      : { width, height };
  const extent = envelope
    ? {
        width: Math.max(cardExtent.width, envelopeSize.width + 2 * peek.x),
        height: Math.max(cardExtent.height, envelopeSize.height + peek.y),
      }
    : cardExtent;
  const room = useRef<HTMLDivElement & HTMLButtonElement>(null);
  const [scale, setScale] = useState(0);
  useIsomorphicLayoutEffect(() => {
    const element = room.current;
    if (!element) return;
    const measure = () => {
      const available = element.clientWidth;
      const maxHeight = Number.parseFloat(getComputedStyle(element).maxHeight) || height;
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

  const table = (
    <div
      className="g-postcard-table"
      aria-hidden="true"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        top: `${24 + ((extent.height - height) * scale) / 2}px`,
        ['--g-stage-scale' as string]: scale,
      }}
    >
      {envelope && (
        <div
          className="g-postcard-envelope"
          style={{
            width: `${envelopeSize.width}px`,
            height: `${envelopeSize.height}px`,
            translate: `calc(-50% + ${peek.x}px) ${peek.y - (extent.height - height) / 2}px`,
          }}
        >
          {envelope}
        </div>
      )}
      {fold ? (
        <div
          className="g-postcard-folded"
          data-fold={fold}
          data-orientation={orientation}
          data-settle={settle}
        >
          <div className="g-postcard-face g-postcard-inside">{inside}</div>
          <div className="g-postcard-cover">
            <div className="g-postcard-face" data-face="front">
              {front}
            </div>
            <div className="g-postcard-face g-postcard-cover-inside" data-face="back" />
          </div>
        </div>
      ) : (
        <div
          className="g-postcard-card"
          data-side={side}
          data-orientation={orientation}
          data-settle={settle}
        >
          <div className="g-postcard-face" data-face="front">
            {front}
          </div>
          <div className="g-postcard-face" data-face="back">
            <div className="g-postcard-back" style={{ width: `${long}px`, height: `${short}px` }}>
              {back}
            </div>
          </div>
        </div>
      )}
    </div>
  );
  const stageHeight = scale ? `${extent.height * scale + 48}px` : undefined;
  return onTurn ? (
    <button
      ref={room}
      type="button"
      className="g-postcard-stage"
      data-size={size}
      aria-label={`${label}. ${turnLabel ?? ''}`.trim()}
      data-ready={scale > 0}
      style={{ height: stageHeight }}
      onClick={onTurn}
    >
      {table}
    </button>
  ) : (
    <div
      ref={room}
      className="g-postcard-stage"
      data-size={size}
      role="img"
      aria-label={label}
      data-ready={scale > 0}
      style={{ height: stageHeight }}
    >
      {table}
    </div>
  );
}
