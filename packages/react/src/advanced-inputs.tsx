'use client';
import { Close as PopoverClose } from '@radix-ui/react-popover';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useLocale } from '@gregui/localization';
import { Button } from './buttons';
import { Alert } from './feedback';
import { Field, Input } from './forms';
import { Icon } from './icons';
import { Inline, Stack } from './layout';
import { Dialog, Popover } from './overlays';
import { Text } from './typography';

export interface Choice {
  value: string;
  label: string;
  disabled?: boolean;
}
type ComboboxQueryControl =
  | { query: string | null; onQueryChange: (query: string | null) => void }
  | { query?: never; onQueryChange?: never };

export type ComboboxProps = {
  label: string;
  options: Choice[];
  value: string;
  onChange: (value: string) => void;
  selectedLabel?: string;
  disabled?: boolean;
  emptyLabel?: string;
  hint?: string;
  error?: string;
  loading?: boolean;
  loadError?: string;
  onRetry?: () => void;
} & (
  | ({ filterMode?: 'local' } & ComboboxQueryControl)
  | { filterMode: 'external'; query: string | null; onQueryChange: (query: string | null) => void }
);

export function Combobox({
  label,
  options,
  value,
  onChange,
  selectedLabel,
  disabled = false,
  emptyLabel,
  hint,
  error,
  filterMode = 'local',
  query: controlledQuery,
  onQueryChange,
  loading = false,
  loadError,
  onRetry,
}: ComboboxProps) {
  const { messages, locale } = useLocale();
  const id = useId();
  const [localQuery, setQuery] = useState<string | null>(null);
  const query = controlledQuery === undefined ? localQuery : controlledQuery;
  const changeQuery = (next: string | null) => {
    if (onQueryChange) onQueryChange(next);
    else setQuery(next);
  };
  const [open, setOpen] = useState(false);
  const expanded = open && !disabled;
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const results =
    filterMode === 'external'
      ? options
      : options.filter((option) =>
          option.label.toLocaleLowerCase(locale).includes((query ?? '').toLocaleLowerCase(locale)),
        );
  const available = loading || loadError ? [] : results;
  const enabled = available.filter((option) => !option.disabled);
  // Only typing or arrow keys make an option active, so Enter on a freshly focused field still submits its form.
  const current =
    enabled.find((option) => option.value === activeValue) ??
    (query !== null ? enabled[0] : undefined);
  const activeId = expanded && current ? `${id}-${options.indexOf(current)}` : undefined;
  const list = useRef<HTMLUListElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    list.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView?.({ block: 'nearest' });
  }, [activeId]);
  const choose = (choice: Choice) => {
    if (disabled || loading || loadError || choice.disabled) return;
    onChange(choice.value);
    changeQuery(null);
    setOpen(false);
  };
  const empty = !loading && !loadError && !results.length;
  return (
    <div
      className="g-combobox"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          changeQuery(null);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && expanded) {
          event.preventDefault();
          event.stopPropagation();
          input.current?.focus();
          setOpen(false);
          changeQuery(null);
        }
      }}
    >
      <Field id={id} label={label} hint={hint} error={error}>
        {(p) => (
          <Input
            {...p}
            ref={input}
            role="combobox"
            autoComplete="off"
            disabled={disabled}
            aria-autocomplete="list"
            aria-expanded={expanded}
            aria-busy={loading}
            aria-controls={expanded ? `${id}-list` : undefined}
            aria-activedescendant={activeId}
            aria-describedby={
              [p['aria-describedby'], expanded && !loading && loadError && `${id}-load-error`]
                .filter(Boolean)
                .join(' ') || undefined
            }
            value={
              query ??
              selectedLabel ??
              options.find((option) => option.value === value)?.label ??
              ''
            }
            onFocus={() => {
              setOpen(true);
              setActiveValue(null);
            }}
            onChange={(e) => {
              changeQuery(e.target.value);
              setOpen(true);
              setActiveValue(null);
            }}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                setOpen(true);
                const index = enabled.findIndex((option) => option.value === current?.value);
                const next = !expanded
                  ? 0
                  : Math.max(
                      0,
                      Math.min(enabled.length - 1, index + (e.key === 'ArrowDown' ? 1 : -1)),
                    );
                setActiveValue(enabled[next]?.value ?? null);
              } else if (expanded && (e.key === 'Home' || e.key === 'End')) {
                e.preventDefault();
                setActiveValue(
                  (e.key === 'Home' ? enabled[0] : enabled[enabled.length - 1])?.value ?? null,
                );
              } else if (e.key === 'Enter' && expanded && current) {
                e.preventDefault();
                choose(current);
              }
            }}
          />
        )}
      </Field>
      <div className="g-choice-list" hidden={!expanded}>
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          aria-busy={loading}
          className="g-choice-options"
        >
          {(expanded ? available : []).map((option) => (
            <li
              key={option.value}
              id={`${id}-${options.indexOf(option)}`}
              role="option"
              aria-selected={value === option.value}
              aria-disabled={option.disabled || undefined}
              data-active={current === option}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(option)}
            >
              {option.label}
              {value === option.value && <span aria-hidden="true"> ✓</span>}
            </li>
          ))}
        </ul>
        <div
          role="status"
          aria-live="polite"
          className={expanded && (loading || empty) ? 'g-combobox-feedback' : 'g-sr-only'}
        >
          {expanded
            ? loading
              ? messages.loading
              : empty
                ? (emptyLabel ?? messages.noResults)
                : ''
            : ''}
        </div>
        {expanded && !loading && loadError && (
          <div className="g-choice-error" id={`${id}-load-error`}>
            <Alert title={loadError} tone="danger" live>
              {onRetry && (
                <Button
                  tabIndex={0}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    input.current?.focus();
                    onRetry();
                  }}
                >
                  {messages.retry}
                </Button>
              )}
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}

export function DateRangePicker({
  start,
  end,
  onChange,
  label,
  min,
  max,
  disabled = false,
}: {
  start: string;
  end: string;
  onChange: (range: { start: string; end: string }) => void;
  label: string;
  min?: string;
  max?: string;
  disabled?: boolean;
}) {
  const { messages } = useLocale();
  const error = !!start && !!end && start > end;
  return (
    <fieldset className="g-fieldset" disabled={disabled}>
      <legend>{label}</legend>
      <Inline>
        <Field label={messages.startDate}>
          {(p) => (
            <Input
              {...p}
              type="date"
              value={start}
              min={min}
              max={end && max ? (end < max ? end : max) : end || max}
              onChange={(e) => onChange({ start: e.target.value, end })}
            />
          )}
        </Field>
        <Field label={messages.endDate} error={error ? messages.dateRangeError : undefined}>
          {(p) => (
            <Input
              {...p}
              type="date"
              value={end}
              min={start && min ? (start > min ? start : min) : start || min}
              max={max}
              onChange={(e) => onChange({ start, end: e.target.value })}
            />
          )}
        </Field>
      </Inline>
    </fieldset>
  );
}

export function FileUpload({
  label,
  onFiles,
  accept,
  multiple = false,
  maxBytes,
  directory = false,
  hint,
  disabled = false,
}: {
  label: string;
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxBytes?: number;
  directory?: boolean;
  hint?: string;
  disabled?: boolean;
}) {
  const { messages } = useLocale();
  const [error, setError] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  function select(files: File[]) {
    const validType = (file: File) =>
      !accept ||
      accept.split(',').some((raw) => {
        const type = raw.trim().toLowerCase();
        return type.startsWith('.')
          ? file.name.toLowerCase().endsWith(type)
          : type.endsWith('/*')
            ? file.type.toLowerCase().startsWith(type.slice(0, -1))
            : file.type.toLowerCase() === type;
      });
    if (
      (!multiple && files.length > 1) ||
      files.some((file) => (maxBytes !== undefined && file.size > maxBytes) || !validType(file))
    ) {
      setError(true);
      if (input.current) input.current.value = '';
      return;
    }
    setError(false);
    setNames(files.map((file) => file.webkitRelativePath || file.name));
    onFiles(files);
  }
  return (
    <div
      className="g-upload"
      data-disabled={disabled}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (!disabled && !directory) select(Array.from(event.dataTransfer.files));
      }}
    >
      <Stack>
        <span className="g-upload-icon" aria-hidden="true">
          <Icon name="upload" />
        </span>
        <Field
          label={label}
          hint={hint ?? (directory ? undefined : messages.dropFiles)}
          error={error ? messages.fileError : undefined}
        >
          {(p) => (
            <Input
              {...p}
              ref={input}
              type="file"
              {...(directory ? { webkitdirectory: '' } : {})}
              accept={accept}
              multiple={multiple}
              disabled={disabled}
              onChange={(event) => select(Array.from(event.target.files ?? []))}
            />
          )}
        </Field>
        {!!names.length && (
          <Stack gap={2}>
            <Text>{names.join(', ')}</Text>
            <Button
              variant="ghost"
              disabled={disabled}
              onClick={() => {
                if (input.current) input.current.value = '';
                setNames([]);
                setError(false);
                onFiles([]);
              }}
            >
              {messages.clearFiles}
            </Button>
          </Stack>
        )}
      </Stack>
    </div>
  );
}

export interface ActionItem {
  id: string;
  label: string;
  onAction: () => void;
  disabled?: boolean;
  danger?: boolean;
}
/**
 * A labelled action popover using ordinary Tab navigation, not menu semantics.
 *
 * @deprecated Use `Menu`, which has ARIA menu semantics (arrow keys, typeahead,
 * Escape), icons, shortcuts, checkbox/radio items and submenus. ActionMenu stays
 * exported and working for existing consumers. Migration:
 *
 * ```tsx
 * // Before
 * <ActionMenu label="Project actions" actions={[{ id: 'open', label: 'Open', onAction: open }]} />
 * // After
 * <Menu
 *   label="Project actions"
 *   trigger={<Button variant="secondary">Project actions</Button>}
 *   items={[{ id: 'open', label: 'Open', onSelect: open }]}
 * />
 * ```
 *
 * `onAction` becomes `onSelect`; `disabled` and `danger` keep their meaning.
 */
export function ActionMenu({ label, actions }: { label: string; actions: ActionItem[] }) {
  return (
    <Popover label={label} trigger={<Button variant="secondary">{label}</Button>}>
      <Stack gap={2}>
        {actions.map((action) => (
          <PopoverClose key={action.id} asChild>
            <Button
              variant={action.danger ? 'danger' : 'ghost'}
              disabled={action.disabled}
              onClick={action.onAction}
            >
              {action.label}
            </Button>
          </PopoverClose>
        ))}
      </Stack>
    </Popover>
  );
}

export function CommandPalette({
  trigger,
  title,
  description,
  commands,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  commands: ActionItem[];
}) {
  const { messages } = useLocale();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const found = commands.filter((command) =>
    command.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  return (
    <Dialog
      trigger={trigger}
      title={title}
      description={description}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setQuery('');
      }}
    >
      <Stack>
        <Field label={messages.search}>
          {(p) => (
            <Input {...p} type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
          )}
        </Field>
        {found.map((command) => (
          <Button
            key={command.id}
            variant="ghost"
            disabled={command.disabled}
            onClick={() => {
              setOpen(false);
              command.onAction();
            }}
          >
            {command.label}
          </Button>
        ))}
        {!found.length && <Text>{messages.noResults}</Text>}
      </Stack>
    </Dialog>
  );
}
