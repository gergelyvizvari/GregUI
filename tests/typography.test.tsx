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
