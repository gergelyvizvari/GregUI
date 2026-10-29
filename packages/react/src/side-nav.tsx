'use client';
import { useEffect, useId, useMemo, useState, type ReactNode, type SyntheticEvent } from 'react';
import { Icon, renderIcon, type IconSource } from './icons';
import { Menu, type MenuEntry } from './menu';
import { Tooltip } from './overlays';
import { useSidebarCollapsed } from './shell';

export interface SideNavItem {
  id: string;
  label: string;
  /** Give top-level items an icon: the collapsed AppShell rail shows icons only, else an initial. */
  icon?: IconSource;
  /** Leaf destination. Without it the leaf renders as a button. */
  href?: string;
  /** Short trailing content such as a count. Include it in the label if it matters to screen readers. */
  badge?: ReactNode;
  disabled?: boolean;
  /** Child items make this a disclosure that shows and hides them. */
  items?: SideNavItem[];
}
export interface SideNavSection {
  id: string;
  /** Visible section heading; also names the section's list. */
  title?: string;
  items: SideNavItem[];
}
export interface SideNavProps {
  /** Items in a single unlabelled list. Use `sections` for headed groups instead. */
  items?: SideNavItem[];
  sections?: SideNavSection[];
  /** Id of the current page's item. Its ancestors open automatically. */
  value?: string;
  /**
   * Called when a destination is chosen. For `href` items call `event.preventDefault()`
   * to route client-side; otherwise the browser follows the link.
   */
  onNavigate?: (item: SideNavItem, event: SyntheticEvent | Event) => void;
  /** Controlled open disclosure ids. */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  /** Wraps the lists in a `<nav>` landmark. Leave unset inside AppShell, which already provides one. */
  label?: string;
}

function pathTo(items: SideNavItem[], id: string | undefined): string[] {
  if (!id) return [];
  for (const item of items) {
    if (item.id === id) return [id];
    const inner = item.items ? pathTo(item.items, id) : [];
    if (inner.length) return [item.id, ...inner];
  }
  return [];
}

function toMenuEntries(
  items: SideNavItem[],
  value: string | undefined,
  onNavigate: SideNavProps['onNavigate'],
): MenuEntry[] {
  return items.map((item) =>
    item.items
      ? {
          type: 'submenu',
          id: item.id,
          label: item.label,
          icon: item.icon,
          disabled: item.disabled,
          items: toMenuEntries(item.items, value, onNavigate),
        }
      : {
          id: item.id,
          label: item.label,
          current: item.id === value,
          icon: item.icon,
          href: item.href,
          disabled: item.disabled,
          onSelect: (event: Event) => onNavigate?.(item, event),
        },
  );
}

/**
 * Hierarchical application navigation with collapsible groups and headed sections.
 * Inside a collapsible AppShell it becomes an icon rail; groups open as menus there.
 */
export function SideNav({
  items,
  sections,
  value,
  onNavigate,
  expanded,
  defaultExpanded,
  onExpandedChange,
  label,
}: SideNavProps) {
  const rail = useSidebarCollapsed();
  const baseId = useId();
  const groups = useMemo(
    () => sections ?? [{ id: 'items', items: items ?? [] }],
    [sections, items],
  );
  const all = useMemo(() => groups.flatMap((section) => section.items), [groups]);
  const currentPath = pathTo(all, value);
  const [ownExpanded, setOwnExpanded] = useState<string[]>(() => [
    ...(defaultExpanded ?? []),
    ...currentPath.slice(0, -1),
  ]);
  const open = expanded ?? ownExpanded;
  const setOpen = (next: string[]) => {
    if (!expanded) setOwnExpanded(next);
    onExpandedChange?.(next);
  };
  // Reveal a newly selected page that sits inside a closed group.
  const ancestors = currentPath.slice(0, -1).join(' ');
  useEffect(() => {
    if (expanded || !ancestors) return;
    setOwnExpanded((prev) => {
      const missing = ancestors.split(' ').filter((id) => !prev.includes(id));
      return missing.length ? [...prev, ...missing] : prev;
    });
  }, [ancestors, expanded]);

  const renderItem = (item: SideNavItem, depth: number): ReactNode => {
    const current = item.id === value;
    const containsCurrent = !current && currentPath.includes(item.id);
    const content = (
      <>
        {item.icon
          ? renderIcon(item.icon)
          : rail && (
              <span className="g-side-nav-initial" aria-hidden="true">
                {item.label.slice(0, 1)}
              </span>
            )}
        <span className="g-nav-text">{item.label}</span>
        {item.badge != null && <span className="g-side-nav-badge">{item.badge}</span>}
      </>
    );
    if (item.items) {
      if (rail && depth === 0)
        return (
          <li key={item.id}>
            <Menu
              side="right"
              trigger={
                <button
                  type="button"
                  className="g-nav-item"
                  data-contains-current={containsCurrent || undefined}
                  disabled={item.disabled}
                >
                  {content}
                </button>
              }
              items={[
                {
                  type: 'group',
                  id: item.id,
                  label: item.label,
                  items: toMenuEntries(item.items, value, onNavigate),
                },
              ]}
            />
          </li>
        );
      const isOpen = open.includes(item.id);
      const listId = `${baseId}-${item.id}`;
      return (
        <li key={item.id}>
          <button
            type="button"
            className="g-nav-item"
            data-depth={depth}
            data-contains-current={containsCurrent || undefined}
            aria-expanded={isOpen}
            aria-controls={listId}
            disabled={item.disabled}
            onClick={() =>
              setOpen(isOpen ? open.filter((id) => id !== item.id) : [...open, item.id])
            }
          >
            {content}
            <span className="g-side-nav-disclosure">
              <Icon name="chevron" />
            </span>
          </button>
          <ul className="g-side-nav-list" id={listId} hidden={!isOpen}>
            {item.items.map((child) => renderItem(child, depth + 1))}
          </ul>
        </li>
      );
    }
    const shared = {
      className: 'g-nav-item',
      'data-depth': depth,
      'aria-current': current ? ('page' as const) : undefined,
      onClick: (event: SyntheticEvent) => onNavigate?.(item, event),
    };
    const leaf =
      item.href && !item.disabled ? (
        <a {...shared} href={item.href}>
          {content}
        </a>
      ) : item.href ? (
        <a {...shared} aria-disabled="true" onClick={undefined}>
          {content}
        </a>
      ) : (
        <button {...shared} type="button" disabled={item.disabled}>
          {content}
        </button>
      );
    return <li key={item.id}>{rail ? <Tooltip label={item.label}>{leaf}</Tooltip> : leaf}</li>;
  };

  const lists = (
    <div className="g-side-nav" data-rail={rail || undefined}>
      {groups.map((section) => {
        const headingId = `${baseId}-section-${section.id}`;
        return (
          <div className="g-side-nav-section" key={section.id}>
            {section.title && (
              <p className="g-side-nav-heading" id={headingId}>
                {section.title}
              </p>
            )}
            <ul className="g-side-nav-list" aria-labelledby={section.title ? headingId : undefined}>
              {section.items.map((item) => renderItem(item, 0))}
            </ul>
          </div>
        );
      })}
    </div>
  );
  return label ? <nav aria-label={label}>{lists}</nav> : lists;
}
