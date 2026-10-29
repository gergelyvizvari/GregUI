# Changelog

## Unreleased

- Added Hungarian package messages. `LocaleProvider` now picks built-in messages from the locale's language, so `locale="hu-HU"` shows every package label, error and calendar control in Hungarian; other languages still fall back to English and `messages` overrides still win. Dates, numbers, month and weekday names already follow the locale through `Intl`. Exported `english`, `hungarian` and `messagesFor`.
- Added `CalendarAgenda`, a list of upcoming events grouped by day with relative labels and arrow-key navigation, and calendar events with a yearly repeat for birthdays and anniversaries. `CalendarMonth` and `DatePicker` take `events`. Added `occurrencesBetween`, `yearlyDate`, `daysBetween`, the `CalendarEvent`, `CalendarOccurrence` and `LeapDayRule` types, and two locale messages.
- Added `headingLevel` (2–6) to the titled patterns, `PricingCards` plan names, `Wizard` step titles, `AuthForm` and `EmptyState`, so they fit any page outline. Defaults are unchanged.
- `switchMode` now keeps hand-picked colours that still pass the contrast checks in the new mode, instead of resetting custom themes to the style defaults.
- Async actions in the patterns, Wizard, AuthForm and ConfirmDialog now share one internal `useAsyncAction` hook (pending, failure, duplicate-submit lock and unmount safety). No API change.
- DocumentPreview is print-aware: `bleedMm` grows the sheet beyond the trim and adds trim and crop marks to the guides, `padding="bleed"` lets artwork reach the sheet edge, and `imageResolution` with per-page `images` warns when a photo would print below 300 dpi (configurable). Added `documentImageDpi`. Postcard studio uses a 3 mm bleed and flags its sample photo.
- Added style guides: `designMarkdown(theme)` and `presetGuides` in `@gregui/tokens` write a DESIGN.md (colour roles in both modes, checked contrast, type, spacing, motion and rules) that AI coding tools can follow. Generated guides for the featured presets live in `docs/styles/`, `npm run check` keeps them current, and the workbench has Export DESIGN.md.
- Added `CalendarMonth` and `DatePicker` for single dates, with blocked dates that explain why, `min`/`max`, per-day content, Monday or Sunday week starts and plain `YYYY-MM-DD` values. Added `calendar` and `chevron-back` icons and five locale messages.
- Design fixes: borderless secondary buttons get a quiet fill (Paper, Bloom, Clay), alerts follow the theme's control radius, progress bars always show their track, Paper badges get a chip, checkboxes are drawn so unchecked boxes no longer look disabled in dark mode, disabled visual choices are dashed and dimmed, and the mobile toolbar keeps the menu beside the breadcrumb. Paper headings are serif, Bloom and Clay headings rounded, and Clay shadows are softer.
- Fixed Combobox Enter (now submits the form until the user types or arrows), auth success showing next to an app error (`onSubmit` may return `false` or `{ error }`), DocumentPreview and AccentLink crashing on bad runtime input, AddressFields dropping an unlisted country from form posts, and several smaller issues. Added `ListDetail groupHeadingLevel`.

- Scoped Workspace and Bloom dashboard navigation colours to dashboard shells, preserving readable theme colours in editorial/public headers. No API change. Verified with CityLink public branding and Chromium accessibility tests.

- Improved usability: explicit current-plan badges/outlines and shared pricing request locking, stronger row/list selection, combobox selection checks and keyboard scrolling, action-menu dismissal/focus return, file clearing, and locked role/privacy controls with save confirmation.

- Added twenty application components and patterns: TreeView, Timeline, DataTable, Combobox, DateRangePicker, FileUpload, ActionMenu, CommandPalette, SearchFilterBar, ListDetail, ToastStack, Dashboard, ProfileSettings, SecuritySettings, TeamMembers, NotificationCentre, PrivacyPreferences, PricingCards, CommentsPanel and ApprovalPanel. All have interactive catalog examples and localized package labels.

- Added Accordion, Pagination, Stepper and Wizard with localized navigation, native form validation, async completion and retry. Added catalog examples and a complete local onboarding pattern.

- Refined the complete visual hierarchy with editorial headers, quieter navigation, compact demo controls and theme-aware material artwork. Styles now have distinct display typography, action geometry, surface depth and motion timing. Added optional `PageHeader artwork`, `ThemeArtwork` and `AppShell viewKey`; reduced motion remains supported.

- Added optional Google and Apple sign-in callbacks, translated provider buttons, independent loading feedback and shared request locking to LoginForm. The workbench simulates each provider without external authentication.

- Added reusable authentication layouts, six flow forms, password/code fields, translated copy and asynchronous submission handling. Added local English/Hungarian demos for login, registration, recovery and verification.

- Refined shared motion with eased hover/press feedback, transform-based RTL-aware switches, focus halos and dialog/drawer/popover/tab entrances. Reduced motion now also covers pseudo-elements and hover displacement.

- Added five palette choices to every style (25 combinations, each in light/dark), a palette selector with swatches, and public `paletteOptions`, `applyPalette` and `getPalette` helpers. Mode changes retain recognized palette families; custom themes keep the existing fallback.

- Redesigned all five presets with individual light/dark palettes, surface treatments, control depth, geometry and decorative details. Existing version 1 theme JSON remains valid; newly created themes use the new defaults.
- Rebuilt the workbench with warm neutral framing, five live style specimens and a responsive composed preview. Preset selection loads its palette and shape; Undo restores the previous draft.
- Added `PreviewComposition`, `PreviewStage showcase`, light/dark specimens in `PresetOption`, and five-column `Grid` support.

- Made density visibly distinct: standard compact/comfortable controls are 36/52px with coordinated padding and field spacing, plus a 44px touch minimum.

- Fixed shared Select chevron spacing with an inset, direction-aware indicator and reserved text space. Native select behavior and multi-select/listbox presentation are preserved.

## 0.1.0 — 29 September 2026

Initial local foundation:

- React component, token and localization packages with typed public exports.
- Five visual presets, light/dark modes, semantic colors, density, typography and motion options.
- Workbench with theme import/export, contrast report, local drafts, component examples and pattern previews.
- Shared forms, layouts, navigation, feedback and Radix-backed overlays.
- Independent consumer, automated checks, CI configuration and reusable gregUI development skill.

Not yet published. Historical browser/device validation and manual accessibility review remain outstanding; see docs/VERIFICATION.md.
