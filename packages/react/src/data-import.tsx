'use client';
import React, { useId, useMemo, useState } from 'react';
import { useFormat, useLocale } from '@gregui/localization';
import { Button } from './buttons';
import { Alert } from './feedback';
import { Checkbox, Input, Select } from './forms';
import { Inline, Stack } from './layout';
import { SegmentedControl } from './segmented-control';
import { Text } from './typography';
import { Pagination } from './workflows';

export interface ImportField {
  id: string;
  label: string;
  required?: boolean;
  /** Other header names that should map to this field, such as "e-mail" for `email`. */
  aliases?: readonly string[];
}
/** Source column name → field id, or null when the column is not imported. */
export type ImportMapping = Record<string, string | null>;

const normalise = (text: string) =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
/**
 * Suggests a mapping by matching headers to field ids, labels and aliases, ignoring case,
 * accents, spaces and punctuation. Each field is used at most once; others map to null.
 */
export function suggestImportMapping(
  columns: readonly string[],
  fields: readonly ImportField[],
): ImportMapping {
  const used = new Set<string>();
  const mapping: ImportMapping = {};
  for (const column of columns) {
    const key = normalise(column);
    const field = fields.find(
      (candidate) =>
        !used.has(candidate.id) &&
        [candidate.id, candidate.label, ...(candidate.aliases ?? [])].some(
          (name) => normalise(name) === key,
        ),
    );
    mapping[column] = field?.id ?? null;
    if (field) used.add(field.id);
  }
  return mapping;
}
/** Turns parsed rows (arrays of cells in `columns` order) into objects keyed by field id. */
export function applyImportMapping(
  rows: readonly (readonly string[])[],
  columns: readonly string[],
  mapping: ImportMapping,
): Record<string, string>[] {
  return rows.map((row) => {
    const values: Record<string, string> = {};
    columns.forEach((column, index) => {
      const field = mapping[column];
      if (field) values[field] = row[index] ?? '';
    });
    return values;
  });
}
/** Required fields that no column maps to. */
export function missingImportFields(
  fields: readonly ImportField[],
  mapping: ImportMapping,
): ImportField[] {
  const mapped = new Set(Object.values(mapping));
  return fields.filter((field) => field.required && !mapped.has(field.id));
}

export interface ImportColumnMappingProps {
  /** Table caption, such as "Match the columns in contacts.csv". */
  label: string;
  /** Header names from the file, in file order. */
  columns: readonly string[];
  fields: readonly ImportField[];
  value: ImportMapping;
  onChange: (value: ImportMapping) => void;
  /** A few values per column, shown to help people recognise it. */
  samples?: Record<string, readonly string[]>;
}

/**
 * Matches the columns of an uploaded file to the application's fields. Controlled; parsing the
 * file and importing stay in the application.
 */
export function ImportColumnMapping({
  label,
  columns,
  fields,
  value,
  onChange,
  samples,
}: ImportColumnMappingProps) {
  const { messages: m } = useLocale();
  const id = useId();
  const missing = missingImportFields(fields, value);
  const firstColumnFor = (field: string) => columns.find((column) => value[column] === field);
  return (
    <Stack gap={4}>
      {missing.length > 0 && (
        <Alert
          tone="warning"
          title={m.importMissing.replace(
            '{fields}',
            missing.map((field) => field.label).join(', '),
          )}
        />
      )}
      <div className="g-table-scroll" tabIndex={0} role="region" aria-label={label}>
        <table className="g-table g-import-mapping">
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">{m.importSourceColumn}</th>
              {samples && <th scope="col">{m.importSample}</th>}
              <th scope="col">{m.importMapsTo}</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((column, index) => {
              const field = value[column] ?? '';
              const first = field ? firstColumnFor(field) : undefined;
              const duplicate = !!field && first !== column;
              const select = `${id}-${index}`;
              return (
                <tr key={column}>
                  <th scope="row" id={`${select}-name`}>
                    {column}
                  </th>
                  {samples && (
                    <td>
                      <Text as="span" size="small" tone="muted">
                        {(samples[column] ?? []).filter(Boolean).slice(0, 3).join(', ')}
                      </Text>
                    </td>
                  )}
                  <td>
                    <div className="g-import-choice">
                      <Select
                        id={select}
                        aria-labelledby={`${select}-name`}
                        aria-invalid={duplicate || undefined}
                        aria-describedby={duplicate ? `${select}-error` : undefined}
                        value={field}
                        onChange={(event) =>
                          onChange({ ...value, [column]: event.target.value || null })
                        }
                      >
                        <option value="">{m.importIgnore}</option>
                        {fields.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.required ? `${option.label} *` : option.label}
                          </option>
                        ))}
                      </Select>
                      {duplicate && (
                        <p id={`${select}-error`} className="g-error">
                          {m.importDuplicate.replace('{column}', first!)}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Stack>
  );
}

export interface ImportRowIssue {
  /** Field id the problem belongs to. */
  field: string;
  message: string;
}
export interface ImportPreviewRow {
  id: string;
  /** Row number in the file, shown to people. Defaults to the position + 1. */
  line?: number;
  /** Values keyed by field id. */
  values: Record<string, string>;
  /** Problems from the application's validation. */
  issues?: readonly ImportRowIssue[];
  skipped?: boolean;
}
export interface ImportPreviewProps {
  label: string;
  /** Fields in column order. */
  fields: readonly ImportField[];
  rows: readonly ImportPreviewRow[];
  /** Skip or include rows. Called with several ids by "Skip all rows with problems". */
  onSkipChange: (ids: string[], skipped: boolean) => void;
  /** Turns cells with problems into inputs; revalidate and pass new `issues` back. */
  onValueChange?: (id: string, field: string, value: string) => void;
  /** Rows per page. Default 50. */
  pageSize?: number;
}

/**
 * The mapped rows before import: counts, a filter for rows with problems, per-cell messages,
 * skipping and optional inline fixes. Controlled; validation and importing stay in the app.
 */
export function ImportPreview({
  label,
  fields,
  rows,
  onSkipChange,
  onValueChange,
  pageSize = 50,
}: ImportPreviewProps) {
  const { messages: m } = useLocale();
  const format = useFormat();
  const id = useId();
  const [filter, setFilter] = useState<'all' | 'problems'>('all');
  const [page, setPage] = useState(1);
  const problems = (row: ImportPreviewRow) => !!row.issues?.length;
  const counts = useMemo(() => {
    let ready = 0;
    let invalid = 0;
    let skipped = 0;
    for (const row of rows) {
      if (row.skipped) skipped += 1;
      else if (problems(row)) invalid += 1;
      else ready += 1;
    }
    return { ready, invalid, skipped };
  }, [rows]);
  const visible =
    filter === 'problems' ? rows.filter((row) => problems(row) && !row.skipped) : rows;
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const current = Math.min(page, pageCount);
  const shown = visible.slice((current - 1) * pageSize, current * pageSize);
  const pending = rows.filter((row) => problems(row) && !row.skipped).map((row) => row.id);
  return (
    <Stack gap={4}>
      <Text weight="strong" id={`${id}-summary`}>
        {m.importSummary
          .replace('{ready}', format.number(counts.ready))
          .replace('{problems}', format.number(counts.invalid))
          .replace('{skipped}', format.number(counts.skipped))}
      </Text>
      <Inline gap={3} justify="between" align="end">
        <SegmentedControl
          label={m.importShow}
          hideLabel
          size="small"
          options={[
            { value: 'all', label: m.importAllRows },
            { value: 'problems', label: m.importProblemRows },
          ]}
          value={filter}
          onValueChange={(next) => {
            setFilter(next as 'all' | 'problems');
            setPage(1);
          }}
        />
        <Button
          variant="secondary"
          size="small"
          disabled={pending.length === 0}
          onClick={() => onSkipChange(pending, true)}
        >
          {m.importSkipInvalid}
        </Button>
      </Inline>
      <div
        className="g-table-scroll"
        tabIndex={0}
        role="region"
        aria-label={label}
        aria-describedby={`${id}-summary`}
      >
        <table className="g-table g-import-preview">
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">{m.importRow}</th>
              {fields.map((field) => (
                <th scope="col" key={field.id}>
                  {field.label}
                </th>
              ))}
              <th scope="col">{m.importSkip}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => {
              const line = row.line ?? rows.indexOf(row) + 1;
              const lineText = format.number(line);
              return (
                <tr
                  key={row.id}
                  data-skipped={row.skipped || undefined}
                  data-invalid={(problems(row) && !row.skipped) || undefined}
                >
                  <th scope="row">{lineText}</th>
                  {fields.map((field) => {
                    // A skipped row keeps its values but no longer asks for fixes.
                    const issues = row.skipped
                      ? []
                      : (row.issues?.filter((issue) => issue.field === field.id) ?? []);
                    const cell = `${id}-${row.id}-${field.id}`;
                    const text = row.values[field.id] ?? '';
                    return (
                      <td key={field.id} data-invalid={issues.length > 0 || undefined}>
                        {issues.length > 0 && onValueChange ? (
                          <Input
                            aria-label={m.importCellLabel
                              .replace('{field}', field.label)
                              .replace('{row}', lineText)}
                            aria-invalid
                            aria-describedby={`${cell}-error`}
                            defaultValue={text}
                            onBlur={(event) => {
                              if (event.target.value !== text)
                                onValueChange(row.id, field.id, event.target.value);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') event.currentTarget.blur();
                            }}
                          />
                        ) : (
                          <span>{text}</span>
                        )}
                        {issues.length > 0 && (
                          <span id={`${cell}-error`} className="g-import-issue">
                            {issues.map((issue) => issue.message).join(' ')}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td>
                    <Checkbox
                      label={m.importSkipRow.replace('{row}', lineText)}
                      hideLabel
                      checked={!!row.skipped}
                      onChange={(event) => onSkipChange([row.id], event.target.checked)}
                    />
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 && (
              <tr>
                <td colSpan={fields.length + 2}>
                  <Text size="small" tone="muted">
                    {filter === 'problems' ? m.importNoProblems : m.importEmpty}
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />}
    </Stack>
  );
}
