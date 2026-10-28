import { useState } from 'react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Container,
  Heading,
  PageHeader,
  Prose,
  Section,
  Stack,
  Status,
  Text,
} from '@gregui/react';

export function TextStylesDemo() {
  return (
    <Stack gap={3}>
      <Text size="eyebrow">Typography foundations</Text>
      <Heading level={3} size="hero">
        Clear words. Clear hierarchy.
      </Heading>
      <Text size="lead">Lead text introduces an idea before the details begin.</Text>
      <Text>
        Body text carries the everyday content. <strong>Emphasis</strong> and <em>tone</em> add
        meaning without changing its structure.
      </Text>
      <Text size="large">Large supporting text keeps its existing appearance.</Text>
      <Text size="small" tone="muted">
        Small text supplies supporting context.
      </Text>
      <Text size="caption" tone="muted">
        Caption text labels a source or illustration.
      </Text>
      <Heading level={4} size="page">
        Page-sized heading
      </Heading>
      <Heading level={5} size="section">
        Section-sized heading
      </Heading>
      <Heading level={6} size="card">
        Card-sized heading
      </Heading>
    </Stack>
  );
}
export function ReadingContentDemo() {
  return (
    <Prose role="region" aria-label="Reading example">
      <h3>Room to read</h3>
      <p>
        A reading measure and consistent paragraph rhythm make longer content easier to follow.
        Native headings, lists and quotations share the current theme.{' '}
        <a href="#reading-details">Jump to the details</a>.
      </p>
      <ul>
        <li>Keep semantic heading levels independent from visual size.</li>
        <li>
          Use lists when points belong together.
          <ol>
            <li>Start with the shared foundation.</li>
            <li>Add application content.</li>
          </ol>
        </li>
      </ul>
      <figure>
        <blockquote>
          <p>Good typography helps people understand what matters and what comes next.</p>
        </blockquote>
        <figcaption>A fictional design note for this local example.</figcaption>
      </figure>
      <h4 id="reading-details" tabIndex={-1}>
        Details that stay readable
      </h4>
      <p>
        Inline <code>themeVariables</code> and long identifiers such as
        typography_foundation_without_application_specific_style_overrides wrap within the available
        width.
      </p>
      <pre tabIndex={0} role="region" aria-label="Example code">
        <code>
          {
            'const title = "A shared foundation";\nconst description = "A deliberately long code line keeps its whitespace and scrolls within the reading column rather than widening the page.";'
          }
        </code>
      </pre>
    </Prose>
  );
}
export function TypographyDemo() {
  return (
    <Stack gap={5}>
      <TextStylesDemo />
      <ReadingContentDemo />
    </Stack>
  );
}

export function PageCompositionDemo() {
  const [notice, setNotice] = useState('');
  return (
    <Container size="reading" inset={false}>
      <PageHeader
        size="compact"
        breadcrumbs={
          <Breadcrumbs
            label="Example page breadcrumb"
            items={[{ label: 'Guide', href: '#page-overview' }, { label: 'Page foundations' }]}
          />
        }
        eyebrow="Page composition"
        title="A reusable page foundation"
        description="A clear introduction, useful context and consistent sections."
        meta={
          <>
            <Badge>Draft</Badge>
            <Text as="span" size="caption" tone="muted">
              Updated <time dateTime="2026-10-28">28 October 2026</time>
            </Text>
          </>
        }
        actions={
          <Button onClick={() => setNotice('Preview action completed locally.')}>
            Preview action
          </Button>
        }
      />
      <Stack gap={6}>
        <Status>{notice}</Status>
        <Section
          title="Overview"
          description="The same building blocks work across application types."
        >
          <Prose>
            <p id="page-overview">
              Use the page header for the title and context, sections for named groups, and a
              reading measure for explanatory content.
            </p>
          </Prose>
          <Section level={3} title="A nested section">
            <Text>Nested sections choose their semantic level explicitly.</Text>
          </Section>
        </Section>
        <Section title="Next steps">
          <Prose>
            <ol>
              <li>Choose a logical heading order.</li>
              <li>Supply your own copy and actions.</li>
              <li>Check narrow layouts and longer translations.</li>
            </ol>
          </Prose>
        </Section>
      </Stack>
    </Container>
  );
}
