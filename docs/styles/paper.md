# Paper · Pure white

> Quiet ink, colour on paper. Ink on paper: white or warm-white planes, near-black type, a serif display face and square corners. Colour comes from the chosen accent only.

**Use it for:** Stationery, editorial products and print-related tools where the content is the colour.

This file describes a gregUI theme for people and AI coding tools. Build screens only from `@gregui/react` components; this style comes from the theme, not from app CSS.

## Apply it

```tsx
import '@gregui/react/styles.css';
import { LocaleProvider, ThemeProvider } from '@gregui/react';
import { createTheme } from '@gregui/tokens';

const theme = createTheme('paper', 'light', 'paper');
// <LocaleProvider locale="en-GB"><ThemeProvider theme={theme}>…</ThemeProvider></LocaleProvider>
```

## Colour roles

Use roles through component props such as `tone` and `variant`. Never hard-code these values in an app.

**Accent: expressive.** `primary` also marks selected states, progress, badges and decoration. Set `accent: 'restrained'` to keep it to the main action, links and focus.

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| `background` | `#ffffff` | `#242424` | Page canvas behind everything |
| `surface` | `#ffffff` | `#242424` | Cards, fields, menus and dialogs |
| `text` | `#292929` | `#eeeeee` | Body text and headings |
| `muted` | `#646464` | `#bdbdbd` | Secondary text, hints and captions |
| `border` | `#858585` | `#909090` | Field and control boundaries |
| `primary` | `#303030` | `#e0e0e0` | Main action, links and current selection |
| `onPrimary` | `#ffffff` | `#242424` | Text and icons on primary |
| `focus` | `#303030` | `#eeeeee` | Keyboard focus ring |
| `success` | `#426348` | `#adcfac` | Positive status text |
| `warning` | `#7c590f` | `#e3c383` | Caution status text |
| `danger` | `#a13f3f` | `#edaaaa` | Errors and destructive actions |

## Checked contrast

| Pair | Minimum | Light | Dark |
| --- | --- | --- | --- |
| text / surface | 4.5:1 | 14.55:1 | 13.38:1 |
| text / background | 4.5:1 | 14.55:1 | 13.38:1 |
| muted / surface | 4.5:1 | 5.92:1 | 8.26:1 |
| muted / background | 4.5:1 | 5.92:1 | 8.26:1 |
| onPrimary / primary | 4.5:1 | 13.20:1 | 11.76:1 |
| primary / surface | 4.5:1 | 13.20:1 | 11.76:1 |
| primary / background | 4.5:1 | 13.20:1 | 11.76:1 |
| border / surface | 3:1 | 3.69:1 | 4.86:1 |
| border / background | 3:1 | 3.69:1 | 4.86:1 |
| focus / surface | 3:1 | 13.20:1 | 13.38:1 |
| focus / background | 3:1 | 13.20:1 | 13.38:1 |
| success / surface | 4.5:1 | 6.75:1 | 9.09:1 |
| warning / surface | 4.5:1 | 6.38:1 | 9.17:1 |
| danger / surface | 4.5:1 | 6.37:1 | 8.08:1 |
| danger / background | 4.5:1 | 6.37:1 | 8.08:1 |

## Shape and density

- Corners: square (`2px`).
- Density: comfortable. Controls are `3.25rem` tall; set `density: 'compact'` for dense tools.

## Typography

- Body font: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Display font: `"Iowan Old Style", "Palatino Linotype", Charter, Georgia, serif`, weight 400.
- Use `Heading` sizes and `Text` sizes rather than custom font settings.

| Role | Size | Line height | Tracking |
| --- | --- | --- | --- |
| `body` | `1rem` | 1.5 | normal |
| `small` | `0.8125rem` | 1.55 | normal |
| `caption` | `0.75rem` | 1.5 | normal |
| `large` | `1.05rem` | 1.65 | normal |
| `lead` | `clamp(1.125rem, 1.5vw, 1.375rem)` | 1.6 | -0.01em |
| `eyebrow` | `0.6875rem` | 1.5 | 0.13em |
| `hero` | `clamp(2.4rem, 4.4vw, 4.5rem)` | 1.15 | -0.055em |
| `page` | `clamp(2rem, 3.4vw, 3.25rem)` | 1.15 | -0.035em |
| `section` | `1.125rem` | 1.15 | -0.02em |
| `card` | `1rem` | 1.15 | -0.01em |

## Spacing

Layout components (`Stack`, `Inline`, `Grid`) take a `gap` step from this scale.

| Step | Value |
| --- | --- |
| 0 | `0` |
| 1 | `0.25rem` |
| 2 | `0.5rem` |
| 3 | `0.75rem` |
| 4 | `1rem` |
| 5 | `1.5rem` |
| 6 | `2rem` |
| 7 | `3rem` |
| 8 | `4rem` |

## Motion

- Controls 120ms, entrances 180ms, press feedback 120ms. The system reduced-motion setting turns them off.

## Rules

- Let whitespace and type size carry hierarchy before reaching for colour.
- Secondary actions have a soft fill and no border.
- One primary button per view; other actions use `secondary` or `ghost`.
- Show status with `Alert`, `Badge` and `tone`, never colour alone.
- No `className`, `style` or app CSS. If a variant is missing, extend gregUI instead.
- Check light and dark mode, keyboard focus and right-to-left layout for new screens.
