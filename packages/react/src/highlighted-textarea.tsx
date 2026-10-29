'use client';
import { useLayoutEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import { Field } from './forms';

type Props = Omit<
  ComponentPropsWithoutRef<'textarea'>,
  'className' | 'style' | 'value' | 'defaultValue' | 'onChange'
> & {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  highlights: string[];
  size?: 'small' | 'medium';
  font?: 'mono' | 'body';
  hint?: string;
  error?: string;
};
export function highlightText(value: string, terms: string[]) {
  const words = [...new Set(terms.filter(Boolean))].sort((a, b) => b.length - a.length);
  if (!words.length) return [{ text: value, highlighted: false }];
  const escaped = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}_])(?:${escaped.join('|')})(?![\\p{L}\\p{N}_])`,
    'gu',
  );
  const pieces: { text: string; highlighted: boolean }[] = [];
  let end = 0;
  for (const match of value.matchAll(pattern)) {
    pieces.push({ text: value.slice(end, match.index), highlighted: false });
    pieces.push({ text: match[0], highlighted: true });
    end = match.index! + match[0].length;
  }
  pieces.push({ text: value.slice(end), highlighted: false });
  return pieces;
}
/** Native plain-text editing with a decorative emphasis layer; no rich-text state. */
export function HighlightedTextarea({
  label,
  value,
  onValueChange,
  highlights,
  hint,
  error,
  rows = 9,
  size = 'medium',
  font = 'mono',
  onScroll,
  ...props
}: Props) {
  const input = useRef<HTMLTextAreaElement>(null);
  const mirror = useRef<HTMLDivElement>(null);
  const sync = () => {
    if (!input.current || !mirror.current) return;
    // clientWidth excludes the native scrollbar, so both layers wrap identically.
    const style = getComputedStyle(input.current);
    const border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    mirror.current.style.borderWidth = style.borderWidth;
    mirror.current.style.width = `${input.current.clientWidth + border}px`;
    mirror.current.scrollTop = input.current.scrollTop;
    mirror.current.scrollLeft = input.current.scrollLeft;
  };
  useLayoutEffect(() => {
    sync();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(sync);
    if (input.current) observer.observe(input.current);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(sync, [value, highlights]);
  return (
    <Field label={label} hint={hint} error={error}>
      {(field) => (
        <div className="g-highlighted-editor" data-size={size} data-font={font}>
          <div ref={mirror} className="g-highlighted-mirror" aria-hidden="true">
            {highlightText(value, highlights).map((part, index) =>
              part.highlighted ? <strong key={index}>{part.text}</strong> : part.text,
            )}
            {'\n'}
          </div>
          <textarea
            {...props}
            {...field}
            ref={input}
            className="g-input g-textarea g-highlighted-input"
            rows={rows}
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            onScroll={(event) => {
              sync();
              onScroll?.(event);
            }}
          />
        </div>
      )}
    </Field>
  );
}
