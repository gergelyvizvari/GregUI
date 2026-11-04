import React, { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  ImportColumnMapping,
  ImportPreview,
  LocaleProvider,
  applyImportMapping,
  missingImportFields,
  suggestImportMapping,
  type ImportField,
  type ImportMapping,
  type ImportPreviewRow,
} from '@gregui/react';

const fields: ImportField[] = [
  { id: 'name', label: 'Name', required: true },
  { id: 'email', label: 'Email', required: true, aliases: ['e-mail', 'mail'] },
  { id: 'birthday', label: 'Birthday' },
];

describe('import helpers', () => {
  it('suggests a mapping ignoring case, accents and punctuation, using each field once', () => {
    expect(
      suggestImportMapping(
        ['NAME', 'E-Mail', 'Mail', 'Születésnap', 'Notes'],
        [...fields, { id: 'szuletesnap', label: 'Születésnap' }],
      ),
    ).toEqual({
      NAME: 'name',
      'E-Mail': 'email',
      Mail: null,
      Születésnap: 'szuletesnap',
      Notes: null,
    });
  });

  it('applies a mapping to parsed rows and lists missing required fields', () => {
    const mapping: ImportMapping = { A: 'name', B: null, C: 'email' };
    expect(
      applyImportMapping([['Ada', 'x', 'ada@example.com'], ['Bo']], ['A', 'B', 'C'], mapping),
    ).toEqual([
      { name: 'Ada', email: 'ada@example.com' },
      { name: 'Bo', email: '' },
    ]);
    expect(missingImportFields(fields, { A: 'name' }).map((field) => field.id)).toEqual(['email']);
  });
});

function Mapping() {
  const columns = ['Full name', 'Mail', 'Notes'];
  const [value, setValue] = useState<ImportMapping>(suggestImportMapping(columns, fields));
  return (
    <ImportColumnMapping
      label="Match the columns in contacts.csv"
      columns={columns}
      fields={fields}
      value={value}
      onChange={setValue}
      samples={{ 'Full name': ['Ada Lovelace', 'Bo Lee'], Mail: ['ada@example.com'], Notes: [] }}
    />
  );
}

describe('ImportColumnMapping', () => {
  it('labels each choice by its column, shows samples and warns about missing fields', async () => {
    render(<Mapping />);
    expect(
      screen.getByRole('region', { name: 'Match the columns in contacts.csv' }),
    ).toBeInTheDocument();
    const name = screen.getByRole('combobox', { name: 'Full name' });
    expect(name).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Mail' })).toHaveValue('email');
    expect(screen.getByText('Ada Lovelace, Bo Lee')).toBeInTheDocument();
    expect(screen.getByText('Choose a column for: Name')).toBeInTheDocument();
    await userEvent.selectOptions(name, 'name');
    expect(screen.queryByText(/Choose a column for/)).toBeNull();
  });

  it('marks a field chosen for two columns', async () => {
    render(<Mapping />);
    const notes = screen.getByRole('combobox', { name: 'Notes' });
    await userEvent.selectOptions(notes, 'email');
    expect(notes).toHaveAttribute('aria-invalid', 'true');
    expect(notes).toHaveAccessibleDescription('Also chosen for Mail');
    expect(screen.getByRole('combobox', { name: 'Mail' })).not.toHaveAttribute('aria-invalid');
  });
});

const validate = (values: Record<string, string>) =>
  values.email?.includes('@') ? [] : [{ field: 'email', message: 'Enter a valid email.' }];

function Preview({ pageSize, start }: { pageSize?: number; start?: ImportPreviewRow[] }) {
  const [rows, setRows] = useState<ImportPreviewRow[]>(
    start ??
      [
        { name: 'Ada', email: 'ada@example.com' },
        { name: 'Bo', email: 'bo-at-example' },
        { name: 'Cy', email: '' },
      ].map((values, index) => ({
        id: `r${index}`,
        line: index + 2,
        values,
        issues: validate(values),
      })),
  );
  return (
    <ImportPreview
      label="Contacts to import"
      fields={fields}
      rows={rows}
      pageSize={pageSize}
      onSkipChange={(ids, skipped) =>
        setRows((list) => list.map((row) => (ids.includes(row.id) ? { ...row, skipped } : row)))
      }
      onValueChange={(id, field, value) =>
        setRows((list) =>
          list.map((row) => {
            if (row.id !== id) return row;
            const values = { ...row.values, [field]: value };
            return { ...row, values, issues: validate(values) };
          }),
        )
      }
    />
  );
}

describe('ImportPreview', () => {
  it('counts rows and shows each problem next to its cell', () => {
    render(<Preview />);
    expect(screen.getByText('1 ready, 2 with problems, 0 skipped')).toBeInTheDocument();
    const input = screen.getByRole('textbox', { name: 'Email, row 3' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a valid email.');
    expect(input).toHaveValue('bo-at-example');
    expect(screen.getByRole('rowheader', { name: '2' })).toBeInTheDocument();
  });

  it('fixes a value inline and the row becomes ready', async () => {
    render(<Preview />);
    const input = screen.getByRole('textbox', { name: 'Email, row 3' });
    await userEvent.clear(input);
    await userEvent.type(input, 'bo@example.com{Enter}');
    expect(screen.queryByRole('textbox', { name: 'Email, row 3' })).toBeNull();
    expect(screen.getByText('2 ready, 1 with problems, 0 skipped')).toBeInTheDocument();
  });

  it('filters to rows with problems and skips them one by one or all at once', async () => {
    render(<Preview />);
    await userEvent.click(screen.getByRole('radio', { name: 'Rows with problems' }));
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Skip row 3' }));
    expect(screen.getByText('1 ready, 1 with problems, 1 skipped')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Skip all rows with problems' }));
    expect(screen.getByText('1 ready, 0 with problems, 2 skipped')).toBeInTheDocument();
    expect(screen.getByText('No rows have problems.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip all rows with problems' })).toBeDisabled();
    await userEvent.click(screen.getByRole('radio', { name: 'All rows' }));
    expect(screen.getByRole('checkbox', { name: 'Skip row 4' })).toBeChecked();
  });

  it('pages long files', async () => {
    const start = Array.from({ length: 12 }, (_, index) => ({
      id: `r${index}`,
      values: { name: `Person ${index + 1}`, email: `p${index}@example.com` },
    }));
    render(<Preview start={start} pageSize={5} />);
    expect(screen.getByText('Person 5')).toBeInTheDocument();
    expect(screen.queryByText('Person 6')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /^Next/ }));
    expect(screen.getByText('Person 6')).toBeInTheDocument();
  });

  it('is translated', () => {
    render(
      <LocaleProvider locale="hu-HU">
        <Preview />
      </LocaleProvider>,
    );
    expect(screen.getByText('1 kész, 2 hibás, 0 kihagyva')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '3. sor kihagyása' })).toBeInTheDocument();
  });
});
