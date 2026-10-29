'use client';
import {
  createContext,
  useContext,
  useId,
  useMemo,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createTheme, switchMode, themeVariables, type Mode, type Theme } from '@gregui/tokens';
import { useLocale } from '@gregui/localization';

/**
 * Where a ThemeProvider takes light/dark from. `'theme'` uses the theme's own `mode`;
 * `'system'` follows the device's `prefers-color-scheme` and derives the other mode with
 * `switchMode`. This is a runtime choice: stored theme JSON keeps `mode: 'light' | 'dark'`.
 */
export type ThemeColorScheme = 'theme' | 'system';

interface SystemScheme {
  /** Stable per-provider selector value shared by the frame and its portals. */
  id: string;
  /** Variables that differ between the light and dark variants. */
  light: Record<string, string>;
  dark: Record<string, string>;
}
interface ThemeState {
  /** Effective theme: the resolved light/dark variant once the device preference is known. */
  theme: Theme;
  /** Theme supplied to the provider before any system mode was applied. */
  base: Theme;
  colorScheme: ThemeColorScheme;
  /** Device mode; null during server rendering and hydration, or when not following the system. */
  systemMode: Mode | null;
  scheme?: SystemScheme;
}
const defaultTheme = createTheme();
const ThemeContext = createContext<ThemeState>({
  theme: defaultTheme,
  base: defaultTheme,
  colorScheme: 'theme',
  systemMode: null,
});

/**
 * The effective theme. Under `colorScheme="system"` its `mode` and colours are the device's
 * resolved variant; during server rendering and hydration it is the supplied theme.
 */
export function useTheme() {
  return useContext(ThemeContext).theme;
}

const darkQuery = '(prefers-color-scheme: dark)';
function subscribeToSystem(onChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia(darkQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
function readSystemMode(): Mode {
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(darkQuery).matches
    ? 'dark'
    : 'light';
}
const unknownMode = () => null;
const ignore = () => () => {};

/**
 * The device's light/dark preference from `prefers-color-scheme`, following live changes.
 * Returns undefined during server rendering and hydration, before the preference can be read.
 */
export function useSystemMode(): Mode | undefined {
  return useSyncExternalStore(subscribeToSystem, readSystemMode, unknownMode) ?? undefined;
}

function ThemeFrame({
  state,
  children,
  portal = false,
}: {
  state: ThemeState;
  children: ReactNode;
  portal?: boolean;
}) {
  const { locale, direction } = useLocale();
  const { theme, scheme, systemMode } = state;
  const variables = themeVariables(theme);
  // Variables that differ by mode come from the scoped stylesheet so CSS can pick them before
  // JavaScript knows the device preference; inline values would override it.
  if (scheme) for (const name of Object.keys(scheme.light)) delete variables[name];
  return (
    <div
      className={`g-theme${portal ? ' g-portal' : ''}`}
      data-preset={theme.preset}
      data-mode={scheme && !systemMode ? 'system' : theme.mode}
      data-color-scheme={scheme ? 'system' : undefined}
      data-g-scheme={scheme?.id}
      data-accent={theme.accent ?? 'expressive'}
      data-density={theme.density}
      data-motion={theme.motion}
      style={variables as CSSProperties}
      lang={locale}
      dir={direction}
    >
      {children}
    </div>
  );
}

function declarations(variables: Record<string, string>) {
  // !important matches the precedence the inline variables had over preset rules.
  return Object.entries(variables)
    .map(([name, value]) => `${name}:${value} !important;`)
    .join('');
}
function schemeStyles({ id, light, dark }: SystemScheme) {
  const selector = `[data-g-scheme="${id}"]`;
  const css = `${selector}{${declarations(light)}}@media ${darkQuery}{${selector}{${declarations(dark)}}}`;
  // Values come from theme JSON; keep them from closing the style element.
  return css.replace(/</g, '\\3c ');
}

export function ThemeProvider({
  theme,
  colorScheme,
  children,
}: {
  theme?: Theme;
  /**
   * `'system'` follows the device's light/dark preference, including live changes, and renders
   * both variants in CSS so the first paint matches the device. Defaults to `'theme'`, or to the
   * parent's setting when `theme` is omitted.
   */
  colorScheme?: ThemeColorScheme;
  children: ReactNode;
}) {
  const inherited = useContext(ThemeContext);
  const inherit =
    theme === undefined && (colorScheme ?? inherited.colorScheme) === inherited.colorScheme;
  const scheme = inherit ? inherited.colorScheme : (colorScheme ?? 'theme');
  const base = theme ?? (scheme === 'system' ? inherited.base : inherited.theme);
  const system = scheme === 'system';
  const id = useId();
  // An inheriting provider reuses its parent's state, so only the owning provider subscribes.
  const owns = system && !inherit;
  const systemMode = useSyncExternalStore(
    owns ? subscribeToSystem : ignore,
    owns ? readSystemMode : unknownMode,
    unknownMode,
  );
  const variants = useMemo(() => {
    if (!owns) return undefined;
    const light = base.mode === 'light' ? base : switchMode(base, 'light');
    const dark = base.mode === 'dark' ? base : switchMode(base, 'dark');
    const lightVars = themeVariables(light);
    const darkVars = themeVariables(dark);
    const changed = Object.keys(lightVars).filter((name) => lightVars[name] !== darkVars[name]);
    const pick = (vars: Record<string, string>) =>
      Object.fromEntries(changed.map((name) => [name, vars[name]!]));
    return { light, dark, scheme: { id, light: pick(lightVars), dark: pick(darkVars) } };
  }, [owns, base, id]);
  let state: ThemeState;
  if (inherit) state = inherited;
  else if (variants)
    state = {
      theme: systemMode ? variants[systemMode] : base,
      base,
      colorScheme: 'system',
      systemMode,
      scheme: variants.scheme,
    };
  else state = { theme: base, base, colorScheme: 'theme', systemMode: null };
  return (
    <ThemeContext.Provider value={state}>
      {variants && <style dangerouslySetInnerHTML={{ __html: schemeStyles(variants.scheme) }} />}
      <ThemeFrame state={state}>{children}</ThemeFrame>
    </ThemeContext.Provider>
  );
}
export function PortalFrame({ children }: { children: ReactNode }) {
  return (
    <ThemeFrame state={useContext(ThemeContext)} portal>
      {children}
    </ThemeFrame>
  );
}
