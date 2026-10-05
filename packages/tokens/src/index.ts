export const presets = ['flat', 'glass', 'soft', 'elevated', 'outline'] as const;
export type Preset = (typeof presets)[number];
export type Mode = 'light' | 'dark';
export type Density = 'comfortable' | 'compact';
export const colorRoles = [
  'background',
  'surface',
  'text',
  'muted',
  'border',
  'primary',
  'onPrimary',
  'focus',
  'success',
  'warning',
  'danger',
] as const;
export type ColorRole = (typeof colorRoles)[number];
export interface Theme {
  version: 1;
  name: string;
  preset: Preset;
  mode: Mode;
  density: Density;
  radius: 'square' | 'rounded' | 'pill';
  font: 'system' | 'humanist' | 'mono';
  motion: 'standard' | 'reduced';
  colors: Record<ColorRole, string>;
}
// Presets supply an art-directed starting palette; imported/custom colors remain editable.
const palettes: Record<Preset, Record<Mode, Theme['colors']>> = {
  flat: {
    light: {
      background: '#eef2eb',
      surface: '#fbfcf8',
      text: '#1e3429',
      muted: '#536456',
      border: '#778575',
      primary: '#245d43',
      onPrimary: '#ffffff',
      focus: '#234d3b',
      success: '#25623d',
      warning: '#7a510c',
      danger: '#ae2b37',
    },
    dark: {
      background: '#131d18',
      surface: '#1b2a22',
      text: '#edf4e9',
      muted: '#b4c5b7',
      border: '#809987',
      primary: '#a4d4ac',
      onPrimary: '#172e20',
      focus: '#b1e1b8',
      success: '#9bd6ac',
      warning: '#edcb8d',
      danger: '#ffabb1',
    },
  },
  glass: {
    light: {
      background: '#ece9f5',
      surface: '#fbf9ff',
      text: '#302344',
      muted: '#685773',
      border: '#897496',
      primary: '#7042ac',
      onPrimary: '#ffffff',
      focus: '#5c3293',
      success: '#286341',
      warning: '#7a4e0b',
      danger: '#ad294d',
    },
    dark: {
      background: '#181324',
      surface: '#292136',
      text: '#f6efff',
      muted: '#c8b9d9',
      border: '#a08caf',
      primary: '#d5b5fa',
      onPrimary: '#321746',
      focus: '#e1c2ff',
      success: '#a1deb7',
      warning: '#f3ce90',
      danger: '#ffb1c6',
    },
  },
  soft: {
    light: {
      background: '#e7e1d8',
      surface: '#eee8df',
      text: '#3d342b',
      muted: '#695c50',
      border: '#88796a',
      primary: '#87512f',
      onPrimary: '#ffffff',
      focus: '#784626',
      success: '#376340',
      warning: '#73510a',
      danger: '#a12c3c',
    },
    dark: {
      background: '#211e1a',
      surface: '#2e2923',
      text: '#f4ebe0',
      muted: '#c9bdae',
      border: '#a49785',
      primary: '#e9ba93',
      onPrimary: '#382416',
      focus: '#f6cba6',
      success: '#b1d3a7',
      warning: '#edce8a',
      danger: '#f7b1ac',
    },
  },
  elevated: {
    light: {
      background: '#eaf0f8',
      surface: '#ffffff',
      text: '#182b47',
      muted: '#52647e',
      border: '#77889e',
      primary: '#2258c5',
      onPrimary: '#ffffff',
      focus: '#1748b0',
      success: '#21633e',
      warning: '#7c5105',
      danger: '#b0283d',
    },
    dark: {
      background: '#111a29',
      surface: '#1c2a40',
      text: '#eef4ff',
      muted: '#b6c7de',
      border: '#819bbd',
      primary: '#9fc3ff',
      onPrimary: '#152c52',
      focus: '#b8d5ff',
      success: '#99dbb5',
      warning: '#f0cf94',
      danger: '#ffaebc',
    },
  },
  outline: {
    light: {
      background: '#f3efdc',
      surface: '#fffdf2',
      text: '#252820',
      muted: '#5f6254',
      border: '#777b69',
      primary: '#303625',
      onPrimary: '#f1fa8c',
      focus: '#3e5424',
      success: '#35633c',
      warning: '#78500c',
      danger: '#b22b37',
    },
    dark: {
      background: '#191d15',
      surface: '#272d20',
      text: '#f4f3df',
      muted: '#c2c7af',
      border: '#97a282',
      primary: '#ddea8b',
      onPrimary: '#252c18',
      focus: '#eafa9c',
      success: '#b6dbaa',
      warning: '#edce8c',
      danger: '#ffb2aa',
    },
  },
};
export const paletteOptions = [
  { id: 'forest', name: 'Forest', preset: 'flat' },
  { id: 'plum', name: 'Plum', preset: 'glass' },
  { id: 'clay', name: 'Clay', preset: 'soft' },
  { id: 'cobalt', name: 'Cobalt', preset: 'elevated' },
  { id: 'ink', name: 'Ink & cream', preset: 'outline' },
] as const;
export type Palette = (typeof paletteOptions)[number]['id'];
function paletteColors(palette: Palette, mode: Mode): Theme['colors'] {
  const option = paletteOptions.find((option) => option.id === palette);
  if (!option) throw new Error('Unknown palette.');
  return { ...palettes[option.preset][mode] };
}
/** Recognizes stored colours without adding metadata to version 1 theme documents. */
export function getPalette(theme: Theme): Palette | undefined {
  return paletteOptions.find((option) =>
    colorRoles.every(
      (role) =>
        theme.colors[role].toLowerCase() ===
        palettes[option.preset][theme.mode][role].toLowerCase(),
    ),
  )?.id;
}
export function applyPalette(theme: Theme, palette: Palette): Theme {
  return { ...theme, colors: paletteColors(palette, theme.mode) };
}
export function createTheme(
  preset: Preset = 'flat',
  mode: Mode = 'light',
  palette?: Palette,
): Theme {
  return {
    version: 1,
    name: 'My workspace',
    preset,
    mode,
    density: 'comfortable',
    radius: preset === 'outline' ? 'square' : 'rounded',
    font: 'system',
    motion: 'standard',
    colors: palette ? paletteColors(palette, mode) : { ...palettes[preset][mode] },
  };
}
export function switchMode(theme: Theme, mode: Mode): Theme {
  const palette = getPalette(theme);
  return {
    ...theme,
    mode,
    colors: palette ? paletteColors(palette, mode) : { ...palettes[theme.preset][mode] },
  };
}
export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.5rem',
  6: '2rem',
  7: '3rem',
  8: '4rem',
} as const;
export type Space = keyof typeof spacing;
export function themeVariables(theme: Theme): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const role of colorRoles) vars[`--g-${role}`] = theme.colors[role];
  const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ');
  const night = theme.mode === 'dark';
  vars['--g-line'] = `rgba(${rgb(theme.colors.text)}, ${night ? 0.22 : 0.14})`;
  vars['--g-tint'] = `rgba(${rgb(theme.colors.primary)}, ${night ? 0.13 : 0.07})`;
  vars['--g-atmosphere'] = `rgba(${rgb(theme.colors.primary)}, ${night ? 0.24 : 0.16})`;
  vars['--g-shadow-color'] = night ? '0, 0, 0' : rgb(theme.colors.text);
  vars['--g-highlight'] = night ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.85)';
  vars['--g-primary-sheen'] = night
    ? 'linear-gradient(180deg,rgba(255,255,255,0.12),transparent)'
    : 'linear-gradient(180deg,transparent,rgba(0,0,0,0.12))';
  vars['--g-radius'] = { square: '2px', rounded: '12px', pill: '24px' }[theme.radius];
  const compact = theme.density === 'compact';
  vars['--g-control-height'] = compact ? '2.25rem' : '3.25rem';
  vars['--g-control-padding-y'] = compact ? '0.35rem' : '0.8rem';
  vars['--g-button-padding-x'] = compact ? '0.75rem' : '1.25rem';
  vars['--g-button-small-height'] = compact ? '2rem' : '2.75rem';
  vars['--g-button-large-height'] = compact ? '2.75rem' : '3.75rem';
  vars['--g-field-gap'] = compact ? '0.375rem' : '0.625rem';
  vars['--g-textarea-height'] = compact ? '5rem' : '7rem';
  vars['--g-font'] = {
    system:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    humanist: '"Trebuchet MS", "Segoe UI", sans-serif',
    mono: 'ui-monospace, "SFMono-Regular", Consolas, monospace',
  }[theme.font];
  const rhythms = {
    flat: [160, 240],
    glass: [240, 380],
    soft: [260, 400],
    elevated: [200, 320],
    outline: [120, 220],
  };
  vars['--g-display-font'] =
    theme.font === 'system' && theme.preset === 'soft'
      ? 'Georgia, "Times New Roman", serif'
      : 'var(--g-font)';
  vars['--g-art-spread'] = theme.motion === 'reduced' ? '17px' : '23px';
  vars['--g-icon-shift'] = theme.motion === 'reduced' ? '0px' : '2px';
  vars['--g-art-lift'] = theme.motion === 'reduced' ? '10px' : '15px';
  vars['--g-display-weight'] =
    theme.preset === 'soft' ? '400' : theme.preset === 'outline' ? '750' : '550';
  vars['--g-duration'] = theme.motion === 'reduced' ? '0ms' : `${rhythms[theme.preset][0]}ms`;
  vars['--g-duration-fast'] = theme.motion === 'reduced' ? '0ms' : '120ms';
  vars['--g-duration-enter'] = theme.motion === 'reduced' ? '0ms' : `${rhythms[theme.preset][1]}ms`;
  vars['--g-ease'] = 'cubic-bezier(0.2, 0, 0, 1)';
  vars['--g-ease-enter'] = 'cubic-bezier(0.16, 1, 0.3, 1)';
  return vars;
}
function luminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
export function contrast(a: string, b: string): number {
  if (![a, b].every((v) => /^#[\da-f]{6}$/i.test(v)))
    throw new Error('Contrast requires six-digit hex colors.');
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
export interface ContrastCheck {
  label: string;
  foreground: ColorRole;
  background: ColorRole;
  ratio: number;
  minimum: number;
  pass: boolean;
}
export function checkContrast(theme: Theme): ContrastCheck[] {
  const pairs: [ColorRole, ColorRole, number][] = [
    ['text', 'surface', 4.5],
    ['text', 'background', 4.5],
    ['muted', 'surface', 4.5],
    ['muted', 'background', 4.5],
    ['onPrimary', 'primary', 4.5],
    ['primary', 'surface', 4.5],
    ['primary', 'background', 4.5],
    ['border', 'surface', 3],
    ['border', 'background', 3],
    ['focus', 'surface', 3],
    ['focus', 'background', 3],
    ['success', 'surface', 4.5],
    ['warning', 'surface', 4.5],
    ['danger', 'surface', 4.5],
    ['danger', 'background', 4.5],
  ];
  return pairs.map(([foreground, background, minimum]) => {
    const ratio = contrast(theme.colors[foreground], theme.colors[background]);
    return {
      label: `${foreground} / ${background}`,
      foreground,
      background,
      ratio,
      minimum,
      pass: ratio >= minimum,
    };
  });
}
export function parseTheme(input: unknown): Theme {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Theme must be a JSON object.');
  const v = input as Record<string, unknown>;
  const exactKeys = [
    'version',
    'name',
    'preset',
    'mode',
    'density',
    'radius',
    'font',
    'motion',
    'colors',
  ];
  if (Object.keys(v).some((k) => !exactKeys.includes(k)))
    throw new Error('Theme contains unsupported properties.');
  if (v.version !== 1) throw new Error('Unsupported theme version. Expected version 1.');
  if (typeof v.name !== 'string' || !v.name.trim() || v.name.length > 80)
    throw new Error('Theme name must contain 1–80 characters.');
  const enums: Record<string, readonly string[]> = {
    preset: presets,
    mode: ['light', 'dark'],
    density: ['comfortable', 'compact'],
    radius: ['square', 'rounded', 'pill'],
    font: ['system', 'humanist', 'mono'],
    motion: ['standard', 'reduced'],
  };
  for (const [key, values] of Object.entries(enums))
    if (typeof v[key] !== 'string' || !values.includes(v[key] as string))
      throw new Error(`Invalid ${key}.`);
  if (!v.colors || typeof v.colors !== 'object' || Array.isArray(v.colors))
    throw new Error('Theme colors are required.');
  const colors = v.colors as Record<string, unknown>;
  if (
    Object.keys(colors).length !== colorRoles.length ||
    Object.keys(colors).some((k) => !colorRoles.includes(k as ColorRole))
  )
    throw new Error('Theme must contain exactly the supported color roles.');
  for (const role of colorRoles)
    if (typeof colors[role] !== 'string' || !/^#[\da-f]{6}$/i.test(colors[role] as string))
      throw new Error(`${role} must be a six-digit hex color.`);
  return {
    version: 1,
    name: v.name.trim(),
    preset: v.preset as Preset,
    mode: v.mode as Mode,
    density: v.density as Density,
    radius: v.radius as Theme['radius'],
    font: v.font as Theme['font'],
    motion: v.motion as Theme['motion'],
    colors: Object.fromEntries(
      colorRoles.map((r) => [r, (colors[r] as string).toLowerCase()]),
    ) as Theme['colors'],
  };
}
export function exportTheme(theme: Theme, format: 'json' | 'css' = 'json'): string {
  const valid = parseTheme(theme);
  if (checkContrast(valid).some((c) => !c.pass))
    throw new Error('Fix the reported contrast pairs before exporting.');
  if (format === 'json') return JSON.stringify(valid, null, 2) + '\n';
  return `/* gregUI v1 token values. Set preset/mode/density through ThemeProvider. */\n.g-theme {\n${Object.entries(
    themeVariables(valid),
  )
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}\n`;
}
