import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import {
  Breadcrumbs,
  Button,
  Container,
  Heading,
  PageHeader,
  Prose,
  Section,
  Text,
  ThemeProvider,
  PostcardStage,
  EditorLayout,
} from '@gregui/react';

it('keeps deep heading semantics independent of visual size and labels nested sections correctly', () => {
  render(
    <Section title="Parent">
      <Section level={5} title="Nested">
        <Heading level={6} size="hero">
          Deep detail
        </Heading>
        <Text size="lead">Introduction</Text>
        <Text size="caption">Source</Text>
      </Section>
    </Section>,
  );
  const nested = screen.getByRole('region', { name: 'Nested' });
  expect(within(nested).getByRole('heading', { name: 'Nested', level: 5 })).toBeInTheDocument();
  expect(
    within(nested).getByRole('heading', { name: 'Deep detail', level: 6 }),
  ).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Parent' })).toContainElement(nested);
});

it('composes a page header with distinct breadcrumb navigation, metadata and a working action', async () => {
  const action = vi.fn(),
    user = userEvent.setup();
  render(
    <PageHeader
      size="compact"
      title="Project details"
      breadcrumbs={
        <Breadcrumbs
          label="Project location"
          items={[{ label: 'Projects', href: '/projects' }, { label: 'Details' }]}
        />
      }
      meta={
        <Text as="span" size="caption">
          Updated today
        </Text>
      }
      actions={<Button onClick={action}>Save project</Button>}
    />,
  );
  expect(screen.getByRole('heading', { level: 1, name: 'Project details' })).toBeInTheDocument();
  expect(
    within(screen.getByRole('navigation', { name: 'Project location' })).getByRole('link', {
      name: 'Projects',
    }),
  ).toHaveAttribute('href', '/projects');
  expect(screen.getByText('Updated today')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Save project' }));
  expect(action).toHaveBeenCalledOnce();
});

it('preserves native content semantics and accessible links inside a reading container', () => {
  render(
    <Container size="reading">
      <Prose role="region" aria-label="Article">
        <h2>Article section</h2>
        <p>
          Read the <a href="/guide">guide</a>.
        </p>
        <ol>
          <li>First step</li>
          <li>Second step</li>
        </ol>
        <figure>
          <blockquote>
            <p>A quotation.</p>
          </blockquote>
          <figcaption>Its source.</figcaption>
        </figure>
      </Prose>
    </Container>,
  );
  const article = screen.getByRole('region', { name: 'Article' });
  expect(within(article).getByRole('heading', { level: 2 })).toHaveTextContent('Article section');
  expect(within(article).getByRole('list')).toContainElement(screen.getByText('First step'));
  expect(within(article).getByRole('link', { name: 'guide' })).toHaveAttribute('href', '/guide');
  expect(screen.getByText('A quotation.').closest('blockquote')).not.toBeNull();
});

it('puts progress above a second-level page title that code can focus', () => {
  render(
    <PageHeader
      tone="brand"
      headingLevel={2}
      titleId="step-question"
      title="Who is it for?"
      progress={<ol aria-label="Progress" />}
    />,
  );
  const title = screen.getByRole('heading', { level: 2, name: 'Who is it for?' });
  expect(title).toHaveAttribute('id', 'step-question');
  expect(title).toHaveAttribute('tabindex', '-1');
  const progress = screen.getByRole('list', { name: 'Progress' });
  expect(progress.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
});

it('carries an app highlight and handwriting face into the theme', () => {
  const { container } = render(
    <ThemeProvider highlight={{ color: 'gold', on: 'black' }} handFont="cursive">
      <span>Hi</span>
    </ThemeProvider>,
  );
  const frame = container.querySelector('.g-theme') as HTMLElement;
  expect(frame.style.getPropertyValue('--g-mark')).toBe('gold');
  expect(frame.style.getPropertyValue('--g-onMark')).toBe('black');
  expect(frame.style.getPropertyValue('--g-hand-font')).toBe('cursive');
});

it('tucks a note on the picture side of a postcard and hides it on the back', () => {
  const { container, rerender } = render(
    <PostcardStage label="Card" front={<span />} back={<span />} note="Happy birthday" />,
  );
  const note = container.querySelector('.g-postcard-note')!;
  expect(note).toHaveAttribute('data-shown', 'true');
  expect(note).toHaveAttribute('aria-hidden', 'true');
  rerender(<PostcardStage label="Card" side="back" front={<span />} back={<span />} note="Hi" />);
  expect(container.querySelector('.g-postcard-note')).toHaveAttribute('data-shown', 'false');
});

it('sets the editor on panels when asked', () => {
  const { container } = render(
    <EditorLayout appearance="panels" aside={{ label: 'Preview', preview: true, content: 'x' }}>
      y
    </EditorLayout>,
  );
  expect(container.querySelector('.g-editor-layout')).toHaveAttribute('data-appearance', 'panels');
});
