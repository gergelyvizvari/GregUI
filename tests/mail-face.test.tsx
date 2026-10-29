import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { MailFace } from '@gregui/react';
it('names message, recipient and optional sender while keeping preview marks decorative', () => {
  const { container } = render(
    <MailFace
      label="Postcard"
      variant="postcard"
      postageLabel="Bélyeg"
      message={{ label: 'Message', content: 'Hello Anna' }}
      recipient={{ label: 'Recipient', content: 'Anna · Budapest' }}
      sender={{ label: 'Sender', content: 'Alex' }}
    />,
  );
  expect(screen.getByRole('region', { name: 'Message' })).toHaveTextContent('Hello Anna');
  expect(screen.getByRole('region', { name: 'Recipient' })).toHaveTextContent('Anna · Budapest');
  expect(screen.getByRole('region', { name: 'Sender' })).toHaveTextContent('Alex');
  expect(container.querySelector('.g-mail-postage')).toHaveAttribute('aria-hidden', 'true');
  expect(container.querySelector('.g-mail-divider')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByRole('group', { name: 'Postcard' })).toHaveAttribute('dir', 'ltr');
});
it('envelopes never render a postcard message or divider', () => {
  const { container } = render(
    <MailFace
      label="Envelope"
      variant="envelope"
      postageLabel="Postage"
      recipient={{ label: 'Recipient', content: 'Anna' }}
      message={{ label: 'Private message', content: 'Keep this inside the card' }}
    />,
  );
  expect(screen.queryByText('Keep this inside the card')).toBeNull();
  expect(screen.queryByRole('region', { name: 'Private message' })).toBeNull();
  expect(container.querySelector('.g-mail-divider')).toBeNull();
});
