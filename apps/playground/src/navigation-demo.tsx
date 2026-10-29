import { useState } from 'react';
import {
  Breadcrumbs,
  Card,
  IconButton,
  Icon,
  Inline,
  Menu,
  SideNav,
  Stack,
  Text,
  type SideNavItem,
} from '@gregui/react';

// Demo destinations only: routing belongs to the application, so links here are intercepted.
const trail = [
  { label: 'Workspace', href: '#workspace' },
  { label: 'Clients', href: '#clients' },
  { label: 'Northwind', href: '#northwind' },
  { label: 'Campaigns', href: '#campaigns' },
  { label: 'Spring postcards' },
];

export function BreadcrumbsDemo() {
  const [visited, setVisited] = useState('');
  return (
    <Stack gap={3}>
      <Breadcrumbs
        items={trail}
        maxItems={3}
        onNavigate={(item, event) => {
          event.preventDefault();
          setVisited(item.label);
        }}
      />
      <Text size="small" tone="muted">
        {visited ? `Would open: ${visited}` : 'Long trails keep the first and last levels.'}
      </Text>
    </Stack>
  );
}

export function MenuDemo() {
  const [last, setLast] = useState('');
  const [pinned, setPinned] = useState(true);
  const [sort, setSort] = useState('recent');
  return (
    <Stack gap={3}>
      <Inline gap={2}>
        <Menu
          label="Campaign actions"
          trigger={
            <IconButton variant="secondary" label="Campaign actions">
              <Icon name="menu" />
            </IconButton>
          }
          items={[
            {
              id: 'edit',
              label: 'Rename',
              icon: 'edit',
              shortcut: 'F2',
              onSelect: () => setLast('Rename'),
            },
            {
              id: 'copy',
              label: 'Duplicate',
              icon: 'layers',
              onSelect: () => setLast('Duplicate'),
            },
            {
              type: 'submenu',
              id: 'export',
              label: 'Export as',
              icon: 'download',
              items: [
                { id: 'pdf', label: 'Print-ready PDF', onSelect: () => setLast('Export PDF') },
                { id: 'png', label: 'Preview images', onSelect: () => setLast('Export images') },
              ],
            },
            { type: 'separator', id: 'sep-view' },
            {
              type: 'checkbox',
              id: 'pin',
              label: 'Pin to sidebar',
              checked: pinned,
              onCheckedChange: setPinned,
            },
            {
              type: 'radio',
              id: 'sort',
              label: 'Sort by',
              value: sort,
              onValueChange: setSort,
              options: [
                { value: 'recent', label: 'Most recent' },
                { value: 'name', label: 'Name' },
              ],
            },
            { type: 'separator', id: 'sep-danger' },
            {
              id: 'delete',
              label: 'Delete campaign',
              danger: true,
              onSelect: () => setLast('Delete'),
            },
          ]}
        />
        <Text>{last ? `Chose: ${last}` : 'Open the menu with a click, Enter or Space.'}</Text>
      </Inline>
      <Text size="small" tone="muted">
        Pinned: {pinned ? 'yes' : 'no'}. Sorted by {sort === 'recent' ? 'most recent' : 'name'}.
      </Text>
    </Stack>
  );
}

const sections: { id: string; title?: string; items: SideNavItem[] }[] = [
  {
    id: 'work',
    title: 'Work',
    items: [
      { id: 'home', label: 'Home', icon: 'grid', href: '#home' },
      {
        id: 'campaigns',
        label: 'Campaigns',
        icon: 'layers',
        items: [
          { id: 'active', label: 'Active', href: '#active', badge: 3 },
          {
            id: 'archive',
            label: 'Archive',
            items: [
              { id: '2025', label: '2025', href: '#2025' },
              { id: '2024', label: '2024', href: '#2024' },
            ],
          },
        ],
      },
      { id: 'calendar', label: 'Calendar', icon: 'calendar', href: '#calendar' },
    ],
  },
  {
    id: 'admin',
    title: 'Admin',
    items: [
      { id: 'brand', label: 'Brand kit', icon: 'palette', href: '#brand' },
      { id: 'security', label: 'Security', icon: 'shield', href: '#security', disabled: true },
    ],
  },
];

export function SideNavDemo() {
  const [current, setCurrent] = useState('2025');
  return (
    <Card>
      <SideNav
        label="Example workspace"
        sections={sections}
        value={current}
        onNavigate={(item, event) => {
          event.preventDefault();
          setCurrent(item.id);
        }}
      />
    </Card>
  );
}
