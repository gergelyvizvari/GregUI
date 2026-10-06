# gregUI

A reusable React UI foundation with six featured visual directions and backwards-compatible legacy presets, typed design tokens, localization, accessible interaction primitives and a theme workbench. Built for the owner's future applications.

## Run locally

Requires Node.js 22.12+ (verified on 22.20) and npm.

```sh
npm ci
npm run build
npm run dev
```

Open the URL printed by Vite. The workbench includes a component catalog, theme editor, foundations, example patterns and an accessibility/support page. It has no backend, analytics or external fonts. Save draft explicitly stores a theme in this browser; Delete saved draft removes it.

```sh
npm run check           # types, consumer style boundary, unit/interaction tests, builds
npm run test:e2e        # Chromium, Firefox, WebKit, mobile Chromium emulation
npm run format:check
npm run test:package    # isolated tarball installation; needs registry/cache access
```

The browser command builds the packages/apps and serves a fresh production bundle on port 4174, independently of the development server.

If Playwright browsers are missing, run `npx playwright install chromium firefox webkit`. Mobile emulation is not a real-device test.

## Repository

| Location                    | Purpose                                                                           |
| --------------------------- | --------------------------------------------------------------------------------- |
| `packages/tokens`           | Versioned theme schema, presets, semantic roles, contrast checks, JSON/CSS export |
| `packages/react`            | Components, layout/pattern primitives, shared stylesheet, themed portals          |
| `packages/localization`     | Locale/direction/messages provider and number/date/plural formatters              |
| `apps/playground`           | Workbench using the same public packages as consuming apps                        |
| `examples/consumer`         | Separate application importing built package exports without local styles         |
| `tests`                     | Theme, interaction, SSR/hydration and browser checks                              |
| `skills/gregui-development` | Portable source for the reusable development skill                                |

The application bundlers resolve built package exports, not source aliases. After changing a library package, run `npm run build:packages` and reload the workbench. Unit tests resolve source directly.

## Application kit

The searchable Components catalog now includes Tree View, Timeline, sortable Data Table, advanced inputs and ready-made profile, security, team, notification, privacy, pricing, discussion and approval panels. See [expanded component contracts](docs/EXPANDED-COMPONENTS.md) for APIs and supported scope. Every example is local and uses the public package.

## Use the library

Build the packages and install their tarballs in another project, or publish them to your chosen private registry. Nothing has been published by this project setup. Install React and React DOM 19 in the consuming app.

```tsx
import { ThemeProvider, LocaleProvider, Stack, Button } from '@gregui/react';
import { createTheme } from '@gregui/tokens';
import '@gregui/react/styles.css';

export function App() {
  return (
    <LocaleProvider locale="en-GB" timeZone="Europe/London">
      <ThemeProvider theme={createTheme('flat', 'light')}>
        <Stack gap={4}>
          <Button
            onClick={() => {
              /* application behavior */
            }}
          >
            Continue
          </Button>
        </Stack>
      </ThemeProvider>
    </LocaleProvider>
  );
}
```

Import the stylesheet once, at the application root. Packages ship ESM and TypeScript declarations; React providers/components carry a `use client` directive for frameworks with server components. The package itself does not depend on Next.js. Locale/time-zone inputs must be consistent on server and client.

Use `parseTheme(JSON.parse(input))` before applying externally supplied theme JSON. `exportTheme` rejects schemas or checked color pairs that fail validation; export is not accessibility certification. Changing light/dark mode with `switchMode` uses the matching palette's light/dark colours. Custom colours fall back to the preset's defaults; other theme properties are preserved.

Each preset has its own default palette and component treatment: forest Flat, plum Glass, clay Soft, blue Elevated and ink/cream Outline. See the [visual direction](docs/DESIGN.md). The workbench loads the complete preset when selected; Undo restores your previous custom draft.

Apps own domain content, state, routing, validation rules and data processing. gregUI owns styling and shared interaction behavior. Compose Stack, Inline, Grid, Split, Container, Card and page/overlay primitives; extend the package for missing variants. No application CSS, arbitrary style props or class overrides. `npm run check:styles` enforces common violations in this workspace; replicate the policy in each consuming repository.

## Current scope and limits

This is the first working foundation, not a production certification. The initial catalog includes buttons/links, labeled fields, select/textarea, checkbox/radio/switch, layouts, dialogs/drawers/full-screen flows, confirmation, tooltip/popover, tabs/navigation, alerts/status/progress/skeletons, tables and empty states. Fourteen presets work in light/dark modes. Glass uses decorative effects with opaque content surfaces so readability does not depend on an unknown backdrop.

Date pickers, comboboxes, advanced tables, charts, upload orchestration, consent integrations and native mobile components remain future additions. Apps must complete their own accessibility, privacy and sector-specific checks. The 24-month browser policy is documented; historical devices and manual assistive-technology testing remain unverified.

See [component contracts](docs/COMPONENTS.md), [compatibility and verification](docs/COMPATIBILITY.md), [contributing](docs/CONTRIBUTING.md), and the original [product brief](UI-SYSTEM-BRIEF.md).

### Palette choices

Every style supports Forest, Plum, Clay, Cobalt, Ink & cream, Ocean, Rose and Amber: 112 combinations with light/dark counterparts. Use the workbench's Palette selector, or `createTheme('soft', 'light', 'cobalt')`. `applyPalette(theme, 'forest')` replaces only colours; `getPalette(theme)` identifies a matching built-in palette or returns undefined for custom colours. `paletteOptions` provides IDs and display names for consumers. Stored theme JSON remains version 1, and palette recognition survives import, save/restore and Undo.

### Ready-made authentication

Open **Authentication** in the workbench to try sign-in, registration, recovery, password reset, email verification and two-step verification. Shared forms include password visibility, remember preference, pending/error/success states and translation hooks. See [integration examples](docs/AUTHENTICATION.md). The demo performs no network authentication or credential storage.

Featured choices are Workspace, Bloom, Clay, Neumorphic and Glass. `featuredPresets` drives new theme pickers; `presets` retains all saved-theme IDs for compatibility. Selecting a complete direction can load `recommendedPalettes[preset]`; users may then customize colours independently.
