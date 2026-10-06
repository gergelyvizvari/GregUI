'use client';
import { useRef, useState, type ReactNode, type KeyboardEvent } from 'react';
import { useLocale } from '@gregui/localization';
import { Button, Checkbox, Field, Input, Pagination, Select, Stack, Text } from './index';

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}
export function TreeView({
  nodes,
  label,
  selectedId,
  onSelect,
  defaultExpanded = [],
}: {
  nodes: TreeNode[];
  label: string;
  selectedId?: string;
  onSelect?: (id: string) => void;
  defaultExpanded?: string[];
}) {
  const { direction } = useLocale();
  const [expanded, setExpanded] = useState(() => new Set(defaultExpanded));
  const [focused, setFocused] = useState(nodes[0]?.id ?? '');
  const root = useRef<HTMLUListElement>(null);
  const visible: { node: TreeNode; parent?: string }[] = [];
  const visit = (items: TreeNode[], parent?: string) =>
    items.forEach((node) => {
      visible.push({ node, parent });
      if (expanded.has(node.id)) visit(node.children ?? [], node.id);
    });
  visit(nodes);
  const focusId = visible.some((item) => item.node.id === focused) ? focused : visible[0]?.node.id;
  function focus(id: string) {
    setFocused(id);
    const target = Array.from(
      root.current?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? [],
    ).find((el) => el.dataset.node === id);
    target?.focus();
  }
  function toggle(id: string, open: boolean) {
    setExpanded((old) => {
      const next = new Set(old);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }
  function key(event: KeyboardEvent, node: TreeNode) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const index = visible.findIndex((item) => item.node.id === node.id);
    const forward = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backward = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (
      ['ArrowDown', 'ArrowUp', 'Home', 'End', forward, backward, 'Enter', ' '].includes(event.key)
    )
      event.preventDefault();
    if (event.key === 'ArrowDown') focus(visible[Math.min(visible.length - 1, index + 1)].node.id);
    else if (event.key === 'ArrowUp') focus(visible[Math.max(0, index - 1)].node.id);
    else if (event.key === 'Home') focus(visible[0].node.id);
    else if (event.key === 'End') focus(visible[visible.length - 1].node.id);
    else if (event.key === forward && node.children?.length) {
      if (!expanded.has(node.id)) toggle(node.id, true);
      else focus(node.children[0].id);
    } else if (event.key === backward) {
      if (expanded.has(node.id)) toggle(node.id, false);
      else if (visible[index].parent) focus(visible[index].parent!);
    } else if (event.key === 'Enter' || event.key === ' ') onSelect?.(node.id);
    else if (event.key.length === 1) {
      const after = [...visible.slice(index + 1), ...visible.slice(0, index + 1)];
      const match = after.find((item) =>
        item.node.label.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()),
      );
      if (match) focus(match.node.id);
    }
  }
  const render = (items: TreeNode[]): ReactNode =>
    items.map((node) => (
      <li
        key={node.id}
        role="treeitem"
        data-node={node.id}
        tabIndex={focusId === node.id ? 0 : -1}
        aria-label={node.label}
        aria-expanded={node.children?.length ? expanded.has(node.id) : undefined}
        aria-selected={onSelect ? selectedId === node.id : undefined}
        onFocus={(event) => {
          event.stopPropagation();
          setFocused(node.id);
        }}
        onKeyDown={(event) => {
          event.stopPropagation();
          key(event, node);
        }}
      >
        <div
          className="g-tree-item"
          onClick={() => {
            focus(node.id);
            onSelect?.(node.id);
            if (node.children?.length) toggle(node.id, !expanded.has(node.id));
          }}
        >
          <span aria-hidden="true" className="g-tree-marker">
            {node.children?.length ? (expanded.has(node.id) ? '−' : '+') : '·'}
          </span>
          {node.label}
        </div>
        {node.children?.length && expanded.has(node.id) ? (
          <ul role="group">{render(node.children)}</ul>
        ) : null}
      </li>
    ));
  return (
    <ul ref={root} role="tree" aria-label={label} className="g-tree">
      {render(nodes)}
    </ul>
  );
}

export interface TimelineItem {
  id: string;
  title: string;
  dateTime: string;
  dateLabel: string;
  content?: ReactNode;
  status?: 'complete' | 'current' | 'upcoming';
}
export function Timeline({
  items,
  label,
  orientation = 'vertical',
}: {
  items: TimelineItem[];
  label: string;
  orientation?: 'vertical' | 'horizontal';
}) {
  return (
    <ol className="g-timeline" aria-label={label} data-orientation={orientation}>
      {items.map((item) => (
        <li
          key={item.id}
          data-status={item.status ?? 'complete'}
          aria-current={item.status === 'current' ? 'step' : undefined}
        >
          <span className="g-timeline-dot" aria-hidden="true" />
          <div>
            <time dateTime={item.dateTime}>{item.dateLabel}</time>
            <p className="g-timeline-title">{item.title}</p>
            {item.content}
          </div>
        </li>
      ))}
    </ol>
  );
}

export interface DataColumn<T> {
  key: string;
  label: string;
  value: (row: T) => string | number;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: 'compact';
}
export function DataTable<T>({
  caption,
  columns,
  rows,
  rowId,
  pageSize = 5,
  selectedIds,
  activeRowId,
  onSelectionChange,
  emptyLabel,
}: {
  caption: string;
  columns: DataColumn<T>[];
  rows: T[];
  rowId: (row: T) => string;
  pageSize?: number;
  selectedIds?: string[];
  activeRowId?: string;
  onSelectionChange?: (ids: string[]) => void;
  emptyLabel?: string;
}) {
  const { messages, locale } = useLocale();
  const [sort, setSort] = useState<{ key: string; descending: boolean }>();
  const [page, setPage] = useState(1);
  const count = Math.max(1, Math.floor(Number.isFinite(pageSize) ? pageSize : 5));
  const column = columns.find((c) => c.key === sort?.key);
  const ordered = column
    ? [...rows].sort((a, b) => {
        const av = column.value(a),
          bv = column.value(b);
        return (
          (typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv), locale, { numeric: true })) *
          (sort?.descending ? -1 : 1)
        );
      })
    : rows;
  const pages = Math.max(1, Math.ceil(rows.length / count));
  const current = Math.min(page, pages);
  const shown = ordered.slice((current - 1) * count, current * count);
  return (
    <Stack>
      <div className="g-table-scroll" tabIndex={0} role="region" aria-label={caption}>
        <table className="g-table g-data-table">
          <caption>{caption}</caption>
          <thead>
            <tr>
              {onSelectionChange && <th scope="col">{messages.selection}</th>}
              {columns.map((c) => (
                <th
                  key={c.key}
                  data-width={c.width}
                  scope="col"
                  aria-sort={
                    sort?.key === c.key
                      ? sort.descending
                        ? 'descending'
                        : 'ascending'
                      : c.sortable
                        ? 'none'
                        : undefined
                  }
                >
                  {c.sortable ? (
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => {
                        setSort({
                          key: c.key,
                          descending: sort?.key === c.key ? !sort.descending : false,
                        });
                        setPage(1);
                      }}
                    >
                      {c.label}{' '}
                      <span aria-hidden="true">
                        {sort?.key === c.key ? (sort.descending ? '↓' : '↑') : '↕'}
                      </span>
                    </Button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr
                key={rowId(row)}
                data-active={activeRowId === rowId(row) || undefined}
                data-selected={selectedIds?.includes(rowId(row)) ?? false}
              >
                {onSelectionChange && (
                  <td>
                    <Checkbox
                      hideLabel
                      label={`${messages.selectRow} ${String(columns[0]?.value(row) ?? rowId(row))}`}
                      checked={selectedIds?.includes(rowId(row)) ?? false}
                      onChange={(e) =>
                        onSelectionChange(
                          e.target.checked
                            ? [...new Set([...(selectedIds ?? []), rowId(row)])]
                            : (selectedIds ?? []).filter((id) => id !== rowId(row)),
                        )
                      }
                    />
                  </td>
                )}
                {columns.map((c, i) =>
                  i === 0 ? (
                    <th scope="row" key={c.key} data-width={c.width}>
                      {c.render?.(row) ?? c.value(row)}
                    </th>
                  ) : (
                    <td key={c.key} data-width={c.width}>
                      {c.render?.(row) ?? c.value(row)}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <Text>{emptyLabel ?? messages.noResults}</Text>}
      {rows.length > count && (
        <Pagination page={current} pageCount={pages} onPageChange={setPage} />
      )}
    </Stack>
  );
}

export interface FilterDefinition {
  key: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
}
export function SearchFilterBar({
  query,
  onQueryChange,
  filters = [],
  onFilterChange,
  onClear,
  label,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  filters?: FilterDefinition[];
  onFilterChange?: (key: string, value: string) => void;
  onClear: () => void;
  label?: string;
}) {
  const { messages } = useLocale();
  return (
    <div className="g-filter-bar">
      <Field label={label ?? messages.search}>
        {(p) => (
          <Input
            {...p}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        )}
      </Field>
      {filters.map((filter) => (
        <Field key={filter.key} label={filter.label}>
          {(p) => (
            <Select
              {...p}
              value={filter.value}
              onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
      ))}
      <Button variant="ghost" onClick={onClear}>
        {messages.clearFilters}
      </Button>
    </div>
  );
}

export function ListDetail({
  label,
  items,
  selectedId,
  onSelect,
  children,
}: {
  label: string;
  items: { id: string; label: string; description?: string }[];
  selectedId?: string;
  onSelect: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="g-list-detail">
      <nav aria-label={label}>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-current={selectedId === item.id ? 'true' : undefined}
                onClick={() => onSelect(item.id)}
              >
                <strong>
                  {item.label}
                  {selectedId === item.id && <span aria-hidden="true"> ✓</span>}
                </strong>
                {item.description && <span>{item.description}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <section aria-label={items.find((item) => item.id === selectedId)?.label ?? label}>
        {children}
      </section>
    </div>
  );
}
