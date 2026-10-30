'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Heading, Text } from './typography';
import { renderIcon, type IconSource } from './icons';
import { Avatar } from './avatar';

// Marketing sections for public sites. They use the same tokens as the app, so a landing page
// and the product it leads to look like one system. Copy, images and links belong to the app.

type HeadingLevel = 1 | 2 | 3 | 4;

/**
 * Opt-in entrance as a section scrolls into view. Content is visible without JavaScript and
 * under `prefers-reduced-motion: reduce`; it is only hidden once the observer is armed.
 */
function useReveal(enabled: boolean) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'idle' | 'armed' | 'shown'>('idle');
  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    setState('armed');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState('shown');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);
  return { ref, 'data-reveal': enabled ? state : undefined };
}

function SectionIntro({
  eyebrow,
  title,
  lead,
  level,
}: {
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  level: HeadingLevel;
}) {
  if (!eyebrow && !title && !lead) return null;
  return (
    <div className="g-marketing-intro">
      {eyebrow && <Text size="eyebrow">{eyebrow}</Text>}
      {title && (
        <Heading level={level} size="page">
          {title}
        </Heading>
      )}
      {lead && <Text size="lead">{lead}</Text>}
    </div>
  );
}

export interface HeroSectionProps {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Usually one or two LinkButtons. */
  actions?: ReactNode;
  /** Illustration, product preview or image beside the copy; stacks below on narrow screens. */
  media?: ReactNode;
  /** Centre the copy when there is no media. */
  align?: 'start' | 'center';
  /** Defaults to 1: a page has one hero. */
  headingLevel?: HeadingLevel;
  reveal?: boolean;
}

export function HeroSection({
  eyebrow,
  title,
  lead,
  actions,
  media,
  align = 'start',
  headingLevel = 1,
  reveal = false,
}: HeroSectionProps) {
  const revealProps = useReveal(reveal);
  return (
    <section
      ref={revealProps.ref}
      data-reveal={revealProps['data-reveal']}
      className="g-hero-section"
      data-align={media ? 'start' : align}
      data-media={media ? true : undefined}
    >
      <div className="g-hero-copy">
        {eyebrow && <Text size="eyebrow">{eyebrow}</Text>}
        <Heading level={headingLevel} size="hero">
          {title}
        </Heading>
        {lead && <Text size="lead">{lead}</Text>}
        {actions && <div className="g-hero-actions">{actions}</div>}
      </div>
      {media && <div className="g-hero-media">{media}</div>}
    </section>
  );
}

export interface Feature {
  icon?: IconSource;
  title: string;
  description: ReactNode;
}

export interface FeatureGridProps {
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  features: readonly Feature[];
  /** Maximum columns on wide screens; fewer fit on narrow ones. */
  columns?: 2 | 3 | 4;
  /** Level of the section title; feature titles use the next level. */
  headingLevel?: HeadingLevel;
  reveal?: boolean;
}

export function FeatureGrid({
  eyebrow,
  title,
  lead,
  features,
  columns = 3,
  headingLevel = 2,
  reveal = false,
}: FeatureGridProps) {
  const revealProps = useReveal(reveal);
  const itemLevel = (title ? Math.min(headingLevel + 1, 6) : headingLevel) as 2 | 3 | 4 | 5;
  return (
    <section
      ref={revealProps.ref}
      data-reveal={revealProps['data-reveal']}
      className="g-marketing-section"
    >
      <SectionIntro eyebrow={eyebrow} title={title} lead={lead} level={headingLevel} />
      <ul className="g-feature-grid" data-columns={columns}>
        {features.map((feature) => (
          <li key={feature.title} className="g-feature">
            {feature.icon && (
              <span className="g-feature-icon" aria-hidden="true">
                {renderIcon(feature.icon)}
              </span>
            )}
            <Heading level={itemLevel} size="card">
              {feature.title}
            </Heading>
            <Text tone="muted">{feature.description}</Text>
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface Testimonial {
  quote: ReactNode;
  name: string;
  /** Role, company or place, shown under the name. */
  detail?: string;
  avatarSrc?: string;
}

export interface TestimonialsProps {
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  items: readonly Testimonial[];
  headingLevel?: HeadingLevel;
  reveal?: boolean;
}

export function Testimonials({
  eyebrow,
  title,
  lead,
  items,
  headingLevel = 2,
  reveal = false,
}: TestimonialsProps) {
  const revealProps = useReveal(reveal);
  return (
    <section
      ref={revealProps.ref}
      data-reveal={revealProps['data-reveal']}
      className="g-marketing-section"
    >
      <SectionIntro eyebrow={eyebrow} title={title} lead={lead} level={headingLevel} />
      <div className="g-testimonials">
        {items.map((item) => (
          <figure key={item.name} className="g-testimonial">
            <blockquote>
              <Text size="large">{item.quote}</Text>
            </blockquote>
            <figcaption className="g-testimonial-person">
              <Avatar name={item.name} src={item.avatarSrc} decorative />
              <span className="g-testimonial-who">
                <Text as="span" weight="strong">
                  {item.name}
                </Text>
                {item.detail && (
                  <Text as="span" size="small" tone="muted">
                    {item.detail}
                  </Text>
                )}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export interface Logo {
  name: string;
  /** Image URL; the name becomes its alt text. Omit to show the name as text. */
  src?: string;
}

export interface LogoCloudProps {
  /** Short line introducing the logos, for example "Trusted by". */
  label: string;
  logos: readonly Logo[];
}

/** A row of partner or customer logos, shown muted so they do not compete with the content. */
export function LogoCloud({ label, logos }: LogoCloudProps) {
  return (
    <section className="g-logo-cloud" aria-label={label}>
      <Text size="small" tone="muted">
        {label}
      </Text>
      <ul>
        {logos.map((logo) => (
          <li key={logo.name}>
            {logo.src ? (
              <img src={logo.src} alt={logo.name} loading="lazy" />
            ) : (
              <span className="g-logo-name">{logo.name}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface CtaBandProps {
  title: ReactNode;
  lead?: ReactNode;
  /** Usually one or two LinkButtons. On `primary` tone use `secondary` buttons for contrast. */
  actions: ReactNode;
  tone?: 'primary' | 'surface';
  headingLevel?: HeadingLevel;
  reveal?: boolean;
}

/** Closing call to action across the content width. */
export function CtaBand({
  title,
  lead,
  actions,
  tone = 'primary',
  headingLevel = 2,
  reveal = false,
}: CtaBandProps) {
  const revealProps = useReveal(reveal);
  return (
    <section
      ref={revealProps.ref}
      data-reveal={revealProps['data-reveal']}
      className="g-cta-band"
      data-tone={tone}
    >
      <div className="g-cta-copy">
        <Heading level={headingLevel} size="page">
          {title}
        </Heading>
        {lead && <Text size="lead">{lead}</Text>}
      </div>
      <div className="g-hero-actions">{actions}</div>
    </section>
  );
}
