import React, { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { DataTable, LocaleProvider, type DataTableSort, type DataTableProps } from '@gregui/react';

const rows = [
  { id: 'z', count: 9 },
  { id: 'a', count: 1 },
  { id: 'm', count: 5 },
];
const base = {
  caption: 'Records',
  rows,
  rowId: (row: (typeof rows)[number]) => row.id,
  columns: [
    { key: 'id', label: 'Name', value: (row: (typeof rows)[number]) => row.id, sortable: true },
  ],
};

it('keeps controlled client state until its owner updates it and resets the page on sort', async () => {
  const user = userEvent.setup();
  const onPageChange = vi.fn(),
    onSortChange = vi.fn();
  const { rerender } = render(
    <DataTable
      {...base}
      pageSize={1}
      page={2}
      onPageChange={onPageChange}
      sort={null}
      onSortChange={onSortChange}
    />,
  );
  expect(screen.getByRole('rowheader')).toHaveTextContent('a');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(onPageChange).toHaveBeenLastCalledWith(3);
  expect(screen.getByRole('rowheader')).toHaveTextContent('a');
  screen.getByRole('button', { name: 'Name' }).focus();
  await user.keyboard('{Enter}');
  expect(onSortChange).toHaveBeenCalledWith({ key: 'id', descending: false });
  expect(onPageChange).toHaveBeenLastCalledWith(1);
  rerender(
    <DataTable
      {...base}
      pageSize={1}
      page={1}
      onPageChange={onPageChange}
      sort={{ key: 'id', descending: true }}
      onSortChange={onSortChange}
    />,
  );
  expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute(
    'aria-sort',
    'descending',
  );
  expect(screen.getByRole('rowheader')).toHaveTextContent('z');
});

it('renders server page rows verbatim and emits page and sort requests', async () => {
  const user = userEvent.setup();
  const onPageChange = vi.fn(),
    onSortChange = vi.fn();
  render(
    <DataTable
      {...base}
      mode="server"
      totalRows={30}
      pageSize={2}
      page={3}
      onPageChange={onPageChange}
      sort={{ key: 'id', descending: false }}
      onSortChange={onSortChange}
    />,
  );
  expect(screen.getAllByRole('rowheader').map((node) => node.textContent)).toEqual(['z', 'a', 'm']);
  expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(onPageChange).toHaveBeenLastCalledWith(4);
  await user.click(screen.getByRole('button', { name: 'Name' }));
  expect(onSortChange).toHaveBeenCalledWith({ key: 'id', descending: true });
  expect(onPageChange).toHaveBeenLastCalledWith(1);
});

it('announces translated loading and error feedback without a false empty state, and locks stale selection', async () => {
  const user = userEvent.setup();
  const onRetry = vi.fn(),
    onSelectionChange = vi.fn();
  function View({ loading, error }: { loading?: boolean; error?: string }) {
    return (
      <LocaleProvider messages={{ loading: 'Betöltés', retry: 'Újra' }}>
        <DataTable {...base} rows={[]} loading={loading} error={error} onRetry={onRetry} />
      </LocaleProvider>
    );
  }
  const { rerender } = render(<View loading error="Failed" />);
  expect(screen.getByRole('region', { name: 'Records' })).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByRole('status')).toHaveTextContent('Betöltés');
  expect(screen.queryByText('No results found.')).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  rerender(<View error="Failed" />);
  expect(screen.getByRole('alert')).toHaveTextContent('Failed');
  await user.click(screen.getByRole('button', { name: 'Újra' }));
  expect(onRetry).toHaveBeenCalledOnce();
  expect(screen.queryByText('No results found.')).not.toBeInTheDocument();
  rerender(
    <DataTable
      {...base}
      pageSize={1}
      loading
      selectedIds={['z']}
      onSelectionChange={onSelectionChange}
    />,
  );
  expect(screen.getByRole('checkbox')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Name' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  await user.click(screen.getByRole('checkbox'));
  expect(onSelectionChange).not.toHaveBeenCalled();
  rerender(<DataTable {...base} error="Failed" onSelectionChange={onSelectionChange} />);
  expect(screen.getAllByRole('checkbox').every((node) => node.hasAttribute('disabled'))).toBe(true);
});

it('retains off-page selection and active detail context in server mode', async () => {
  const user = userEvent.setup();
  function Host() {
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(['outside']);
    const [sort, setSort] = useState<DataTableSort | null>(null);
    return (
      <DataTable
        {...base}
        mode="server"
        rows={[rows[page - 1]]}
        totalRows={3}
        pageSize={1}
        page={page}
        onPageChange={setPage}
        sort={sort}
        onSortChange={setSort}
        selectedIds={selected}
        onSelectionChange={setSelected}
        activeRowId="z"
      />
    );
  }
  render(<Host />);
  const first = screen.getByRole('rowheader', { name: 'z' }).closest('tr')!;
  expect(first).toHaveAttribute('data-active', 'true');
  expect(within(first).getByRole('checkbox')).not.toBeChecked();
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: 'Previous' }));
  expect(screen.getByRole('checkbox')).toBeChecked();
});

it('clamps render bounds without emitting callbacks and distinguishes empty success from loading', () => {
  const onPageChange = vi.fn();
  const onSortChange = vi.fn();
  const props: DataTableProps<(typeof rows)[number]> = {
    ...base,
    mode: 'server',
    rows: [],
    totalRows: 20,
    pageSize: 5,
    page: 99,
    onPageChange,
    sort: null,
    onSortChange,
  };
  const { rerender } = render(<DataTable {...props} />);
  expect(screen.getByRole('button', { name: 'Page 4' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('No results found.')).toBeVisible();
  rerender(<DataTable {...props} totalRows={0} page={NaN} pageSize={0} />);
  expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  expect(onPageChange).not.toHaveBeenCalled();
});

// Keep invalid partial control contracts from becoming accepted public APIs.
function typeContracts() {
  // @ts-expect-error server mode requires a total and controlled state
  const missingServerState: DataTableProps<(typeof rows)[number]> = { ...base, mode: 'server' };
  // @ts-expect-error controlled client page requires its callback
  const missingPageCallback: DataTableProps<(typeof rows)[number]> = { ...base, page: 2 };
  // @ts-expect-error controlled sort requires its callback
  const missingSortCallback: DataTableProps<(typeof rows)[number]> = { ...base, sort: null };
  return [missingServerState, missingPageCallback, missingSortCallback];
}
void typeContracts;

it('uses provider locale for client sorting with RTL and keeps the sortable header focused', async () => {
  const user = userEvent.setup();
  render(
    <LocaleProvider locale="sv-SE" direction="rtl">
      <DataTable
        {...base}
        rows={[
          { id: 'ä', count: 1 },
          { id: 'z', count: 2 },
        ]}
      />
    </LocaleProvider>,
  );
  const button = screen.getByRole('button', { name: 'Name' });
  button.focus();
  await user.keyboard('{Enter}');
  expect(screen.getAllByRole('rowheader').map((node) => node.textContent)).toEqual(['z', 'ä']);
  expect(button).toHaveFocus();
});
