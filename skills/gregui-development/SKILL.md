---
name: gregui-development
description: Build React apps with gregUI or extend gregUI components, themes and layouts while keeping presentation in the shared package. Use for gregUI adoption and changes, not unrelated React projects.
---

# gregUI development

The source workspace is `/Users/greg/code/gregUI`. Read its `README.md` and `docs/COMPONENTS.md` for current commands and contracts; if it moved, locate the workspace rather than inventing an API. When changing the library, also read `docs/CONTRIBUTING.md`.

Applications own domain data, copy, validation and event handlers. gregUI owns presentation. Import `@gregui/react/styles.css` once; compose exported layouts and typed variants. Do not add app CSS, className/style props or duplicate a shared component to work around a missing variant. Extend the smallest reusable package API instead.

Packages are `@gregui/tokens`, `@gregui/localization` and `@gregui/react`. Consumer apps resolve built exports: rebuild packages after library changes. Keep public declarations, package exports and consumer examples aligned.

For the visual rules of a style, read `docs/styles/<preset>.md`, or `designMarkdown(theme)` output for a custom theme. Resolve palette colours through `createTheme` or `applyPalette`; `paletteOptions[].preset` is only a suggested material and does not identify the palette colours. Use the exported preset and palette lists for choices. Set `accent: 'restrained'` on a theme to keep `primary` to the main action, links and focus.

To follow the device's light/dark setting, use `ThemeProvider colorScheme="system"` rather than storing a third mode; theme JSON keeps `mode: 'light' | 'dark'`. Themes use version 1 JSON with strict validation of known roles and values; unknown properties and colour roles from newer builds are ignored and dropped, and other versions are rejected. Parse external themes before applying them. In library CSS use `var(--g-…)` colours, `var(--g-type-…)` sizes, `var(--g-z-…)` layers and the exported `breakpoints` widths; `npm run check` fails when hard-coded colour or font-size literals increase. A schema-valid draft may fail contrast; exported themes must pass the declared pair checks. Color checks are not a certification. Preserve theme and locale through portals; check dark mode and RTL when changing overlays. Avoid translucent essential surfaces whose contrast depends on an unknown backdrop.

Before completing changes, run the checks relevant to the changed behavior. `npm run check` covers types, the consumer style boundary, unit/interaction/SSR tests and builds. `npm run test:e2e` covers browser workflows; use specific test/project filters for narrow changes. The compatibility document distinguishes intended historic versions from browsers actually tested: preserve this distinction in claims.

For new application adoption, install built packages and React 19, wrap the app in LocaleProvider/ThemeProvider, and use the shared primitives. Add regression coverage for new interactions and update the workbench example when extending the system. Do not infer authorization to publish a package or deploy an application.
