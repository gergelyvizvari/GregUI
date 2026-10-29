import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import {
  CalendarAgenda,
  CalendarMonth,
  DatePicker,
  LocaleProvider,
  addDays,
  addMonths,
  isCalendarDate,
  occurrencesBetween,
  yearlyDate,
  type CalendarDate,
  type CalendarEvent,
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

const occasions: CalendarEvent[] = [
  { id: 'anna', title: "Anna's birthday", date: '1994-12-12', repeat: 'yearly' },
  { id: 'card', title: 'Post the card', date: '2026-12-12' },
  { id: 'leap', title: "Leo's birthday", date: '2000-02-29', repeat: 'yearly' },
  { id: 'old', title: 'Office party', date: '2025-12-15' },
  {
    id: 'lease',
    title: 'Lease renewal',
    date: '2020-12-20',
    repeat: 'yearly',
    until: '2026-12-31',
  },
];

it('repeats yearly events from their first date, counts years and moves 29 February', () => {
  expect(yearlyDate('2000-02-29', 2027)).toBe('2027-02-28');
  expect(yearlyDate('2000-02-29', 2027, 'mar1')).toBe('2027-03-01');
  expect(yearlyDate('2000-02-29', 2028)).toBe('2028-02-29');
  const december = occurrencesBetween(occasions, '2026-12-01', '2026-12-31');
  expect(december.map(({ event, date, years }) => [event.id, date, years])).toEqual([
    ['anna', '2026-12-12', 32],
    ['card', '2026-12-12', 0],
    ['lease', '2026-12-20', 6],
  ]);
  // Repeats never appear before the first occurrence or after `until`.
  expect(occurrencesBetween(occasions, '1990-12-01', '1993-12-31')).toEqual([]);
  expect(occurrencesBetween(occasions, '2024-12-01', '2024-12-31').map((o) => o.event.id)).toEqual([
    'anna',
    'lease',
  ]);
  expect(occurrencesBetween(occasions, '2027-12-01', '2027-12-31').map((o) => o.event.id)).toEqual([
    'anna',
  ]);
  const years = occurrencesBetween(occasions, '2026-01-01', '2028-12-31').filter(
    (o) => o.event.id === 'leap',
  );
  expect(years.map((o) => o.date)).toEqual(['2026-02-28', '2027-02-28', '2028-02-29']);
  expect(
    occurrencesBetween(occasions, '2027-02-01', '2027-03-31', { leapDay: 'mar1' }).map(
      (o) => o.date,
    ),
  ).toEqual(['2027-03-01']);
});

it('shows yearly events inside month days and reads them with the date', () => {
  render(<Month events={occasions} />);
  const day = screen.getByRole('button', { name: 'Saturday, 12 December 2026' });
  expect(day).toHaveAccessibleDescription(
    "No collection at weekends Anna's birthday, Post the card",
  );
  expect(day).toHaveTextContent("Anna's birthday+1");
  expect(
    screen.getByRole('button', { name: 'Tuesday, 15 December 2026' }),
  ).not.toHaveAccessibleDescription(/Office party/);
});

it('lists upcoming occurrences by day with relative labels and yearly details', () => {
  render(
    <CalendarAgenda
      label="Coming up"
      events={occasions}
      today="2026-12-12"
      days={10}
      renderDetail={({ event, years }) => (event.repeat ? `Turns ${years}` : null)}
    />,
  );
  const region = screen.getByRole('region', { name: 'Coming up' });
  expect(within(region).getByRole('heading', { level: 2, name: 'Coming up' })).toBeInTheDocument();
  const days = within(region).getAllByRole('heading', { level: 3 });
  expect(days.map((d) => d.textContent)).toEqual([
    'Saturday, 12 December 2026today',
    'Sunday, 20 December 2026in 8 days',
  ]);
  const list = within(region).getByRole('list', { name: /12 December 2026/ });
  expect(
    within(list)
      .getAllByRole('listitem')
      .map((i) => i.textContent),
  ).toEqual(["Anna's birthdayTurns 32Every year", 'Post the card']);
  expect(region.querySelector('time')).toHaveAttribute('datetime', '2026-12-12');
  expect(screen.queryByRole('button')).toBeNull();
});

it('says when nothing is coming up', () => {
  render(<CalendarAgenda label="Coming up" events={occasions} today="2026-06-01" days={7} />);
  expect(screen.getByText('Nothing coming up in this period.')).toBeInTheDocument();
});

it('makes agenda entries one tab stop with arrow, Home and End navigation', async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(
    <>
      <button type="button">Before</button>
      <CalendarAgenda
        label="Coming up"
        events={occasions}
        today="2026-12-10"
        days={30}
        onSelect={onSelect}
      />
      <button type="button">After</button>
    </>,
  );
  await user.click(screen.getByRole('button', { name: 'Before' }));
  await user.tab();
  const anna = screen.getByRole('button', { name: /^Anna's birthday/ });
  expect(anna).toHaveFocus();
  expect(anna).toHaveAccessibleDescription('Saturday, 12 December 2026 in 2 days');
  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('button', { name: 'Post the card' })).toHaveFocus();
  await user.keyboard('{End}');
  expect(screen.getByRole('button', { name: /^Lease renewal/ })).toHaveFocus();
  await user.keyboard('{ArrowDown}{Home}');
  expect(anna).toHaveFocus();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(onSelect).toHaveBeenCalledWith(
    expect.objectContaining({ date: '2026-12-12', years: 0, event: occasions[1] }),
  );
  await user.tab();
  expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  await user.tab({ shift: true });
  expect(screen.getByRole('button', { name: 'Post the card' })).toHaveFocus();
});

it('renders the agenda in another locale on the server', () => {
  const html = renderToString(
    <LocaleProvider locale="hu-HU" messages={{ repeatsYearly: 'Minden évben' }}>
      <CalendarAgenda label="Közelgő" events={occasions} today="2026-12-11" days={3} />
    </LocaleProvider>,
  );
  expect(html).toContain('Minden évben');
  expect(html).toContain('holnap');
  expect(html).toContain('2026. december 12.');
});
