'use client';
import { useId, type CSSProperties, type ReactNode } from 'react';
import { createTheme, themeVariables, type Theme } from '@gregui/tokens';
import { Icon } from './icons';
import { Heading, Text } from './typography';
export function PreviewStage({
  children,
  label = 'Component preview',
  showcase = false,
}: {
  children: ReactNode;
  label?: string;
  showcase?: boolean;
}) {
  return (
    <section className="g-preview-stage" aria-label={label} data-showcase={showcase}>
      {children}
    </section>
  );
}
export function PreviewComposition({ children }: { children: ReactNode }) {
  return <div className="g-preview-composition">{children}</div>;
}
export function PresetOption({
  name,
  description,
  selected,
  onClick,
  preset,
  mode = 'light',
  palette,
}: {
  name: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  preset: Theme['preset'];
  mode?: Theme['mode'];
  palette?: import('@gregui/tokens').Palette;
}) {
  const sample = createTheme(preset, mode, palette);
  return (
    <button className="g-preset-option" aria-pressed={selected} onClick={onClick} type="button">
      <span
        className="g-theme g-preset-art"
        data-preset={preset}
        data-mode={mode}
        data-accent={sample.accent ?? 'expressive'}
        style={themeVariables(sample) as CSSProperties}
        aria-hidden="true"
      >
        <span className="g-mini-app">
          <span className="g-mini-rail">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span className="g-mini-card">
            <span className="g-mini-heading">
              Your day <span className="g-mini-dot" />
            </span>
            <span className="g-mini-metrics">
              <span>
                24<small>Ready</small>
              </span>
              <span>
                8<small>In review</small>
              </span>
              <span>
                96%<small>Complete</small>
              </span>
            </span>
            <span className="g-mini-input">
              Search workspace <Icon name="chevron" />
            </span>
            <span className="g-mini-footer">
              <span className="g-mini-toggle" />
              <span className="g-mini-button">
                Let's go <Icon name="chevron" />
              </span>
            </span>
          </span>
        </span>
      </span>
      <span className="g-preset-label">
        {name}
        {selected && <Icon name="check" />}
      </span>
      <span className="g-hint">{description}</span>
    </button>
  );
}
export function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="g-color-control">
      <label htmlFor={id}>{label}</label>
      <div className="g-color-inputs">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} color`}
        />
        <code>{value.toUpperCase()}</code>
      </div>
    </div>
  );
}
export function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <div className="g-swatch">
      <span style={{ backgroundColor: color }} aria-hidden="true" />
      <Text size="small" weight="strong">
        {label}
      </Text>
      <Text size="small" tone="muted">
        {color.toUpperCase()}
      </Text>
    </div>
  );
}
export function Metric({
  value,
  label,
  compact = false,
}: {
  value: string;
  label: string;
  compact?: boolean;
}) {
  return (
    <div className="g-metric" data-compact={compact || undefined}>
      <Text size="eyebrow" tone="muted">
        {label}
      </Text>
      <Heading level={3} size={compact ? 'card' : 'page'}>
        {value}
      </Heading>
    </div>
  );
}
/** Decorative material study, inheriting the current theme. Contains no semantic content. */
export function ThemeArtwork({ compact = false }: { compact?: boolean }) {
  return (
    <div className="g-theme-artwork" data-compact={compact} aria-hidden="true">
      <div className="g-art-orbit" />
      <div className="g-art-object">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="g-art-baseline">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
