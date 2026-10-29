# Bloom · Lagoon

> Fresh colour, a little sunshine. Fresh, bright colour with rounded display type and generous rounded shapes. Friendly without being childish.

**Use it for:** Consumer apps, greetings, onboarding and anything that should feel welcoming.

This file describes a gregUI theme for people and AI coding tools. Build screens only from `@gregui/react` components; this style comes from the theme, not from app CSS.

## Apply it

```tsx
import '@gregui/react/styles.css';
import { LocaleProvider, ThemeProvider } from '@gregui/react';
import { createTheme } from '@gregui/tokens';

const theme = createTheme('joyful', 'light', 'lagoon');
// <LocaleProvider locale="en-GB"><ThemeProvider theme={theme}>…</ThemeProvider></LocaleProvider>
```

## Colour roles

Use roles through component props such as `tone` and `variant`. Never hard-code these values in an app.

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| `background` | `#eaf8f6` | `#102c31` | Page canvas behind everything |
| `surface` | `#ffffff` | `#1b3c42` | Cards, fields, menus and dialogs |
| `text` | `#153d43` | `#edfcf9` | Body text and headings |
| `muted` | `#496b70` | `#b0d3d4` | Secondary text, hints and captions |
| `border` | `#759296` | `#81a6ac` | Field and control boundaries |
| `primary` | `#007c80` | `#7be2d4` | Main action, links and current selection |
| `onPrimary` | `#ffffff` | `#123e3e` | Text and icons on primary |
| `focus` | `#006469` | `#a4f4e6` | Keyboard focus ring |
| `success` | `#257345` | `#91dfaf` | Positive status text |
| `warning` | `#805800` | `#ffdb87` | Caution status text |
| `danger` | `#b73955` | `#ffafc2` | Errors and destructive actions |

## Checked contrast

| Pair | Minimum | Light | Dark |
| --- | --- | --- | --- |
| text / surface | 4.5:1 | 11.79:1 | 11.23:1 |
| text / background | 4.5:1 | 10.82:1 | 13.94:1 |
| muted / surface | 4.5:1 | 5.80:1 | 7.40:1 |
| muted / background | 4.5:1 | 5.32:1 | 9.19:1 |
| onPrimary / primary | 4.5:1 | 5.01:1 | 7.66:1 |
| primary / surface | 4.5:1 | 5.01:1 | 7.72:1 |
| primary / background | 4.5:1 | 4.59:1 | 9.58:1 |
| border / surface | 3:1 | 3.33:1 | 4.51:1 |
| border / background | 3:1 | 3.05:1 | 5.60:1 |
| focus / surface | 3:1 | 6.94:1 | 9.40:1 |
| focus / background | 3:1 | 6.36:1 | 11.68:1 |
| success / surface | 4.5:1 | 5.81:1 | 7.55:1 |
| warning / surface | 4.5:1 | 6.34:1 | 8.88:1 |
| danger / surface | 4.5:1 | 5.63:1 | 6.87:1 |
| danger / background | 4.5:1 | 5.16:1 | 8.53:1 |

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

- Controls 180ms, entrances 300ms, press feedback 120ms. The system reduced-motion setting turns them off.

## Rules

- Use Badge and VisualChoiceGroup for colour moments rather than tinting whole sections.
- Keep long reading text on plain surfaces.
- One primary button per view; other actions use `secondary` or `ghost`.
- Show status with `Alert`, `Badge` and `tone`, never colour alone.
- No `className`, `style` or app CSS. If a variant is missing, extend gregUI instead.
- Check light and dark mode, keyboard focus and right-to-left layout for new screens.
