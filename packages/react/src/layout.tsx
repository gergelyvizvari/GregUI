'use client';
import { useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { spacing, type Space } from '@gregui/tokens';
import type { Clean, DivProps } from './internal-types';
import { Heading, Text } from './typography';
export function Stack({ gap = 4, children, ...props }: DivProps & { gap?: Space }) {
  return (
    <div {...props} className="g-stack" style={{ gap: spacing[gap] }}>
      {children}
    </div>
  );
}
export function Inline({
  gap = 3,
  align = 'center',
  justify = 'start',
  wrap = true,
  children,
  ...props
}: DivProps & {
  gap?: Space;
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'between' | 'end';
  /** false keeps every child on one row, so long text wraps inside its own item (an icon beside a sentence). */
  wrap?: boolean;
}) {
  return (
    <div
      {...props}
      className="g-inline"
      data-align={align}
      data-justify={justify}
      data-wrap={wrap ? undefined : 'false'}
      style={{ gap: spacing[gap] }}
    >
      {children}
    </div>
  );
}
export function Grid({
  columns = 2,
  gap = 4,
  children,
  ...props
}: DivProps & { columns?: 1 | 2 | 3 | 4 | 5 | 'auto'; gap?: Space }) {
  return (
    <div {...props} className="g-grid" data-columns={columns} style={{ gap: spacing[gap] }}>
      {children}
    </div>
  );
}
export function Split({ children, ...props }: DivProps) {
  return (
    <div {...props} className="g-split">
      {children}
    </div>
  );
}
export function Container({
  children,
  size = 'page',
  inset = true,
  align = 'center',
  ...props
}: DivProps & {
  size?: 'page' | 'form' | 'reading';
  inset?: boolean;
  /** `start` keeps a narrow container against the page's leading edge, under a left-aligned title. */
  align?: 'center' | 'start';
}) {
  return (
    <div
      {...props}
      className="g-container"
      data-size={size}
      data-inset={inset}
      data-align={align === 'start' ? 'start' : undefined}
    >
      {children}
    </div>
  );
}
export function Card({
  children,
  padding = 5,
  footer,
  ...props
}: DivProps & { padding?: Space; footer?: ReactNode }) {
  return (
    <div
      {...props}
      className="g-card"
      data-footer={footer != null || undefined}
      style={{
        padding: padding === 0 ? 0 : `max(${spacing[padding]}, var(--g-card-min-padding, 0px))`,
      }}
    >
      {children}
      {footer != null && <div className="g-card-footer">{footer}</div>}
    </div>
  );
}
/**
 * The card's title as a link that makes the whole card clickable, for lists where each card opens
 * a record. It reads as plain heading text (no link colour or underline); the card lifts on hover
 * and shows the focus ring when the link has keyboard focus. Buttons, checkboxes and other links
 * inside the card stay clickable on their own. Use one per card. Apps own navigation: pass
 * `onClick` (and `preventDefault`) for client-side routing.
 */
export function CardLink({
  children,
  ...props
}: Clean<ComponentPropsWithoutRef<'a'>> & { href: string }) {
  return (
    <a {...props} className="g-card-link">
      {children}
    </a>
  );
}
export function Section({
  title,
  description,
  children,
  action,
  level = 2,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  level?: 2 | 3 | 4 | 5 | 6;
}) {
  const id = useId();
  return (
    <section className="g-section" aria-labelledby={id}>
      <Inline justify="between">
        <Stack gap={1}>
          <Heading level={level} size="section" id={id}>
            {title}
          </Heading>
          {description && (
            <Text tone="muted" size="small">
              {description}
            </Text>
          )}
        </Stack>
        {action}
      </Inline>
      {children}
    </section>
  );
}
