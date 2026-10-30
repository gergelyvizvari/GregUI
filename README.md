# gregUI

A reusable React UI foundation with eight featured visual directions and backwards-compatible legacy presets, typed design tokens, localization, accessible interaction primitives and a theme workbench. Built for the owner's future applications.

## AI development guide

Start with [the AI guide](docs/AI-GUIDE.md) for source locations, implemented capabilities, integration boundaries and verification commands. [Component development candidates](docs/COMPONENT-ROADMAP.md) records proposed next steps separately from shipped APIs.

## Run locally

Requires Node.js 22.12+ (verified on 22.20) and npm.

```sh
npm ci
npm run build
npm run dev
```

Open the URL printed by Vite. The workbench imports the built packages, like a real app would, so `npm run dev` rebuilds them first. After changing package source while the server runs, run `npm run build:packages` again. The workbench includes a component catalog, theme editor, foundations, example patterns and an accessibility/support page. Use the floating **Edit theme** button on Components, Typography & pages, Patterns, Authentication or Foundations to adjust previews live; it opens a non-modal desktop inspector or a modal mobile drawer with the same theme/history as Theme studio. It has no backend, analytics or external fonts. Save draft explicitly stores a theme in this browser; Delete saved draft removes it.

```sh
npm run check           # types, consumer style boundary, unit/interaction tests, builds
npm run test:e2e        # Chromium, Firefox, WebKit, mobile Chromium emulation
npm run format:check
npm run test:package    # isolated tarball installation; needs registry/cache access
```

The browser command builds the packages/apps and serves a fresh production bundle on port 4174, independently of the development server.

If Playwright browsers are missing, run `npx playwright install chromium firefox webkit`. Mobile emulation is not a real-device test.

## Repository

| Location                    | Purpose                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `packages/tokens`           | Versioned themes, presets, semantic colour/type roles, contrast checks, JSON/CSS export |
| `packages/react`            | Components, layout/pattern primitives, shared stylesheet, themed portals                |
| `packages/localization`     | Locale/direction/messages provider and number/date/plural formatters                    |
| `apps/playground`           | Workbench using the same public packages as consuming apps                              |
| `examples/consumer`         | Separate application importing built package exports without local styles               |
| `tests`                     | Theme, interaction, SSR/hydration and browser checks                                    |
| `skills/gregui-development` | Portable source for the reusable development skill                                      |

The application bundlers resolve built package exports, not source aliases. After changing a library package, run `npm run build:packages` and reload the workbench. Unit tests resolve source directly.

## Application kit

The searchable Components catalog now includes Tree View, Timeline, sortable Data Table, advanced inputs and ready-made profile, security, team, notification, privacy, pricing, discussion and approval panels. See [expanded component contracts](docs/EXPANDED-COMPONENTS.md) for APIs and supported scope. Every example is local and uses the public package. ConfirmDialog also supports awaited actions with pending locking and failure/retry feedback.

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

For an app without `AppShell`, add `page` to the top-level provider so the theme's background fills the window and the browser's scrollbars and overscroll follow its mode: `<ThemeProvider theme={theme} page>`.

To follow the device's light/dark setting, add `colorScheme="system"`: `<ThemeProvider theme={theme} colorScheme="system">`. The provider derives the other mode with `switchMode`, follows live changes and paints the device's mode before JavaScript runs, including server-rendered pages. `useTheme().mode` reports the resolved mode and `useSystemMode()` the device setting. Saved theme JSON keeps `mode: 'light' | 'dark'`; store a "match system" preference separately. The default is unchanged: the theme's own mode.

Import the stylesheet once, at the application root. Packages ship ESM and TypeScript declarations; React providers/components carry a `use client` directive for frameworks with server components. The package itself does not depend on Next.js. Locale/time-zone inputs must be consistent on server and client.

Use `parseTheme(JSON.parse(input))` before applying externally supplied theme JSON. Within version 1 it ignores (and drops) properties and colour roles it does not know, so themes saved by a newer build still load; every known field must still be valid, and other versions are rejected. `exportTheme` rejects schemas or checked color pairs that fail validation; export is not accessibility certification. Changing light/dark mode with `switchMode` uses the matching palette's light/dark colours. Hand-picked colour roles are kept when they still pass `checkContrast` in the new mode, and the rest come from the closest palette or the preset's defaults; other theme properties are preserved.

Each preset has its own default palette and component treatment: forest Flat, plum Glass, clay Soft, blue Elevated and ink/cream Outline. See the [visual direction](docs/DESIGN.md) and the generated per-preset [style guides](docs/styles/README.md). The workbench loads the complete preset when selected; Undo restores your previous custom draft.

Apps own domain content, state, routing, validation rules and data processing. gregUI owns styling and shared interaction behavior. Compose Stack, Inline, Grid, Split, Container, Card and page/overlay primitives; extend the package for missing variants. No application CSS, arbitrary style props or class overrides. `npm run check:styles` enforces common violations in this workspace; replicate the policy in each consuming repository.

## Typography and page foundations

Open **Typography & pages** in the main navigation: **Text styles**, **Reading content**, **Page elements**, and **Type scale** are separate tabs. The page can be opened directly with `?page=typography`. Components has category/search filters and an index with collapsible categories that remembers expansion choices in this browser, keeps the selected category open and shows one focused example; its address includes a stable component ID for bookmarking.

Use Heading levels h1–h6 independently from visual sizes, Text lead/caption roles, and Prose for readable native content. Container reading width, nested Section levels and compact PageHeader breadcrumbs/metadata compose common pages without app CSS. Foundations and the catalog include live typography/content and page-composition examples. See [contracts](docs/COMPONENTS.md#typography-and-page-foundations).

## Current scope and limits

This is the first working foundation, not a production certification. The initial catalog includes buttons/links, labeled fields, select/textarea, checkbox/radio/switch, layouts, dialogs/drawers/full-screen flows, confirmation, tooltip/popover, tabs/navigation, alerts/status/progress/skeletons, tables and empty states. Sixteen presets (eight featured) work in light/dark modes. Glass uses translucent cards with a blurred backdrop; inputs and overlays retain opaque surfaces. Verify card text against the actual backdrop.

Combobox with local or application-controlled remote results, native DateRangePicker and DataTable with client or application-controlled server mode are implemented. Custom calendars, charts, upload orchestration, consent integrations and native mobile components remain future additions. Apps must complete their own accessibility, privacy and sector-specific checks. The 24-month browser policy is documented; historical devices and manual assistive-technology testing remain unverified.

See [component contracts](docs/COMPONENTS.md), [compatibility and verification](docs/COMPATIBILITY.md), [contributing](docs/CONTRIBUTING.md), and the original [product brief](UI-SYSTEM-BRIEF.md).

### Palette choices

Every style supports all seventeen `paletteOptions` — Coral, Citrus, Mint, Violet, Graphite, Pure white, Cream & vermilion, Iris, Lagoon, Forest, Plum, Clay, Cobalt, Ink & cream, Ocean, Rose and Amber: 272 preset/palette combinations, or 544 including light/dark modes. Use the workbench's Palette selector, or `createTheme('soft', 'light', 'cobalt')`. `applyPalette(theme, 'forest')` replaces only colours; `getPalette(theme)` identifies a matching built-in palette or returns undefined for custom colours. `paletteOptions` provides IDs and display names for consumers. Stored theme JSON remains version 1, and palette recognition survives import, save/restore and Undo.

### Ready-made authentication

Open **Authentication** in the workbench to try sign-in, registration, recovery, password reset, email verification and two-step verification. Shared forms include password visibility, remember preference, pending/error/success states and translation hooks. See [integration examples](docs/AUTHENTICATION.md). The demo performs no network authentication or credential storage.

Featured choices are Paper, Cream, Workspace, Bloom, Clay, Neumorphic, Glass and Flat. `featuredPresets` drives new theme pickers; `presets` retains all saved-theme IDs for compatibility. Selecting a complete direction can load `recommendedPalettes[preset]`; users may then customize colours independently.

### Visual choices and document previews

`VisualChoiceGroup` provides controlled visual radio selection. `DocumentPreview` provides dimensioned pages, fit/zoom, page switching, optional safe-area, bleed and crop-mark guides, and a low-resolution image warning. Open **Postcard studio** in the Components catalog to choose a template and personalise a local front/back preview. AI generation, address storage and print/PDF export remain application responsibilities. See [contracts](docs/COMPONENTS.md#visual-single-selection).

`AddressFields` adds controlled recipient and postal-address entry with application-configured country choices, field order, labels, requiredness and errors. The postcard example starts with Hungary, supports Hungarian/UK address layouts and basic postcode checks, and updates its preview as details change. See [address contracts](docs/COMPONENTS.md#address-fields).

Postcard studio also offers flat and folded formats, each in portrait or landscape. Folded cards include cover, open inside and back-cover previews and editable inside text. Mailing method is separate from card format: flat cards can be directly addressed or use an envelope; any enveloped card keeps the address only on its separate envelope preview. `DocumentSpread` supplies reusable equal document panels; printing and duplex imposition remain application responsibilities.

`MailFace` provides realistic screen compositions for postcard backs and envelope fronts: reserved upper-right postage, lower-right recipient address, and a message/address divider for direct postcards. These are preview guides, not paid postage or a certified print layout.

Sender / return address fields now populate the upper-left mailing area on direct postcards and envelopes, using the Posting from country and the same Hungarian/UK formatting policy. Sender details remain separate from both recipient drafts.
