'use client';
import React, {
  createContext,
  useContext,
  useId,
  forwardRef,
  type CSSProperties,
  type ReactNode,
  type ComponentPropsWithoutRef,
} from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as AlertPrimitive from '@radix-ui/react-alert-dialog';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import {
  createTheme,
  themeVariables,
  spacing,
  contrast,
  type Theme,
  type Space,
} from '@gregui/tokens';
import { useLocale } from '@gregui/localization';
export { LocaleProvider, useLocale, useFormat } from '@gregui/localization';
export { createTheme, type Theme } from '@gregui/tokens';
type Clean<T> = Omit<T, 'style' | 'className'>;
type DivProps = Clean<ComponentPropsWithoutRef<'div'>>;
const ThemeContext = createContext<Theme>(createTheme());
export function useTheme() {
  return useContext(ThemeContext);
}
function ThemeFrame({
  theme,
  children,
  portal = false,
}: {
  theme: Theme;
  children: ReactNode;
  portal?: boolean;
}) {
  const { locale, direction } = useLocale();
  return (
    <div
      className={`g-theme${portal ? ' g-portal' : ''}`}
      data-preset={theme.preset}
      data-mode={theme.mode}
      data-density={theme.density}
      data-motion={theme.motion}
      style={themeVariables(theme) as CSSProperties}
      lang={locale}
      dir={direction}
    >
      {children}
    </div>
  );
}
export function ThemeProvider({ theme, children }: { theme?: Theme; children: ReactNode }) {
  const inherited = useTheme();
  const value = theme ?? inherited;
  return (
    <ThemeContext.Provider value={value}>
      <ThemeFrame theme={value}>{children}</ThemeFrame>
    </ThemeContext.Provider>
  );
}
function PortalFrame({ children }: { children: ReactNode }) {
  return (
    <ThemeFrame theme={useTheme()} portal>
      {children}
    </ThemeFrame>
  );
}
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
}: DivProps & { columns?: 1 | 2 | 3 | 4 | 5; gap?: Space }) {
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
}: DivProps & { size?: 'page' | 'form'; inset?: boolean }) {
  return (
    <div {...props} className="g-container" data-size={size} data-inset={inset}>
      {children}
    </div>
  );
}
export function Card({ children, padding = 5, ...props }: DivProps & { padding?: Space }) {
  return (
    <div {...props} className="g-card" style={{ padding: spacing[padding] }}>
      {children}
    </div>
  );
}
export function Section({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const id = useId();
  return (
    <section className="g-section" aria-labelledby={id}>
      <Inline justify="between">
        <Stack gap={1}>
          <Heading level={2} size="section" id={id}>
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
export function Text({
  as: Tag = 'p',
  size = 'body',
  tone = 'default',
  weight = 'normal',
  children,
  ...props
}: Clean<ComponentPropsWithoutRef<'p'>> & {
  as?: 'p' | 'span';
  size?: 'small' | 'body' | 'large' | 'eyebrow';
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
  level?: 1 | 2 | 3 | 4;
  size?: 'hero' | 'page' | 'section' | 'card';
}) {
  const Tag = `h${level}` as 'h1';
  return (
    <Tag {...props} className="g-heading" data-size={size}>
      {children}
    </Tag>
  );
}
export function Divider() {
  return <hr className="g-divider" />;
}
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
}) {
  return (
    <span className="g-badge" data-tone={tone}>
      {children}
    </span>
  );
}
export const Button = forwardRef<
  HTMLButtonElement,
  Clean<ComponentPropsWithoutRef<'button'>> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    icon?: ReactNode;
  }
>(function Button(
  {
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled,
    children,
    icon,
    type = 'button',
    ...props
  },
  ref,
) {
  const { messages } = useLocale();
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className="g-button"
      data-variant={variant}
      data-size={size}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <Spinner label={messages.loading} /> : icon}
      {children}
    </button>
  );
});
export const IconButton = forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<typeof Button>, 'children'> & { label: string; children: ReactNode }
>(function IconButton({ label, children, ...props }, ref) {
  return (
    <Button {...props} ref={ref} aria-label={label}>
      {children}
    </Button>
  );
});
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
export function CodeBlock({
  children,
  label = 'Code example',
}: {
  children: string;
  label?: string;
}) {
  return (
    <pre className="g-code-block" tabIndex={0} role="region" aria-label={label}>
      <code>{children}</code>
    </pre>
  );
}
export type IconName =
  | 'grid'
  | 'palette'
  | 'layers'
  | 'arrow'
  | 'check'
  | 'close'
  | 'menu'
  | 'sun'
  | 'moon'
  | 'download'
  | 'upload'
  | 'undo'
  | 'search'
  | 'shield'
  | 'code'
  | 'external'
  | 'chevron'
  | 'plus';
const paths: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  palette: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="8" cy="9" r="1" />
      <circle cx="14" cy="7" r="1" />
      <path d="M20 14h-5a3 3 0 0 0-3 3v4" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" />
    </>
  ),
  moon: <path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z" />,
  download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
  upload: <path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5" />,
  undo: <path d="M4 10h10a6 6 0 0 1 0 12M4 10l5-5m-5 5 5 5" />,
  search: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="m15 15 6 6" />
    </>
  ),
  shield: (
    <>
      <path d="m12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5z" />
      <path d="m8 11 3 3 5-5" />
    </>
  ),
  code: <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-5 3 2-18" />,
  external: <path d="M14 3h7v7m0-7-11 11M10 3H3v18h18v-7" />,
  chevron: <path d="m8 4 8 8-8 8" />,
  plus: <path d="M12 4v16M4 12h16" />,
};
export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="g-icon"
      data-icon={name}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  id?: string;
  children: (props: {
    id: string;
    'aria-describedby'?: string;
    'aria-invalid'?: true;
    required?: boolean;
  }) => ReactNode;
}
export function Field({ label, hint, error, required, id: provided, children }: FieldProps) {
  const uid = useId();
  const id = provided ?? uid;
  const { messages } = useLocale();
  return (
    <div className="g-field">
      <label className="g-label" htmlFor={id}>
        {label}
        {required && <span className="g-required"> ({messages.required})</span>}
      </label>
      {hint && (
        <p className="g-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {children({
        id,
        'aria-describedby':
          [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? true : undefined,
        required,
      })}
      {error && (
        <p className="g-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
export const Input = forwardRef<HTMLInputElement, Clean<ComponentPropsWithoutRef<'input'>>>(
  function Input(props, ref) {
    return <input {...props} ref={ref} className="g-input" />;
  },
);
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  Clean<ComponentPropsWithoutRef<'textarea'>>
>(function Textarea(props, ref) {
  return <textarea rows={3} {...props} ref={ref} className="g-input g-textarea" />;
});
export const Select = forwardRef<HTMLSelectElement, Clean<ComponentPropsWithoutRef<'select'>>>(
  function Select(props, ref) {
    if (props.multiple || (props.size ?? 0) > 1) {
      return <select {...props} ref={ref} className="g-input g-select" />;
    }
    return (
      <span className="g-select-wrap">
        <select {...props} ref={ref} className="g-input g-select" />
        <span className="g-select-chevron" aria-hidden="true">
          <Icon name="chevron" />
        </span>
      </span>
    );
  },
);
export function TextField({
  label,
  hint,
  error,
  ...props
}: Clean<ComponentPropsWithoutRef<'input'>> & { label: string; hint?: string; error?: string }) {
  return (
    <Field label={label} hint={hint} error={error} required={props.required} id={props.id}>
      {(field) => <Input {...props} {...field} />}
    </Field>
  );
}
export function Checkbox({
  label,
  hint,
  hideLabel = false,
  ...props
}: Omit<Clean<ComponentPropsWithoutRef<'input'>>, 'type'> & {
  label: string;
  hint?: string;
  hideLabel?: boolean;
}) {
  const uid = useId();
  const id = props.id ?? uid;
  return (
    <div className="g-check-field">
      <label className="g-check-label">
        <input
          {...props}
          id={id}
          type="checkbox"
          className="g-checkbox"
          aria-describedby={hint ? `${id}-hint` : props['aria-describedby']}
        />
        <span className={hideLabel ? 'g-sr-only' : undefined}>{label}</span>
      </label>
      {hint && (
        <p className="g-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}
export function Switch({
  label,
  ...props
}: Omit<Clean<ComponentPropsWithoutRef<'input'>>, 'type' | 'role'> & { label: string }) {
  return (
    <label className="g-check-label g-switch-label">
      <span>{label}</span>
      <input {...props} className="g-switch" type="checkbox" role="switch" />
    </label>
  );
}
export function RadioGroup({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <fieldset className="g-fieldset">
      <legend className="g-label">{legend}</legend>
      <Inline>
        {options.map((option) => (
          <label className="g-check-label" key={option.value}>
            <input
              type="radio"
              name={name ?? id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </Inline>
    </fieldset>
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
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="g-empty">
      <Icon name="layers" />
      <Heading level={3} size="card">
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
export function DescriptionList({ items }: { items: { term: string; description: ReactNode }[] }) {
  return (
    <dl className="g-description-list">
      {items.map((item) => (
        <div key={item.term}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </div>
      ))}
    </dl>
  );
}
export function Table({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="g-table-scroll" tabIndex={0} role="region" aria-label={caption}>
      <table className="g-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th scope="col" key={c}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) =>
                j === 0 ? (
                  <th scope="row" key={j}>
                    {cell}
                  </th>
                ) : (
                  <td key={j}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Breadcrumbs({
  items,
  label = 'Breadcrumb',
}: {
  items: { label: string; href?: string }[];
  label?: string;
}) {
  return (
    <nav aria-label={label}>
      <ol className="g-breadcrumbs">
        {items.map((item, i) => (
          <li key={i}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
            {i < items.length - 1 && <Icon name="chevron" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function Tabs({
  items,
  label,
  defaultValue,
  value,
  onValueChange,
}: {
  items: { value: string; label: string; content: ReactNode }[];
  label: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const { direction } = useLocale();
  return (
    <TabsPrimitive.Root
      dir={direction}
      className="g-tabs"
      defaultValue={defaultValue ?? items[0]?.value}
      value={value}
      onValueChange={onValueChange}
    >
      <TabsPrimitive.List className="g-tab-list" aria-label={label}>
        {items.map((item) => (
          <TabsPrimitive.Trigger className="g-tab" value={item.value} key={item.value}>
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content className="g-tab-content" value={item.value} key={item.value}>
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
interface OverlayProps {
  trigger: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  footer?: ReactNode;
}
function Overlay({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  onOpenChange,
  presentation = 'dialog',
}: OverlayProps & { presentation?: 'dialog' | 'drawer' | 'fullscreen' }) {
  const { messages } = useLocale();
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <PortalFrame>
          <DialogPrimitive.Overlay className="g-backdrop" />
          <DialogPrimitive.Content className="g-dialog" data-presentation={presentation}>
            <div className="g-dialog-header">
              <Stack gap={2}>
                <DialogPrimitive.Title className="g-dialog-title">{title}</DialogPrimitive.Title>
                <DialogPrimitive.Description className="g-hint">
                  {description}
                </DialogPrimitive.Description>
              </Stack>
              <DialogPrimitive.Close asChild>
                <IconButton variant="ghost" label={messages.close}>
                  <Icon name="close" />
                </IconButton>
              </DialogPrimitive.Close>
            </div>
            <div className="g-dialog-body">{children}</div>
            {footer && <div className="g-dialog-footer">{footer}</div>}
          </DialogPrimitive.Content>
        </PortalFrame>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export function Dialog(props: OverlayProps) {
  return <Overlay {...props} />;
}
export function Drawer(props: OverlayProps) {
  return <Overlay {...props} presentation="drawer" />;
}
export function FullscreenDialog(props: OverlayProps) {
  return <Overlay {...props} presentation="fullscreen" />;
}
export function DialogClose({ children }: { children: ReactNode }) {
  return <DialogPrimitive.Close asChild>{children}</DialogPrimitive.Close>;
}
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
}) {
  return (
    <AlertPrimitive.Root>
      <AlertPrimitive.Trigger asChild>{trigger}</AlertPrimitive.Trigger>
      <AlertPrimitive.Portal>
        <PortalFrame>
          <AlertPrimitive.Overlay className="g-backdrop" />
          <AlertPrimitive.Content className="g-dialog">
            <div className="g-dialog-header">
              <Stack gap={2}>
                <AlertPrimitive.Title className="g-dialog-title">{title}</AlertPrimitive.Title>
                <AlertPrimitive.Description className="g-hint">
                  {description}
                </AlertPrimitive.Description>
              </Stack>
            </div>
            <div className="g-dialog-footer">
              <Inline justify="end">
                <AlertPrimitive.Cancel asChild>
                  <Button variant="secondary">{cancelLabel}</Button>
                </AlertPrimitive.Cancel>
                <AlertPrimitive.Action asChild>
                  <Button variant="danger" onClick={onConfirm}>
                    {confirmLabel}
                  </Button>
                </AlertPrimitive.Action>
              </Inline>
            </div>
          </AlertPrimitive.Content>
        </PortalFrame>
      </AlertPrimitive.Portal>
    </AlertPrimitive.Root>
  );
}
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <PortalFrame>
            <TooltipPrimitive.Content className="g-tooltip" sideOffset={8}>
              {label}
            </TooltipPrimitive.Content>
          </PortalFrame>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
export function Popover({
  trigger,
  label,
  children,
}: {
  trigger: ReactNode;
  label: string;
  children: ReactNode;
}) {
  const { messages } = useLocale();
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PortalFrame>
          <PopoverPrimitive.Content className="g-popover" aria-label={label} sideOffset={8}>
            <Stack>
              {children}
              <PopoverPrimitive.Close asChild>
                <Button size="small" variant="secondary">
                  {messages.close}
                </Button>
              </PopoverPrimitive.Close>
            </Stack>
          </PopoverPrimitive.Content>
        </PortalFrame>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  artwork,
}: {
  artwork?: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="g-page-header" data-editorial={Boolean(artwork)}>
      <Stack gap={3}>
        {eyebrow && (
          <Text size="eyebrow" tone="primary">
            {eyebrow}
          </Text>
        )}
        <Heading level={1} size="page">
          {title}
        </Heading>
        {description && (
          <Text tone="muted" size="large">
            {description}
          </Text>
        )}
      </Stack>
      {actions && <Inline>{actions}</Inline>}
      {artwork && <div className="g-page-artwork">{artwork}</div>}
    </header>
  );
}
export function NavItem({
  active = false,
  icon,
  children,
  ...props
}: Clean<ComponentPropsWithoutRef<'button'>> & { active?: boolean; icon?: IconName }) {
  return (
    <button
      {...props}
      type="button"
      className="g-nav-item"
      aria-current={active ? 'page' : undefined}
    >
      {icon && <Icon name={icon} />}
      <span>{children}</span>
      {active && <span className="g-nav-dot" />}
    </button>
  );
}
export function AppShell({
  brand,
  subtitle,
  nav,
  footer,
  toolbar,
  children,
  viewKey,
  appearance = 'standard',
  brandMark,
}: {
  appearance?: 'standard' | 'editorial' | 'dashboard';
  brandMark?: ReactNode;
  viewKey?: string;
  brand: string;
  subtitle?: string;
  nav: ReactNode;
  footer?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  const { messages } = useLocale();
  const mainId = useId();
  const [navOpen, setNavOpen] = React.useState(false);
  React.useEffect(() => {
    if (viewKey) window.scrollTo(0, 0);
  }, [viewKey]);
  return (
    <div className="g-app-shell" data-appearance={appearance}>
      <a className="g-skip" href={`#${mainId}`}>
        {messages.skipToContent}
      </a>
      <aside className="g-sidebar">
        <div className="g-brand">
          {brandMark ?? (
            <span className="g-brand-mark">
              g<span>↗</span>
            </span>
          )}
          <Stack gap={0}>
            <Text weight="strong">{brand}</Text>
            {subtitle && (
              <Text size="small" tone="muted">
                {subtitle}
              </Text>
            )}
          </Stack>
        </div>
        <nav className="g-nav" aria-label={messages.navigation}>
          {nav}
        </nav>
        {footer && <div className="g-sidebar-footer">{footer}</div>}
      </aside>
      <div className="g-workspace">
        <div className="g-toolbar">
          <div className="g-mobile-nav">
            <Drawer
              open={navOpen}
              onOpenChange={setNavOpen}
              trigger={
                <IconButton variant="ghost" label={messages.openNavigation}>
                  <Icon name="menu" />
                </IconButton>
              }
              title={brand}
              description={messages.navigation}
            >
              <nav
                className="g-nav"
                aria-label={messages.navigation}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest('button')) setNavOpen(false);
                }}
              >
                {nav}
              </nav>
            </Drawer>
          </div>
          {toolbar}
        </div>
        <main className="g-main" id={mainId} tabIndex={-1}>
          {viewKey ? (
            <div key={viewKey} className="g-page-content">
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
export function PreviewStage({
  children,
  label = 'Component preview',
  showcase = false,
}: {
  children: ReactNode;
  label?: string;
  showcase?: boolean;
}) {
  return (
    <section className="g-preview-stage" aria-label={label} data-showcase={showcase}>
      {children}
    </section>
  );
}
export function PreviewComposition({ children }: { children: ReactNode }) {
  return <div className="g-preview-composition">{children}</div>;
}
export function PresetOption({
  name,
  description,
  selected,
  onClick,
  preset,
  mode = 'light',
}: {
  name: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  preset: Theme['preset'];
  mode?: Theme['mode'];
}) {
  const sample = createTheme(preset, mode);
  return (
    <button className="g-preset-option" aria-pressed={selected} onClick={onClick} type="button">
      <span
        className="g-theme g-preset-art"
        data-preset={preset}
        data-mode={mode}
        style={themeVariables(sample) as CSSProperties}
        aria-hidden="true"
      >
        <span className="g-mini-card">
          <span className="g-mini-heading">
            Studio / 01
            <span className="g-mini-dot" />
          </span>
          <span className="g-mini-input">
            Your workspace
            <Icon name="chevron" />
          </span>
          <span className="g-mini-footer">
            <span className="g-mini-toggle" />
            <span className="g-mini-button">Continue ↗</span>
          </span>
        </span>
      </span>
      <span className="g-preset-label">
        {name}
        {selected && <Icon name="check" />}
      </span>
      <span className="g-hint">{description}</span>
    </button>
  );
}
export function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="g-color-control">
      <label htmlFor={id}>{label}</label>
      <div className="g-color-inputs">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} color`}
        />
        <code>{value.toUpperCase()}</code>
      </div>
    </div>
  );
}
export function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <div className="g-swatch">
      <span style={{ backgroundColor: color }} aria-hidden="true" />
      <Text size="small" weight="strong">
        {label}
      </Text>
      <Text size="small" tone="muted">
        {color.toUpperCase()}
      </Text>
    </div>
  );
}
export function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="g-metric">
      <Text size="eyebrow" tone="muted">
        {label}
      </Text>
      <Heading level={3} size="page">
        {value}
      </Heading>
    </div>
  );
}

export * from './auth';

/** Decorative material study, inheriting the current theme. Contains no semantic content. */
export function ThemeArtwork({ compact = false }: { compact?: boolean }) {
  return (
    <div className="g-theme-artwork" data-compact={compact} aria-hidden="true">
      <div className="g-art-orbit" />
      <div className="g-art-object">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="g-art-baseline">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export {
  Accordion,
  Pagination,
  Stepper,
  Wizard,
  type AccordionItem,
  type StepItem,
  type WizardStep,
} from './workflows';
export * from './data';
export * from './advanced-inputs';
export * from './patterns';

export { ImageRegion, type ImageRegionValue } from './image-region';

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
  if (
    ![palette.background, palette.text].every((value) => /^#[\da-f]{6}$/i.test(value)) ||
    contrast(palette.background, palette.text) < 4.5
  )
    throw new Error('AccentLink requires a valid, readable color pair.');
  return (
    <a
      className="g-accent-link"
      href={href}
      style={
        { '--g-action-fill': palette.background, '--g-action-ink': palette.text } as CSSProperties
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
