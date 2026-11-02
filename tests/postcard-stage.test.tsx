import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { MailFace, PostcardStage, VisualChoiceGroup } from '@gregui/react';

it('shows one card with both sides, named by its label, and turns it over', () => {
  const { rerender, container } = render(
    <PostcardStage
      label="Birthday card for Anna"
      front={<img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" />}
      back={<p>Happy birthday</p>}
      changeKey="balloons"
    />,
  );
  const stage = screen.getByRole('img', { name: 'Birthday card for Anna' });
  const card = container.querySelector('.g-postcard-card')!;
  expect(card).toHaveAttribute('data-side', 'front');
  expect(card).not.toHaveAttribute('data-settle');
  expect(stage.querySelector('[aria-hidden="true"]')).toHaveTextContent('Happy birthday');
  rerender(
    <PostcardStage
      label="Birthday card for Anna"
      side="back"
      orientation="portrait"
      front={null}
      back={<p>Happy birthday</p>}
      envelope={<p>Anna Kiss</p>}
      changeKey="cake"
    />,
  );
  expect(card).toHaveAttribute('data-side', 'back');
  expect(card).toHaveAttribute('data-settle', 'a');
  expect(container.querySelector('.g-postcard-envelope')).toHaveTextContent('Anna Kiss');
});

it('lays choices out as big tiles', () => {
  render(
    <VisualChoiceGroup
      label="Who is it for?"
      hideLabel
      layout="tiles"
      value="me"
      onChange={() => undefined}
      options={[
        { value: 'anna', label: 'Anna', preview: 'AK' },
        { value: 'me', label: 'Me', preview: 'Me' },
      ]}
    />,
  );
  expect(screen.getByRole('group', { name: 'Who is it for?' })).toHaveAttribute(
    'data-layout',
    'tiles',
  );
  expect(screen.getByRole('radio', { name: 'Me' })).toBeChecked();
  expect(screen.getByText('Who is it for?')).toHaveClass('g-sr-only');
});

it('shows only the message inside a folded card', () => {
  render(
    <MailFace
      label="Inside"
      variant="inside"
      postageLabel="Stamp"
      message={{ label: 'Message', content: <p>Merry Christmas</p> }}
    />,
  );
  expect(screen.getByRole('region', { name: 'Message' })).toHaveTextContent('Merry Christmas');
  expect(screen.queryByText('Stamp')).not.toBeInTheDocument();
});
