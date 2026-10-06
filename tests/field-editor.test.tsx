import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { FieldEditorItem, TagInput, TextField, LocaleProvider } from '@gregui/react';
function Fixture() {
  const [tags, setTags] = useState(['First', 'Second']);
  return (
    <LocaleProvider locale="en-GB">
      <TagInput
        label="Choices"
        inputLabel="New choice"
        addLabel="Add choice"
        removeLabel={(tag) => `Remove ${tag}`}
        value={tags}
        onChange={setTags}
      />
    </LocaleProvider>
  );
}
it('adds trimmed values, prevents duplicates and preserves focus when removing tokens', async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  await user.click(screen.getByRole('button', { name: 'Remove First' }));
  expect(screen.getByRole('button', { name: 'Remove Second' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Remove Second' }));
  const input = screen.getByLabelText('New choice');
  expect(input).toHaveFocus();
  await user.type(input, '  Doors, windows  {Enter}');
  expect(screen.getByRole('button', { name: 'Remove Doors, windows' })).toBeVisible();
  expect(input).toHaveValue('');
  await user.type(input, 'Doors, windows');
  expect(screen.getByRole('button', { name: 'Add choice' })).toBeDisabled();
  await user.keyboard('{Enter}');
  expect(screen.getAllByRole('button', { name: 'Remove Doors, windows' })).toHaveLength(1);
});
it('exposes a controlled disclosure with a named region and unmounts closed editors', async () => {
  function Fixture() {
    const [open, setOpen] = useState(false);
    return (
      <FieldEditorItem
        name="urgency"
        typeLabel="Category"
        editLabel="Edit"
        closeLabel="Close"
        expanded={open}
        onExpandedChange={setOpen}
        nameField={<TextField label="Field name" />}
        typeField={<TextField label="Type" />}
      />
    );
  }
  const user = userEvent.setup();
  render(<Fixture />);
  expect(screen.queryByLabelText('Field name')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Edit urgency' }));
  expect(screen.getByRole('button', { name: 'Close urgency' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  expect(screen.getByLabelText('Field name')).toBeVisible();
});
