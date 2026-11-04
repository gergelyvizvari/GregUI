import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { QuantityStepper, VisualMultiChoiceGroup } from '@gregui/react';

function Order() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const picked = Object.keys(counts).filter((key) => counts[key]! > 0);
  return (
    <VisualMultiChoiceGroup
      label="Designs"
      values={picked}
      onValuesChange={(values) =>
        setCounts(Object.fromEntries(values.map((value) => [value, counts[value] || 1])))
      }
      options={['Balloons', 'Cake'].map((name) => ({
        value: name,
        label: name,
        preview: <span>{name}</span>,
        extra: (
          <QuantityStepper
            label={name}
            value={counts[name] ?? 0}
            onValueChange={(value) => setCounts({ ...counts, [name]: value })}
          />
        ),
      }))}
    />
  );
}

it('picks several pictures with a tap and counts each picked one', async () => {
  const user = userEvent.setup();
  render(<Order />);
  expect(screen.queryByRole('group', { name: 'Balloons' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: 'Balloons' }));
  await user.click(screen.getByRole('checkbox', { name: 'Cake' }));
  const balloons = screen.getByRole('group', { name: 'Balloons' });
  expect(balloons).toHaveTextContent('1');
  await user.click(screen.getByRole('button', { name: 'Increase: Balloons' }));
  expect(balloons).toHaveTextContent('2');
  expect(screen.getByRole('button', { name: 'Decrease: Cake' })).toBeEnabled();
  // Counting down to nothing takes the picture out of the order.
  await user.click(screen.getByRole('button', { name: 'Decrease: Cake' }));
  expect(screen.getByRole('checkbox', { name: 'Cake' })).not.toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Balloons' })).toBeChecked();
});
