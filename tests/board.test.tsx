import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Board, Card } from '@gregui/react';

it('shows each lane as a named section with its count, and says when a lane is empty', () => {
  render(
    <Board
      label="Print board"
      columns={[
        {
          id: 'waiting',
          title: 'Waiting',
          count: 2,
          emptyLabel: 'Nothing here.',
          children: [<Card key="a">Anna</Card>, <Card key="b">Béla</Card>],
        },
        { id: 'printed', title: 'Printed', count: 0, emptyLabel: 'Nothing here.' },
      ]}
    />,
  );
  const board = screen.getByRole('group', { name: 'Print board' });
  const waiting = within(board).getByRole('region', { name: /Waiting/ });
  expect(within(waiting).getByText('2')).toBeInTheDocument();
  expect(within(waiting).getByText('Anna')).toBeInTheDocument();
  const printed = within(board).getByRole('region', { name: /Printed/ });
  expect(within(printed).getByText('Nothing here.')).toBeInTheDocument();
  expect(within(printed).getByRole('heading', { level: 2, name: 'Printed' })).toBeInTheDocument();
});
