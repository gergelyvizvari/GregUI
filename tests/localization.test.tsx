import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { it, expect } from 'vitest';
import {
  CalendarMonth,
  LocaleProvider,
  Pagination,
  english,
  hungarian,
  messagesFor,
  useFormat,
} from '@gregui/react';

it('translates every package message into Hungarian', () => {
  expect(Object.keys(hungarian).sort()).toEqual(Object.keys(english).sort());
  for (const [key, value] of Object.entries(hungarian)) {
    expect(value.trim(), key).not.toBe('');
  }
});

it('picks built-in messages from the locale language and falls back to English', () => {
  expect(messagesFor('hu-HU')).toBe(hungarian);
  expect(messagesFor('hu')).toBe(hungarian);
  expect(messagesFor('HU_hu')).toBe(hungarian);
  expect(messagesFor('en-GB')).toBe(english);
  expect(messagesFor('de-DE')).toBe(english);
});

it('uses Hungarian package copy for hu-HU and keeps application overrides', () => {
  render(
    <LocaleProvider locale="hu-HU" messages={{ next: 'Előre' }}>
      <Pagination page={2} pageCount={3} onPageChange={() => {}} />
    </LocaleProvider>,
  );
  expect(screen.getByRole('navigation', { name: 'Lapozás' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Előző/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Előre/ })).toBeInTheDocument();
});

it('formats Hungarian numbers and dates', () => {
  function Sample() {
    const format = useFormat();
    return (
      <p>
        {format.number(1234567.5)} | {format.date(Date.UTC(2026, 9, 23), { dateStyle: 'long' })}
      </p>
    );
  }
  const html = renderToString(
    <LocaleProvider locale="hu-HU" timeZone="Europe/Budapest">
      <Sample />
    </LocaleProvider>,
  );
  expect(html.replace(/\s/g, ' ')).toContain('1 234 567,5');
  expect(html).toContain('2026. október 23.');
});

it('renders the calendar with Hungarian month, weekday names and labels', () => {
  const html = renderToString(
    <LocaleProvider locale="hu-HU">
      <CalendarMonth
        label="Kézbesítés"
        month="2026-10"
        onMonthChange={() => {}}
        today="2026-10-29"
      />
    </LocaleProvider>,
  );
  expect(html).toContain('2026. október');
  expect(html).toContain('Előző hónap');
  expect(html).toContain('Következő hónap');
  expect(html).toContain('hétfő');
  expect(html).toContain('vasárnap');
  expect(html).toContain('2026. október 29., csütörtök');
});
