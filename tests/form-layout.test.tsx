import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import {
  EditorLayout,
  FormSection,
  FormActions,
  TextField,
  Button,
} from '../packages/react/src/index';
it('preserves form semantics, named sections and document-first keyboard order', async () => {
  const user = userEvent.setup();
  let submitted = 0;
  render(
    <EditorLayout aside={{ label: 'Review', content: <Button>Submit for review</Button> }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitted++;
        }}
      >
        <FormSection title="Details" number={1}>
          <TextField label="Name" />
        </FormSection>
        <FormActions>
          <Button type="submit">Save draft</Button>
        </FormActions>
      </form>
    </EditorLayout>,
  );
  expect(screen.getByRole('region', { name: 'Details' })).toBeTruthy();
  expect(screen.getByRole('complementary', { name: 'Review' })).toBeTruthy();
  await user.tab();
  expect(screen.getByLabelText('Name')).toHaveFocus();
  await user.type(screen.getByLabelText('Name'), 'Example');
  await user.tab();
  expect(screen.getByRole('button', { name: 'Save draft' })).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(submitted).toBe(1);
  await user.tab();
  expect(screen.getByRole('button', { name: 'Submit for review' })).toHaveFocus();
});
