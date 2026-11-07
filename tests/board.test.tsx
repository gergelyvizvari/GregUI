import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Board, BoardItem, Card, LocaleProvider, Text, type BoardMove } from '@gregui/react';

const columns = (onMove?: (move: BoardMove) => void, canMove?: (move: BoardMove) => boolean) => (
  <Board
    label="Print board"
    onMove={onMove}
    canMove={canMove}
    columns={[
      {
        id: 'waiting',
        title: 'Waiting',
        children: (
          <BoardItem id="anna" label="Anna">
            <Card>
              <Text>Anna</Text>
            </Card>
          </BoardItem>
        ),
      },
      {
        id: 'printed',
        title: 'Printed',
        children: (
          <BoardItem id="tom" label="Tom" movable={false}>
            <Card>
              <Text>Tom</Text>
            </Card>
          </BoardItem>
        ),
      },
      { id: 'posted', title: 'Posted', emptyLabel: 'Nothing here.' },
    ]}
  />
);

/** A dataTransfer stand-in: jsdom's drag events carry none. */
const dataTransfer = () => ({
  data: {} as Record<string, string>,
  effectAllowed: 'none',
  dropEffect: 'none',
  setData(type: string, value: string) {
    this.data[type] = value;
  },
  setDragImage: vi.fn(),
});

describe('Board moves', () => {
  it('is a plain board without onMove: no handles, nothing draggable', () => {
    render(columns());
    expect(screen.queryByRole('button', { name: /Move/ })).toBeNull();
    expect(screen.getByText('Anna').closest('.g-board-item')).not.toHaveAttribute('draggable');
  });

  it('moves an item from its menu to a lane canMove allows, in the active locale', async () => {
    const onMove = vi.fn();
    render(
      <LocaleProvider locale="hu-HU">
        {columns(onMove, ({ to }) => to !== 'posted')}
      </LocaleProvider>,
    );
    // Tom is not movable; Anna's handle names her.
    expect(screen.queryByRole('button', { name: 'Tom áthelyezése' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Anna áthelyezése' }));
    // The menu is named after its handle.
    const menu = await screen.findByRole('menu', { name: 'Anna áthelyezése' });
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent),
    ).toEqual(['Áthelyezés ide: Printed']);
    await userEvent.click(within(menu).getByRole('menuitem'));
    expect(onMove).toHaveBeenCalledWith({ item: 'anna', from: 'waiting', to: 'printed' });
  });

  it('drops an item on another lane and marks the lanes it may go to while dragging', () => {
    const onMove = vi.fn();
    render(columns(onMove, ({ to }) => to !== 'posted'));
    const item = screen.getByText('Anna').closest('.g-board-item')!;
    expect(item).toHaveAttribute('draggable', 'true');
    const transfer = dataTransfer();
    fireEvent.dragStart(item, { dataTransfer: transfer });
    expect(transfer.data['text/plain']).toBe('anna');
    expect(item).toHaveAttribute('data-dragging');
    const printed = screen.getByRole('region', { name: 'Printed' });
    const posted = screen.getByRole('region', { name: 'Posted' });
    expect(printed).toHaveAttribute('data-droppable');
    expect(posted).not.toHaveAttribute('data-droppable');
    fireEvent.dragOver(printed, { dataTransfer: transfer });
    expect(printed).toHaveAttribute('data-over');
    fireEvent.drop(printed, { dataTransfer: transfer });
    expect(onMove).toHaveBeenCalledWith({ item: 'anna', from: 'waiting', to: 'printed' });
    expect(printed).not.toHaveAttribute('data-droppable');
    expect(item).not.toHaveAttribute('data-dragging');
    // A lane the item may not go to ignores the drop.
    fireEvent.dragStart(item, { dataTransfer: transfer });
    fireEvent.drop(posted, { dataTransfer: transfer });
    expect(onMove).toHaveBeenCalledTimes(1);
  });
});
