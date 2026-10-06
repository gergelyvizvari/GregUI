import type { ReactNode } from 'react';
export function ThumbnailChoice({
  label,
  src,
  preview,
  checked,
  onChange,
  detail,
}: {
  label: string;
  src?: string;
  preview?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  detail?: string;
}) {
  return (
    <label className="g-thumbnail-choice" data-checked={checked}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
      />
      <span className="g-thumbnail-choice-media">
        {src ? <img src={src} alt="" loading="lazy" /> : preview}
      </span>
      <span className="g-thumbnail-choice-caption">
        <span>
          {label}
          {detail && <small>{detail}</small>}
        </span>
      </span>
    </label>
  );
}
