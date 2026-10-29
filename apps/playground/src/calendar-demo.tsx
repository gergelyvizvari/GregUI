import { useState } from 'react';
import {
  Badge,
  CalendarMonth,
  DatePicker,
  Stack,
  Text,
  addDays,
  todayDate,
  type CalendarDate,
} from '@gregui/react';

// Demo policy only: real collection days, holidays and print cut-offs belong to the application.
const holidays: Record<string, string> = {
  '12-25': 'Postal holiday',
  '12-26': 'Postal holiday',
  '01-01': 'Postal holiday',
};
const occasions: Record<string, string> = { '12-24': 'Anna', '01-14': 'Mum', '02-14': 'Sam' };
function deliveryAvailability(date: CalendarDate) {
  if (holidays[date.slice(5)]) return holidays[date.slice(5)];
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 ? 'No deliveries on Sundays' : undefined;
}

export function DatePickerDemo() {
  const today = todayDate();
  const earliest = addDays(today, 3);
  const [date, setDate] = useState<CalendarDate | null>(null);
  return (
    <Stack gap={3}>
      <DatePicker
        label="Arrives by"
        hint="Printing and posting take three working days. Sundays and postal holidays are unavailable."
        value={date}
        onChange={setDate}
        name="arrival"
        min={earliest}
        max={addDays(today, 365)}
        isDateUnavailable={deliveryAvailability}
      />
      <Text size="small" tone="muted">
        Selected: {date ?? 'None'}. Values are plain YYYY-MM-DD dates.
      </Text>
    </Stack>
  );
}

export function CalendarMonthDemo() {
  const earliest = addDays(todayDate(), 3);
  const [month, setMonth] = useState(earliest.slice(0, 7));
  const [date, setDate] = useState<CalendarDate | null>(null);
  return (
    <Stack gap={3}>
      <CalendarMonth
        label="Send date"
        month={month}
        onMonthChange={setMonth}
        value={date}
        onSelect={setDate}
        min={earliest}
        isDateUnavailable={deliveryAvailability}
        renderDay={(day) => {
          const name = occasions[day.slice(5)];
          return name ? <Badge>{name}</Badge> : null;
        }}
      />
      <Text size="small" tone="muted">
        Arrow keys move by day and week, Page Up/Down by month, Home/End to the week edges. Blocked
        days stay focusable and say why. Selected: {date ?? 'None'}.
      </Text>
    </Stack>
  );
}
