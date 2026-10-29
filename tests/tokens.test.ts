import { describe, it, expect } from 'vitest';
import {
  presets,
  createTheme,
  checkContrast,
  contrast,
  parseTheme,
  exportTheme,
  switchMode,
  paletteOptions,
  applyPalette,
  getPalette,
  designMarkdown,
  presetGuides,
} from '@gregui/tokens';
describe('theme contract', () => {
  it('matches reference black/white contrast', () =>
    expect(contrast('#000000', '#ffffff')).toBe(21));
  for (const preset of presets)
    for (const mode of ['light', 'dark'] as const)
      it(`${preset} ${mode} meets every declared default contrast pair`, () =>
        expect(checkContrast(createTheme(preset, mode)).filter((c) => !c.pass)).toEqual([]));
  it('round trips every public theme property without sharing mutable colors', () => {
    const original = createTheme('glass', 'dark');
    const copy = parseTheme(JSON.parse(exportTheme(original)));
    expect(copy).toEqual(original);
    copy.colors.primary = '#000000';
    expect(original.colors.primary).not.toBe(copy.colors.primary);
  });
  it('rejects CSS injection, missing roles, unknown fields and future schemas', () => {
    const theme = createTheme();
    expect(() =>
      parseTheme({ ...theme, colors: { ...theme.colors, primary: 'red; position:fixed' } }),
    ).toThrow();
    expect(() => parseTheme({ ...theme, colors: {} })).toThrow();
    expect(() => parseTheme({ ...theme, extra: true })).toThrow();
    expect(() => parseTheme({ ...theme, version: 2 })).toThrow();
  });
  it('allows invalid-contrast drafts but blocks their export', () => {
    const theme = createTheme();
    theme.colors.onPrimary = theme.colors.primary;
    expect(parseTheme(theme)).toEqual(theme);
    expect(() => exportTheme(theme)).toThrow(/contrast/);
  });
  it('resets color roles on mode changes while keeping identity and shape', () => {
    const theme = { ...createTheme('soft'), name: 'Brand', radius: 'square' as const };
    expect(switchMode(theme, 'dark')).toEqual({
      ...theme,
      mode: 'dark',
      colors: createTheme('soft', 'dark').colors,
    });
  });
});

describe('palette families', () => {
  for (const preset of presets)
    for (const palette of paletteOptions) {
      it(`${preset} / ${palette.name} preserves shape, round trips and switches modes`, () => {
        const original = createTheme(preset);
        const theme = applyPalette(original, palette.id);
        expect({ ...theme, colors: original.colors }).toEqual(original);
        for (const mode of ['light', 'dark'] as const) {
          const result = switchMode(theme, mode);
          expect(checkContrast(result).filter((check) => !check.pass)).toEqual([]);
          expect(getPalette(parseTheme(JSON.parse(exportTheme(result))))).toBe(palette.id);
          expect(result.colors).toEqual(createTheme(preset, mode, palette.id).colors);
        }
      });
    }
  it('recognizes manual changes as custom without mutating the palette', () => {
    const theme = applyPalette(createTheme(), 'plum');
    theme.colors.primary = '#123456';
    expect(getPalette(theme)).toBeUndefined();
    expect(getPalette(createTheme('flat', 'light', 'plum'))).toBe('plum');
  });
});

it('migrates stored Mono material to Paper without recolouring saved data', () => {
  const saved = { ...createTheme('paper', 'dark', 'mono'), preset: 'mono' };
  expect(parseTheme(saved)).toEqual({ ...saved, preset: 'paper' });
  expect(presets).not.toContain('mono');
});
it('keeps Pure white neutral and newly added accent palettes distinct', () => {
  const white = createTheme('paper');
  expect(white.colors.background).toBe('#ffffff');
  expect(white.colors.surface).toBe('#ffffff');
  expect(white.colors.primary).toBe('#303030');
  const accents = ['coral', 'citrus', 'mint', 'violet'] as const;
  expect(new Set(accents.map((id) => applyPalette(white, id).colors.primary)).size).toBe(4);
});

describe('designMarkdown', () => {
  it('describes a built-in palette in both modes with its setup call and checked contrast', () => {
    const md = designMarkdown(createTheme('paper', 'light', 'coral'));
    expect(md).toContain('# Paper · Coral');
    expect(md).toContain("createTheme('paper', 'light', 'coral')");
    const light = createTheme('paper', 'light', 'coral').colors.primary;
    const dark = createTheme('paper', 'dark', 'coral').colors.primary;
    expect(md).toContain(`| \`primary\` | \`${light}\` | \`${dark}\` |`);
    expect(md).toContain('| onPrimary / primary | 4.5:1 |');
    expect(md).not.toContain('(fails)');
    expect(md).not.toContain('## Theme JSON');
  });
  it('embeds custom themes as JSON and flags failing pairs instead of throwing', () => {
    const theme = createTheme('flat');
    theme.colors.muted = '#bbbbbb';
    const md = designMarkdown(theme);
    expect(md).toContain('# Flat · Custom');
    expect(md).toContain('parseTheme(themeJson)');
    expect(md).toContain('(fails)');
    expect(md).toContain('"muted": "#bbbbbb"');
    expect(md).not.toContain('| Dark |');
  });
  it('has a guide for every preset', () => {
    for (const preset of presets) expect(presetGuides[preset].rules.length).toBeGreaterThan(0);
  });
});
