'use client';
import { useLocale } from '@gregui/localization';
import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  addDays,
  daysBetween,
  occurrencesBetween,
  todayDate,
  useDateFormat,
  type CalendarDate,
  type CalendarEvent,
  type CalendarOccurrence,
  type LeapDayRule,
} from './calendar';

export interface CalendarAgendaProps<E extends CalendarEvent = CalendarEvent> {
  /** Visible heading, for example "Coming up". */
  label: string;
  /** Heading level for the label; each day uses the next level. */
  headingLevel?: 2 | 3 | 4 | 5;
  events: readonly E[];
  /** First day shown. Defaults to `today`. */
  from?: CalendarDate;
  /** Number of days shown, including `from`. Defaults to 30. */
  days?: number;
  /** Override "today" (useful for tests and server rendering). */
  today?: CalendarDate;
  leapDay?: LeapDayRule;
  /** Makes each entry a button. Arrow keys, Home and End move between entries. */
  onSelect?: (occurrence: CalendarOccurrence<E>) => void;
  /** Short extra line for an entry, for example "Turns 30" or a status badge. */
  renderDetail?: (occurrence: CalendarOccurrence<E>) => ReactNode;
  /** Shown when nothing falls in the range. Defaults to the `agendaEmpty` message. */
  emptyMessage?: string;
}

/** Upcoming events grouped by day, with yearly events repeated into the range. */
export function CalendarAgenda<E extends CalendarEvent = CalendarEvent>({
  label,
  headingLevel = 2,
  events,
  from,
  days = 30,
  today: todayProp,
  leapDay,
  onSelect,
  renderDetail,
  emptyMessage,
}: CalendarAgendaProps<E>) {
  const { messages } = useLocale();
  const format = useDateFormat();
  const id = useId();
  const list = useRef<HTMLOListElement>(null);
  const today = todayProp ?? todayDate();
  const start = from ?? today;
  const end = addDays(start, Math.max(1, days) - 1);
  const groups = useMemo(() => {
    const byDate = new Map<CalendarDate, CalendarOccurrence<E>[]>();
    for (const occurrence of occurrencesBetween(events, start, end, { leapDay }))
      byDate.set(occurrence.date, [...(byDate.get(occurrence.date) ?? []), occurrence]);
    return [...byDate];
  }, [events, start, end, leapDay]);
  const keys = groups.flatMap(([date, items]) => items.map(({ event }) => `${date}:${event.id}`));
  const [activeKey, setActiveKey] = useState<string>();
  const active = activeKey && keys.includes(activeKey) ? activeKey : keys[0];
  const Title = `h${headingLevel}` as 'h2' | 'h3' | 'h4' | 'h5';
  const DayTitle = `h${headingLevel + 1}` as 'h3' | 'h4' | 'h5' | 'h6';
  const onKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    if (!onSelect) return;
    const buttons = [
      ...(list.current?.querySelectorAll<HTMLButtonElement>('[data-agenda-key]') ?? []),
    ];
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    const next = {
      ArrowDown: Math.min(index + 1, buttons.length - 1),
      ArrowUp: Math.max(index - 1, 0),
      Home: 0,
      End: buttons.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    buttons[next]?.focus();
  };
  return (
    <section className="g-agenda" aria-labelledby={`${id}-title`}>
      <Title className="g-agenda-title" id={`${id}-title`}>
        {label}
      </Title>
      {groups.length === 0 ? (
        <p className="g-agenda-empty">{emptyMessage ?? messages.agendaEmpty}</p>
      ) : (
        <ol className="g-agenda-days" ref={list} onKeyDown={onKeyDown}>
          {groups.map(([date, items]) => {
            const dayId = `${id}-${date}`;
            const offset = daysBetween(today, date);
            return (
              <li key={date} className="g-agenda-day" data-today={offset === 0 || undefined}>
                <DayTitle className="g-agenda-date" id={dayId}>
                  <time dateTime={date}>{format.full(date)}</time>
                  <span className="g-agenda-relative">{format.relativeDays(offset)}</span>
                </DayTitle>
                <ul className="g-agenda-events" aria-labelledby={dayId}>
                  {items.map((occurrence) => {
                    const key = `${date}:${occurrence.event.id}`;
                    const detail = renderDetail?.(occurrence);
                    const content = (
                      <>
                        <span className="g-agenda-event-title">{occurrence.event.title}</span>
                        {detail && <span className="g-agenda-detail">{detail}</span>}
                        {occurrence.event.repeat === 'yearly' && (
                          <span className="g-agenda-repeat">{messages.repeatsYearly}</span>
                        )}
                      </>
                    );
                    return (
                      <li key={occurrence.event.id}>
                        {onSelect ? (
                          <button
                            type="button"
                            className="g-agenda-event"
                            data-agenda-key={key}
                            tabIndex={key === active ? 0 : -1}
                            aria-describedby={dayId}
                            onFocus={() => setActiveKey(key)}
                            onClick={() => onSelect(occurrence)}
                          >
                            {content}
                          </button>
                        ) : (
                          <div className="g-agenda-event">{content}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
