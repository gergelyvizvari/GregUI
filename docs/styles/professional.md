# Workspace · Iris

> Clear thinking, colourful details. A clear working surface: square corners, compact rhythm, quick motion and colourful details on a calm base.

**Use it for:** Dashboards, admin tools and data-heavy workflows.

This file describes a gregUI theme for people and AI coding tools. Build screens only from `@gregui/react` components; this style comes from the theme, not from app CSS.

## Apply it

```tsx
import '@gregui/react/styles.css';
import { LocaleProvider, ThemeProvider } from '@gregui/react';
import { createTheme } from '@gregui/tokens';

const theme = createTheme('professional', 'light', 'iris');
// <LocaleProvider locale="en-GB"><ThemeProvider theme={theme}>…</ThemeProvider></LocaleProvider>
```

## Colour roles

Use roles through component props such as `tone` and `variant`. Never hard-code these values in an app.

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| `background` | `#f5f6fb` | `#181b2b` | Page canvas behind everything |
| `surface` | `#ffffff` | `#24283c` | Cards, fields, menus and dialogs |
| `text` | `#25283d` | `#f3f4fc` | Body text and headings |
| `muted` | `#62667e` | `#bec3dc` | Secondary text, hints and captions |
| `border` | `#878ca6` | `#8a92b4` | Field and control boundaries |
| `primary` | `#5353d5` | `#b8b8ff` | Main action, links and current selection |
| `onPrimary` | `#ffffff` | `#222252` | Text and icons on primary |
| `focus` | `#4645bf` | `#ceccff` | Keyboard focus ring |
| `success` | `#21734e` | `#8ee0b4` | Positive status text |
| `warning` | `#865700` | `#f5ce80` | Caution status text |
| `danger` | `#bf3356` | `#ffa5be` | Errors and destructive actions |

## Checked contrast

| Pair | Minimum | Light | Dark |
| --- | --- | --- | --- |
| text / surface | 4.5:1 | 14.49:1 | 13.27:1 |
| text / background | 4.5:1 | 13.42:1 | 15.57:1 |
| muted / surface | 4.5:1 | 5.64:1 | 8.33:1 |
| muted / background | 4.5:1 | 5.23:1 | 9.78:1 |
| onPrimary / primary | 4.5:1 | 5.89:1 | 7.99:1 |
| primary / surface | 4.5:1 | 5.89:1 | 7.85:1 |
| primary / background | 4.5:1 | 5.46:1 | 9.21:1 |
| border / surface | 3:1 | 3.32:1 | 4.75:1 |
| border / background | 3:1 | 3.07:1 | 5.57:1 |
| focus / surface | 3:1 | 7.33:1 | 9.49:1 |
| focus / background | 3:1 | 6.79:1 | 11.14:1 |
| success / surface | 4.5:1 | 5.79:1 | 9.33:1 |
| warning / surface | 4.5:1 | 6.22:1 | 9.71:1 |
| danger / surface | 4.5:1 | 5.49:1 | 7.88:1 |
| danger / background | 4.5:1 | 5.09:1 | 9.25:1 |

## Shape and density

- Corners: square (`2px`).
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

- Controls 120ms, entrances 200ms, press feedback 120ms. The system reduced-motion setting turns them off.

## Rules

- Prefer compact density for tables and dense forms.
- Reserve the primary colour for the main action and current selection.
- One primary button per view; other actions use `secondary` or `ghost`.
- Show status with `Alert`, `Badge` and `tone`, never colour alone.
- No `className`, `style` or app CSS. If a variant is missing, extend gregUI instead.
- Check light and dark mode, keyboard focus and right-to-left layout for new screens.
