'use client';
import { useId, type ReactNode } from 'react';
/** Keeps the editable document first in reading order; secondary context follows on narrow screens. */
export function EditorLayout({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: { label: string; content: ReactNode };
}) {
  return (
    <div className="g-editor-layout" data-aside={!!aside}>
      <div className="g-editor-main">{children}</div>
      {aside && (
        <aside className="g-editor-aside" aria-label={aside.label}>
          {aside.content}
        </aside>
      )}
    </div>
  );
}
/** A named, independently understandable group within a long form. Does not own validation or state. */
export function FormSection({
  title,
  description,
  number,
  children,
  level = 2,
}: {
  title: string;
  description?: string;
  number?: number;
  children: ReactNode;
  level?: 2 | 3 | 4;
}) {
  const id = useId();
  const Heading = ('h' + level) as 'h2' | 'h3' | 'h4';
  return (
    <section className="g-form-section" aria-labelledby={id}>
      <header className="g-form-section-heading">
        {number !== undefined && (
          <span className="g-form-section-number" aria-hidden="true">
            {String(number).padStart(2, '0')}
          </span>
        )}
        <div>
          <Heading id={id} className="g-heading" data-size="section">
            {title}
          </Heading>
          {description && <p className="g-form-section-description">{description}</p>}
        </div>
      </header>
      <div className="g-form-section-body">{children}</div>
    </section>
  );
}
/** In-flow action surface. Sticky only when the viewport has enough vertical space. */
export function FormActions({ children }: { children: ReactNode }) {
  return <div className="g-form-actions">{children}</div>;
}
