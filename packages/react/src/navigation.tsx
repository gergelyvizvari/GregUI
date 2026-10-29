'use client';
import { Fragment, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { useLocale } from '@gregui/localization';
import { Icon } from './icons';
import { Link } from './typography';
export interface BreadcrumbItem {
  label: string;
  href?: string;
}
export interface BreadcrumbsProps {
  /** The trail from the root to the current page. The last item is the current page. */
  items: BreadcrumbItem[];
  /** Accessible name for the landmark. Defaults to the localized "Breadcrumb". */
  label?: string;
  /** Collapse middle items behind a "Show full path" button when the trail is longer. */
  maxItems?: number;
  /** Called on link activation. Call `event.preventDefault()` to route client-side. */
  onNavigate?: (item: BreadcrumbItem, event: MouseEvent<HTMLAnchorElement>) => void;
}
export function Breadcrumbs({ items, label, maxItems, onNavigate }: BreadcrumbsProps) {
  const { messages } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const list = useRef<HTMLOListElement>(null);
  const keep = Math.max(2, maxItems ?? items.length);
  const collapsed = !expanded && items.length > keep;
  const shown = collapsed
    ? [0, ...items.map((_, i) => i).slice(items.length - (keep - 1))]
    : items.map((_, i) => i);
  const reveal = () => {
    setExpanded(true);
    // The button disappears: move focus to the first revealed destination.
    requestAnimationFrame(() => list.current?.querySelectorAll('a')[1]?.focus());
  };
  return (
    <nav aria-label={label ?? messages.breadcrumb}>
      <ol className="g-breadcrumbs" ref={list}>
        {shown.map((index, position) => {
          const item = items[index]!;
          const current = index === items.length - 1;
          return (
            <Fragment key={index}>
              <li>
                {current ? (
                  <span aria-current="page">{item.label}</span>
                ) : item.href ? (
                  <Link href={item.href} onClick={(event) => onNavigate?.(item, event)}>
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
                {!current && <Icon name="chevron" />}
              </li>
              {collapsed && position === 0 && (
                <li>
                  <button
                    type="button"
                    className="g-breadcrumbs-more"
                    aria-label={messages.showFullPath}
                    onClick={reveal}
                  >
                    …
                  </button>
                  <Icon name="chevron" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
export function Tabs({
  items,
  label,
  defaultValue,
  value,
  onValueChange,
}: {
  items: { value: string; label: string; content: ReactNode }[];
  label: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const { direction } = useLocale();
  return (
    <TabsPrimitive.Root
      dir={direction}
      className="g-tabs"
      defaultValue={defaultValue ?? items[0]?.value}
      value={value}
      onValueChange={onValueChange}
    >
      <TabsPrimitive.List className="g-tab-list" aria-label={label}>
        {items.map((item) => (
          <TabsPrimitive.Trigger className="g-tab" value={item.value} key={item.value}>
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content className="g-tab-content" value={item.value} key={item.value}>
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
