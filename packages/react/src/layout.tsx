'use client';
import { useId, type ReactNode } from 'react';
import { spacing, type Space } from '@gregui/tokens';
import type { DivProps } from './internal-types';
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
  children,
  ...props
}: DivProps & {
  gap?: Space;
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'between' | 'end';
}) {
  return (
    <div
      {...props}
      className="g-inline"
      data-align={align}
      data-justify={justify}
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
  ...props
}: DivProps & { size?: 'page' | 'form' | 'reading'; inset?: boolean }) {
  return (
    <div {...props} className="g-container" data-size={size} data-inset={inset}>
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
