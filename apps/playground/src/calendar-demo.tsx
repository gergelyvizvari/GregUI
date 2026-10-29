import { useState, type FormEvent } from 'react';
import {
  Button,
  CalendarAgenda,
  CalendarMonth,
  Checkbox,
  DatePicker,
  Stack,
  Text,
  TextField,
  addDays,
  todayDate,
  type CalendarDate,
  type CalendarEvent,
} from '@gregui/react';

// Demo policy only: real collection days, holidays and print cut-offs belong to the application.
const holidays: Record<string, string> = {
  '12-25': 'Postal holiday',
  '12-26': 'Postal holiday',
  '01-01': 'Postal holiday',
};
// Occasions keep their original year, so the agenda can say "Turns 32".
interface Occasion extends CalendarEvent {
  kind: 'birthday' | 'anniversary' | 'once';
}
const onDay = (year: number, offset: number) => `${year}${addDays(todayDate(), offset).slice(4)}`;
const sampleOccasions = (): Occasion[] => [
  {
    id: 'anna',
    title: "Anna's birthday",
    date: onDay(1994, 2),
    repeat: 'yearly',
    kind: 'birthday',
  },
  { id: 'card', title: 'Send the thank-you card', date: addDays(todayDate(), 2), kind: 'once' },
  {
    id: 'wedding',
    title: 'Our anniversary',
    date: onDay(2015, 9),
    repeat: 'yearly',
    kind: 'anniversary',
  },
  { id: 'mum', title: "Mum's birthday", date: onDay(1961, 23), repeat: 'yearly', kind: 'birthday' },
  { id: 'sam', title: "Sam's birthday", date: onDay(2019, 40), repeat: 'yearly', kind: 'birthday' },
];
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
  const [occasions] = useState(sampleOccasions);
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
        events={occasions}
      />
      <Text size="small" tone="muted">
        Arrow keys move by day and week, Page Up/Down by month, Home/End to the week edges. Blocked
        days stay focusable and say why. Birthdays repeat every year. Selected: {date ?? 'None'}.
      </Text>
    </Stack>
  );
}

export function CalendarAgendaDemo() {
  const [occasions, setOccasions] = useState(sampleOccasions);
  const [picked, setPicked] = useState<string>();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [yearly, setYearly] = useState(true);
  const add = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !date) return;
    setOccasions((list) => [
      ...list,
      {
        id: `${Date.now()}`,
        title: title.trim(),
        date,
        repeat: yearly ? 'yearly' : undefined,
        kind: yearly ? 'birthday' : 'once',
      },
    ]);
    setTitle('');
    setDate(null);
  };
  return (
    <Stack gap={5}>
      <CalendarAgenda
        label="Coming up"
        events={occasions}
        days={45}
        onSelect={({ event, date }) => setPicked(`${event.title} on ${date}`)}
        renderDetail={({ event, years }) =>
          event.kind === 'birthday' && years > 0
            ? `Turns ${years}`
            : event.kind === 'anniversary' && years > 0
              ? `${years} years`
              : null
        }
      />
      <Text size="small" tone="muted">
        Tab reaches the list once; arrow keys, Home and End move between entries. Chosen:{' '}
        {picked ?? 'None'}.
      </Text>
      <form onSubmit={add}>
        <Stack gap={3}>
          <TextField label="Occasion" value={title} onChange={(e) => setTitle(e.target.value)} />
          <DatePicker
            label="Date"
            value={date}
            onChange={setDate}
            hint="For birthdays, the birth date."
          />
          <Checkbox
            label="Repeats every year"
            checked={yearly}
            onChange={(e) => setYearly(e.target.checked)}
          />
          <div>
            <Button type="submit">Add occasion</Button>
          </div>
        </Stack>
      </form>
    </Stack>
  );
}
