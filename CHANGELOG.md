# Changelog

## Unreleased

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
