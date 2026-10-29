'use client';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
  type CSSProperties,
} from 'react';
import { useLocale } from '@gregui/localization';
import { Alert, Button, Checkbox, Field, Input, Pagination, Select, Stack, Text } from './index';

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
export interface DataTableSort {
  key: string;
  descending: boolean;
}

type PageControl =
  { page: number; onPageChange: (page: number) => void } | { page?: never; onPageChange?: never };
type SortControl =
  | { sort: DataTableSort | null; onSortChange: (sort: DataTableSort) => void }
  | { sort?: never; onSortChange?: never };

export type DataTableProps<T> = {
  caption: string;
  columns: DataColumn<T>[];
  rows: T[];
  rowId: (row: T) => string;
  pageSize?: number;
  selectedIds?: string[];
  activeRowId?: string;
  onSelectionChange?: (ids: string[]) => void;
  emptyLabel?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
} & (
  | ({ mode?: 'client'; totalRows?: never } & PageControl & SortControl)
  | {
      mode: 'server';
      totalRows: number;
      page: number;
      onPageChange: (page: number) => void;
      sort: DataTableSort | null;
      onSortChange: (sort: DataTableSort) => void;
    }
);

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
  mode = 'client',
  totalRows,
  page: controlledPage,
  onPageChange,
  sort: controlledSort,
  onSortChange,
  loading = false,
  error,
  onRetry,
}: DataTableProps<T>) {
  const { messages, locale } = useLocale();
  const [localSort, setSort] = useState<DataTableSort | null>(null);
  const [localPage, setPage] = useState(1);
  const sort = controlledSort === undefined ? localSort : controlledSort;
  const page = controlledPage ?? localPage;
  const changePage = (next: number) => {
    if (onPageChange) onPageChange(next);
    else setPage(next);
  };
  const count = Math.max(1, Math.floor(Number.isFinite(pageSize) ? pageSize : 5));
  const column = columns.find((c) => c.key === sort?.key && c.sortable);
  const ordered =
    mode === 'client' && column
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
  const total =
    mode === 'server'
      ? Math.max(0, Number.isFinite(totalRows) ? (totalRows ?? 0) : 0)
      : rows.length;
  const pages = Math.max(1, Math.ceil(total / count));
  const current = Math.min(pages, Math.max(1, Math.floor(Number.isFinite(page) ? page : 1)));
  const shown = mode === 'server' ? rows : ordered.slice((current - 1) * count, current * count);
  return (
    <Stack>
      <div
        className="g-table-scroll"
        tabIndex={0}
        role="region"
        aria-label={caption}
        aria-busy={loading}
      >
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
                      disabled={loading}
                      onClick={() => {
                        const next = {
                          key: c.key,
                          descending: sort?.key === c.key ? !sort.descending : false,
                        };
                        if (onSortChange) onSortChange(next);
                        else setSort(next);
                        changePage(1);
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
                      disabled={loading || !!error}
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
                      {c.render ? c.render(row) : c.value(row)}
                    </th>
                  ) : (
                    <td key={c.key} data-width={c.width}>
                      {c.render ? c.render(row) : c.value(row)}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div role="status" aria-live="polite" className={loading ? 'g-status' : 'g-sr-only'}>
        {loading ? messages.loading : ''}
      </div>
      {!loading && error && (
        <Alert title={error} tone="danger" live>
          {onRetry && <Button onClick={onRetry}>{messages.retry}</Button>}
        </Alert>
      )}
      {!loading && !error && !shown.length && <Text>{emptyLabel ?? messages.noResults}</Text>}
      {pages > 1 && (
        <Pagination page={current} pageCount={pages} onPageChange={changePage} disabled={loading} />
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
  stickyNavigation = false,
  collapsibleGroups = false,
  expandedGroups,
  onExpandedGroupsChange,
  groupHeadingLevel = 2,
}: {
  label: string;
  items: { id: string; label: string; description?: string; group?: string }[];
  selectedId?: string;
  onSelect: (id: string) => void;
  children: ReactNode;
  stickyNavigation?: boolean;
  collapsibleGroups?: boolean;
  expandedGroups?: readonly string[];
  onExpandedGroupsChange?: (groups: string[]) => void;
  /** Heading level for group titles, so the outline fits where the list sits. */
  groupHeadingLevel?: 2 | 3 | 4 | 5 | 6;
}) {
  const GroupHeading = `h${groupHeadingLevel}` as const;
  const navigation = useRef<HTMLElement>(null);
  const groupId = useId();
  const [localExpandedGroups, setLocalExpandedGroups] = useState<Set<string>>(() => new Set());
  const openGroups = expandedGroups === undefined ? localExpandedGroups : new Set(expandedGroups);
  const selectedGroup = items.find((item) => item.id === selectedId)?.group;
  const [availableHeight, setAvailableHeight] = useState<number>();
  useEffect(() => {
    if (!stickyNavigation || !navigation.current) return;
    const element = navigation.current;
    let frame = 0;
    const measure = () => {
      frame = 0;
      setAvailableHeight(
        Math.max(96, window.innerHeight - Math.max(16, element.getBoundingClientRect().top) - 16),
      );
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : undefined;
    observer?.observe(element);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
    };
  }, [stickyNavigation]);
  useEffect(() => {
    if (!stickyNavigation || !navigation.current) return;
    const current = navigation.current.querySelector<HTMLElement>('[aria-current="true"]');
    if (!current) return;
    const pane = navigation.current.getBoundingClientRect();
    const item = current.getBoundingClientRect();
    const visibleBottom = Math.min(pane.bottom, window.innerHeight);
    if (item.top < pane.top) navigation.current.scrollTop -= pane.top - item.top;
    else if (item.bottom > visibleBottom)
      navigation.current.scrollTop += item.bottom - visibleBottom;
  }, [selectedId, stickyNavigation, availableHeight, items.length]);
  const renderItem = (item: (typeof items)[number]) => (
    <li className="g-list-detail-item" key={item.id}>
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
  );
  const groups = new Map<string | undefined, typeof items>();
  for (const item of items) groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
  return (
    <div className="g-list-detail" data-sticky-navigation={stickyNavigation || undefined}>
      <nav
        ref={navigation}
        aria-label={label}
        style={
          availableHeight === undefined
            ? undefined
            : ({ '--g-list-nav-available': `${availableHeight}px` } as CSSProperties)
        }
      >
        <ul>
          {[...groups].map(([group, entries], index) => {
            if (group === undefined) return entries.map(renderItem);
            const selected = selectedGroup === group;
            const open = !collapsibleGroups || selected || openGroups.has(group);
            const panelId = `${groupId}-group-${index}`;
            return (
              <li className="g-list-detail-group" key={group}>
                <GroupHeading>
                  {collapsibleGroups ? (
                    <button
                      className="g-list-detail-group-toggle"
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      aria-disabled={selected || undefined}
                      onClick={() => {
                        if (selected) return;
                        const next = new Set(openGroups);
                        if (next.has(group)) next.delete(group);
                        else next.add(group);
                        if (expandedGroups === undefined) setLocalExpandedGroups(next);
                        onExpandedGroupsChange?.([...next]);
                      }}
                    >
                      {group}
                      <span aria-hidden="true">{open ? '−' : '+'}</span>
                    </button>
                  ) : (
                    group
                  )}
                </GroupHeading>
                <ul id={panelId} aria-label={group} hidden={!open}>
                  {entries.map(renderItem)}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>
      <section aria-label={items.find((item) => item.id === selectedId)?.label ?? label}>
        {children}
      </section>
    </div>
  );
}
