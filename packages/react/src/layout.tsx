'use client';
import { Children, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { spacing, type Space } from '@gregui/tokens';
import { Badge } from './feedback';
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

export interface BoardColumn {
  id: string;
  title: string;
  /** How many items the column holds, shown beside its title. */
  count?: number;
  /** Shown instead of the items when there are none. */
  emptyLabel?: string;
  children?: ReactNode;
}
/**
 * Items by where they stand, in side-by-side lanes (a print queue by step, tickets by status).
 * Each lane is a named section with a bounded surface, so the eye can tell where one ends and
 * the next begins; lanes keep equal widths and the board scrolls sideways rather than wrapping
 * when they no longer fit. The app owns the items, their order and any moving between lanes.
 */
export function Board({
  label,
  columns,
  headingLevel = 2,
  gap = 3,
  ...props
}: DivProps & {
  /** Names the board for assistive technology. */
  label: string;
  columns: readonly BoardColumn[];
  /** The heading level of each lane's title; the default fits a board under a page title. */
  headingLevel?: 2 | 3 | 4;
  gap?: Space;
}) {
  const id = useId();
  return (
    <div
      {...props}
      className="g-board"
      role="group"
      aria-label={label}
      style={{ gap: spacing[gap] }}
    >
      {columns.map((column) => {
        const headingId = `${id}-${column.id}`;
        const empty = Children.count(column.children) === 0;
        return (
          <section key={column.id} className="g-board-column" aria-labelledby={headingId}>
            <div className="g-board-column-head">
              <Heading id={headingId} level={headingLevel} size="card">
                {column.title}
              </Heading>
              {column.count !== undefined && <Badge>{String(column.count)}</Badge>}
            </div>
            <div className="g-board-column-body">
              {empty && column.emptyLabel ? (
                <Text size="small" tone="muted">
                  {column.emptyLabel}
                </Text>
              ) : (
                column.children
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
