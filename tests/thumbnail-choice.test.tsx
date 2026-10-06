import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect } from 'vitest';
import { ThumbnailChoice } from '@gregui/react';
it('selects through the preview and keyboard with a named checkbox', async () => {
  function Fixture() {
    const [checked, setChecked] = useState(false);
    return (
      <ThumbnailChoice label="case.jpg" preview="Preview" checked={checked} onChange={setChecked} />
    );
  }
  render(<Fixture />);
  const user = userEvent.setup();
  await user.click(screen.getByText('Preview'));
  expect(screen.getByRole('checkbox', { name: 'case.jpg' })).toBeChecked();
  await user.keyboard(' ');
  expect(screen.getByRole('checkbox', { name: 'case.jpg' })).not.toBeChecked();
});
