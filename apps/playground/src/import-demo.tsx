import { useMemo, useState } from 'react';
import {
  ImportColumnMapping,
  ImportPreview,
  Stack,
  Text,
  applyImportMapping,
  missingImportFields,
  suggestImportMapping,
  type ImportField,
  type ImportMapping,
  type ImportRowIssue,
} from '@gregui/react';

const fields: ImportField[] = [
  { id: 'name', label: 'Name', required: true, aliases: ['full name'] },
  { id: 'email', label: 'Email', required: true, aliases: ['e-mail'] },
  { id: 'birthday', label: 'Birthday', aliases: ['born', 'date of birth'] },
];
// Demo data stands in for a file the application has already parsed.
const columns = ['Full name', 'E-mail', 'Born', 'Team'];
const parsed = [
  ['Anna Kovács', 'anna@example.com', '1990-03-12', 'Sales'],
  ['Ben Hall', 'ben.example.com', '1985-07-01', 'Support'],
  ['', 'csilla@example.com', '12/31/1992', 'Sales'],
  ['Dan Price', 'dan@example.com', '', 'Finance'],
];
function validate(values: Record<string, string>): ImportRowIssue[] {
  const issues: ImportRowIssue[] = [];
  if (!values.name?.trim()) issues.push({ field: 'name', message: 'Enter a name.' });
  if (!/^[^@\s]+@[^@\s]+$/.test(values.email ?? ''))
    issues.push({ field: 'email', message: 'Enter an email like name@example.com.' });
  if (values.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(values.birthday))
    issues.push({ field: 'birthday', message: 'Use YYYY-MM-DD.' });
  return issues;
}

export function DataImportDemo() {
  const [mapping, setMapping] = useState<ImportMapping>(() =>
    suggestImportMapping(columns, fields),
  );
  const [edits, setEdits] = useState<Record<string, Record<string, string>>>({});
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const rows = useMemo(
    () =>
      applyImportMapping(parsed, columns, mapping).map((mapped, index) => {
        const id = `row-${index}`;
        const values = { ...mapped, ...edits[id] };
        return { id, line: index + 2, values, issues: validate(values), skipped: skipped.has(id) };
      }),
    [mapping, edits, skipped],
  );
  const ready = missingImportFields(fields, mapping).length === 0;
  return (
    <Stack gap={5}>
      <ImportColumnMapping
        label="Match the columns in contacts.csv"
        columns={columns}
        fields={fields}
        value={mapping}
        onChange={setMapping}
        samples={Object.fromEntries(
          columns.map((column, index) => [column, parsed.map((row) => row[index] ?? '')]),
        )}
      />
      {ready && (
        <ImportPreview
          label="Contacts to import"
          fields={fields.filter((field) => Object.values(mapping).includes(field.id))}
          rows={rows}
          onSkipChange={(ids, skip) =>
            setSkipped((current) => {
              const next = new Set(current);
              for (const id of ids) {
                if (skip) next.add(id);
                else next.delete(id);
              }
              return next;
            })
          }
          onValueChange={(id, field, value) =>
            setEdits((current) => ({ ...current, [id]: { ...current[id], [field]: value } }))
          }
        />
      )}
      <Text size="small" tone="muted">
        Demo data only; parsing, validation rules and importing belong to the application.
      </Text>
    </Stack>
  );
}
