'use client';
import { type ReactNode, type ComponentPropsWithoutRef } from 'react';
import type { Clean, DivProps } from './internal-types';
export function Text({
  as: Tag = 'p',
  size = 'body',
  tone = 'default',
  weight = 'normal',
  children,
  ...props
}: Clean<ComponentPropsWithoutRef<'p'>> & {
  as?: 'p' | 'span';
  size?: 'small' | 'body' | 'large' | 'eyebrow' | 'lead' | 'caption';
  tone?: 'default' | 'muted' | 'primary' | 'danger';
  weight?: 'normal' | 'strong';
}) {
  return (
    <Tag {...props} className="g-text" data-size={size} data-tone={tone} data-weight={weight}>
      {children}
    </Tag>
  );
}
export function Heading({
  level = 2,
  size = 'section',
  children,
  ...props
}: Clean<ComponentPropsWithoutRef<'h2'>> & {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'hero' | 'page' | 'section' | 'card';
}) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return (
    <Tag {...props} className="g-heading" data-size={size}>
      {children}
    </Tag>
  );
}
/** Typography for trusted React/HTML content; applications own parsing and sanitisation. */
export function Prose({
  children,
  measure = 'reading',
  ...props
}: DivProps & { measure?: 'reading' | 'full' }) {
  return (
    <div {...props} className="g-prose" data-measure={measure}>
      {children}
    </div>
  );
}
export function Divider() {
  return <hr className="g-divider" />;
}
export function Link({ children, ...props }: Clean<ComponentPropsWithoutRef<'a'>>) {
  return (
    <a {...props} className="g-link">
      {children}
    </a>
  );
}
export function Code({ children }: { children: ReactNode }) {
  return <code className="g-code">{children}</code>;
}
/** Content for assistive technology only, such as a count's unit or an icon button's context. */
export function VisuallyHidden({
  children,
  as: Tag = 'span',
}: {
  children: ReactNode;
  as?: 'span' | 'div';
}) {
  return <Tag className="g-sr-only">{children}</Tag>;
}
/**
 * A keyboard key or combination. Pass `keys` for a combination; each key is its own `<kbd>`.
 * Visual only: the application owns the shortcut itself.
 */
export function Kbd({ children, keys }: { children?: ReactNode; keys?: string[] }) {
  if (!keys) return <kbd className="g-kbd">{children}</kbd>;
  return (
    <kbd className="g-kbd-combo">
      {keys.map((key, i) => (
        <kbd key={i} className="g-kbd">
          {key}
        </kbd>
      ))}
    </kbd>
  );
}
export function CodeBlock({
  children,
  label = 'Code example',
  wrap = false,
}: {
  children: string;
  label?: string;
  wrap?: boolean;
}) {
  return (
    <pre
      className="g-code-block"
      data-wrap={wrap || undefined}
      tabIndex={0}
      role="region"
      aria-label={label}
    >
      <code>{children}</code>
    </pre>
  );
}
