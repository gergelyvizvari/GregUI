'use client';
import { useId, useRef, useState, type ReactNode } from 'react';
import { Button } from './buttons';
import { Badge } from './feedback';
import { Field, Input } from './forms';
import { Icon } from './icons';

/** Controlled disclosure for editing one field in a schema or form builder. */
export function FieldEditorItem({
  name,
  typeLabel,
  summary,
  optionalLabel,
  expanded,
  onExpandedChange,
  editLabel,
  closeLabel,
  nameField,
  typeField,
  hint,
  children,
  footer,
}: {
  name: string;
  typeLabel: string;
  summary?: ReactNode;
  optionalLabel?: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  editLabel: string;
  closeLabel: string;
  nameField: ReactNode;
  typeField: ReactNode;
  hint?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const id = useId();
  return (
    <section className="g-field-editor-item" aria-labelledby={`${id}-name`}>
      <div className="g-field-editor-header">
        <div className="g-field-editor-overview">
          <div className="g-field-editor-title">
            <span id={`${id}-name`} className="g-field-editor-name">
              {name}
            </span>
            <Badge>{typeLabel}</Badge>
            {optionalLabel && <span className="g-hint">{optionalLabel}</span>}
          </div>
          {summary && <div className="g-field-editor-summary">{summary}</div>}
        </div>
        <Button
          size="small"
          variant="ghost"
          aria-label={`${expanded ? closeLabel : editLabel} ${name}`}
          aria-expanded={expanded}
          aria-controls={`${id}-body`}
          onClick={() => onExpandedChange(!expanded)}
        >
          <span aria-hidden="true" className="g-disclosure-mark" data-expanded={expanded} />
        </Button>
      </div>
      <div id={`${id}-body`} hidden={!expanded}>
        {expanded && (
          <div className="g-field-editor-body">
            <div className="g-field-editor-controls">
              {nameField}
              {typeField}
            </div>
            {hint && <div className="g-hint">{hint}</div>}
            {children}
            {footer && <div className="g-field-editor-footer">{footer}</div>}
          </div>
        )}
      </div>
    </section>
  );
}

/** Tokens and their removal controls stay within one wrapping pill. */
export function TagInput({
  label,
  inputLabel,
  addLabel,
  removeLabel,
  value,
  onChange,
  disabled = false,
  size = 'medium',
}: {
  label: string;
  inputLabel: string;
  addLabel: string;
  removeLabel: (value: string) => string;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [draft, setDraft] = useState('');
  const trimmed = draft.trim();
  const canAdd = !!trimmed && !value.includes(trimmed) && !disabled;
  const add = () => {
    if (!canAdd) return;
    onChange([...value, trimmed]);
    setDraft('');
    input.current?.focus();
  };
  return (
    <div className="g-tag-input" data-size={size} role="group" aria-labelledby={id}>
      <span id={id} className="g-label">
        {label}
      </span>
      {value.length > 0 && (
        <ul className="g-tag-input-list" aria-labelledby={id}>
          {value.map((tag, index) => (
            <li key={tag} className="g-tag-input-token">
              <span>{tag}</span>
              <button
                ref={(node) => {
                  buttons.current[index] = node;
                }}
                type="button"
                disabled={disabled}
                aria-label={removeLabel(tag)}
                onClick={() => {
                  // Move focus before the removed token unmounts.
                  const next = buttons.current[index + 1] ?? buttons.current[index - 1];
                  if (next) next.focus();
                  else input.current?.focus();
                  onChange(value.filter((_, i) => i !== index));
                }}
              >
                <Icon name="close" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="g-tag-input-entry">
        <Field label={inputLabel}>
          {(props) => (
            <Input
              {...props}
              ref={input}
              value={draft}
              disabled={disabled}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  add();
                }
              }}
            />
          )}
        </Field>
        <Button variant="secondary" disabled={!canAdd} onClick={add}>
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
