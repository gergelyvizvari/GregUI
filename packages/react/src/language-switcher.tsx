'use client';
import { useId } from 'react';
import { useLocale } from '@gregui/localization';
import { Icon } from './icons';
import { useControllableState } from './controllable';

export interface LanguageOption {
  /** Stable value the app stores, for example `hu` or `en-GB`. */
  value: string;
  /** The language's own name (`Magyar`, `English`), so people can find theirs in any UI language. */
  label: string;
  /** BCP 47 tag of `label`, so screen readers pronounce each name correctly. */
  lang?: string;
}
export interface LanguageSwitcherProps {
  options: readonly LanguageOption[];
  /** Controlled selection. */
  value?: string;
  /** Initial selection when uncontrolled. Defaults to the first option. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name. Defaults to the package's translated "Language". */
  label?: string;
  /** Keep the label for assistive technology only, for compact headers. */
  hideLabel?: boolean;
  size?: 'small' | 'medium';
  /** Name for native form submission. */
  name?: string;
  disabled?: boolean;
}

/**
 * Picks the interface language from a native select with a globe icon. The app owns the list,
 * persistence and what changing language does (routing, reloading copy).
 */
export function LanguageSwitcher({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  hideLabel = false,
  size = 'medium',
  name,
  disabled,
}: LanguageSwitcherProps) {
  const { messages } = useLocale();
  const id = useId();
  const [current, setCurrent] = useControllableState(
    value,
    defaultValue ?? options[0]?.value ?? '',
    onValueChange,
  );
  const selected = options.find((option) => option.value === current);
  return (
    <div className="g-language-switcher" data-size={size}>
      <label className={hideLabel ? 'g-sr-only' : 'g-label'} htmlFor={id}>
        {label ?? messages.language}
      </label>
      <span className="g-select-wrap">
        <span className="g-language-switcher-icon" aria-hidden="true">
          <Icon name="globe" />
        </span>
        <select
          id={id}
          name={name}
          disabled={disabled}
          className="g-input g-select"
          value={current}
          lang={selected?.lang}
          onChange={(event) => setCurrent(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} lang={option.lang}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="g-select-chevron" aria-hidden="true">
          <Icon name="chevron" />
        </span>
      </span>
    </div>
  );
}
