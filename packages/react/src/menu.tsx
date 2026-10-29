'use client';
import { useId, type ReactNode } from 'react';
import * as MenuPrimitive from '@radix-ui/react-dropdown-menu';
import { useLocale } from '@gregui/localization';
import { Icon, renderIcon, type IconSource } from './icons';
import { PortalFrame } from './theme';

interface MenuEntryBase {
  id: string;
  disabled?: boolean;
}
/** Runs `onSelect`, or follows `href` as an ordinary link. */
export interface MenuActionItem extends MenuEntryBase {
  type?: 'item';
  label: string;
  icon?: IconSource;
  /** Visual keyboard hint only; the application owns the shortcut itself. */
  shortcut?: string;
  href?: string;
  /** Marks the destination for the current page. */
  current?: boolean;
  danger?: boolean;
  /** Call `event.preventDefault()` to keep the menu open. */
  onSelect?: (event: Event) => void;
}
export interface MenuCheckboxItem extends MenuEntryBase {
  type: 'checkbox';
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}
export interface MenuRadioGroup extends MenuEntryBase {
  type: 'radio';
  /** Visible group heading. */
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
}
export interface MenuGroup extends MenuEntryBase {
  type: 'group';
  label: string;
  items: MenuEntry[];
}
export interface MenuSubmenu extends MenuEntryBase {
  type: 'submenu';
  label: string;
  icon?: IconSource;
  items: MenuEntry[];
}
export interface MenuSeparator {
  type: 'separator';
  id: string;
}
export type MenuEntry =
  MenuActionItem | MenuCheckboxItem | MenuRadioGroup | MenuGroup | MenuSubmenu | MenuSeparator;

export interface MenuProps {
  /** A button (Button, IconButton) that opens the menu. */
  trigger: ReactNode;
  items: MenuEntry[];
  /** Accessible name for the menu; defaults to the trigger's name. */
  label?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ItemContent({ icon, label, end }: { icon?: IconSource; label: string; end?: ReactNode }) {
  return (
    <>
      {icon && renderIcon(icon)}
      <span className="g-menu-label">{label}</span>
      {end}
    </>
  );
}

function Indicator() {
  return (
    <span className="g-menu-indicator">
      <MenuPrimitive.ItemIndicator>
        <Icon name="check" />
      </MenuPrimitive.ItemIndicator>
    </span>
  );
}

function LabelledGroup({ label, children }: { label?: string; children: ReactNode }) {
  const id = useId();
  return (
    <MenuPrimitive.Group aria-labelledby={label ? id : undefined}>
      {label && (
        <MenuPrimitive.Label className="g-menu-heading" id={id}>
          {label}
        </MenuPrimitive.Label>
      )}
      {children}
    </MenuPrimitive.Group>
  );
}

function Entries({ items }: { items: MenuEntry[] }) {
  const { direction } = useLocale();
  return items.map((entry) => {
    switch (entry.type) {
      case 'separator':
        return <MenuPrimitive.Separator key={entry.id} className="g-menu-separator" />;
      case 'checkbox':
        return (
          <MenuPrimitive.CheckboxItem
            key={entry.id}
            className="g-menu-item"
            checked={entry.checked}
            disabled={entry.disabled}
            onCheckedChange={(checked) => entry.onCheckedChange(checked === true)}
            onSelect={(event) => event.preventDefault()}
          >
            <Indicator />
            <span className="g-menu-label">{entry.label}</span>
          </MenuPrimitive.CheckboxItem>
        );
      case 'radio':
        return (
          <LabelledGroup key={entry.id} label={entry.label}>
            <MenuPrimitive.RadioGroup value={entry.value} onValueChange={entry.onValueChange}>
              {entry.options.map((option) => (
                <MenuPrimitive.RadioItem
                  key={option.value}
                  className="g-menu-item"
                  value={option.value}
                  disabled={entry.disabled || option.disabled}
                >
                  <Indicator />
                  <span className="g-menu-label">{option.label}</span>
                </MenuPrimitive.RadioItem>
              ))}
            </MenuPrimitive.RadioGroup>
          </LabelledGroup>
        );
      case 'group':
        return (
          <LabelledGroup key={entry.id} label={entry.label}>
            <Entries items={entry.items} />
          </LabelledGroup>
        );
      case 'submenu':
        return (
          <MenuPrimitive.Sub key={entry.id}>
            <MenuPrimitive.SubTrigger className="g-menu-item" disabled={entry.disabled}>
              <ItemContent
                icon={entry.icon}
                label={entry.label}
                end={<Icon name={direction === 'rtl' ? 'chevron-back' : 'chevron'} />}
              />
            </MenuPrimitive.SubTrigger>
            <MenuPrimitive.Portal>
              <PortalFrame>
                <MenuPrimitive.SubContent className="g-menu" sideOffset={4} alignOffset={-4}>
                  <Entries items={entry.items} />
                </MenuPrimitive.SubContent>
              </PortalFrame>
            </MenuPrimitive.Portal>
          </MenuPrimitive.Sub>
        );
      default: {
        const content = (
          <ItemContent
            icon={entry.icon}
            label={entry.label}
            end={
              entry.shortcut ? (
                <kbd className="g-menu-shortcut">{entry.shortcut}</kbd>
              ) : (
                entry.current && <span className="g-nav-dot" />
              )
            }
          />
        );
        return (
          <MenuPrimitive.Item
            key={entry.id}
            className="g-menu-item"
            data-tone={entry.danger ? 'danger' : undefined}
            aria-current={entry.current ? 'page' : undefined}
            disabled={entry.disabled}
            onSelect={entry.onSelect}
            asChild={Boolean(entry.href)}
          >
            {entry.href ? <a href={entry.href}>{content}</a> : content}
          </MenuPrimitive.Item>
        );
      }
    }
  });
}

/**
 * A dropdown menu with ARIA menu semantics: arrow keys, typeahead, Home/End and
 * Escape. Supports links, checkbox and radio items, labelled groups and submenus.
 */
export function Menu({
  trigger,
  items,
  label,
  side = 'bottom',
  align = 'start',
  open,
  onOpenChange,
}: MenuProps) {
  const { direction } = useLocale();
  return (
    <MenuPrimitive.Root dir={direction} open={open} onOpenChange={onOpenChange} modal={false}>
      <MenuPrimitive.Trigger asChild>{trigger}</MenuPrimitive.Trigger>
      <MenuPrimitive.Portal>
        <PortalFrame>
          <MenuPrimitive.Content
            className="g-menu"
            aria-label={label}
            side={side}
            align={align}
            sideOffset={6}
            collisionPadding={8}
          >
            <Entries items={items} />
          </MenuPrimitive.Content>
        </PortalFrame>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  );
}
