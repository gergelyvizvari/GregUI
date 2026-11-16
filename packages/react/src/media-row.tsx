import type { ReactNode } from 'react';

/**
 * One item of a list led by a small picture (a card, a photo, a cover): the picture, then the
 * text, then actions. On phones the actions move under the text. The picture is decorative; the
 * text says what the item is.
 */
export function MediaRow({
  media,
  children,
  actions,
}: {
  media: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="g-media-row">
      <div className="g-media-row-media" aria-hidden="true">
        {media}
      </div>
      <div className="g-media-row-body">{children}</div>
      {actions && <div className="g-media-row-actions">{actions}</div>}
    </div>
  );
}
