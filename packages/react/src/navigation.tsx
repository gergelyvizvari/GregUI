'use client';
import { type ReactNode } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { useLocale } from '@gregui/localization';
import { Icon } from './icons';
import { Link } from './typography';
export function Breadcrumbs({
  items,
  label = 'Breadcrumb',
}: {
  items: { label: string; href?: string }[];
  label?: string;
}) {
  return (
    <nav aria-label={label}>
      <ol className="g-breadcrumbs">
        {items.map((item, i) => (
          <li key={i}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
            {i < items.length - 1 && <Icon name="chevron" />}
          </li>
        ))}
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
