import React, { useState } from 'react';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import {
  ActionMenu,
  TreeView,
  Timeline,
  DataTable,
  Combobox,
  DateRangePicker,
  FileUpload,
  NotificationCentre,
  ToastStack,
  ProfileSettings,
  PrivacyPreferences,
  CommentsPanel,
  ApprovalPanel,
  TeamMembers,
  SecuritySettings,
  PricingCards,
  CommandPalette,
  Button,
  LocaleProvider,
} from '@gregui/react';

const tree = [
  {
    id: 'root',
    label: 'Workspace',
    children: [
      { id: 'design', label: 'Design' },
      { id: 'docs', label: 'Docs' },
    ],
  },
  { id: 'archive', label: 'Archive' },
];
it('navigates a tree with arrows, selection and collapse to parent', async () => {
  const user = userEvent.setup(),
    select = vi.fn();
  render(<TreeView nodes={tree} label="Files" onSelect={select} />);
  screen.getByRole('treeitem', { name: 'Workspace' }).focus();
  await user.keyboard('{ArrowRight}{ArrowRight}');
  expect(screen.getByRole('treeitem', { name: 'Design' })).toHaveFocus();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(select).toHaveBeenCalledWith('docs');
  await user.keyboard('{ArrowLeft}{ArrowLeft}');
  expect(screen.getByRole('treeitem', { name: 'Workspace' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await user.keyboard('{End}');
  expect(screen.getByRole('treeitem', { name: 'Archive' })).toHaveFocus();
});
it('reverses tree expansion arrows in RTL', async () => {
  const user = userEvent.setup();
  render(
    <LocaleProvider direction="rtl">
      <TreeView nodes={tree} label="Files" />
    </LocaleProvider>,
  );
  screen.getByRole('treeitem', { name: 'Workspace' }).focus();
  await user.keyboard('{ArrowLeft}{ArrowLeft}');
  expect(screen.getByRole('treeitem', { name: 'Design' })).toHaveFocus();
});
it('renders machine-readable timeline dates and current milestone', () => {
  render(
    <Timeline
      label="History"
      items={[
        { id: '1', title: 'Review', dateTime: '2026-09-29', dateLabel: 'Today', status: 'current' },
      ]}
    />,
  );
  expect(screen.getByText('Today')).toHaveAttribute('datetime', '2026-09-29');
  expect(screen.getByRole('listitem')).toHaveAttribute('aria-current', 'step');
});
it('sorts data numerically, paginates and reports selection', async () => {
  const user = userEvent.setup(),
    select = vi.fn();
  render(
    <DataTable
      caption="Rows"
      rows={[
        { id: 'a', count: 10 },
        { id: 'b', count: 2 },
        { id: 'c', count: 4 },
      ]}
      rowId={(r) => r.id}
      pageSize={2}
      columns={[
        { key: 'id', label: 'Name', value: (r) => r.id },
        { key: 'count', label: 'Count', value: (r) => r.count, sortable: true },
      ]}
      onSelectionChange={select}
    />,
  );
  await user.click(screen.getByRole('button', { name: /Count/ }));
  expect(screen.getAllByRole('rowheader')[0]).toHaveTextContent('b');
  await user.click(screen.getByLabelText('Select row b'));
  expect(select).toHaveBeenCalledWith(['b']);
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByRole('rowheader')).toHaveTextContent('a');
});
it('filters a combobox, skips disabled choices and restores the selected label on Escape', async () => {
  const user = userEvent.setup(),
    change = vi.fn();
  render(
    <Combobox
      label="Region"
      value="uk"
      onChange={change}
      options={[
        { value: 'uk', label: 'United Kingdom' },
        { value: 'fr', label: 'France' },
        { value: 'fi', label: 'Finland', disabled: true },
      ]}
    />,
  );
  await user.click(screen.getByRole('combobox'));
  await user.clear(screen.getByRole('combobox'));
  await user.type(screen.getByRole('combobox'), 'Fr');
  await user.keyboard('{Enter}');
  expect(change).toHaveBeenCalledWith('fr');
  await user.clear(screen.getByRole('combobox'));
  await user.type(screen.getByRole('combobox'), 'none');
  expect(screen.getByText('No results found.')).toBeVisible();
  await user.keyboard('{Escape}');
  expect(screen.getByRole('combobox')).toHaveValue('United Kingdom');
});
it('links range errors and enforces native bounds', () => {
  render(<DateRangePicker label="Dates" start="2026-10-03" end="2026-10-01" onChange={() => {}} />);
  expect(screen.getByLabelText('End date')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByLabelText('End date')).toHaveAttribute('min', '2026-10-03');
});
it('rejects dropped oversized or mismatched files without calling the consumer', () => {
  const onFiles = vi.fn();
  render(<FileUpload label="File" accept=".txt" maxBytes={4} onFiles={onFiles} />);
  const input = screen.getByLabelText('File');
  fireEvent.change(input, { target: { files: [new File(['too large'], 'large.txt')] } });
  expect(onFiles).not.toHaveBeenCalled();
  expect(input).toHaveAttribute('aria-invalid', 'true');
  fireEvent.change(input, { target: { files: [new File(['ok'], 'small.txt')] } });
  expect(onFiles).toHaveBeenCalledTimes(1);
});
it('filters notifications and routes read/dismiss actions', async () => {
  const user = userEvent.setup(),
    read = vi.fn(),
    dismiss = vi.fn();
  render(
    <NotificationCentre
      title="Updates"
      items={[
        { id: 'a', title: 'New', read: false },
        { id: 'b', title: 'Old', read: true },
      ]}
      onRead={read}
      onDismiss={dismiss}
    />,
  );
  await user.click(screen.getByLabelText('Unread only'));
  expect(screen.queryByText('Old')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Mark as read' }));
  expect(read).toHaveBeenCalledWith('a');
  await user.click(screen.getByRole('button', { name: 'Dismiss: New' }));
  expect(dismiss).toHaveBeenCalledWith('a');
});
it('supports toast actions and dismissal without automatic expiry', async () => {
  const user = userEvent.setup(),
    action = vi.fn(),
    dismiss = vi.fn();
  render(
    <ToastStack
      items={[{ id: '1', title: 'Saved', action: { label: 'Undo', onAction: action } }]}
      onDismiss={dismiss}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Undo' }));
  expect(action).toHaveBeenCalledOnce();
  await user.click(screen.getByRole('button', { name: 'Dismiss: Saved' }));
  expect(dismiss).toHaveBeenCalledWith('1');
});
it('reports profile save failure and succeeds on retry', async () => {
  const user = userEvent.setup(),
    save = vi.fn().mockRejectedValueOnce(new Error()).mockResolvedValue(undefined);
  render(
    <ProfileSettings
      title="Profile"
      value={{ name: 'Alex', email: 'alex@example.com' }}
      onChange={() => {}}
      onSave={save}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Saved successfully.'));
});
it('always includes required privacy categories in the saved payload', async () => {
  const user = userEvent.setup(),
    save = vi.fn();
  render(
    <PrivacyPreferences
      title="Privacy"
      description="Choose"
      categories={[
        { id: 'required', title: 'Necessary', description: 'Required', required: true },
        { id: 'optional', title: 'Analytics', description: 'Optional' },
      ]}
      value={[]}
      onChange={() => {}}
      onSave={save}
    />,
  );
  expect(screen.getByLabelText('Necessary')).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Save preferences' }));
  expect(save).toHaveBeenCalledWith(['required']);
});
it('preserves a comment draft after rejection then clears it on success', async () => {
  const user = userEvent.setup(),
    save = vi.fn().mockRejectedValueOnce(new Error()).mockResolvedValue(undefined);
  render(<CommentsPanel title="Comments" comments={[]} onSubmit={save} />);
  await user.type(screen.getByLabelText('Comment'), 'Review this');
  await user.click(screen.getByRole('button', { name: 'Post comment' }));
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  expect(screen.getByLabelText('Comment')).toHaveValue('Review this');
  await user.click(screen.getByRole('button', { name: 'Post comment' }));
  await waitFor(() => expect(screen.getByLabelText('Comment')).toHaveValue(''));
});
it('blocks both approval actions during a pending decision', async () => {
  let resolve!: () => void;
  const save = vi.fn(
    () =>
      new Promise<void>((r) => {
        resolve = r;
      }),
  );
  const user = userEvent.setup();
  render(<ApprovalPanel title="Review" description="Check" details={[]} onDecision={save} />);
  await user.click(screen.getByRole('button', { name: 'Approve' }));
  expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
  resolve();
  expect(await screen.findByText('Decision recorded.')).toBeVisible();
  expect(save).toHaveBeenCalledTimes(1);
});
it('protects the current session and delegates revocation', async () => {
  const user = userEvent.setup(),
    revoke = vi.fn();
  render(
    <SecuritySettings
      title="Security"
      sessions={[
        { id: '1', label: 'Current', description: 'Here', current: true },
        { id: '2', label: 'Tablet', description: 'Yesterday' },
      ]}
      onRevoke={revoke}
    />,
  );
  expect(screen.getAllByRole('button')).toHaveLength(1);
  await user.click(screen.getByRole('button', { name: 'Sign out session' }));
  expect(revoke).toHaveBeenCalledWith('2');
});
it('sends invitations and explicitly saves role changes', async () => {
  const user = userEvent.setup(),
    invite = vi.fn(),
    role = vi.fn();
  render(
    <TeamMembers
      title="Team"
      members={[{ id: 'a', name: 'Alex', email: 'alex@example.com', role: 'member' }]}
      roles={[
        { value: 'member', label: 'Member' },
        { value: 'viewer', label: 'Viewer' },
      ]}
      onInvite={invite}
      onRoleChange={role}
    />,
  );
  await user.type(screen.getByLabelText(/Invitation email/), 'sam@example.com');
  await user.click(screen.getByRole('button', { name: 'Send invitation' }));
  expect(invite).toHaveBeenCalledWith('sam@example.com');
  await user.selectOptions(screen.getByLabelText('Role: Alex'), 'viewer');
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(role).toHaveBeenCalledWith('a', 'viewer');
});
it('disables current pricing plan and delegates other choices', async () => {
  const user = userEvent.setup(),
    choose = vi.fn();
  render(
    <PricingCards
      label="Plans"
      currentId="a"
      onSelect={choose}
      plans={[
        { id: 'a', name: 'Free', price: '0', description: 'Free', features: [] },
        { id: 'b', name: 'Team', price: '12', description: 'Team', features: [] },
      ]}
    />,
  );
  expect(screen.getByRole('button', { name: 'Current plan: Free' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Choose plan: Team' }));
  expect(choose).toHaveBeenCalledWith('b');
});
it('filters commands and returns focus to the trigger after running one', async () => {
  const user = userEvent.setup(),
    action = vi.fn();
  render(
    <CommandPalette
      trigger={<Button>Commands</Button>}
      title="Commands"
      description="Find"
      commands={[
        { id: '1', label: 'Open project', onAction: action },
        { id: '2', label: 'Archive', onAction: () => {} },
      ]}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Commands' }));
  await user.type(screen.getByLabelText('Search'), 'Open');
  expect(screen.queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Open project' }));
  expect(action).toHaveBeenCalledOnce();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Commands' })).toHaveFocus());
});

it('exposes the current pricing card and locks competing selections until retry', async () => {
  const user = userEvent.setup();
  let reject!: (error: Error) => void;
  const choose = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((_, r) => {
          reject = r;
        }),
    )
    .mockResolvedValue(undefined);
  render(
    <PricingCards
      label="Plans"
      currentId="a"
      onSelect={choose}
      plans={[
        { id: 'a', name: 'Free', price: '0', description: 'Free', features: [] },
        {
          id: 'b',
          name: 'Team',
          price: '12',
          description: 'Team',
          features: [],
          recommended: true,
        },
        { id: 'c', name: 'Scale', price: '24', description: 'Scale', features: [] },
      ]}
    />,
  );
  expect(screen.getByRole('article', { name: 'Free' })).toHaveAttribute('aria-current', 'true');
  expect(
    within(screen.getByRole('article', { name: 'Free' })).getByText(/Current plan/, {
      selector: '.g-badge',
    }),
  ).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Choose plan: Team' }));
  expect(screen.getByRole('button', { name: 'Choose plan: Scale' })).toBeDisabled();
  reject(new Error('Failed'));
  expect(await screen.findByRole('alert')).toBeVisible();
  expect(screen.getByRole('article', { name: 'Free' })).toHaveAttribute('aria-current', 'true');
  await user.click(screen.getByRole('button', { name: 'Choose plan: Team' }));
  expect(choose).toHaveBeenCalledTimes(2);
});
it('closes an action popover after selection and restores trigger focus', async () => {
  const user = userEvent.setup(),
    action = vi.fn();
  render(<ActionMenu label="Actions" actions={[{ id: 'a', label: 'Open', onAction: action }]} />);
  await user.click(screen.getByRole('button', { name: 'Actions' }));
  await user.click(screen.getByRole('button', { name: 'Open' }));
  expect(action).toHaveBeenCalledOnce();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Actions' })).toHaveFocus());
  expect(screen.queryByRole('button', { name: 'Open' })).not.toBeInTheDocument();
});
it('clears selected files and notifies the consumer', async () => {
  const user = userEvent.setup(),
    change = vi.fn();
  render(<FileUpload label="Files" onFiles={change} />);
  await user.upload(
    screen.getByLabelText('Files'),
    new File(['x'], 'test.txt', { type: 'text/plain' }),
  );
  await user.click(screen.getByRole('button', { name: 'Clear selected files' }));
  expect(change).toHaveBeenLastCalledWith([]);
  expect((screen.getByLabelText('Files') as HTMLInputElement).files).toHaveLength(0);
});

it('freezes privacy choices while saving and confirms success', async () => {
  const user = userEvent.setup();
  let resolve!: () => void;
  render(
    <PrivacyPreferences
      title="Privacy"
      description="Choose"
      categories={[{ id: 'optional', title: 'Analytics', description: 'Optional' }]}
      value={['optional']}
      onChange={() => {}}
      onSave={() =>
        new Promise<void>((r) => {
          resolve = r;
        })
      }
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Save preferences' }));
  expect(screen.getByLabelText('Analytics')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Necessary only' })).toBeDisabled();
  resolve();
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Saved successfully.'));
});
