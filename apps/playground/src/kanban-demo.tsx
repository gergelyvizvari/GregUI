import { useState } from 'react';
import {
  Badge,
  Inline,
  KanbanBoard,
  Stack,
  Text,
  moveKanbanCard,
  type KanbanCard,
  type KanbanColumn,
} from '@gregui/react';

interface Job extends KanbanCard {
  recipient: string;
  urgent?: boolean;
}
const columns: KanbanColumn[] = [
  { id: 'queued', title: 'Queued' },
  { id: 'printing', title: 'Printing', limit: 2 },
  { id: 'packed', title: 'Packed' },
  { id: 'posted', title: 'Posted' },
];
const start: Job[] = [
  { id: 'j1', columnId: 'queued', title: 'Birthday card #1042', recipient: 'Anna Kovács' },
  {
    id: 'j2',
    columnId: 'queued',
    title: 'Thank-you card #1043',
    recipient: 'Ben Hall',
    urgent: true,
  },
  { id: 'j3', columnId: 'printing', title: 'Anniversary card #1039', recipient: 'Csilla Tóth' },
  { id: 'j4', columnId: 'printing', title: 'Welcome card #1040', recipient: 'Dan Price' },
  { id: 'j5', columnId: 'packed', title: 'Birthday card #1035', recipient: 'Eszter Nagy' },
];

export function KanbanDemo() {
  const [cards, setCards] = useState(start);
  const [last, setLast] = useState('');
  return (
    <Stack>
      <KanbanBoard
        label="Print pipeline"
        columns={columns}
        cards={cards}
        // Demo rule: a job must be packed before it can be posted.
        canMove={(card, to) => to !== 'posted' || card.columnId === 'packed'}
        onMove={(move) => {
          setCards((list) => moveKanbanCard(list, move));
          setLast(`${move.cardId}: ${move.fromColumnId} → ${move.toColumnId} #${move.toIndex + 1}`);
        }}
        renderCard={(card) => (
          <Stack gap={1}>
            <Text weight="strong">{card.title}</Text>
            <Inline gap={2}>
              <Text size="small" tone="muted">
                {card.recipient}
              </Text>
              {card.urgent && <Badge tone="warning">Urgent</Badge>}
            </Inline>
          </Stack>
        )}
      />
      <Text size="small" tone="muted">
        Focus a card's grip and press Space, then use the arrow keys. Only packed jobs can be
        posted. Last move: {last || 'none'}.
      </Text>
    </Stack>
  );
}
