import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  CtaBand,
  FeatureGrid,
  HeroSection,
  LinkButton,
  LogoCloud,
  Testimonials,
} from '@gregui/react';

describe('marketing sections', () => {
  it('gives the hero the page heading and keeps actions and media', () => {
    render(
      <HeroSection
        eyebrow="KindHello"
        title="Cards for the people who matter"
        lead="We remind you in time."
        actions={<LinkButton href="/start">Start</LinkButton>}
        media={<img src="/card.png" alt="A birthday card" />}
      />,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cards for the people');
    expect(screen.getByRole('link', { name: 'Start' })).toHaveAttribute('href', '/start');
    expect(screen.getByRole('img', { name: 'A birthday card' })).toBeInTheDocument();
  });

  it('nests feature headings under the section title', () => {
    render(
      <FeatureGrid
        title="Why KindHello"
        features={[
          { icon: 'calendar', title: 'Reminders', description: 'Never miss a date.' },
          { icon: 'mail', title: 'Delivery', description: 'Online or by post.' },
        ]}
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Why KindHello' })).toBeInTheDocument();
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]!).getByRole('heading', { level: 3 })).toHaveTextContent('Reminders');
  });

  it('marks testimonials as quotations with an attributed person', () => {
    render(
      <Testimonials
        items={[{ quote: 'My grandmother loved it.', name: 'Anna K.', detail: 'Budapest' }]}
      />,
    );
    const figure = screen.getByRole('figure');
    expect(figure.querySelector('blockquote')).toHaveTextContent('My grandmother loved it.');
    expect(figure.querySelector('figcaption')).toHaveTextContent('Anna K.Budapest');
  });

  it('names the logo region and uses logo names as alt text', () => {
    render(
      <LogoCloud
        label="Trusted by"
        logos={[{ name: 'Acme', src: '/acme.svg' }, { name: 'Globex' }]}
      />,
    );
    const region = screen.getByRole('region', { name: 'Trusted by' });
    expect(within(region).getByRole('img', { name: 'Acme' })).toBeInTheDocument();
    expect(within(region).getByText('Globex')).toBeInTheDocument();
  });

  it('renders the call-to-action band with its tone', () => {
    render(<CtaBand title="Ready?" actions={<LinkButton href="/signup">Sign up</LinkButton>} />);
    const heading = screen.getByRole('heading', { level: 2, name: 'Ready?' });
    expect(heading.closest('section')).toHaveAttribute('data-tone', 'primary');
  });
});

describe('reveal', () => {
  const originalObserver = globalThis.IntersectionObserver;
  afterEach(() => {
    globalThis.IntersectionObserver = originalObserver;
    vi.unstubAllGlobals();
  });

  function stubMotion(reduce: boolean) {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({ matches: reduce && query.includes('reduce'), media: query })),
    );
  }

  it('is never hidden in server markup', () => {
    const html = renderToString(<CtaBand reveal title="Ready?" actions={null} />);
    expect(html).toContain('data-reveal="idle"');
    expect(html).not.toContain('armed');
  });

  it('arms on mount and shows when the section enters the viewport', () => {
    stubMotion(false);
    let trigger: (visible: boolean) => void = () => {};
    globalThis.IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        trigger = (visible) =>
          callback([{ isIntersecting: visible } as IntersectionObserverEntry], this as never);
      }
      observe() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
    render(<CtaBand reveal title="Ready?" actions={null} />);
    const section = screen.getByRole('heading', { name: 'Ready?' }).closest('section')!;
    expect(section).toHaveAttribute('data-reveal', 'armed');
    act(() => trigger(true));
    expect(section).toHaveAttribute('data-reveal', 'shown');
  });

  it('stays visible when the user prefers reduced motion', () => {
    stubMotion(true);
    render(<CtaBand reveal title="Ready?" actions={null} />);
    const section = screen.getByRole('heading', { name: 'Ready?' }).closest('section')!;
    expect(section).toHaveAttribute('data-reveal', 'idle');
  });
});
