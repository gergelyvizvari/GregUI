import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { ListDetail } from '@gregui/react';
it('groups named entries and preserves selection and flat-list consumers', async () => {
  const select = vi.fn();
  const { rerender } = render(
    <ListDetail
      label="Index"
      items={[
        { id: 'button', label: 'Button', group: 'Actions' },
        { id: 'input', label: 'Input', group: 'Forms' },
        { id: 'select', label: 'Select', group: 'Forms' },
      ]}
      selectedId="input"
      onSelect={select}
    >
      Details
    </ListDetail>,
  );
  const nav = screen.getByRole('navigation', { name: 'Index' });
  expect(within(nav).getByRole('heading', { name: 'Forms' })).toBeInTheDocument();
  const forms = within(nav).getByRole('list', { name: 'Forms' });
  expect(within(forms).getAllByRole('button')).toHaveLength(2);
  expect(within(forms).getByRole('button', { name: /Input/ })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await userEvent.click(within(forms).getByRole('button', { name: 'Select' }));
  expect(select).toHaveBeenCalledWith('select');
  rerender(
    <ListDetail
      label="Index"
      items={[{ id: 'one', label: 'One', description: 'Description' }]}
      onSelect={select}
    >
      Details
    </ListDetail>,
  );
  expect(within(nav).queryByRole('heading')).toBeNull();
  expect(within(nav).getByRole('button', { name: 'One Description' })).toBeInTheDocument();
});

it('collapses other groups, keeps the current category open and follows controlled selection', async () => {
  const items = [
    { id: 'a', label: 'Action one', group: 'Actions' },
    { id: 'b', label: 'Form one', group: 'Forms' },
  ];
  const { rerender } = render(
    <ListDetail label="Index" items={items} selectedId="a" onSelect={() => {}} collapsibleGroups>
      Details
    </ListDetail>,
  );
  const user = userEvent.setup();
  const actions = screen.getByRole('button', { name: 'Actions' });
  const forms = screen.getByRole('button', { name: 'Forms' });
  expect(actions).toHaveAttribute('aria-expanded', 'true');
  expect(actions).toHaveAttribute('aria-disabled', 'true');
  expect(forms).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('button', { name: 'Form one' })).toBeNull();
  await user.click(actions);
  expect(actions).toHaveAttribute('aria-expanded', 'true');
  forms.focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('button', { name: 'Form one' })).toBeInTheDocument();
  expect(forms).toHaveFocus();
  await user.keyboard(' ');
  expect(screen.queryByRole('button', { name: 'Form one' })).toBeNull();
  rerender(
    <ListDetail label="Index" items={items} selectedId="b" onSelect={() => {}} collapsibleGroups>
      Details
    </ListDetail>,
  );
  expect(forms).toHaveAttribute('aria-expanded', 'true');
  expect(forms).toHaveAttribute('aria-disabled', 'true');
  expect(actions).toHaveAttribute('aria-expanded', 'false');
  expect(document.getElementById(forms.getAttribute('aria-controls')!)).not.toHaveAttribute(
    'hidden',
  );
});

it('reports controlled expansion choices without hiding the selected group or changing controlled state itself', async () => {
  const items = [
    { id: 'a', label: 'Action one', group: 'Actions' },
    { id: 'b', label: 'Form one', group: 'Forms' },
  ];
  const change = vi.fn();
  const { rerender } = render(
    <ListDetail
      label="Index"
      items={items}
      selectedId="a"
      onSelect={() => {}}
      collapsibleGroups
      expandedGroups={[]}
      onExpandedGroupsChange={change}
    >
      Details
    </ListDetail>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Forms' }));
  expect(change).toHaveBeenLastCalledWith(['Forms']);
  expect(screen.getByRole('button', { name: 'Forms' })).toHaveAttribute('aria-expanded', 'false');
  rerender(
    <ListDetail
      label="Index"
      items={items}
      selectedId="a"
      onSelect={() => {}}
      collapsibleGroups
      expandedGroups={['Forms']}
      onExpandedGroupsChange={change}
    >
      Details
    </ListDetail>,
  );
  expect(screen.getByRole('button', { name: 'Forms' })).toHaveAttribute('aria-expanded', 'true');
  await userEvent.click(screen.getByRole('button', { name: 'Forms' }));
  expect(change).toHaveBeenLastCalledWith([]);
  expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute('aria-expanded', 'true');
});

it('renders group titles at the requested heading level', () => {
  render(
    <ListDetail
      label="Index"
      items={[{ id: 'button', label: 'Button', group: 'Actions' }]}
      onSelect={() => {}}
      groupHeadingLevel={3}
    >
      Detail
    </ListDetail>,
  );
  expect(screen.getByRole('heading', { name: 'Actions', level: 3 })).toBeInTheDocument();
});
