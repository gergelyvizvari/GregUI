export const presets = [
  'paper',
  'joyful',
  'professional',
  'clay',
  'neumorphic',

  'flat',
  'glass',
  'soft',
  'elevated',
  'outline',
  'editorial',
  'porcelain',
  'aurora',
  'studio',
  'canvas',
  'cream',
] as const;
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
  /**
   * Where the primary colour appears. `restrained` keeps it to the main action, links and focus;
   * selection and decoration use ink. Omitted means `expressive`.
   */
  accent?: Accent;
}
export const accents = ['expressive', 'restrained'] as const;
export type Accent = (typeof accents)[number];
// Presets supply an art-directed starting palette; imported/custom colors remain editable.
const basePalettes = {
  flat: {
    light: {
      background: '#f2faf5',
      surface: '#ffffff',
      text: '#1e3429',
      muted: '#536456',
      border: '#778575',
      primary: '#157047',
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
      background: '#f7f3ff',
      surface: '#ffffff',
      text: '#302344',
      muted: '#685773',
      border: '#897496',
      primary: '#773bd1',
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
      background: '#faf2ee',
      surface: '#fffaf7',
      text: '#3d342b',
      muted: '#695c50',
      border: '#88796a',
      primary: '#a3482b',
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
      background: '#f2f6ff',
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
      background: '#faf9f6',
      surface: '#ffffff',
      text: '#252820',
      muted: '#5f6254',
      border: '#777b69',
      primary: '#303625',
      onPrimary: '#ffffff',
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
// Every palette keeps essential content opaque in both modes.
const ocean: Record<Mode, Theme['colors']> = {
  light: {
    background: '#f0faff',
    surface: '#ffffff',
    text: '#18363d',
    muted: '#4c6870',
    border: '#718e96',
    primary: '#00728c',
    onPrimary: '#ffffff',
    focus: '#075767',
    success: '#25623d',
    warning: '#7a510c',
    danger: '#ae2b37',
  },
  dark: {
    background: '#101f26',
    surface: '#192f38',
    text: '#e8f7fa',
    muted: '#abcbd3',
    border: '#749ba6',
    primary: '#83d4e2',
    onPrimary: '#10343d',
    focus: '#a5e9f2',
    success: '#9bd6ac',
    warning: '#edcb8d',
    danger: '#ffabb1',
  },
};
const rose: Record<Mode, Theme['colors']> = {
  light: {
    background: '#fff2f7',
    surface: '#ffffff',
    text: '#422633',
    muted: '#745763',
    border: '#a07e8c',
    primary: '#bf2864',
    onPrimary: '#ffffff',
    focus: '#85204e',
    success: '#25623d',
    warning: '#7a510c',
    danger: '#ae2b37',
  },
  dark: {
    background: '#261820',
    surface: '#38232e',
    text: '#fceff5',
    muted: '#d8b9c8',
    border: '#ae8398',
    primary: '#f2a8c9',
    onPrimary: '#471b31',
    focus: '#ffc1dd',
    success: '#9bd6ac',
    warning: '#edcb8d',
    danger: '#ffabb1',
  },
};
const amber: Record<Mode, Theme['colors']> = {
  light: {
    background: '#fff8ed',
    surface: '#ffffff',
    text: '#3d3020',
    muted: '#716149',
    border: '#98876a',
    primary: '#996000',
    onPrimary: '#ffffff',
    focus: '#744800',
    success: '#25623d',
    warning: '#7a510c',
    danger: '#ae2b37',
  },
  dark: {
    background: '#241e14',
    surface: '#352c1d',
    text: '#fbf2df',
    muted: '#d4c2a2',
    border: '#ab9268',
    primary: '#f2c66d',
    onPrimary: '#3b2909',
    focus: '#ffdb96',
    success: '#9bd6ac',
    warning: '#edcb8d',
    danger: '#ffabb1',
  },
};
const iris: Record<Mode, Theme['colors']> = {
  light: {
    background: '#f5f6fb',
    surface: '#ffffff',
    text: '#25283d',
    muted: '#62667e',
    border: '#878ca6',
    primary: '#5353d5',
    onPrimary: '#ffffff',
    focus: '#4645bf',
    success: '#21734e',
    warning: '#865700',
    danger: '#bf3356',
  },
  dark: {
    background: '#181b2b',
    surface: '#24283c',
    text: '#f3f4fc',
    muted: '#bec3dc',
    border: '#8a92b4',
    primary: '#b8b8ff',
    onPrimary: '#222252',
    focus: '#ceccff',
    success: '#8ee0b4',
    warning: '#f5ce80',
    danger: '#ffa5be',
  },
};
const lagoon: Record<Mode, Theme['colors']> = {
  light: {
    background: '#eaf8f6',
    surface: '#ffffff',
    text: '#153d43',
    muted: '#496b70',
    border: '#759296',
    primary: '#007c80',
    onPrimary: '#ffffff',
    focus: '#006469',
    success: '#257345',
    warning: '#805800',
    danger: '#b73955',
  },
  dark: {
    background: '#102c31',
    surface: '#1b3c42',
    text: '#edfcf9',
    muted: '#b0d3d4',
    border: '#81a6ac',
    primary: '#7be2d4',
    onPrimary: '#123e3e',
    focus: '#a4f4e6',
    success: '#91dfaf',
    warning: '#ffdb87',
    danger: '#ffafc2',
  },
};
// Warm cream stock with one vermilion accent; brighter and warmer than Paper.
const cream: Record<Mode, Theme['colors']> = {
  light: {
    background: '#fcf6ea',
    surface: '#fffcf5',
    text: '#2b241e',
    muted: '#68594c',
    border: '#8e7d6c',
    primary: '#c03d12',
    onPrimary: '#ffffff',
    focus: '#962f0d',
    success: '#3d6a3a',
    warning: '#7a560a',
    danger: '#a52d2d',
  },
  dark: {
    background: '#211c16',
    surface: '#2b251e',
    text: '#f8efe1',
    muted: '#cfc0ad',
    border: '#a2907b',
    primary: '#ffb08a',
    onPrimary: '#3b1a0a',
    focus: '#ffcaa8',
    success: '#b2d6a4',
    warning: '#edcb86',
    danger: '#ffaca6',
  },
};
const paper: Record<Mode, Theme['colors']> = {
  light: {
    background: '#ffffff',
    surface: '#ffffff',
    text: '#292929',
    muted: '#646464',
    border: '#858585',
    primary: '#303030',
    onPrimary: '#ffffff',
    focus: '#303030',
    success: '#426348',
    warning: '#7c590f',
    danger: '#a13f3f',
  },
  dark: {
    background: '#242424',
    surface: '#242424',
    text: '#eeeeee',
    muted: '#bdbdbd',
    border: '#909090',
    primary: '#e0e0e0',
    onPrimary: '#242424',
    focus: '#eeeeee',
    success: '#adcfac',
    warning: '#e3c383',
    danger: '#edaaaa',
  },
};
const mono: Record<Mode, Theme['colors']> = {
  light: {
    background: '#fafafa',
    surface: '#fafafa',
    text: '#242424',
    muted: '#626262',
    border: '#858585',
    primary: '#393939',
    onPrimary: '#ffffff',
    focus: '#343434',
    success: '#505050',
    warning: '#595959',
    danger: '#934949',
  },
  dark: {
    background: '#202020',
    surface: '#202020',
    text: '#eeeeee',
    muted: '#bdbdbd',
    border: '#909090',
    primary: '#dddddd',
    onPrimary: '#242424',
    focus: '#eeeeee',
    success: '#c4c4c4',
    warning: '#cdcdcd',
    danger: '#e4aaaa',
  },
};
// Accent families are independent of material presets.
function freshPalette(light: string, dark: string, wash: string): Record<Mode, Theme['colors']> {
  return {
    light: { ...paper.light, background: wash, primary: light, focus: light },
    dark: { ...paper.dark, primary: dark, focus: dark, onPrimary: '#242424' },
  };
}
const extraPalettes = {
  mono,
  coral: freshPalette('#bc4039', '#ffada5', '#fff5f3'),
  citrus: freshPalette('#806600', '#efd567', '#fffced'),
  mint: freshPalette('#087858', '#7fe0ba', '#f0fcf6'),
  violet: freshPalette('#7734ce', '#d0b0ff', '#f9f3ff'),
};
const palettes: Record<Preset, Record<Mode, Theme['colors']>> = {
  ...basePalettes,
  paper,
  cream,
  editorial: amber,
  porcelain: rose,
  aurora: ocean,
  studio: basePalettes.elevated,
  canvas: basePalettes.flat,
  joyful: lagoon,
  professional: iris,
  clay: amber,
  neumorphic: basePalettes.soft,
};
export const presetInfo: Record<Preset, { name: string; description: string }> = {
  paper: { name: 'Paper', description: 'Quiet ink, colour on paper' },
  joyful: { name: 'Bloom', description: 'Fresh colour, a little sunshine' },
  professional: { name: 'Workspace', description: 'Clear thinking, colourful details' },
  clay: { name: 'Clay', description: 'Puffy forms, sculpted edges' },
  neumorphic: { name: 'Neumorphic', description: 'Raised surfaces, recessed controls' },
  flat: { name: 'Flat', description: 'Clean and simple' },
  glass: { name: 'Glass', description: 'Layered glass' },
  soft: { name: 'Soft', description: 'Soft surfaces' },
  elevated: { name: 'Elevated', description: 'Depth and shadows' },
  outline: { name: 'Outline', description: 'Defined borders' },
  editorial: { name: 'Editorial', description: 'Serif detail, fine rules' },
  porcelain: { name: 'Porcelain', description: 'Polished curves, satin light' },
  aurora: { name: 'Aurora', description: 'Luminous edges, flowing colour' },
  studio: { name: 'Studio', description: 'Precise lines, quiet depth' },
  canvas: { name: 'Canvas', description: 'Tactile paper, playful shapes' },
  cream: { name: 'Cream', description: 'Warm stock, editorial ink' },
};
export const paletteOptions = [
  { id: 'coral', name: 'Coral', preset: 'paper' },
  { id: 'citrus', name: 'Citrus', preset: 'paper' },
  { id: 'mint', name: 'Mint', preset: 'paper' },
  { id: 'violet', name: 'Violet', preset: 'paper' },
  { id: 'mono', name: 'Graphite', preset: 'paper' },
  { id: 'paper', name: 'Pure white', preset: 'paper' },
  { id: 'cream', name: 'Cream & vermilion', preset: 'cream' },
  { id: 'iris', name: 'Iris', preset: 'professional' },
  { id: 'lagoon', name: 'Lagoon', preset: 'joyful' },
  { id: 'forest', name: 'Forest', preset: 'flat' },
  { id: 'plum', name: 'Plum', preset: 'glass' },
  { id: 'clay', name: 'Clay', preset: 'soft' },
  { id: 'cobalt', name: 'Cobalt', preset: 'elevated' },
  { id: 'ink', name: 'Ink & cream', preset: 'outline' },
  { id: 'ocean', name: 'Ocean', preset: 'aurora' },
  { id: 'rose', name: 'Rose', preset: 'porcelain' },
  { id: 'amber', name: 'Amber', preset: 'editorial' },
] as const;
export type Palette = (typeof paletteOptions)[number]['id'];
/** Curated choices; legacy IDs stay readable for saved user themes. */
export const featuredPresets = [
  'paper',
  'cream',
  'professional',
  'joyful',
  'clay',
  'neumorphic',
  'glass',
  'flat',
] as const;
export const recommendedPalettes: Record<Preset, Palette> = {
  paper: 'paper',
  professional: 'iris',
  joyful: 'lagoon',
  clay: 'rose',
  neumorphic: 'clay',
  glass: 'plum',
  flat: 'forest',
  soft: 'clay',
  elevated: 'cobalt',
  outline: 'ink',
  editorial: 'amber',
  porcelain: 'rose',
  aurora: 'ocean',
  studio: 'cobalt',
  canvas: 'forest',
  cream: 'cream',
};
function paletteColors(palette: Palette, mode: Mode): Theme['colors'] {
  const option = paletteOptions.find((option) => option.id === palette);
  if (!option) throw new Error('Unknown palette.');
  const extra = extraPalettes[palette as keyof typeof extraPalettes];
  return { ...(extra ?? palettes[option.preset])[mode] };
}
function materialColors(preset: Preset, colors: Theme['colors']): Theme['colors'] {
  // A single material plane is essential for true raised/inset neumorphic depth.
  return preset === 'neumorphic' ? { ...colors, surface: colors.background } : { ...colors };
}
/** Recognizes stored colours without adding metadata to version 1 theme documents. */
export function getPalette(theme: Theme): Palette | undefined {
  return paletteOptions.find((option) =>
    colorRoles.every(
      (role) =>
        theme.colors[role].toLowerCase() ===
        materialColors(theme.preset, paletteColors(option.id, theme.mode))[role].toLowerCase(),
    ),
  )?.id;
}
export function applyPalette(theme: Theme, palette: Palette): Theme {
  return { ...theme, colors: materialColors(theme.preset, paletteColors(palette, theme.mode)) };
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
    radius: ['paper', 'outline', 'editorial', 'studio', 'professional'].includes(preset)
      ? 'square'
      : 'rounded',
    font: preset === 'joyful' || preset === 'clay' ? 'humanist' : 'system',
    motion: 'standard',
    colors: materialColors(preset, palette ? paletteColors(palette, mode) : palettes[preset][mode]),
    ...(preset === 'cream' ? { accent: 'restrained' as const } : {}),
  };
}
function baseColors(preset: Preset, mode: Mode, palette?: Palette): Theme['colors'] {
  return materialColors(preset, palette ? paletteColors(palette, mode) : palettes[preset][mode]);
}
/**
 * Switches light/dark while keeping identity, shape and hand-picked colours.
 * Roles that differ from the closest built-in palette (or the preset defaults) carry over
 * when they still pass checkContrast in the new mode; the rest use that palette's colours.
 */
export function switchMode(theme: Theme, mode: Mode): Theme {
  const sources: (Palette | undefined)[] = [
    undefined,
    ...paletteOptions.map((option) => option.id),
  ];
  const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
  let base: Palette | undefined;
  let best = -1;
  for (const source of sources) {
    const colors = baseColors(theme.preset, theme.mode, source);
    const matches = colorRoles.filter((role) => same(colors[role], theme.colors[role])).length;
    if (matches > best) [base, best] = [source, matches];
  }
  const from = baseColors(theme.preset, theme.mode, base);
  const to = baseColors(theme.preset, mode, base);
  const custom = new Set(colorRoles.filter((role) => !same(from[role], theme.colors[role])));
  const result: Theme = { ...theme, mode, colors: { ...to } };
  for (const role of custom) result.colors[role] = theme.colors[role];
  // Built-in colours pass every pair, so reverting failing custom roles always terminates.
  for (;;) {
    const failing = checkContrast(result)
      .filter((check) => !check.pass)
      .flatMap((check) => [check.foreground, check.background])
      .filter((role) => custom.delete(role));
    if (!failing.length) return result;
    for (const role of failing) result.colors[role] = to[role];
  }
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
/** Shared text roles. Preset font families and display weights remain theme-owned. */
export const typography = {
  body: { fontSize: '1rem', lineHeight: '1.5', letterSpacing: 'normal' },
  small: { fontSize: '0.8125rem', lineHeight: '1.55', letterSpacing: 'normal' },
  caption: { fontSize: '0.75rem', lineHeight: '1.5', letterSpacing: 'normal' },
  large: { fontSize: '1.05rem', lineHeight: '1.65', letterSpacing: 'normal' },
  lead: {
    fontSize: 'clamp(1.125rem, 1.5vw, 1.375rem)',
    lineHeight: '1.6',
    letterSpacing: '-0.01em',
  },
  eyebrow: { fontSize: '0.6875rem', lineHeight: '1.5', letterSpacing: '0.13em' },
  hero: { fontSize: 'clamp(2.4rem, 4.4vw, 4.5rem)', lineHeight: '1.15', letterSpacing: '-0.055em' },
  page: { fontSize: 'clamp(2rem, 3.4vw, 3.25rem)', lineHeight: '1.15', letterSpacing: '-0.035em' },
  section: { fontSize: '1.125rem', lineHeight: '1.15', letterSpacing: '-0.02em' },
  card: { fontSize: '1rem', lineHeight: '1.15', letterSpacing: '-0.01em' },
} as const;
export type TypographyRole = keyof typeof typography;
/**
 * Stacking layers, lowest first. Theme-invariant; emitted as `--g-z-<kebab-name>` by
 * `themeVariables`, so every themed root and portal frame has them. Use these instead of numbers.
 */
export const zIndex = {
  /** Decorative layer behind its own content (badge stamp, immersive panel image). */
  behind: -1,
  /** Lifts an element above its siblings (timeline dot, focused choice input). */
  raised: 1,
  /** Sticky form action bar at the bottom of a long form. */
  stickyActions: 5,
  /** In-flow dropdown list anchored to its field (Combobox choices). */
  dropdown: 10,
  /** Sticky toolbar at the top of a scrolling region. */
  sticky: 20,
  /** Sticky page banner, kept above a sticky toolbar that scrolls under it. */
  stickyBanner: 21,
  /** Floating panel launcher button. */
  launcher: 80,
  /** Non-modal floating panel (desktop inspector). */
  panel: 90,
  /** Modal backdrop. */
  backdrop: 100,
  /** Modal dialog, drawer and modal floating panel. */
  modal: 101,
  /** Popover and menu content, above modals that open them. */
  popover: 110,
  /** Skip link, above everything when focused. */
  skipLink: 200,
} as const;
export type ZIndexLayer = keyof typeof zIndex;
/**
 * Named viewport widths in CSS pixels, used as `max-width` limits (`compact` means "this width or
 * narrower"). CSS custom properties cannot be used in media queries, so styles.css repeats these
 * numbers; script code should use `mediaQuery('compact')` etc. instead of literal queries.
 */
export const breakpoints = {
  /** Phones: single-column layouts and stacked toolbars. */
  phone: 600,
  /** Small tablets and narrow windows: drawers replace side panels and inspectors. */
  compact: 760,
  /** Tablets and split screens: multi-column layouts collapse. */
  medium: 960,
  /** Laptops: wide workbench grids reduce columns. */
  wide: 1200,
} as const;
export type Breakpoint = keyof typeof breakpoints;
/** `(max-width: <n>px)` for a named breakpoint, for `window.matchMedia`. */
export function mediaQuery(breakpoint: Breakpoint): string {
  return `(max-width: ${breakpoints[breakpoint]}px)`;
}

export function themeVariables(theme: Theme): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [role, spec] of Object.entries(typography)) {
    vars[`--g-type-${role}-size`] = spec.fontSize;
    vars[`--g-type-${role}-line-height`] = spec.lineHeight;
    vars[`--g-type-${role}-tracking`] = spec.letterSpacing;
  }
  for (const [layer, value] of Object.entries(zIndex))
    vars[`--g-z-${layer.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = String(value);
  for (const role of colorRoles) vars[`--g-${role}`] = theme.colors[role];
  const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ');
  const night = theme.mode === 'dark';
  vars['--g-line'] = `rgba(${rgb(theme.colors.text)}, ${night ? 0.22 : 0.14})`;
  // Restrained accents keep washes and glows in ink so the primary colour stays rare.
  const wash = rgb(theme.accent === 'restrained' ? theme.colors.text : theme.colors.primary);
  vars['--g-tint'] = `rgba(${wash}, ${night ? 0.13 : 0.07})`;
  vars['--g-atmosphere'] = `rgba(${wash}, ${night ? 0.24 : 0.16})`;
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
    humanist: 'ui-rounded, "SF Pro Rounded", "Avenir Next", system-ui, sans-serif',
    mono: 'ui-monospace, "SFMono-Regular", Consolas, monospace',
  }[theme.font];
  const rhythms = {
    paper: [120, 180],
    flat: [160, 240],
    glass: [240, 380],
    soft: [260, 400],
    elevated: [200, 320],
    outline: [120, 220],
    editorial: [180, 280],
    porcelain: [240, 360],
    aurora: [260, 400],
    studio: [140, 220],
    canvas: [180, 280],
    cream: [160, 260],
    joyful: [180, 300],
    professional: [120, 200],
    clay: [240, 340],
    neumorphic: [200, 280],
  };
  // Display type is a large part of each style's character, so presets differ here, not just in shape.
  const serifDisplay = '"Iowan Old Style", "Palatino Linotype", Charter, Georgia, serif';
  const roundedDisplay = 'ui-rounded, "SF Pro Rounded", "Nunito", "Avenir Next", var(--g-font)';
  vars['--g-display-font'] =
    theme.font === 'system' && ['soft', 'editorial', 'paper', 'cream'].includes(theme.preset)
      ? serifDisplay
      : theme.font !== 'mono' && ['joyful', 'clay'].includes(theme.preset)
        ? roundedDisplay
        : 'var(--g-font)';
  vars['--g-art-spread'] = theme.motion === 'reduced' ? '17px' : '23px';
  vars['--g-icon-shift'] = theme.motion === 'reduced' ? '0px' : '2px';
  vars['--g-art-lift'] = theme.motion === 'reduced' ? '10px' : '15px';
  vars['--g-display-weight'] = ['soft', 'editorial', 'paper', 'cream'].includes(theme.preset)
    ? '400'
    : ['outline', 'flat'].includes(theme.preset)
      ? '750'
      : ['joyful', 'clay'].includes(theme.preset)
        ? '650'
        : theme.preset === 'glass'
          ? '480'
          : '550';
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
/**
 * Validates untrusted theme JSON and returns a fresh, normalised version 1 theme.
 *
 * Forward compatibility: a theme saved by a newer build of the same schema version may carry
 * top-level properties or colour roles this build does not know. Those are ignored and dropped
 * from the result instead of rejected, so the theme still loads. Every property this build knows
 * must still be present (accent stays optional) and valid, and every known colour role must be a
 * six-digit hex colour.
 *
 * Unknown values are dropped rather than passed through so the result is exactly `Theme`: nothing
 * unvalidated reaches `themeVariables`, CSS export or `designMarkdown`, and `exportTheme` writes
 * only what this build understands. Re-exporting from an older build therefore loses the newer
 * build's extra settings, which fall back to their defaults when reopened in the newer build.
 * A change that older builds must not silently ignore needs a new `version`, which stays rejected.
 */
export function parseTheme(input: unknown): Theme {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Theme must be a JSON object.');
  const source = input as Record<string, unknown>;
  // The short-lived Mono material is now Paper; preserve saved custom colours.
  const v = source.preset === 'mono' ? { ...source, preset: 'paper' } : source;
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
  if (v.accent !== undefined && !accents.includes(v.accent as Accent))
    throw new Error('Invalid accent.');
  for (const [key, values] of Object.entries(enums))
    if (typeof v[key] !== 'string' || !values.includes(v[key] as string))
      throw new Error(`Invalid ${key}.`);
  if (!v.colors || typeof v.colors !== 'object' || Array.isArray(v.colors))
    throw new Error('Theme colors are required.');
  const colors = v.colors as Record<string, unknown>;
  // Unknown roles (from a newer build) are ignored; every known role is still required.
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
    ...(v.accent === undefined ? {} : { accent: v.accent as Accent }),
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
/** Art direction per preset, written for people and AI tools building with a style. */
export const presetGuides: Record<
  Preset,
  { character: string; useFor: string; rules: readonly string[] }
> = {
  paper: {
    character:
      'Ink on paper: white or warm-white planes, near-black type, a serif display face and square corners. Colour comes from the chosen accent only.',
    useFor:
      'Stationery, editorial products and print-related tools where the content is the colour.',
    rules: [
      'Let whitespace and type size carry hierarchy before reaching for colour.',
      'Secondary actions have a soft fill and no border.',
    ],
  },
  joyful: {
    character:
      'Fresh, bright colour with rounded display type and generous rounded shapes. Friendly without being childish.',
    useFor: 'Consumer apps, greetings, onboarding and anything that should feel welcoming.',
    rules: [
      'Use Badge and VisualChoiceGroup for colour moments rather than tinting whole sections.',
      'Keep long reading text on plain surfaces.',
    ],
  },
  professional: {
    character:
      'A clear working surface: square corners, compact rhythm, quick motion and colourful details on a calm base.',
    useFor: 'Dashboards, admin tools and data-heavy workflows.',
    rules: [
      'Prefer compact density for tables and dense forms.',
      'Reserve the primary colour for the main action and current selection.',
    ],
  },
  clay: {
    character:
      'Puffy, sculpted forms with soft tinted surfaces, rounded display type and gentle depth.',
    useFor: 'Playful consumer products, creative tools and craft or gifting experiences.',
    rules: [
      'Group related content in cards; avoid stacking many raised layers.',
      'Keep text on solid surfaces so contrast stays predictable.',
    ],
  },
  neumorphic: {
    character:
      'Raised surfaces and recessed controls on one tonal plane, separated by light and shadow.',
    useFor: 'Small control panels and settings screens with few elements.',
    rules: [
      'Fields keep visible borders; never rely on shadows alone to show a boundary.',
      'Avoid long lists and dense tables in this style.',
    ],
  },
  flat: {
    character: 'Clean planes, restrained corners, fine borders and minimal elevation.',
    useFor: 'General-purpose products that should feel direct and fast.',
    rules: ['Separate regions with spacing and borders rather than shadows.'],
  },
  glass: {
    character:
      'Layered translucent panels over an atmospheric backdrop, with rim highlights and rounded actions.',
    useFor: 'Media, showcase and immersive experiences.',
    rules: [
      'Keep inputs, overlays and essential text on opaque surfaces.',
      'Check text contrast against the real backdrop before shipping.',
    ],
  },
  soft: {
    character: 'Warm tonal planes, opposing soft shadows, inset fields and a serif display face.',
    useFor: 'Wellness, lifestyle and calm reading experiences.',
    rules: ['Use fewer, larger surfaces; soft depth gets muddy when nested.'],
  },
  elevated: {
    character: 'Floating cards over a quiet background, polished action buttons and clear depth.',
    useFor: 'SaaS products where panels, popovers and dialogs need clear layering.',
    rules: ['Use elevation to show layering (page, card, overlay), not decoration.'],
  },
  outline: {
    character:
      'Graphic structure: hard borders, offset shadows, squared corners and uppercase actions.',
    useFor: 'Bold brands, portfolios and products with a print or poster feel.',
    rules: ['Keep labels short; uppercase actions get hard to read when long.'],
  },
  editorial: {
    character: 'Serif display type, fine rules and a magazine-like reading rhythm.',
    useFor: 'Content-led products, stories, journals and long-form reading.',
    rules: ['Use Heading sizes and rules for hierarchy; keep decoration out of body text.'],
  },
  porcelain: {
    character: 'Polished curves with a satin, softly lit surface.',
    useFor: 'Premium consumer products and beauty or fashion brands.',
    rules: ['Keep layouts sparse so the polished surfaces have room.'],
  },
  aurora: {
    character: 'Luminous edges and flowing colour around calm content areas.',
    useFor: 'Launch pages and showcase moments rather than everyday tools.',
    rules: ['Keep the luminous treatment to framing; content stays on plain surfaces.'],
  },
  studio: {
    character: 'Precise lines, square corners, quick motion and quiet depth.',
    useFor: 'Creative and professional tools where precision matters.',
    rules: ['Align to the spacing scale strictly; this style shows misalignment.'],
  },
  canvas: {
    character: 'Tactile paper surfaces and playful shapes.',
    useFor: 'Education, hobby and craft products.',
    rules: ['Mix shapes sparingly; one playful element per view is enough.'],
  },
  cream: {
    character:
      'Warm cream stock, warm-black ink, a serif display face and one bright vermilion accent. Fine rules and soft corners instead of depth.',
    useFor:
      'Editorial products, stationery and postcard tools, newsletters and story-led marketing pages.',
    rules: [
      'Pair it with the restrained accent so vermilion marks only the main action, links and focus.',
      'Use Stamp and Postmark for one tactile detail per view; keep long text on the plain surface.',
    ],
  },
};
const roleUse: Record<ColorRole, string> = {
  background: 'Page canvas behind everything',
  surface: 'Cards, fields, menus and dialogs',
  text: 'Body text and headings',
  muted: 'Secondary text, hints and captions',
  border: 'Field and control boundaries',
  primary: 'Main action, links and current selection',
  onPrimary: 'Text and icons on primary',
  focus: 'Keyboard focus ring',
  success: 'Positive status text',
  warning: 'Caution status text',
  danger: 'Errors and destructive actions',
};
/**
 * Writes a DESIGN.md for a theme: the guide AI coding tools and people follow to build in this style.
 * Built-in palettes include both modes; custom colours describe the theme's current mode only.
 */
export function designMarkdown(theme: Theme): string {
  const valid = parseTheme(theme);
  const info = presetInfo[valid.preset];
  const guide = presetGuides[valid.preset];
  const palette = getPalette(valid);
  const modes: Mode[] = palette ? ['light', 'dark'] : [valid.mode];
  const themes = modes.map((mode) => (mode === valid.mode ? valid : switchMode(valid, mode)));
  const vars = themeVariables(valid);
  const paletteName = palette ? paletteOptions.find((o) => o.id === palette)!.name : 'Custom';
  const row = (cells: string[]) => `| ${cells.join(' | ')} |`;
  const table = (head: string[], rows: string[][]) =>
    [row(head), row(head.map(() => '---')), ...rows.map(row)].join('\n');
  const capital = (mode: Mode) => mode[0]!.toUpperCase() + mode.slice(1);
  const usesDefaults =
    palette &&
    JSON.stringify({ ...valid, name: '' }) ===
      JSON.stringify({ ...createTheme(valid.preset, valid.mode, palette), name: '' });
  const setup = usesDefaults
    ? `const theme = createTheme('${valid.preset}', '${valid.mode}', '${palette}');`
    : `// Save the theme JSON below as theme.json.\nconst theme = parseTheme(themeJson);`;
  return [
    `# ${info.name} · ${paletteName}`,
    '',
    `> ${info.description}. ${guide.character}`,
    '',
    `**Use it for:** ${guide.useFor}`,
    '',
    'This file describes a gregUI theme for people and AI coding tools. Build screens only from `@gregui/react` components; this style comes from the theme, not from app CSS.',
    '',
    '## Apply it',
    '',
    '```tsx',
    "import '@gregui/react/styles.css';",
    "import { LocaleProvider, ThemeProvider } from '@gregui/react';",
    `import { ${usesDefaults ? 'createTheme' : 'parseTheme'} } from '@gregui/tokens';`,
    '',
    setup,
    '// <LocaleProvider locale="en-GB"><ThemeProvider theme={theme}>…</ThemeProvider></LocaleProvider>',
    '```',
    '',
    '## Colour roles',
    '',
    'Use roles through component props such as `tone` and `variant`. Never hard-code these values in an app.',
    '',
    valid.accent === 'restrained'
      ? '**Accent: restrained.** `primary` appears only on the main action, links and focus. Selected states, progress, badges and decoration use `text` on `surface`.'
      : "**Accent: expressive.** `primary` also marks selected states, progress, badges and decoration. Set `accent: 'restrained'` to keep it to the main action, links and focus.",
    '',
    table(
      ['Role', ...modes.map(capital), 'Use'],
      colorRoles.map((role) => [
        `\`${role}\``,
        ...themes.map((t) => `\`${t.colors[role]}\``),
        roleUse[role],
      ]),
    ),
    '',
    '## Checked contrast',
    '',
    table(
      ['Pair', 'Minimum', ...modes.map(capital)],
      checkContrast(valid).map((check, i) => [
        check.label,
        `${check.minimum}:1`,
        ...themes.map((t) => {
          const c = checkContrast(t)[i]!;
          return `${c.ratio.toFixed(2)}:1${c.pass ? '' : ' (fails)'}`;
        }),
      ]),
    ),
    '',
    '## Shape and density',
    '',
    `- Corners: ${valid.radius} (\`${vars['--g-radius']}\`).`,
    `- Density: ${valid.density}. Controls are \`${vars['--g-control-height']}\` tall; set \`density: 'compact'\` for dense tools.`,
    '',
    '## Typography',
    '',
    `- Body font: \`${vars['--g-font']}\`.`,
    `- Display font: \`${vars['--g-display-font']}\`, weight ${vars['--g-display-weight']}.`,
    '- Use `Heading` sizes and `Text` sizes rather than custom font settings.',
    '',
    table(
      ['Role', 'Size', 'Line height', 'Tracking'],
      Object.entries(typography).map(([role, spec]) => [
        `\`${role}\``,
        `\`${spec.fontSize}\``,
        spec.lineHeight,
        spec.letterSpacing,
      ]),
    ),
    '',
    '## Spacing',
    '',
    'Layout components (`Stack`, `Inline`, `Grid`) take a `gap` step from this scale.',
    '',
    table(
      ['Step', 'Value'],
      Object.entries(spacing).map(([step, value]) => [step, `\`${value}\``]),
    ),
    '',
    '## Motion',
    '',
    valid.motion === 'reduced'
      ? '- Motion is reduced: transitions are off.'
      : `- Controls ${vars['--g-duration']}, entrances ${vars['--g-duration-enter']}, press feedback ${vars['--g-duration-fast']}. The system reduced-motion setting turns them off.`,
    '',
    '## Rules',
    '',
    ...guide.rules.map((rule) => `- ${rule}`),
    '- One primary button per view; other actions use `secondary` or `ghost`.',
    '- Show status with `Alert`, `Badge` and `tone`, never colour alone.',
    '- No `className`, `style` or app CSS. If a variant is missing, extend gregUI instead.',
    '- Check light and dark mode, keyboard focus and right-to-left layout for new screens.',
    ...(usesDefaults
      ? []
      : ['', '## Theme JSON', '', '```json', JSON.stringify(valid, null, 2), '```']),
    '',
  ].join('\n');
}
