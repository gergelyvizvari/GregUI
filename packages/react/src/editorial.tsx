'use client';
import { type CSSProperties, type ReactNode, type ComponentPropsWithoutRef } from 'react';
import { contrast } from '@gregui/tokens';
import type { Clean } from './internal-types';
/** Image-led feature with opaque copy surfaces and a responsive two-column layout. */
export function FeaturePanel({
  variant = 'split',
  image,
  imageAlt,
  children,
}: {
  variant?: 'split' | 'immersive';
  image: string;
  imageAlt: string;
  children: ReactNode;
}) {
  return (
    <section className="g-feature-panel" data-variant={variant}>
      <div className="g-feature-copy">{children}</div>
      <img src={image} alt={imageAlt} width={900} height={600} />
    </section>
  );
}
export function MediaCard({
  image,
  imageAlt,
  children,
}: {
  image: string;
  imageAlt: string;
  children: ReactNode;
}) {
  return (
    <article className="g-media-card">
      <img src={image} alt={imageAlt} width={900} height={600} loading="lazy" />
      <div className="g-media-copy">{children}</div>
    </article>
  );
}
/** A decorative identity mark; the adjacent brand supplies its accessible name. */
export function PulseMark() {
  return (
    <svg className="g-pulse-mark" viewBox="0 0 40 40" aria-hidden="true">
      <rect x="6" y="17" width="6" height="16" rx="3" />
      <rect x="17" y="7" width="6" height="26" rx="3" />
      <rect x="28" y="12" width="6" height="21" rx="3" />
    </svg>
  );
}
/** Explicit brand accent pair, validated separately from text/link theme roles. */
export function AccentLink({
  href,
  palette,
  children,
}: {
  href: string;
  palette: { background: string; text: string };
  children: ReactNode;
}) {
  // An unreadable or malformed pair falls back to the theme's action colours instead of throwing.
  const readable =
    [palette.background, palette.text].every((value) => /^#[\da-f]{6}$/i.test(value)) &&
    contrast(palette.background, palette.text) >= 4.5;
  if (!readable && !(typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'))
    console.warn('AccentLink needs a valid, readable color pair; using theme colors.');
  return (
    <a
      className="g-accent-link"
      href={href}
      style={
        readable
          ? ({
              '--g-action-fill': palette.background,
              '--g-action-ink': palette.text,
            } as CSSProperties)
          : undefined
      }
    >
      {children}
    </a>
  );
}
export function EditorialLead({ feature, aside }: { feature: ReactNode; aside: ReactNode }) {
  return (
    <div className="g-editorial-lead">
      <div>{feature}</div>
      <aside>{aside}</aside>
    </div>
  );
}
export function SignalCard({ children }: { children: ReactNode }) {
  return <article className="g-signal-card">{children}</article>;
}
export function ChipLink({
  children,
  active = false,
  ...props
}: Clean<ComponentPropsWithoutRef<'a'>> & { active?: boolean }) {
  return (
    <a {...props} className="g-chip-link" aria-current={active ? 'page' : undefined}>
      {children}
    </a>
  );
}
