import React, { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { LocaleProvider, MonthDayField, daysInMonth, type MonthDayValue } from '@gregui/react';

function Controlled({
  initial = { month: null, day: null },
  withYear,
}: {
  initial?: MonthDayValue;
  withYear?: boolean;
}) {
  const [value, setValue] = useState<MonthDayValue>(initial);
  return (
    <>
      <MonthDayField label="Birthday" value={value} onChange={setValue} withYear={withYear} />
      <output data-testid="value">{JSON.stringify(value)}</output>
    </>
  );
}

const current = () => JSON.parse(screen.getByTestId('value').textContent!);

describe('MonthDayField', () => {
  it('groups month and day under the label and saves a date without a year', async () => {
    render(<Controlled />);
    const group = screen.getByRole('group', { name: 'Birthday' });
    await userEvent.selectOptions(within(group).getByRole('combobox', { name: /Month/ }), '3');
    await userEvent.selectOptions(within(group).getByRole('combobox', { name: /Day/ }), '15');
    expect(current()).toEqual({ month: 3, day: 15 });
  });

  it('allows 29 February without a year and clamps days for shorter months', async () => {
    render(<Controlled initial={{ month: 1, day: 31 }} withYear />);
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /Month/ }), '2');
    expect(current()).toEqual({ month: 2, day: 29 });
    await userEvent.type(screen.getByRole('textbox', { name: /Year/ }), '2023');
    expect(current()).toEqual({ month: 2, day: 28, year: 2023 });
    expect(screen.getAllByRole('option', { name: /^\d+$/ })).toHaveLength(28);
  });

  it('uses locale month names and order', () => {
    render(
      <LocaleProvider locale="hu-HU">
        <MonthDayField label="Névnap" value={{ month: 3, day: 15 }} onChange={() => {}} />
      </LocaleProvider>,
    );
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveAccessibleName(/Hónap/);
    expect(selects[1]).toHaveAccessibleName(/Nap/);
    expect(screen.getByRole('option', { name: 'március' })).toBeInTheDocument();

    render(
      <LocaleProvider locale="en-GB">
        <MonthDayField label="Birthday" value={{ month: 3, day: 15 }} onChange={() => {}} />
      </LocaleProvider>,
    );
    const group = screen.getByRole('group', { name: 'Birthday' });
    expect(within(group).getAllByRole('combobox')[0]).toHaveAccessibleName(/Day/);
  });

  it('associates an error with the group', () => {
    render(
      <MonthDayField
        label="Birthday"
        value={{ month: null, day: 4 }}
        onChange={() => {}}
        error="Choose a month."
      />,
    );
    expect(screen.getByRole('group', { name: 'Birthday' })).toHaveAccessibleDescription(
      'Choose a month.',
    );
  });

  it('counts days per month', () => {
    expect(daysInMonth(2)).toBe(29);
    expect(daysInMonth(2, 2023)).toBe(28);
    expect(daysInMonth(4)).toBe(30);
  });
});
