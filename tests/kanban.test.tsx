import React, { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  KanbanBoard,
  LocaleProvider,
  moveKanbanCard,
  type KanbanCard,
  type KanbanColumn,
} from '@gregui/react';

const columns: KanbanColumn[] = [
  { id: 'todo', title: 'To print' },
  { id: 'doing', title: 'Printing', limit: 1 },
  { id: 'done', title: 'Posted' },
];
const initial: KanbanCard[] = [
  { id: 'a', columnId: 'todo', title: 'Card A' },
  { id: 'b', columnId: 'todo', title: 'Card B' },
  { id: 'c', columnId: 'doing', title: 'Card C' },
];

function Board({
  onMove = vi.fn(),
  canMove,
  start = initial,
}: {
  onMove?: (move: unknown) => void;
  canMove?: (card: KanbanCard, to: string) => boolean;
  start?: KanbanCard[];
}) {
  const [cards, setCards] = useState(start);
  return (
    <KanbanBoard
      label="Print pipeline"
      columns={columns}
      cards={cards}
      canMove={canMove}
      onMove={(move) => {
        onMove(move);
        setCards((list) => moveKanbanCard(list, move));
      }}
    />
  );
}
const column = (name: string) => screen.getByRole('region', { name });
const titles = (name: string) =>
  within(column(name))
    .queryAllByRole('listitem')
    .map((item) => item.textContent?.match(/Card \w/)?.[0])
    .filter(Boolean);

describe('moveKanbanCard', () => {
  it('moves within and between columns by destination index', () => {
    const move = (cardId: string, toColumnId: string, toIndex: number) =>
      moveKanbanCard(initial, { cardId, toColumnId, toIndex, fromColumnId: '', fromIndex: 0 }).map(
        (card) => `${card.id}:${card.columnId}`,
      );
    expect(move('a', 'todo', 1)).toEqual(['b:todo', 'a:todo', 'c:doing']);
    expect(move('b', 'doing', 0)).toEqual(['a:todo', 'b:doing', 'c:doing']);
    expect(move('a', 'doing', 1)).toEqual(['b:todo', 'c:doing', 'a:doing']);
    expect(move('a', 'done', 0)).toEqual(['b:todo', 'c:doing', 'a:done']);
  });
});

describe('KanbanBoard', () => {
  it('shows columns as named regions with counts, limits and empty states', () => {
    render(<Board start={[...initial, { id: 'd', columnId: 'doing', title: 'Card D' }]} />);
    expect(screen.getByRole('region', { name: 'Print pipeline' })).toBeInTheDocument();
    expect(within(column('To print')).getByText('2 cards')).toBeInTheDocument();
    const printing = column('Printing');
    expect(printing).toHaveAttribute('data-over-limit', 'true');
    expect(printing).toHaveTextContent('2 of 1');
    expect(printing).toHaveTextContent('Over the limit of 1');
    expect(within(column('Posted')).getByText('No cards')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Printing' })).toBeInTheDocument();
  });

  it('picks up with Space, moves with arrows across columns and drops with Space', async () => {
    const onMove = vi.fn();
    render(<Board onMove={onMove} />);
    const handle = screen.getByRole('button', { name: 'Move Card A' });
    expect(handle).toHaveAccessibleDescription(/Press Space to pick up/);
    handle.focus();
    await userEvent.keyboard(' ');
    expect(handle).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Picked up Card A. To print, position 1 of 2.',
    );
    await userEvent.keyboard('{ArrowDown}');
    expect(titles('To print')).toEqual(['Card B', 'Card A']);
    expect(screen.getByRole('status')).toHaveTextContent('To print, position 2 of 2.');
    await userEvent.keyboard('{ArrowRight}');
    expect(titles('Printing')).toEqual(['Card C', 'Card A']);
    expect(screen.getByRole('button', { name: 'Move Card A' })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp} ');
    expect(onMove).toHaveBeenCalledWith({
      cardId: 'a',
      fromColumnId: 'todo',
      fromIndex: 0,
      toColumnId: 'doing',
      toIndex: 0,
    });
    expect(titles('Printing')).toEqual(['Card A', 'Card C']);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Card A moved to Printing, position 1 of 2.',
    );
    expect(screen.getByRole('button', { name: 'Move Card A' })).toHaveFocus();
  });

  it('cancels with Escape and returns the card to where it was', async () => {
    const onMove = vi.fn();
    render(<Board onMove={onMove} />);
    screen.getByRole('button', { name: 'Move Card B' }).focus();
    await userEvent.keyboard(' {ArrowRight}{ArrowRight}');
    expect(titles('Posted')).toEqual(['Card B']);
    await userEvent.keyboard('{Escape}');
    expect(titles('To print')).toEqual(['Card A', 'Card B']);
    expect(onMove).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Move cancelled. Card B stays in To print.',
    );
    expect(screen.getByRole('button', { name: 'Move Card B' })).toHaveFocus();
  });

  it('skips columns the card may not enter and mirrors arrows in RTL', async () => {
    render(
      <LocaleProvider direction="rtl">
        <Board canMove={(_, to) => to !== 'doing'} />
      </LocaleProvider>,
    );
    screen.getByRole('button', { name: 'Move Card A' }).focus();
    await userEvent.keyboard(' {ArrowLeft} ');
    expect(titles('Posted')).toEqual(['Card A']);
  });

  it('moves through the menu to another column or the top', async () => {
    const onMove = vi.fn();
    render(<Board onMove={onMove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Move options: Card B' }));
    expect(screen.getByRole('menuitem', { name: 'Move to top' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Move to bottom' })).toBeNull();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Move to Posted' }));
    expect(titles('Posted')).toEqual(['Card B']);
    expect(onMove).toHaveBeenLastCalledWith(
      expect.objectContaining({ cardId: 'b', toColumnId: 'done', toIndex: 0 }),
    );
  });

  it('moves by drag and drop', () => {
    const onMove = vi.fn();
    render(<Board onMove={onMove} />);
    const card = screen.getByRole('button', { name: 'Move Card A' }).closest('li')!;
    const target = within(column('Posted')).getByRole('list');
    const dataTransfer = { setData: vi.fn(), effectAllowed: '', dropEffect: '' };
    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer, clientY: 10 });
    expect(column('Posted')).toHaveAttribute('data-drop-target', 'true');
    fireEvent.drop(target, { dataTransfer, clientY: 10 });
    expect(onMove).toHaveBeenCalledWith(
      expect.objectContaining({ cardId: 'a', toColumnId: 'done', toIndex: 0 }),
    );
    expect(titles('Posted')).toEqual(['Card A']);
  });

  it('is translated', () => {
    render(
      <LocaleProvider locale="hu-HU">
        <Board />
      </LocaleProvider>,
    );
    expect(screen.getByRole('button', { name: 'Card A áthelyezése' })).toBeInTheDocument();
    expect(within(column('To print')).getByText('2 kártya')).toBeInTheDocument();
  });
});
