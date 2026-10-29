import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import {
  CalendarMonth,
  DatePicker,
  LocaleProvider,
  addDays,
  addMonths,
  isCalendarDate,
  type CalendarDate,
} from '@gregui/react';

const weekendOrHoliday = (date: CalendarDate) => {
  if (date === '2026-12-25') return 'Postal holiday';
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6 ? 'No collection at weekends' : undefined;
};

it('does date arithmetic on plain dates without time zone drift', () => {
  expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  expect(addDays('2026-03-29', -1)).toBe('2026-03-28');
  expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
  expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
  expect(isCalendarDate('2026-02-30')).toBe(false);
  expect(isCalendarDate('2026-02-28')).toBe(true);
});

function Month(props: Partial<Parameters<typeof CalendarMonth>[0]>) {
  const [month, setMonth] = useState('2026-12');
  const [value, setValue] = useState<CalendarDate | null>(null);
  return (
    <>
      <CalendarMonth
        label="Delivery date"
        month={month}
        onMonthChange={setMonth}
        value={value}
        onSelect={setValue}
        today="2026-12-10"
        isDateUnavailable={weekendOrHoliday}
        {...props}
      />
      <output data-testid="picked">{value ?? 'none'}</output>
    </>
  );
}

it('renders a labelled grid that starts on Monday and marks today', () => {
  render(<Month />);
  const grid = screen.getByRole('grid', { name: 'Delivery date, December 2026' });
  const headers = within(grid).getAllByRole('columnheader');
  expect(headers[0]).toHaveTextContent('Mon');
  expect(headers[0]).toHaveAttribute('abbr', 'Monday');
  const today = screen.getByRole('button', { name: 'Thursday, 10 December 2026' });
  expect(today).toHaveAttribute('aria-current', 'date');
  expect(today).toHaveAttribute('tabindex', '0');
  // 1 December 2026 is a Tuesday, so the first Monday cell is empty.
  expect(within(grid).getAllByRole('row')[1]!.querySelectorAll('td')[0]).toBeEmptyDOMElement();
});

it('moves by keyboard across days, weeks and months and selects with Enter', async () => {
  const user = userEvent.setup();
  render(<Month />);
  await user.click(screen.getByRole('button', { name: 'Thursday, 10 December 2026' }));
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('button', { name: 'Friday, 11 December 2026' })).toHaveFocus();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(screen.getByTestId('picked')).toHaveTextContent('2026-12-18');
  await user.keyboard('{PageDown}');
  expect(screen.getByRole('grid', { name: /January 2027/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Monday, 18 January 2027' })).toHaveFocus();
  await user.keyboard('{Home}');
  expect(screen.getByRole('button', { name: 'Monday, 18 January 2027' })).toHaveFocus();
  await user.keyboard('{End}');
  expect(screen.getByRole('button', { name: 'Sunday, 24 January 2027' })).toHaveFocus();
});

it('keeps blocked dates focusable, explains why and refuses to select them', async () => {
  const user = userEvent.setup();
  render(<Month />);
  const holiday = screen.getByRole('button', { name: 'Friday, 25 December 2026' });
  expect(holiday).toHaveAttribute('aria-disabled', 'true');
  expect(holiday).toHaveAccessibleDescription('Postal holiday');
  await user.click(holiday);
  expect(screen.getByTestId('picked')).toHaveTextContent('none');
  expect(screen.getByText('25 Dec 2026: Postal holiday')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Saturday, 26 December 2026' }),
  ).toHaveAccessibleDescription('No collection at weekends');
});

it('respects min and max for navigation and selection', async () => {
  const user = userEvent.setup();
  render(<Month min="2026-12-09" max="2027-01-15" />);
  expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
  expect(
    screen.getByRole('button', { name: 'Tuesday, 8 December 2026' }),
  ).toHaveAccessibleDescription('Too early to choose');
  await user.click(screen.getByRole('button', { name: 'Next month' }));
  expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
});

it('renders extra day content and translated, server-safe output', () => {
  const html = renderToString(
    <LocaleProvider locale="hu-HU" messages={{ previousMonth: 'Előző hónap' }}>
      <CalendarMonth
        label="Kézbesítés"
        month="2026-12"
        onMonthChange={() => {}}
        today="2026-12-10"
        renderDay={(date) => (date === '2026-12-24' ? 'Anna' : null)}
      />
    </LocaleProvider>,
  );
  expect(html).toContain('Előző hónap');
  expect(html).toContain('2026. december');
  expect(html).toContain('Anna');
});

it('opens a date picker, selects a date, returns focus and submits the ISO value', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  function Fixture() {
    const [value, setValue] = useState<CalendarDate | null>(null);
    return (
      <form data-testid="form">
        <DatePicker
          label="Arrives by"
          name="arrival"
          hint="We print and post the day before."
          value={value}
          onChange={(next) => {
            onChange(next);
            setValue(next);
          }}
          today="2026-12-10"
          isDateUnavailable={weekendOrHoliday}
        />
      </form>
    );
  }
  render(<Fixture />);
  const trigger = screen.getByRole('button', { name: /Arrives by/ });
  expect(trigger).toHaveTextContent('Choose a date');
  expect(trigger).toHaveAccessibleDescription('We print and post the day before.');
  await user.click(trigger);
  expect(screen.getByRole('button', { name: 'Thursday, 10 December 2026' })).toHaveFocus();
  await user.keyboard('{ArrowRight}{Enter}');
  expect(onChange).toHaveBeenCalledWith('2026-12-11');
  expect(screen.queryByRole('grid')).toBeNull();
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveTextContent('11 Dec 2026');
  const data = new FormData(screen.getByTestId('form') as HTMLFormElement);
  expect(data.get('arrival')).toBe('2026-12-11');
});
