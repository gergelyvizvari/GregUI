'use client';
import { Close as PopoverClose } from '@radix-ui/react-popover';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useLocale } from '@gregui/localization';
import { Button, Dialog, Field, Inline, Input, Popover, Stack, Text } from './index';

export interface Choice {
  value: string;
  label: string;
  disabled?: boolean;
}
export function Combobox({
  label,
  options,
  value,
  onChange,
  disabled = false,
  emptyLabel,
}: {
  label: string;
  options: Choice[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  emptyLabel?: string;
}) {
  const { messages } = useLocale();
  const id = useId();
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = options.filter((option) =>
    option.label.toLocaleLowerCase().includes((query ?? '').toLocaleLowerCase()),
  );
  const enabled = results.filter((option) => !option.disabled);
  const current = enabled[Math.min(active, enabled.length - 1)];
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    list.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView?.({ block: 'nearest' });
  }, [active, query, open]);
  const choose = (choice: Choice) => {
    onChange(choice.value);
    setQuery(null);
    setOpen(false);
  };
  return (
    <div className="g-combobox">
      <Field label={label}>
        {(p) => (
          <Input
            {...p}
            role="combobox"
            autoComplete="off"
            disabled={disabled}
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={open ? `${id}-list` : undefined}
            aria-activedescendant={
              open && current ? `${id}-${options.indexOf(current)}` : undefined
            }
            value={query ?? options.find((option) => option.value === value)?.label ?? ''}
            onFocus={() => {
              setOpen(true);
              setActive(0);
            }}
            onBlur={() => {
              setOpen(false);
              setQuery(null);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                setOpen(true);
                setActive((a) =>
                  Math.max(0, Math.min(enabled.length - 1, a + (e.key === 'ArrowDown' ? 1 : -1))),
                );
              } else if (open && (e.key === 'Home' || e.key === 'End')) {
                e.preventDefault();
                setActive(e.key === 'Home' ? 0 : Math.max(0, enabled.length - 1));
              } else if (e.key === 'Enter' && open && current) {
                e.preventDefault();
                choose(current);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false);
                setQuery(null);
              }
            }}
          />
        )}
      </Field>
      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          className="g-choice-list"
        >
          {results.map((option) => (
            <li
              key={option.value}
              id={`${id}-${options.indexOf(option)}`}
              role="option"
              aria-selected={value === option.value}
              aria-disabled={option.disabled || undefined}
              data-active={current === option}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (!option.disabled) choose(option);
              }}
            >
              {option.label}
              {value === option.value && <span aria-hidden="true"> ✓</span>}
            </li>
          ))}
          {!results.length && <li role="presentation">{emptyLabel ?? messages.noResults}</li>}
        </ul>
      )}
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
  disabled = false,
}: {
  label: string;
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxBytes?: number;
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
    setNames(files.map((file) => file.name));
    onFiles(files);
  }
  return (
    <div
      className="g-upload"
      data-disabled={disabled}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (!disabled) select(Array.from(event.dataTransfer.files));
      }}
    >
      <Stack>
        <Field
          label={label}
          hint={messages.dropFiles}
          error={error ? messages.fileError : undefined}
        >
          {(p) => (
            <Input
              {...p}
              ref={input}
              type="file"
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
/** A labelled action popover using ordinary Tab navigation, not menu semantics. */
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
