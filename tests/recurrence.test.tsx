import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  LocaleProvider,
  RecurrenceField,
  nextRecurrence,
  recurrenceDates,
  recurrenceSummary,
  type RecurrenceValue,
} from '@gregui/react';

const dates = (value: RecurrenceValue, from: string, to: string, leapDay?: 'feb28' | 'mar1') =>
  recurrenceDates(value, from, to, { leapDay }).map((o) => o.date);

describe('recurrence helpers', () => {
  it('returns a single date once and nothing outside the range', () => {
    const value: RecurrenceValue = { frequency: 'once', start: '2027-03-12' };
    expect(dates(value, '2027-01-01', '2027-12-31')).toEqual(['2027-03-12']);
    expect(dates(value, '2028-01-01', '2028-12-31')).toEqual([]);
    expect(dates({ frequency: 'once', start: null }, '2027-01-01', '2027-12-31')).toEqual([]);
  });

  it('repeats yearly from the first date, moving 29 February in common years', () => {
    const value: RecurrenceValue = { frequency: 'yearly', start: '2024-02-29' };
    expect(dates(value, '2023-01-01', '2028-12-31')).toEqual([
      '2024-02-29',
      '2025-02-28',
      '2026-02-28',
      '2027-02-28',
      '2028-02-29',
    ]);
    expect(dates(value, '2025-01-01', '2025-12-31', 'mar1')).toEqual(['2025-03-01']);
  });

  it('repeats monthly on the same day, using the last day of shorter months', () => {
    const value: RecurrenceValue = { frequency: 'monthly', start: '2027-01-31' };
    expect(dates(value, '2027-01-01', '2027-05-31')).toEqual([
      '2027-01-31',
      '2027-02-28',
      '2027-03-31',
      '2027-04-30',
      '2027-05-31',
    ]);
  });

  it('repeats every N days, weeks, months or years and skips ahead to the range', () => {
    expect(
      dates(
        { frequency: 'custom', start: '2027-01-01', interval: 2, unit: 'week' },
        '2027-03-01',
        '2027-03-31',
      ),
    ).toEqual(['2027-03-12', '2027-03-26']);
    expect(
      dates(
        { frequency: 'custom', start: '2027-01-01', interval: 10, unit: 'day' },
        '2027-01-05',
        '2027-01-31',
      ),
    ).toEqual(['2027-01-11', '2027-01-21', '2027-01-31']);
    expect(
      dates(
        { frequency: 'custom', start: '2027-01-15', interval: 3, unit: 'month' },
        '2027-02-01',
        '2027-12-31',
      ),
    ).toEqual(['2027-04-15', '2027-07-15', '2027-10-15']);
    expect(
      dates(
        { frequency: 'custom', start: '2020-06-01', interval: 5, unit: 'year' },
        '2021-01-01',
        '2035-12-31',
      ),
    ).toEqual(['2025-06-01', '2030-06-01', '2035-06-01']);
  });

  it('gives lead dates and the next date', () => {
    const value: RecurrenceValue = { frequency: 'yearly', start: '1990-03-12', leadDays: 7 };
    expect(nextRecurrence(value, '2026-11-04')).toEqual({
      date: '2027-03-12',
      leadDate: '2027-03-05',
      index: 37,
    });
    expect(nextRecurrence({ frequency: 'once', start: '2026-01-01' }, '2026-11-04')).toBeNull();
    expect(nextRecurrence({ frequency: 'once', start: '2030-01-01' }, '2026-11-04')?.date).toBe(
      '2030-01-01',
    );
  });

  it('summarises the rule in English and Hungarian', () => {
    expect(recurrenceSummary({ frequency: 'yearly', start: '1990-03-12', leadDays: 7 })).toBe(
      'Every year on 12 March, 7 days before',
    );
    expect(recurrenceSummary({ frequency: 'once', start: '2027-03-12', leadDays: 1 })).toBe(
      'Once, on 12 March 2027, 1 day before',
    );
    expect(recurrenceSummary({ frequency: 'monthly', start: '2027-01-15' })).toBe(
      'Every month on day 15',
    );
    expect(recurrenceSummary({ frequency: 'monthly', start: '2027-01-31' })).toBe(
      'Every month on the last day',
    );
    expect(
      recurrenceSummary({ frequency: 'custom', start: '2027-01-01', interval: 2, unit: 'week' }),
    ).toBe('Every 2 weeks, from 1 January 2027');
    expect(
      recurrenceSummary({ frequency: 'custom', start: '2027-01-01', interval: 1, unit: 'day' }),
    ).toBe('Every day, from 1 January 2027');
    expect(
      recurrenceSummary(
        { frequency: 'yearly', start: '1990-03-12', leadDays: 7 },
        { locale: 'hu-HU' },
      ),
    ).toBe('Minden évben március 12., 7 nappal előtte');
  });
});

function Harness({ initial }: { initial: RecurrenceValue }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <RecurrenceField label="When to send" value={value} onChange={setValue} today="2026-11-04" />
      <output data-testid="value">{JSON.stringify(value)}</output>
    </>
  );
}

describe('RecurrenceField', () => {
  it('switches frequency, shows custom inputs and updates the summary and next date', async () => {
    render(<Harness initial={{ frequency: 'yearly', start: '1990-03-12', leadDays: 7 }} />);
    const group = screen.getByRole('group', { name: 'When to send' });
    expect(group).toHaveAccessibleDescription(
      /Every year on 12 March, 7 days before Next: 12 March 2027 \(from 5 March 2027\)/,
    );
    expect(screen.queryByLabelText('Every')).toBeNull();
    await userEvent.click(screen.getByRole('radio', { name: 'Custom' }));
    expect(screen.getByLabelText('Every')).toHaveValue('1');
    await userEvent.selectOptions(screen.getByLabelText('Unit'), 'month');
    const every = screen.getByLabelText('Every');
    await userEvent.clear(every);
    await userEvent.type(every, '6');
    await userEvent.tab();
    expect(JSON.parse(screen.getByTestId('value').textContent!)).toMatchObject({
      frequency: 'custom',
      unit: 'month',
      interval: 6,
      leadDays: 7,
    });
    expect(
      screen.getByText('Every 6 months, from 12 March 1990, 7 days before'),
    ).toBeInTheDocument();
  });

  it('changes the lead time with the stepper and hides it when not wanted', async () => {
    const { unmount } = render(<Harness initial={{ frequency: 'monthly', start: '2026-11-20' }} />);
    expect(screen.getByText('Next: 20 November 2026')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Increase/ }));
    expect(screen.getByText('Every month on day 20, 1 day before')).toBeInTheDocument();
    unmount();
    render(
      <RecurrenceField
        label="Repeat"
        lead={false}
        frequencies={['once', 'yearly']}
        value={{ frequency: 'once', start: null }}
        onChange={() => {}}
      />,
    );
    expect(screen.queryByLabelText('Days in advance')).toBeNull();
    expect(screen.queryByRole('radio', { name: 'Monthly' })).toBeNull();
    expect(screen.getByLabelText(/^Date/)).toBeInTheDocument();
  });

  it('shows the application error and is translated', () => {
    render(
      <LocaleProvider locale="hu-HU">
        <RecurrenceField
          label="Küldés"
          error="Válassz dátumot."
          value={{ frequency: 'yearly', start: null }}
          onChange={() => {}}
        />
      </LocaleProvider>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Válassz dátumot.');
    expect(screen.getByRole('radio', { name: 'Évente' })).toBeChecked();
    expect(screen.getByLabelText('Ennyi nappal előtte')).toBeInTheDocument();
  });
});
