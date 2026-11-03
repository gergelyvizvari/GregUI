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

it('opens a folded card and turns the card when pressed', async () => {
  const turned: string[] = [];
  const { container, rerender } = render(
    <PostcardStage
      label="Folded card for Anna"
      orientation="portrait"
      front={<p>Cover</p>}
      fold="closed"
      inside={<p>Inside words</p>}
      onTurn={() => turned.push('turn')}
      turnLabel="Open the card"
    />,
  );
  const button = screen.getByRole('button', { name: 'Folded card for Anna. Open the card' });
  expect(container.querySelector('.g-postcard-folded')).toHaveAttribute('data-fold', 'closed');
  expect(container.querySelector('.g-postcard-inside')).toHaveTextContent('Inside words');
  button.click();
  expect(turned).toEqual(['turn']);
  rerender(
    <PostcardStage
      label="Folded card for Anna"
      orientation="portrait"
      front={<p>Cover</p>}
      fold="open"
      inside={<p>Inside words</p>}
    />,
  );
  expect(container.querySelector('.g-postcard-folded')).toHaveAttribute('data-fold', 'open');
  expect(screen.getByRole('img', { name: 'Folded card for Anna' })).toBeInTheDocument();
});

it('keeps the writing side landscape on a portrait card', () => {
  const { container } = render(
    <PostcardStage label="Card" orientation="portrait" side="back" front={null} back={<p>Hi</p>} />,
  );
  const back = container.querySelector<HTMLElement>('.g-postcard-back')!;
  expect(parseFloat(back.style.width)).toBeGreaterThan(parseFloat(back.style.height));
  expect(container.querySelector('.g-postcard-card')).toHaveAttribute(
    'data-orientation',
    'portrait',
  );
});

it('leaves out the stamp on a card that is not posted', () => {
  render(
    <MailFace
      label="E-card back"
      variant="postcard"
      postageLabel="Stamp"
      postage={false}
      recipient={{ label: 'Recipient', content: <p>Anna</p> }}
    />,
  );
  expect(screen.queryByText('Stamp')).not.toBeInTheDocument();
});

it('shows written suggestions as note cards without previews', async () => {
  const chosen: string[] = [];
  render(
    <VisualChoiceGroup
      label="Suggestions"
      layout="notes"
      value={null}
      onChange={(value) => chosen.push(value)}
      options={[
        { value: '0', label: 'Thinking of you', description: 'A little hello.' },
        { value: '1', label: 'For you', description: 'With love.' },
      ]}
    />,
  );
  screen.getByRole('radio', { name: 'For you' }).click();
  expect(chosen).toEqual(['1']);
  expect(document.querySelector('.g-visual-choice-preview')).toBeNull();
});
