import React, { useState } from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import {
  AppShell,
  Breadcrumbs,
  Button,
  LocaleProvider,
  Menu,
  NavItem,
  SideNav,
  type SideNavItem,
} from '@gregui/react';

const trail = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Archive', href: '/projects/archive' },
  { label: 'Spring', href: '/projects/archive/spring' },
  { label: 'Brief' },
];

describe('Breadcrumbs', () => {
  it('names the landmark in the active locale and marks only the last item current', () => {
    const { rerender } = render(
      <Breadcrumbs items={[{ label: 'Design system' }, { label: 'Overview' }]} />,
    );
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getByText('Overview')).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByText('Design system')).not.toHaveAttribute('aria-current');
    rerender(
      <LocaleProvider locale="hu-HU">
        <Breadcrumbs items={trail} />
      </LocaleProvider>,
    );
    expect(screen.getByRole('navigation', { name: 'Navigációs útvonal' })).toBeInTheDocument();
  });

  it('collapses the middle of long trails and reveals it with focus on the first hidden link', async () => {
    render(<Breadcrumbs items={trail} maxItems={3} />);
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual(['Home', 'Spring']);
    await userEvent.click(screen.getByRole('button', { name: 'Show full path' }));
    expect(screen.getAllByRole('link')).toHaveLength(4);
    await waitFor(() => expect(screen.getByRole('link', { name: 'Projects' })).toHaveFocus());
  });

  it('lets the application route link clicks', async () => {
    const navigate = vi.fn((_item, event: React.MouseEvent) => event.preventDefault());
    render(<Breadcrumbs items={trail} onNavigate={navigate} />);
    await userEvent.click(screen.getByRole('link', { name: 'Projects' }));
    expect(navigate).toHaveBeenCalledWith(trail[1], expect.anything());
  });
});

describe('Menu', () => {
  function Example({ onRename }: { onRename: () => void }) {
    const [wrap, setWrap] = useState(false);
    const [density, setDensity] = useState('comfortable');
    return (
      <Menu
        trigger={<Button variant="secondary">Options</Button>}
        items={[
          { id: 'rename', label: 'Rename', icon: 'edit', shortcut: 'F2', onSelect: onRename },
          { id: 'docs', label: 'Help centre', href: '/help' },
          { type: 'separator', id: 's1' },
          {
            type: 'checkbox',
            id: 'wrap',
            label: 'Wrap lines',
            checked: wrap,
            onCheckedChange: setWrap,
          },
          {
            type: 'radio',
            id: 'density',
            label: 'Density',
            value: density,
            onValueChange: setDensity,
            options: [
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact', label: 'Compact' },
            ],
          },
          {
            type: 'submenu',
            id: 'move',
            label: 'Move to',
            items: [{ id: 'inbox', label: 'Inbox' }],
          },
          { id: 'delete', label: 'Delete', danger: true, disabled: true },
        ]}
      />
    );
  }

  it('exposes menu semantics, runs actions and returns focus to the trigger', async () => {
    const rename = vi.fn();
    render(<Example onRename={rename} />);
    const trigger = screen.getByRole('button', { name: 'Options' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await userEvent.click(trigger);
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: /Help centre/ })).toHaveAttribute(
      'href',
      '/help',
    );
    expect(within(menu).getByRole('menuitem', { name: /Delete/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await userEvent.click(within(menu).getByRole('menuitem', { name: /Rename/ }));
    expect(rename).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('keeps the menu open while toggling checkbox and radio items', async () => {
    render(<Example onRename={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    const wrap = await screen.findByRole('menuitemcheckbox', { name: 'Wrap lines' });
    expect(wrap).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(wrap);
    expect(screen.getByRole('menuitemcheckbox', { name: 'Wrap lines' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('menuitemradio', { name: 'Comfortable' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('group', { name: 'Density' })).toBeInTheDocument();
  });

  it('opens submenus from the keyboard', async () => {
    render(<Example onRename={() => {}} />);
    screen.getByRole('button', { name: 'Options' }).focus();
    await userEvent.keyboard('{Enter}');
    const move = await screen.findByRole('menuitem', { name: /Move to/ });
    expect(move).toHaveAttribute('aria-haspopup', 'menu');
    move.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(await screen.findByRole('menuitem', { name: 'Inbox' })).toBeInTheDocument();
  });
});

const tree: SideNavItem[] = [
  { id: 'home', label: 'Home', icon: 'grid', href: '/' },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'layers',
    items: [
      { id: 'active', label: 'Active', href: '/projects/active' },
      {
        id: 'archive',
        label: 'Archive',
        items: [{ id: 'spring', label: 'Spring', href: '/projects/archive/spring' }],
      },
    ],
  },
  { id: 'settings', label: 'Settings', icon: 'shield', badge: 2 },
];

describe('SideNav', () => {
  it('opens the groups that contain the current page and marks it', () => {
    render(<SideNav label="Workspace" items={tree} value="spring" />);
    const nav = screen.getByRole('navigation', { name: 'Workspace' });
    expect(within(nav).getByRole('button', { name: 'Projects' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(within(nav).getByRole('button', { name: 'Archive' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(within(nav).getByRole('link', { name: 'Spring' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('toggles nested groups as disclosures', async () => {
    const change = vi.fn();
    render(<SideNav items={tree} onExpandedChange={change} />);
    const projects = screen.getByRole('button', { name: 'Projects' });
    expect(projects).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Active' })).not.toBeInTheDocument();
    await userEvent.click(projects);
    expect(projects).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(projects.getAttribute('aria-controls')!)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Active' })).toBeVisible();
    expect(change).toHaveBeenLastCalledWith(['projects']);
  });

  it('reports destinations so the application can route them', async () => {
    const navigate = vi.fn((_item, event: Event | React.SyntheticEvent) => event.preventDefault());
    render(<SideNav items={tree} onNavigate={navigate} />);
    await userEvent.click(screen.getByRole('link', { name: 'Home' }));
    await userEvent.click(screen.getByRole('button', { name: 'Settings 2' }));
    expect(navigate.mock.calls.map(([item]) => item.id)).toEqual(['home', 'settings']);
  });

  it('names sections by their headings', () => {
    render(
      <SideNav
        sections={[
          { id: 'main', title: 'Workspace', items: tree.slice(0, 1) },
          { id: 'admin', title: 'Admin', items: tree.slice(2) },
        ]}
      />,
    );
    expect(screen.getByRole('list', { name: 'Admin' })).toBeInTheDocument();
  });
});

describe('AppShell sidebar', () => {
  function Shell() {
    return (
      <AppShell
        brand="Acme"
        sidebarCollapsible
        nav={
          <>
            <NavItem icon="grid" active>
              Overview
            </NavItem>
            <SideNav items={tree} />
          </>
        }
      >
        <p>Content</p>
      </AppShell>
    );
  }

  it('collapses to a rail that keeps accessible names and opens groups as menus', async () => {
    render(<Shell />);
    const toggle = screen.getByRole('button', { name: 'Collapse sidebar' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(toggle);
    const expand = screen.getByRole('button', { name: 'Expand sidebar' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    expect(expand.closest('aside')).toHaveAttribute('data-collapsed', 'true');
    const nav = screen.getAllByRole('navigation', { name: 'Navigation' })[0]!;
    expect(within(nav).getByRole('button', { name: 'Overview' })).toBeInTheDocument();
    const projects = within(nav).getByRole('button', { name: 'Projects' });
    expect(projects).toHaveAttribute('aria-haspopup', 'menu');
    await userEvent.click(projects);
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'Active' })).toHaveAttribute(
      'href',
      '/projects/active',
    );
  });

  it('keeps the mobile drawer open while a group is expanded and closes it on navigation', async () => {
    render(<Shell />);
    await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    const drawer = await screen.findByRole('dialog');
    await userEvent.click(within(drawer).getByRole('button', { name: 'Projects' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const link = within(drawer).getByRole('link', { name: 'Active' });
    link.addEventListener('click', (event) => event.preventDefault());
    await userEvent.click(link);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
