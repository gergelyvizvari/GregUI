'use client';
import {
  Children,
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type DragEvent,
  type ReactNode,
} from 'react';
import { spacing, type Space } from '@gregui/tokens';
import { useLocale } from '@gregui/localization';
import { IconButton } from './buttons';
import { Badge } from './feedback';
import { Icon } from './icons';
import type { Clean, DivProps } from './internal-types';
import { Menu } from './menu';
import { Heading, Text } from './typography';
export function Stack({ gap = 4, children, ...props }: DivProps & { gap?: Space }) {
  return (
    <div {...props} className="g-stack" style={{ gap: spacing[gap] }}>
      {children}
    </div>
  );
}
export function Inline({
  gap = 3,
  align = 'center',
  justify = 'start',
  wrap = true,
  children,
  ...props
}: DivProps & {
  gap?: Space;
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'between' | 'end';
  /** false keeps every child on one row, so long text wraps inside its own item (an icon beside a sentence). */
  wrap?: boolean;
}) {
  return (
    <div
      {...props}
      className="g-inline"
      data-align={align}
      data-justify={justify}
      data-wrap={wrap ? undefined : 'false'}
      style={{ gap: spacing[gap] }}
    >
      {children}
    </div>
  );
}
export function Grid({
  columns = 2,
  gap = 4,
  children,
  ...props
}: DivProps & { columns?: 1 | 2 | 3 | 4 | 5 | 'auto'; gap?: Space }) {
  return (
    <div {...props} className="g-grid" data-columns={columns} style={{ gap: spacing[gap] }}>
      {children}
    </div>
  );
}
export function Split({ children, ...props }: DivProps) {
  return (
    <div {...props} className="g-split">
      {children}
    </div>
  );
}
export function Container({
  children,
  size = 'page',
  inset = true,
  align = 'center',
  ...props
}: DivProps & {
  size?: 'page' | 'form' | 'reading';
  inset?: boolean;
  /** `start` keeps a narrow container against the page's leading edge, under a left-aligned title. */
  align?: 'center' | 'start';
}) {
  return (
    <div
      {...props}
      className="g-container"
      data-size={size}
      data-inset={inset}
      data-align={align === 'start' ? 'start' : undefined}
    >
      {children}
    </div>
  );
}
export function Card({
  children,
  padding = 5,
  footer,
  ...props
}: DivProps & { padding?: Space; footer?: ReactNode }) {
  return (
    <div
      {...props}
      className="g-card"
      data-footer={footer != null || undefined}
      style={{
        padding: padding === 0 ? 0 : `max(${spacing[padding]}, var(--g-card-min-padding, 0px))`,
      }}
    >
      {children}
      {footer != null && <div className="g-card-footer">{footer}</div>}
    </div>
  );
}
/**
 * The card's title as a link that makes the whole card clickable, for lists where each card opens
 * a record. It reads as plain heading text (no link colour or underline); the card lifts on hover
 * and shows the focus ring when the link has keyboard focus. Buttons, checkboxes and other links
 * inside the card stay clickable on their own. Use one per card. Apps own navigation: pass
 * `onClick` (and `preventDefault`) for client-side routing.
 */
export function CardLink({
  children,
  ...props
}: Clean<ComponentPropsWithoutRef<'a'>> & { href: string }) {
  return (
    <a {...props} className="g-card-link">
      {children}
    </a>
  );
}
export function Section({
  title,
  description,
  children,
  action,
  level = 2,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  level?: 2 | 3 | 4 | 5 | 6;
}) {
  const id = useId();
  return (
    <section className="g-section" aria-labelledby={id}>
      <Inline justify="between">
        <Stack gap={1}>
          <Heading level={level} size="section" id={id}>
            {title}
          </Heading>
          {description && (
            <Text tone="muted" size="small">
              {description}
            </Text>
          )}
        </Stack>
        {action}
      </Inline>
      {children}
    </section>
  );
}

export interface BoardColumn {
  id: string;
  title: string;
  /** How many items the column holds, shown beside its title. */
  count?: number;
  /** Shown instead of the items when there are none. */
  emptyLabel?: string;
  children?: ReactNode;
}
/** An item moved from one lane to another, by a drag or from its move menu. */
export interface BoardMove {
  item: string;
  from: string;
  to: string;
}
interface BoardContextValue {
  columns: readonly BoardColumn[];
  onMove?: (move: BoardMove) => void;
  canMove: (move: BoardMove) => boolean;
  dragging?: { item: string; from: string };
  setDragging: (dragging?: { item: string; from: string }) => void;
}
const BoardContext = createContext<BoardContextValue | undefined>(undefined);
const ColumnContext = createContext<string | undefined>(undefined);
/**
 * Items by where they stand, in side-by-side lanes (a print queue by step, tickets by status).
 * Each lane is a named section with a bounded surface, so the eye can tell where one ends and
 * the next begins; lanes keep equal widths and the board scrolls sideways rather than wrapping
 * when they no longer fit. The app owns the items and their order. With `onMove`, items wrapped
 * in `BoardItem` can be dragged to another lane or moved there from their move menu; `canMove`
 * says which lanes an item may go to, and the app does the moving (the board does not reorder).
 */
export function Board({
  label,
  columns,
  headingLevel = 2,
  gap = 3,
  onMove,
  canMove = () => true,
  ...props
}: DivProps & {
  /** Names the board for assistive technology. */
  label: string;
  columns: readonly BoardColumn[];
  /** The heading level of each lane's title; the default fits a board under a page title. */
  headingLevel?: 2 | 3 | 4;
  gap?: Space;
  /** Called when an item is dropped on, or sent from its menu to, another lane. */
  onMove?: (move: BoardMove) => void;
  /** Whether an item may move to a lane; every other lane by default. */
  canMove?: (move: BoardMove) => boolean;
}) {
  const id = useId();
  const [dragging, setDragging] = useState<{ item: string; from: string }>();
  const [over, setOver] = useState<string>();
  const dropTarget = (column: string) =>
    Boolean(
      onMove &&
      dragging &&
      dragging.from !== column &&
      canMove({ item: dragging.item, from: dragging.from, to: column }),
    );
  return (
    <BoardContext.Provider
      value={{
        columns,
        onMove,
        canMove,
        dragging,
        setDragging: (next) => {
          setDragging(next);
          if (!next) setOver(undefined);
        },
      }}
    >
      <div
        {...props}
        className="g-board"
        role="group"
        aria-label={label}
        style={{ gap: spacing[gap] }}
      >
        {columns.map((column) => {
          const headingId = `${id}-${column.id}`;
          const empty = Children.count(column.children) === 0;
          const droppable = dropTarget(column.id);
          return (
            <section
              key={column.id}
              className="g-board-column"
              aria-labelledby={headingId}
              data-droppable={droppable ? '' : undefined}
              data-over={droppable && over === column.id ? '' : undefined}
              onDragOver={(event) => {
                if (!droppable) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                if (over !== column.id) setOver(column.id);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null))
                  setOver(undefined);
              }}
              onDrop={(event) => {
                if (!droppable || !dragging) return;
                event.preventDefault();
                onMove?.({ item: dragging.item, from: dragging.from, to: column.id });
                setDragging(undefined);
                setOver(undefined);
              }}
            >
              <div className="g-board-column-head">
                <Heading id={headingId} level={headingLevel} size="card">
                  {column.title}
                </Heading>
                {column.count !== undefined && <Badge>{String(column.count)}</Badge>}
              </div>
              <div className="g-board-column-body">
                <ColumnContext.Provider value={column.id}>
                  {empty && column.emptyLabel ? (
                    <Text size="small" tone="muted">
                      {column.emptyLabel}
                    </Text>
                  ) : (
                    column.children
                  )}
                </ColumnContext.Provider>
              </div>
            </section>
          );
        })}
      </div>
    </BoardContext.Provider>
  );
}
/**
 * One item on a board that can move between lanes. It drags with the mouse, and its move menu
 * (a small handle in the corner, for the keyboard and touch) lists the lanes it may go to. With
 * no lane to go to, or on a board without `onMove`, it is a plain item.
 */
export function BoardItem({
  id,
  label,
  movable = true,
  children,
}: {
  id: string;
  /** What the item is, for the move handle's name ("Move Anna Kovács"). */
  label: string;
  /** false keeps this one where it is. */
  movable?: boolean;
  children: ReactNode;
}) {
  const board = useContext(BoardContext);
  const from = useContext(ColumnContext);
  const { messages } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const targets =
    board?.onMove && movable && from !== undefined
      ? board.columns.filter(
          (column) => column.id !== from && board.canMove({ item: id, from, to: column.id }),
        )
      : [];
  if (!board || from === undefined || !targets.length)
    return <div className="g-board-item">{children}</div>;
  const move = (to: string) => board.onMove?.({ item: id, from, to });
  return (
    <div
      ref={ref}
      className="g-board-item"
      draggable
      data-dragging={board.dragging?.item === id ? '' : undefined}
      onDragStart={(event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData('text/plain', id);
        event.dataTransfer.effectAllowed = 'move';
        // The whole item travels, even when the drag started on a link inside it.
        if (ref.current) event.dataTransfer.setDragImage(ref.current, 24, 24);
        board.setDragging({ item: id, from });
      }}
      onDragEnd={() => board.setDragging(undefined)}
    >
      {children}
      <div className="g-board-item-handle">
        <Menu
          label={messages.move}
          trigger={
            <IconButton
              size="small"
              variant="ghost"
              label={messages.moveItem.replace('{item}', label)}
            >
              <Icon name="grip" />
            </IconButton>
          }
          items={targets.map((column) => ({
            id: column.id,
            label: messages.moveTo.replace('{column}', column.title),
            onSelect: () => move(column.id),
          }))}
        />
      </div>
    </div>
  );
}
