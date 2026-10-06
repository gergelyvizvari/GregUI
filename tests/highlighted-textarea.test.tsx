import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { HighlightedTextarea } from '@gregui/react';
import { highlightText } from '../packages/react/src/highlighted-textarea';
it('matches whole field names, handles regex characters and preserves literal text', () => {
  const value = 'type fault_type health_risk {type} café caféine a.b <script>';
  const parts = highlightText(value, ['type', 'health_risk', 'café', 'a.b', 'type', '']);
  expect(parts.filter((p) => p.highlighted).map((p) => p.text)).toEqual([
    'type',
    'health_risk',
    'type',
    'café',
    'a.b',
  ]);
  expect(parts.map((p) => p.text).join('')).toBe(value);
});
it('edits plain text, refreshes highlights and keeps decoration out of accessible content', async () => {
  function Fixture() {
    const [value, setValue] = useState('description');
    return (
      <HighlightedTextarea
        label="Instructions"
        value={value}
        onValueChange={setValue}
        highlights={['description']}
      />
    );
  }
  const user = userEvent.setup();
  const { container } = render(<Fixture />);
  const input = screen.getByRole('textbox', { name: 'Instructions' });
  await user.type(input, ' <script>description</script>');
  expect(input).toHaveValue('description <script>description</script>');
  expect(container.querySelector('script')).toBeNull();
  expect(container.querySelectorAll('[aria-hidden="true"] strong')).toHaveLength(2);
});
