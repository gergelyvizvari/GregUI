'use client';
import React, {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useFormat, useLocale } from '@gregui/localization';
import { IconButton } from './buttons';
import { Icon } from './icons';
import { Menu, type MenuEntry } from './menu';
import { Heading, Text, VisuallyHidden } from './typography';

export interface KanbanColumn {
  id: string;
  title: string;
  /** Work-in-progress limit; the count shows "3 of 5" and marks the column when over it. */
  limit?: number;
}
export interface KanbanCard {
  id: string;
  columnId: string;
  /** Names the card in move controls and announcements. */
  title: string;
}
export interface KanbanMove {
  cardId: string;
  fromColumnId: string;
  fromIndex: number;
  toColumnId: string;
  /** Position in the destination column after the move, counted from 0. */
  toIndex: number;
}
export interface KanbanBoardProps<T extends KanbanCard> {
  /** Accessible name of the board. */
  label: string;
  columns: readonly KanbanColumn[];
  /** Cards in display order; a card's position in its column follows this array. */
  cards: readonly T[];
  /** Apply the move to your data. The board shows the result once `cards` changes. */
  onMove: (move: KanbanMove) => void;
  /** Card body. Defaults to the title. Keep interactive content to links and buttons. */
  renderCard?: (card: T) => ReactNode;
  /** Return false to keep a card out of a column; moves skip it. */
  canMove?: (card: T, toColumnId: string) => boolean;
  /** Pointer drag and drop as well as keyboard and menu moves. Defaults to true. */
  draggable?: boolean;
  /** Level of the column headings. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Shown in empty columns. */
  emptyMessage?: string;
}
interface Place {
  columnId: string;
  index: number;
}

/**
 * Columns of cards that people move with the keyboard (pick up, arrows, drop), a move menu, or
 * by dragging. Controlled: the board reports moves and the application updates `cards`.
 */
export function KanbanBoard<T extends KanbanCard>({
  label,
  columns,
  cards,
  onMove,
  renderCard,
  canMove,
  draggable = true,
  headingLevel = 3,
  emptyMessage,
}: KanbanBoardProps<T>) {
  const { messages: m, direction } = useLocale();
  const format = useFormat();
  const id = useId();
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const [grabbed, setGrabbed] = useState<{ id: string; origin: Place; place: Place } | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<Place | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const refocus = useRef<string | null>(null);

  const byColumn = useMemo(() => {
    const map = new Map<string, T[]>(columns.map((column) => [column.id, []]));
    for (const card of cards) map.get(card.columnId)?.push(card);
    return map;
  }, [cards, columns]);
  // While a card is picked up, show it where it would land.
  const shown = useMemo(() => {
    if (!grabbed) return byColumn;
    const card = cards.find((item) => item.id === grabbed.id);
    if (!card) return byColumn;
    const map = new Map<string, T[]>();
    for (const [key, list] of byColumn)
      map.set(
        key,
        list.filter((item) => item.id !== card.id),
      );
    map.get(grabbed.place.columnId)?.splice(grabbed.place.index, 0, card);
    return map;
  }, [byColumn, grabbed, cards]);

  useEffect(() => {
    if (!refocus.current) return;
    handles.current.get(refocus.current)?.focus();
    refocus.current = null;
  });
  // Drop a pick-up whose card disappeared.
  useEffect(() => {
    if (grabbed && !cards.some((card) => card.id === grabbed.id)) setGrabbed(null);
  }, [cards, grabbed]);

  const titleOf = (columnId: string) => columns.find((c) => c.id === columnId)?.title ?? '';
  const where = (template: string, card: T, place: Place, total: number) =>
    template
      .replace('{title}', card.title)
      .replace('{column}', titleOf(place.columnId))
      .replace('{position}', format.number(place.index + 1))
      .replace('{total}', format.number(total));
  const allowed = (card: T, columnId: string) =>
    columnId === card.columnId || !canMove || canMove(card, columnId);
  const placeOf = (card: T): Place => ({
    columnId: card.columnId,
    index: byColumn.get(card.columnId)?.indexOf(card) ?? 0,
  });
  function commit(card: T, to: Place) {
    const from = placeOf(card);
    if (from.columnId === to.columnId && from.index === to.index) return false;
    refocus.current = card.id;
    onMove({
      cardId: card.id,
      fromColumnId: from.columnId,
      fromIndex: from.index,
      toColumnId: to.columnId,
      toIndex: to.index,
    });
    return true;
  }
  const others = (columnId: string, cardId: string) =>
    (byColumn.get(columnId) ?? []).filter((item) => item.id !== cardId).length;
  function moveTo(card: T, to: Place) {
    if (!commit(card, to)) return;
    const total = others(to.columnId, card.id) + 1;
    setAnnouncement(where(m.kanbanDropped, card, to, total));
  }

  function onHandleKey(event: KeyboardEvent<HTMLButtonElement>, card: T) {
    const key = event.key;
    if (!grabbed || grabbed.id !== card.id) {
      if (key === ' ' || key === 'Enter') {
        event.preventDefault();
        const origin = placeOf(card);
        setGrabbed({ id: card.id, origin, place: origin });
        setAnnouncement(
          where(m.kanbanPickedUp, card, origin, byColumn.get(origin.columnId)!.length),
        );
      }
      return;
    }
    const { place } = grabbed;
    if (key === ' ' || key === 'Enter') {
      event.preventDefault();
      setGrabbed(null);
      if (commit(card, place))
        setAnnouncement(where(m.kanbanDropped, card, place, others(place.columnId, card.id) + 1));
      else setAnnouncement(where(m.kanbanCancelled, card, grabbed.origin, 0));
      return;
    }
    if (key === 'Escape' || key === 'Tab') {
      if (key === 'Escape') event.preventDefault();
      setGrabbed(null);
      refocus.current = key === 'Escape' ? card.id : null;
      setAnnouncement(where(m.kanbanCancelled, card, grabbed.origin, 0));
      return;
    }
    const size = others(place.columnId, card.id) + 1;
    let next: Place | null = null;
    if (key === 'ArrowUp') next = { ...place, index: Math.max(0, place.index - 1) };
    else if (key === 'ArrowDown') next = { ...place, index: Math.min(size - 1, place.index + 1) };
    else if (key === 'Home') next = { ...place, index: 0 };
    else if (key === 'End') next = { ...place, index: size - 1 };
    else if (key === 'ArrowLeft' || key === 'ArrowRight') {
      const forward = (key === 'ArrowRight') !== (direction === 'rtl');
      const start = columns.findIndex((column) => column.id === place.columnId);
      for (
        let i = start + (forward ? 1 : -1);
        i >= 0 && i < columns.length;
        i += forward ? 1 : -1
      ) {
        if (!allowed(card, columns[i]!.id)) continue;
        const target = columns[i]!.id;
        next = { columnId: target, index: Math.min(place.index, others(target, card.id)) };
        break;
      }
    } else return;
    event.preventDefault();
    if (!next || (next.columnId === place.columnId && next.index === place.index)) return;
    refocus.current = card.id;
    setGrabbed({ ...grabbed, place: next });
    setAnnouncement(where(m.kanbanPosition, card, next, others(next.columnId, card.id) + 1));
  }

  function dropIndex(list: HTMLElement, y: number, cardId: string) {
    const items = Array.from(list.querySelectorAll<HTMLElement>(':scope > [data-card-id]')).filter(
      (item) => item.dataset.cardId !== cardId,
    );
    return items.filter((item) => {
      const box = item.getBoundingClientRect();
      return box.top + box.height / 2 < y;
    }).length;
  }

  return (
    <section className="g-kanban" aria-label={label}>
      <p id={`${id}-help`} hidden>
        {m.kanbanInstructions}
      </p>
      <div className="g-kanban-columns">
        {columns.map((column) => {
          const list = shown.get(column.id) ?? [];
          const count = (byColumn.get(column.id) ?? []).length;
          const over = column.limit !== undefined && count > column.limit;
          const dragCard = dragging ? cards.find((card) => card.id === dragging) : undefined;
          const accepts = !dragCard || allowed(dragCard, column.id);
          return (
            <section
              key={column.id}
              className="g-kanban-column"
              aria-labelledby={`${id}-${column.id}`}
              data-over-limit={over || undefined}
              data-drop-target={dropTarget?.columnId === column.id || undefined}
            >
              <header className="g-kanban-column-header">
                <Heading level={headingLevel} size="card" id={`${id}-${column.id}`}>
                  {column.title}
                </Heading>
                <Text as="span" size="small" tone={over ? 'danger' : 'muted'}>
                  {column.limit === undefined ? (
                    <>
                      <span aria-hidden="true">{format.number(count)}</span>
                      <VisuallyHidden>
                        {m.kanbanCount.replace('{count}', format.number(count))}
                      </VisuallyHidden>
                    </>
                  ) : (
                    m.kanbanLimit
                      .replace('{count}', format.number(count))
                      .replace('{limit}', format.number(column.limit))
                  )}
                  {over && (
                    <VisuallyHidden>
                      {`, ${m.kanbanOverLimit.replace('{limit}', format.number(column.limit!))}`}
                    </VisuallyHidden>
                  )}
                </Text>
              </header>
              <ul
                className="g-kanban-list"
                aria-labelledby={`${id}-${column.id}`}
                onDragOver={(event) => {
                  if (!dragCard || !accepts) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                  const index = dropIndex(event.currentTarget, event.clientY, dragCard.id);
                  if (dropTarget?.columnId !== column.id || dropTarget.index !== index)
                    setDropTarget({ columnId: column.id, index });
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null))
                    setDropTarget(null);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragCard && accepts)
                    moveTo(dragCard, {
                      columnId: column.id,
                      index: dropIndex(event.currentTarget, event.clientY, dragCard.id),
                    });
                  setDragging(null);
                  setDropTarget(null);
                }}
              >
                {list.map((card, index) => {
                  const picked = grabbed?.id === card.id;
                  const menu: MenuEntry[] = [
                    ...columns
                      .filter((target) => target.id !== card.columnId && allowed(card, target.id))
                      .map((target) => ({
                        id: `to-${target.id}`,
                        label: m.kanbanMoveTo.replace('{column}', target.title),
                        onSelect: () =>
                          moveTo(card, { columnId: target.id, index: others(target.id, card.id) }),
                      })),
                    ...(list.length > 1 ? [{ type: 'separator' as const, id: 'sep' }] : []),
                    ...(index > 0
                      ? [
                          {
                            id: 'top',
                            label: m.kanbanMoveTop,
                            onSelect: () => moveTo(card, { columnId: card.columnId, index: 0 }),
                          },
                        ]
                      : []),
                    ...(index < list.length - 1
                      ? [
                          {
                            id: 'bottom',
                            label: m.kanbanMoveBottom,
                            onSelect: () =>
                              moveTo(card, { columnId: card.columnId, index: list.length - 1 }),
                          },
                        ]
                      : []),
                  ];
                  return (
                    <li
                      key={card.id}
                      data-card-id={card.id}
                      className="g-kanban-card"
                      data-picked={picked || undefined}
                      data-dragging={dragging === card.id || undefined}
                      data-drop-before={
                        (dropTarget?.columnId === column.id && dropTarget.index === index) ||
                        undefined
                      }
                      draggable={draggable}
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', card.title);
                        setDragging(card.id);
                      }}
                      onDragEnd={() => {
                        setDragging(null);
                        setDropTarget(null);
                      }}
                    >
                      <div className="g-kanban-card-tools">
                        <IconButton
                          ref={(node) => {
                            if (node) handles.current.set(card.id, node);
                            else handles.current.delete(card.id);
                          }}
                          variant="ghost"
                          size="small"
                          label={m.kanbanMove.replace('{title}', card.title)}
                          aria-describedby={`${id}-help`}
                          aria-pressed={picked}
                          onKeyDown={(event) => onHandleKey(event, card)}
                          onClick={(event) => {
                            // Keyboard activation is handled in onKeyDown; a click picks up too.
                            if (event.detail === 0) return;
                            if (picked) setGrabbed(null);
                            else {
                              const origin = placeOf(card);
                              setGrabbed({ id: card.id, origin, place: origin });
                            }
                          }}
                          onBlur={() => {
                            if (picked && refocus.current !== card.id) {
                              setGrabbed(null);
                              setAnnouncement(where(m.kanbanCancelled, card, grabbed!.origin, 0));
                            }
                          }}
                        >
                          <Icon>
                            <circle cx="9" cy="6" r="1" />
                            <circle cx="15" cy="6" r="1" />
                            <circle cx="9" cy="12" r="1" />
                            <circle cx="15" cy="12" r="1" />
                            <circle cx="9" cy="18" r="1" />
                            <circle cx="15" cy="18" r="1" />
                          </Icon>
                        </IconButton>
                        {menu.length > 0 && (
                          <Menu
                            label={m.kanbanMoveOptions.replace('{title}', card.title)}
                            trigger={
                              <IconButton
                                variant="ghost"
                                size="small"
                                label={m.kanbanMoveOptions.replace('{title}', card.title)}
                              >
                                <Icon name="more" />
                              </IconButton>
                            }
                            items={menu.filter(
                              (item, i, all) =>
                                item.type !== 'separator' || (i > 0 && i < all.length - 1),
                            )}
                          />
                        )}
                      </div>
                      <div className="g-kanban-card-body">
                        {renderCard ? renderCard(card) : <Text weight="strong">{card.title}</Text>}
                      </div>
                    </li>
                  );
                })}
                {list.length === 0 && (
                  <li className="g-kanban-empty">
                    <Text size="small" tone="muted">
                      {emptyMessage ?? m.kanbanEmpty}
                    </Text>
                  </li>
                )}
              </ul>
            </section>
          );
        })}
      </div>
      <div role="status" className="g-sr-only">
        {announcement}
      </div>
    </section>
  );
}

/** Applies a `KanbanMove` to a card array, for applications that keep cards in one ordered list. */
export function moveKanbanCard<T extends KanbanCard>(cards: readonly T[], move: KanbanMove): T[] {
  const card = cards.find((item) => item.id === move.cardId);
  if (!card) return [...cards];
  const rest = cards.filter((item) => item.id !== move.cardId);
  const inColumn = rest.filter((item) => item.columnId === move.toColumnId);
  const moved = { ...card, columnId: move.toColumnId };
  const before = inColumn[move.toIndex];
  if (before) {
    rest.splice(rest.indexOf(before), 0, moved);
    return rest;
  }
  const last = inColumn[inColumn.length - 1];
  rest.splice(last ? rest.indexOf(last) + 1 : rest.length, 0, moved);
  return rest;
}
