import type { ReactNode } from 'react';
/** A contained brand landing-page preview; navigation and content belong to consumers. */
export function BrandPreview({
  label,
  name,
  logo,
  cover,
  title,
  description,
  language,
  compact = false,
  children,
}: {
  label: string;
  name: string;
  logo?: string;
  cover?: string;
  title?: string;
  description?: string;
  language?: string;
  compact?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className="g-brand-preview" data-compact={compact} aria-label={label}>
      <header className="g-brand-preview-header">
        {logo && <img src={logo} alt="" />}
        <strong>{name}</strong>
      </header>
      {cover && <img className="g-brand-preview-cover" src={cover} alt="" />}
      <div className="g-brand-preview-content">
        {title && (
          <h3 className="g-heading" data-size="page" lang={language} dir="auto">
            {title}
          </h3>
        )}
        {description && (
          <p lang={language} dir="auto">
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
