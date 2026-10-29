import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { VisualChoiceGroup } from '@gregui/react';

const options = [
  { value: 'a', label: 'Alpine', description: 'Mountain photograph', preview: 'Mountains' },
  { value: 'b', label: 'Pending', status: 'Generating', disabled: true, preview: 'Waiting' },
  { value: 'c', label: 'Greeting', preview: 'Hello' },
];
it('selects through a visual card and native keyboard navigation, skipping unavailable choices', async () => {
  function Fixture() {
    const [value, onChange] = useState<string | null>('a');
    return <VisualChoiceGroup label="Design" options={options} value={value} onChange={onChange} />;
  }
  render(<Fixture />);
  const user = userEvent.setup();
  await user.click(screen.getByText('Hello'));
  expect(screen.getByRole('radio', { name: 'Greeting' })).toBeChecked();
  await user.keyboard('{ArrowLeft}');
  expect(screen.getByRole('radio', { name: 'Alpine' })).toBeChecked();
  expect(screen.getByRole('radio', { name: 'Alpine' })).toHaveFocus();
  expect(screen.getByRole('radio', { name: 'Pending' })).toBeDisabled();
  expect(screen.getByRole('radio', { name: 'Alpine' })).toHaveAccessibleDescription(
    'Mountain photograph',
  );
});
it('associates validation, submits only the chosen value and locks a disabled group', async () => {
  const onChange = vi.fn();
  const { container, rerender } = render(
    <form>
      <VisualChoiceGroup
        label="Design"
        name="design"
        options={options}
        value="a"
        onChange={onChange}
        hint="Choose one"
        error="Check your selection"
        required
      />
    </form>,
  );
  expect(new FormData(container.querySelector('form')!).get('design')).toBe('a');
  expect(screen.getByRole('radio', { name: 'Alpine' })).toHaveAccessibleDescription(
    'Mountain photograph Choose one Check your selection',
  );
  expect(screen.getByRole('radio', { name: 'Alpine' })).toBeInvalid();
  rerender(
    <VisualChoiceGroup label="Minta" options={options} value="a" onChange={onChange} disabled />,
  );
  await userEvent.click(screen.getByText('Hello'));
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole('radio', { name: 'Greeting' })).toBeDisabled();
});
