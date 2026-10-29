'use client';
import { type ReactNode } from 'react';
import { useLocale } from '@gregui/localization';
import { Icon } from './icons';
import { Inline, Stack } from './layout';
import { Heading, Link, Text } from './typography';
export function Badge({
  children,
  tone = 'neutral',
  variant = 'standard',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
  /** `stamp` has a perforated stamp edge; `label` is a punched, pointed luggage-label tag. */
  variant?: 'standard' | 'stamp' | 'label';
}) {
  return (
    <span className="g-badge" data-tone={tone} data-variant={variant}>
      {children}
    </span>
  );
}
export function Alert({
  title,
  children,
  tone = 'info',
  live = false,
}: {
  title: string;
  children?: ReactNode;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  live?: boolean;
}) {
  return (
    <div
      className="g-alert"
      data-tone={tone}
      role={live ? (tone === 'danger' ? 'alert' : 'status') : undefined}
    >
      <Icon name={tone === 'success' ? 'check' : 'shield'} />
      <Stack gap={1}>
        <Text weight="strong">{title}</Text>
        {children && <div className="g-alert-description">{children}</div>}
      </Stack>
    </div>
  );
}
export function Status({ children }: { children: ReactNode }) {
  return (
    <div className="g-status" role="status" aria-live="polite">
      {children}
    </div>
  );
}
export function Spinner({ label }: { label?: string }) {
  const { messages } = useLocale();
  return <span className="g-spinner" role="status" aria-label={label ?? messages.loading} />;
}
export function Progress({ value, label }: { value: number; label: string }) {
  return (
    <label className="g-progress-label">
      <Inline justify="between">
        <Text as="span" size="small">
          {label}
        </Text>
        <Text as="span" size="small">
          {Math.round(Math.max(0, Math.min(100, value)))}%
        </Text>
      </Inline>
      <progress className="g-progress" value={value} max={100} />
    </label>
  );
}
export function Skeleton({ lines = 3, label }: { lines?: number; label?: string }) {
  const { messages } = useLocale();
  return (
    <div className="g-stack" role="status" aria-label={label ?? messages.loading}>
      {Array.from({ length: Math.min(10, Math.max(1, lines)) }, (_, i) => (
        <span key={i} className="g-skeleton" />
      ))}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
  headingLevel = 3,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  /** Level of the title heading. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}) {
  return (
    <div className="g-empty">
      <Icon name="layers" />
      <Heading level={headingLevel} size="card">
        {title}
      </Heading>
      <Text tone="muted">{description}</Text>
      {action}
    </div>
  );
}
export function ErrorSummary({
  title = 'Check the following fields',
  errors,
}: {
  title?: string;
  errors: { id: string; message: string }[];
}) {
  return (
    <Alert title={title} tone="danger" live>
      <ul>
        {errors.map((e) => (
          <li key={e.id}>
            <Link href={`#${e.id}`}>{e.message}</Link>
          </li>
        ))}
      </ul>
    </Alert>
  );
}
