# Clay · Rose

> Puffy forms, sculpted edges. Puffy, sculpted forms with soft tinted surfaces, rounded display type and gentle depth.

**Use it for:** Playful consumer products, creative tools and craft or gifting experiences.

This file describes a gregUI theme for people and AI coding tools. Build screens only from `@gregui/react` components; this style comes from the theme, not from app CSS.

## Apply it

```tsx
import '@gregui/react/styles.css';
import { LocaleProvider, ThemeProvider } from '@gregui/react';
import { createTheme } from '@gregui/tokens';

const theme = createTheme('clay', 'light', 'rose');
// <LocaleProvider locale="en-GB"><ThemeProvider theme={theme}>…</ThemeProvider></LocaleProvider>
```

## Colour roles

Use roles through component props such as `tone` and `variant`. Never hard-code these values in an app.

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| `background` | `#fff2f7` | `#261820` | Page canvas behind everything |
| `surface` | `#ffffff` | `#38232e` | Cards, fields, menus and dialogs |
| `text` | `#422633` | `#fceff5` | Body text and headings |
| `muted` | `#745763` | `#d8b9c8` | Secondary text, hints and captions |
| `border` | `#a07e8c` | `#ae8398` | Field and control boundaries |
| `primary` | `#bf2864` | `#f2a8c9` | Main action, links and current selection |
| `onPrimary` | `#ffffff` | `#471b31` | Text and icons on primary |
| `focus` | `#85204e` | `#ffc1dd` | Keyboard focus ring |
| `success` | `#25623d` | `#9bd6ac` | Positive status text |
| `warning` | `#7a510c` | `#edcb8d` | Caution status text |
| `danger` | `#ae2b37` | `#ffabb1` | Errors and destructive actions |

## Checked contrast

| Pair | Minimum | Light | Dark |
| --- | --- | --- | --- |
| text / surface | 4.5:1 | 13.49:1 | 12.99:1 |
| text / background | 4.5:1 | 12.40:1 | 15.24:1 |
| muted / surface | 4.5:1 | 6.39:1 | 8.08:1 |
| muted / background | 4.5:1 | 5.87:1 | 9.48:1 |
| onPrimary / primary | 4.5:1 | 5.67:1 | 7.64:1 |
| primary / surface | 4.5:1 | 5.67:1 | 7.75:1 |
| primary / background | 4.5:1 | 5.21:1 | 9.09:1 |
| border / surface | 3:1 | 3.58:1 | 4.49:1 |
| border / background | 3:1 | 3.29:1 | 5.27:1 |
| focus / surface | 3:1 | 9.08:1 | 9.62:1 |
| focus / background | 3:1 | 8.34:1 | 11.28:1 |
| success / surface | 4.5:1 | 7.26:1 | 8.71:1 |
| warning / surface | 4.5:1 | 6.98:1 | 9.34:1 |
| danger / surface | 4.5:1 | 6.56:1 | 8.09:1 |
| danger / background | 4.5:1 | 6.03:1 | 9.49:1 |

## Shape and density

- Corners: rounded (`12px`).
- Density: comfortable. Controls are `3.25rem` tall; set `density: 'compact'` for dense tools.

## Typography

- Body font: `ui-rounded, "SF Pro Rounded", "Avenir Next", system-ui, sans-serif`.
- Display font: `ui-rounded, "SF Pro Rounded", "Nunito", "Avenir Next", var(--g-font)`, weight 650.
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

- Controls 240ms, entrances 340ms, press feedback 120ms. The system reduced-motion setting turns them off.

## Rules

- Group related content in cards; avoid stacking many raised layers.
- Keep text on solid surfaces so contrast stays predictable.
- One primary button per view; other actions use `secondary` or `ghost`.
- Show status with `Alert`, `Badge` and `tone`, never colour alone.
- No `className`, `style` or app CSS. If a variant is missing, extend gregUI instead.
- Check light and dark mode, keyboard focus and right-to-left layout for new screens.
