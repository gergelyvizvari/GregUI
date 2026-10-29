# Cream · Cream & vermilion

> Warm stock, editorial ink. Warm cream stock, warm-black ink, a serif display face and one bright vermilion accent. Fine rules and soft corners instead of depth.

**Use it for:** Editorial products, stationery and postcard tools, newsletters and story-led marketing pages.

This file describes a gregUI theme for people and AI coding tools. Build screens only from `@gregui/react` components; this style comes from the theme, not from app CSS.

## Apply it

```tsx
import '@gregui/react/styles.css';
import { LocaleProvider, ThemeProvider } from '@gregui/react';
import { createTheme } from '@gregui/tokens';

const theme = createTheme('cream', 'light', 'cream');
// <LocaleProvider locale="en-GB"><ThemeProvider theme={theme}>…</ThemeProvider></LocaleProvider>
```

## Colour roles

Use roles through component props such as `tone` and `variant`. Never hard-code these values in an app.

**Accent: restrained.** `primary` appears only on the main action, links and focus. Selected states, progress, badges and decoration use `text` on `surface`.

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| `background` | `#fcf6ea` | `#211c16` | Page canvas behind everything |
| `surface` | `#fffcf5` | `#2b251e` | Cards, fields, menus and dialogs |
| `text` | `#2b241e` | `#f8efe1` | Body text and headings |
| `muted` | `#68594c` | `#cfc0ad` | Secondary text, hints and captions |
| `border` | `#8e7d6c` | `#a2907b` | Field and control boundaries |
| `primary` | `#c03d12` | `#ffb08a` | Main action, links and current selection |
| `onPrimary` | `#ffffff` | `#3b1a0a` | Text and icons on primary |
| `focus` | `#962f0d` | `#ffcaa8` | Keyboard focus ring |
| `success` | `#3d6a3a` | `#b2d6a4` | Positive status text |
| `warning` | `#7a560a` | `#edcb86` | Caution status text |
| `danger` | `#a52d2d` | `#ffaca6` | Errors and destructive actions |

## Checked contrast

| Pair | Minimum | Light | Dark |
| --- | --- | --- | --- |
| text / surface | 4.5:1 | 14.92:1 | 13.29:1 |
| text / background | 4.5:1 | 14.20:1 | 14.83:1 |
| muted / surface | 4.5:1 | 6.56:1 | 8.51:1 |
| muted / background | 4.5:1 | 6.25:1 | 9.50:1 |
| onPrimary / primary | 4.5:1 | 5.36:1 | 8.84:1 |
| primary / surface | 4.5:1 | 5.23:1 | 8.53:1 |
| primary / background | 4.5:1 | 4.98:1 | 9.52:1 |
| border / surface | 3:1 | 3.87:1 | 4.91:1 |
| border / background | 3:1 | 3.68:1 | 5.48:1 |
| focus / surface | 3:1 | 7.56:1 | 10.29:1 |
| focus / background | 3:1 | 7.20:1 | 11.48:1 |
| success / surface | 4.5:1 | 6.17:1 | 9.41:1 |
| warning / surface | 4.5:1 | 6.48:1 | 9.73:1 |
| danger / surface | 4.5:1 | 6.80:1 | 8.44:1 |
| danger / background | 4.5:1 | 6.47:1 | 9.42:1 |

## Shape and density

- Corners: rounded (`12px`).
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

- Controls 160ms, entrances 260ms, press feedback 120ms. The system reduced-motion setting turns them off.

## Rules

- Pair it with the restrained accent so vermilion marks only the main action, links and focus.
- Use Stamp and Postmark for one tactile detail per view; keep long text on the plain surface.
- One primary button per view; other actions use `secondary` or `ghost`.
- Show status with `Alert`, `Badge` and `tone`, never colour alone.
- No `className`, `style` or app CSS. If a variant is missing, extend gregUI instead.
- Check light and dark mode, keyboard focus and right-to-left layout for new screens.
