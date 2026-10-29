# Neumorphic · Clay

> Raised surfaces, recessed controls. Raised surfaces and recessed controls on one tonal plane, separated by light and shadow.

**Use it for:** Small control panels and settings screens with few elements.

This file describes a gregUI theme for people and AI coding tools. Build screens only from `@gregui/react` components; this style comes from the theme, not from app CSS.

## Apply it

```tsx
import '@gregui/react/styles.css';
import { LocaleProvider, ThemeProvider } from '@gregui/react';
import { createTheme } from '@gregui/tokens';

const theme = createTheme('neumorphic', 'light', 'clay');
// <LocaleProvider locale="en-GB"><ThemeProvider theme={theme}>…</ThemeProvider></LocaleProvider>
```

## Colour roles

Use roles through component props such as `tone` and `variant`. Never hard-code these values in an app.

**Accent: expressive.** `primary` also marks selected states, progress, badges and decoration. Set `accent: 'restrained'` to keep it to the main action, links and focus.

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| `background` | `#faf2ee` | `#211e1a` | Page canvas behind everything |
| `surface` | `#faf2ee` | `#211e1a` | Cards, fields, menus and dialogs |
| `text` | `#3d342b` | `#f4ebe0` | Body text and headings |
| `muted` | `#695c50` | `#c9bdae` | Secondary text, hints and captions |
| `border` | `#88796a` | `#a49785` | Field and control boundaries |
| `primary` | `#a3482b` | `#e9ba93` | Main action, links and current selection |
| `onPrimary` | `#ffffff` | `#382416` | Text and icons on primary |
| `focus` | `#784626` | `#f6cba6` | Keyboard focus ring |
| `success` | `#376340` | `#b1d3a7` | Positive status text |
| `warning` | `#73510a` | `#edce8a` | Caution status text |
| `danger` | `#a12c3c` | `#f7b1ac` | Errors and destructive actions |

## Checked contrast

| Pair | Minimum | Light | Dark |
| --- | --- | --- | --- |
| text / surface | 4.5:1 | 11.02:1 | 14.07:1 |
| text / background | 4.5:1 | 11.02:1 | 14.07:1 |
| muted / surface | 4.5:1 | 5.85:1 | 8.99:1 |
| muted / background | 4.5:1 | 5.85:1 | 8.99:1 |
| onPrimary / primary | 4.5:1 | 5.97:1 | 8.32:1 |
| primary / surface | 4.5:1 | 5.40:1 | 9.41:1 |
| primary / background | 4.5:1 | 5.40:1 | 9.41:1 |
| border / surface | 3:1 | 3.81:1 | 5.80:1 |
| border / background | 3:1 | 3.81:1 | 5.80:1 |
| focus / surface | 3:1 | 7.03:1 | 11.07:1 |
| focus / background | 3:1 | 7.03:1 | 11.07:1 |
| success / surface | 4.5:1 | 6.29:1 | 10.07:1 |
| warning / surface | 4.5:1 | 6.53:1 | 10.90:1 |
| danger / surface | 4.5:1 | 6.46:1 | 9.36:1 |
| danger / background | 4.5:1 | 6.46:1 | 9.36:1 |

## Shape and density

- Corners: rounded (`12px`).
- Density: comfortable. Controls are `3.25rem` tall; set `density: 'compact'` for dense tools.

## Typography

- Body font: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Display font: `var(--g-font)`, weight 550.
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

- Controls 200ms, entrances 280ms, press feedback 120ms. The system reduced-motion setting turns them off.

## Rules

- Fields keep visible borders; never rely on shadows alone to show a boundary.
- Avoid long lists and dense tables in this style.
- One primary button per view; other actions use `secondary` or `ghost`.
- Show status with `Alert`, `Badge` and `tone`, never colour alone.
- No `className`, `style` or app CSS. If a variant is missing, extend gregUI instead.
- Check light and dark mode, keyboard focus and right-to-left layout for new screens.
