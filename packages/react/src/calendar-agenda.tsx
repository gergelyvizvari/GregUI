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
  type CalendarMonthValue,
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
  /**
   * An action beside an entry, such as "Send a card". It sits next to the entry (never inside its
   * button), so both stay separately reachable.
   */
  renderAction?: (occurrence: CalendarOccurrence<E>) => ReactNode;
  /** Shown when nothing falls in the range. Defaults to the `agendaEmpty` message. */
  emptyMessage?: string;
  /**
   * `day` (default) gives every day its own heading. `month` is a compact planner list: one heading
   * per month and one row per entry, with a date tile, the title and a line with the detail and
   * the relative day ("tomorrow", "in 5 days").
   */
  groupBy?: 'day' | 'month';
}

/** Capitalises only the first letter: "november" → "November", while "2027. január" stays. */
const sentenceStart = (text: string, locale: string) =>
  text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);

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
  renderAction,
  emptyMessage,
  groupBy = 'day',
}: CalendarAgendaProps<E>) {
  const { messages, locale } = useLocale();
  const format = useDateFormat();
  const id = useId();
  const list = useRef<HTMLOListElement>(null);
  const today = todayProp ?? todayDate();
  const start = from ?? today;
  const end = addDays(start, Math.max(1, days) - 1);
  const groups = useMemo(() => {
    const byDate = new Map<string, CalendarOccurrence<E>[]>();
    for (const occurrence of occurrencesBetween(events, start, end, { leapDay })) {
      const group = groupBy === 'month' ? occurrence.date.slice(0, 7) : occurrence.date;
      byDate.set(group, [...(byDate.get(group) ?? []), occurrence]);
    }
    return [...byDate];
  }, [events, start, end, leapDay, groupBy]);
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
  const entry = (occurrence: CalendarOccurrence<E>, content: ReactNode, describedBy?: string) => {
    const key = `${occurrence.date}:${occurrence.event.id}`;
    return onSelect ? (
      <button
        type="button"
        className="g-agenda-event"
        data-agenda-key={key}
        tabIndex={key === active ? 0 : -1}
        aria-describedby={describedBy}
        onFocus={() => setActiveKey(key)}
        onClick={() => onSelect(occurrence)}
      >
        {content}
      </button>
    ) : (
      <div className="g-agenda-event">{content}</div>
    );
  };
  const thisYear = today.slice(0, 4);
  const monthGroups = () => (
    <ol className="g-agenda-days" data-group="month" ref={list} onKeyDown={onKeyDown}>
      {groups.map(([month, items]) => {
        const monthId = `${id}-${month}`;
        return (
          <li key={month} className="g-agenda-day">
            <DayTitle className="g-agenda-date" id={monthId}>
              {sentenceStart(
                month.slice(0, 4) === thisYear
                  ? format.monthName(month as CalendarMonthValue)
                  : format.month(month as CalendarMonthValue),
                locale,
              )}
            </DayTitle>
            <ul className="g-agenda-events" aria-labelledby={monthId}>
              {items.map((occurrence) => {
                const { date, event } = occurrence;
                const offset = daysBetween(today, date);
                const detail = renderDetail?.(occurrence);
                const action = renderAction?.(occurrence);
                // The title comes first for assistive technology; the tile is moved before it visually.
                const content = (
                  <>
                    <span className="g-agenda-text">
                      <span className="g-agenda-event-title">{event.title}</span>
                      <span className="g-agenda-detail">
                        <span className="g-agenda-relative">{format.relativeDays(offset)}</span>
                        {detail && (
                          <>
                            <span aria-hidden="true"> · </span>
                            {detail}
                          </>
                        )}
                      </span>
                    </span>
                    <time className="g-agenda-tile" dateTime={date}>
                      <span className="g-agenda-tile-day" aria-hidden="true">
                        {Number(date.slice(8, 10))}
                      </span>
                      <span className="g-agenda-tile-weekday" aria-hidden="true">
                        {format.weekdayOf(date)}
                      </span>
                      <span className="g-sr-only">{format.full(date)}</span>
                    </time>
                  </>
                );
                return (
                  <li
                    key={`${date}:${event.id}`}
                    data-action={action ? true : undefined}
                    data-today={offset === 0 || undefined}
                    data-tone={event.tone ?? 'primary'}
                  >
                    {entry(occurrence, content)}
                    {action && <div className="g-agenda-action">{action}</div>}
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ol>
  );
  return (
    <section className="g-agenda" data-group={groupBy} aria-labelledby={`${id}-title`}>
      <Title className="g-agenda-title" id={`${id}-title`}>
        {label}
      </Title>
      {groups.length === 0 ? (
        <p className="g-agenda-empty">{emptyMessage ?? messages.agendaEmpty}</p>
      ) : groupBy === 'month' ? (
        monthGroups()
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
                    const action = renderAction?.(occurrence);
                    return (
                      <li key={occurrence.event.id} data-action={action ? true : undefined}>
                        {entry(occurrence, content, dayId)}
                        {action && <div className="g-agenda-action">{action}</div>}
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
