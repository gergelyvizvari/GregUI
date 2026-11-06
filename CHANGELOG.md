# Changelog

## 0.22.0 — 6 November 2026

- Editorial `AppShell` on phones and small tablets: the header reads like a website header, with the brand in the display face at a readable size, the toolbar at the other end, and 44px icon buttons. New `brand` type role (`--g-type-brand-size`, `-line-height`, `-tracking`).

## 0.21.0 — 6 November 2026

- `AppShell stickyMasthead` (with `appearance="editorial"`): on wide screens the masthead (brand, navigation and toolbar) stays at the top while the page scrolls; phones keep their own bars.

## 0.20.0 — 5 November 2026

- `CommentsPanel`: `inputLabel` and `submitLabel` name the text box and button for what posting does (for example "Send answer by email"); `onSubmit` is optional, and without it the thread is read-only with no composer.

## 0.19.0 — 5 November 2026

- Phone tab bar: a form's sticky buttons (`FormActions`) sit above the bar instead of under it.
- `VisualChoiceGroup layout="masonry"`: on phones a preview that is not a picture is only as tall as its words.

## 0.18.0 — 5 November 2026

- `Inline wrap={false}`: items stay on one row and long text wraps inside its own item, so an icon or button stays beside its sentence on narrow screens; buttons, badges and icons never shrink.
- `AuthForm`: the code screens (`verify-email`, `two-factor`) put the cursor in the code field when they open, so the phone keyboard is ready.

## 0.17.0 — 5 November 2026

- `SegmentedControl phoneRow` (with `variant="chips"`): on phones the chips stay on one row that scrolls sideways, with the chosen chip in view.
- `Stepper compact`: on phones one row of numbers; finished steps' summaries stay for screen readers only, so the stepper no longer wraps into several rows.

## 0.16.1 — 5 November 2026

- `VisualChoiceGroup layout="masonry"`: a preview that is not a picture (such as "your own picture") is a quiet dashed tile across the column, as in the gallery layout, instead of bare text.

## 0.16.0 — 4 November 2026

- New `MediaRow`: a list item led by a small picture, with text and actions (under the text on phones).
- `Dialog`, `Drawer`, `FullscreenDialog`: `trigger` is optional, for overlays opened from a menu item with controlled `open`.

## 0.15.0 — 4 November 2026

- `AuthForm codeFirst`: for apps where the emailed code is the usual way in, the code screen links to "Sign in with a password" (new message `authUsePassword`).
- `AuthForm rememberChoice={false}` hides "Keep me signed in" where sessions always last.

## 0.14.0 — 4 November 2026

- `AppShell phoneNav`: a bottom tab bar on phones with up to five destinations and an optional raised main action, instead of hiding them in the menu drawer.

## 0.13.0 — 4 November 2026

- New `VisualMultiChoiceGroup`: several pictures picked with a tap (checkboxes) in the gallery or masonry look, with optional controls under each chosen one.
- New `QuantityStepper`: a compact "− 2 +" count in one pill, for small whole numbers such as how many of a card to order.

## 0.12.1 — 4 November 2026

- `VisualChoiceGroup layout="tiles"`: exactly four tiles sit two by two instead of three and one.

## 0.12.0 — 4 November 2026

- New `BarChart`: a small stacked bar chart for counts over a few periods (cards per day), with a legend for two or more series, an empty message, and the same numbers in a visually hidden table.

## 0.11.9 — 4 November 2026

- `CalendarAgenda groupBy="month"`: month headings capitalise only their first letter, so Hungarian reads "2027. február", not "2027. Február".

## 0.11.8 — 4 November 2026

- `CalendarAgenda groupBy="month"`: on phones the action moves under the entry's text, so titles keep the full row instead of wrapping beside the button.

## 0.11.7 — 4 November 2026

- `CalendarAgenda`: `groupBy="month"` is a compact planner list: a heading per month (with the year only outside the current one) and one row per entry in a card, with a date tile (day number and weekday; filled for today), the title, and a line with the relative day and `renderDetail`. The yearly label is left out, `tone="neutral"` entries are quieter and `renderAction` sits inside the row. Screen readers hear the title before the full date.

## 0.11.6 — 4 November 2026

- `PostcardStage`: the card keeps a hairline edge and a soft cast shadow in every preset, so a white card stays visible on a white page.

## 0.11.5 — 4 November 2026

- `DocumentPreview`: Fit now fits the whole page, height included, so an upright (portrait) page no longer runs off the bottom of the viewport; it updates when the window's height changes.

## 0.11.4 — 4 November 2026

- `CalendarMonth`: `size="large"` is a planner month with tall days that list their events as small coloured labels (dots on phones); `CalendarEvent tone` (`primary`, `accent`, `neutral`) colours them.
- `AppShell`: `brandHref` (with `brandLinkComponent` for a router link) makes the brand a link home in the masthead and the phone header; the phone brand mark no longer shrinks.
- `AppShell appearance="editorial"`: the one-row masthead now starts above 960px (was 1200px).

## 0.11.3 — 4 November 2026

- `Container`: `align="start"` keeps a narrow (form or reading) container against the leading edge, under a left-aligned page title.
- `CalendarAgenda`: `renderAction` puts an action beside an entry (for example "Send a card"), next to the entry's own button rather than inside it; on phones it wraps below.

## 0.11.2 — 4 November 2026

- `AppShell`: `toolbarOverflow` holds secondary toolbar items (language, light/dark, sign out): at the end of the toolbar on wide screens, inside the menu drawer on narrow ones, so a phone header stays one row.
- `AppShell appearance="editorial"`: the one-row masthead needs a wide screen (above 1200px); narrower windows get the menu drawer instead of a squeezed, wrapping masthead, and the header spans the full width. Brand and navigation labels no longer break mid-word.

## 0.11.1 — 4 November 2026

- `AppShell`: `tone="brand"` with `appearance="editorial"` sets the masthead (brand, navigation and toolbar) on the primary colour, like a website header on its hero; a deep tint in dark mode. The current page stays on the page surface.

## 0.11.0 — 4 November 2026

- `ThemeProvider`: `displayFont` (`{ family, weight? }`) sets the app's own display face for headings, inherited by nested providers and portals. The app loads the font; theme JSON is unchanged.
- `AppShell appearance="editorial"`: on wider screens the brand, navigation and toolbar share one masthead row, like a website header, and `SideNav` items run sideways there; phones keep the menu drawer.
- `PageHeader`: `tone="brand"` puts the header on a bold block of the primary colour (a deep tint in dark mode), like a landing page hero; text and buttons switch to readable colours on it.

## 0.10.6 — 4 November 2026

- `NumberField`: on an empty field the increase and decrease buttons (and arrow keys) step from 0, so up gives 1 and down −1; before, both jumped to `min`. When 0 is out of range it starts at the nearest limit.

## 0.10.5 — 3 November 2026

- `VisualChoiceGroup`: `layout="people"` shows one calm row per choice, avatar or icon beside the name and a short note; an option's `highlight` sets it apart with a festive edge and the note as a pill, `quiet` makes it a lighter dashed extra.
- `Avatar`: `colorful` puts the initials on a soft theme hue picked from the name, the same every time.

## 0.10.4 — 3 November 2026

- `Stepper`: moving between steps, each number glides to its new place and the new step's name fades in, so the move reads as a move; skipped when motion is reduced.

## 0.10.3 — 3 November 2026

- `SideNav`: `badgeTone: 'attention'` fills an item's badge with the primary colour for work waiting there; the collapsed rail keeps it as a dot.

## 0.10.2 — 3 November 2026

- `Stepper`: `reachedStep` keeps steps already reached finished and selectable after going back, so people can jump forward again.

## 0.10.1 — 3 November 2026

- `VisualChoiceGroup`: `hideCaptions` keeps option labels for assistive technology only, when the pictures speak for themselves.

## 0.10.0 — 3 November 2026

- `VisualChoiceGroup`: `layout="masonry"` shows previews at a column's full width and their own height, in balanced columns, for a large set of mixed pictures; selection looks the same as `gallery`.

## 0.9.0 — 3 November 2026

- `EditorLayout`: `aside.preview` for a live preview beside the document: a wider column that stays in view while scrolling, above the document when stacked.
- `VisualChoiceGroup`: `onPick` reports a click or tap on an option, so a wizard can move on as soon as something is chosen; arrow keys only select.

## 0.8.0 — 3 November 2026

- `PostcardStage`: `fold="closed" | "open"` for a folded card seen slightly from the side that opens on its fold to `inside`; a portrait card's writing side is landscape and the card turns a quarter as it turns over; `onTurn` and `turnLabel` make the card a button that turns or opens it; `size="large"` for a last look; the stage is roomier, and a closed folded card stands slightly open.
- `Stepper`: `compact` for one short row: finished steps show what was chosen, the current step its label.
- `DocumentPreview`: `controls="buttons"` shows the page and zoom as segmented buttons instead of menus; a page's `sizeMm` shows it at its own size, such as an envelope.
- `MailFace`: the inside of a folded card is centred, in the display face.
- `MailFace`: `postage={false}` for cards that are not posted.
- `VisualChoiceGroup`: `layout="notes"` for written suggestions as small note cards; `preview` is optional with it.

## 0.7.0 — 2 November 2026

- `PostcardStage`: one postcard on the table at true proportions, scaled to fit, turning over between its picture and writing sides, with an optional envelope behind a folded card and a small settle when its content changes.
- `MailFace`: `variant="inside"` for the inside of a folded card, the message alone.
- `VisualChoiceGroup`: `layout="tiles"` for big, centred choices with an avatar, icon or small picture; `hideLabel` when a heading already asks the question.

## 0.6.8 — 2 November 2026

- Headings, regions and messages that receive focus from code (`tabindex="-1"`, such as `Wizard` step titles, the `AppShell` main area and form feedback) no longer show a focus ring.

## 0.6.7 — 2 November 2026

- `Stepper`: `onStepSelect` makes completed steps buttons, so people can go back to them.
- `SegmentedControl`: `variant="chips"` shows many options as wrapping rounded chips, for filters.
- `VisualChoiceGroup`: `layout="gallery"` shows previews at their own proportion and one height, ringed and ticked when chosen, for pictures of mixed shapes.

## 0.6.6 — 2 November 2026

- `PageLoading`: a whole-screen, centred loading state with an optional brand mark, shown after a short pause.

## 0.6.5 — 2 November 2026

- `CardLink`: the title link of a `Card` that makes the whole card clickable, for lists of records; the title reads as plain text and the card lifts on hover.

## 0.6.4 — 1 November 2026

- `AuthForm`: `registration={false}` hides the "create account" link on the login screen.

## 0.6.3 — 1 November 2026

- `AuthLayout page`: on one column the introduction lines up with the form.

## 0.6.2 — 1 November 2026

- `AuthLayout`: `page` makes it the whole screen, filling the viewport with the introduction and form centred together.

## 0.6.1 — 1 November 2026

- `AppShell`: on small screens the brand mark and name show next to the menu button, so the product is still recognisable while the sidebar is hidden.

## 0.6.0 — 1 November 2026

- Passwordless sign-in: `AuthForm` mode `email-code` and `EmailCodeForm` ask for an email to send a one-time code to; `emailCode` adds an "Email me a code instead" link to the login screen. Enter the code with the existing `verify-email` screen. New messages: `authEmailCode`, `authEmailCodeDescription`, `authSendCode`, `authUseCode`, `authEmailCodeSent`.

## 0.5.1 — 31 October 2026

- `Field` takes `optional`, which marks the label instead of adding a hint line, so fields in one row stay aligned.
- `MonthDayField`'s year uses it: the year input now lines up with month and day. The `optional` message is lower case to fit in the label.

## 0.5.0 — 30 October 2026

### Added

- `MonthDayField` and `daysInMonth`: recurring dates without a year (birthdays, name days), with locale month names and order and an optional year.
- Locale messages `month`, `day`, `year`, `notSelected` and `optional` (English and Hungarian). Apps that pass a complete `Messages` object must add them.

## 0.4.0 — 30 October 2026

### Added

- Marketing sections: `HeroSection`, `FeatureGrid`, `Testimonials`, `LogoCloud` and `CtaBand`, with an opt-in `reveal` entrance that respects reduced motion and never hides server-rendered content.

## 0.3.0 — 30 October 2026

### Added

- `LinkButton`: navigation styled as a `Button`, with an optional framework link `component`.
- `LanguageSwitcher`: interface-language select with a globe icon, per-option `lang` and a translated default label.
- Icon: `globe`.
- Locale message `language` (English and Hungarian). Apps that pass a complete `Messages` object must add it.

## 0.2.0 — 30 October 2026

### Changed behaviour

- A `ToastStack` item's action button now dismisses the toast after running `onAction`. Set `keepOpen: true` on the action to keep the previous behaviour.
- `parseTheme` now ignores unknown top-level properties and colour roles from newer builds instead of rejecting the theme; known properties are still validated and other versions are still rejected. Re-saving such a theme drops the unknown keys.
- `ActionMenu` is deprecated in favour of `Menu`. It still works.
- `Menu` radio items now keep the menu open, as documented.

### Added

- System colour mode: `ThemeProvider colorScheme="system"` follows the device's light/dark setting with no first-paint flash, including in portals. Added `useSystemMode` and the `ThemeColorScheme` type. Theme JSON is unchanged.
- `ThemeProvider page` makes a top-level provider the page root: its background fills the viewport and the document's `color-scheme` follows the theme.
- `ContextMenu`: the same `MenuEntry` items as `Menu`, opened by right click, long-press, Shift+F10 or the ContextMenu key.
- Form controls: `SegmentedControl`, `Slider` and `NumberField` (locale-aware parsing, including Hungarian separators).
- Feedback: timed toasts (`duration` per stack or item, pausing on hover, focus and hidden pages; danger toasts never expire unless `forceExpiry`), toast actions, and `Banner` with an `AppShell banner` slot.
- People and text helpers: `Avatar`, `AvatarGroup`, `Kbd`, `VisuallyHidden` and `SkipLink` (now used by `AppShell`).
- Icons: 27 more built-in icons (`iconNames` lists 49), application glyphs as `Icon` children, and the `IconSource` type accepted by `SideNav`, `Menu` and `NavItem` icon props. `Alert`, toasts and `Banner` use a distinct icon per tone.
- Tokens: `zIndex` (emitted as `--g-z-*`), `breakpoints` and `mediaQuery()`.
- New locale messages (English and Hungarian): `statusOnline`, `statusAway`, `statusBusy`, `statusOffline`, `morePeople`, `numberIncrease`, `numberDecrease`, `numberInvalid`, `numberTooLow`, `numberTooHigh`. Apps that pass a complete `Messages` object must add them.

### Internal

- A stylesheet lint fails `npm run check` when hard-coded colours or font sizes in `styles.css` increase; numeric `z-index` is no longer allowed in library CSS.
- README and DESIGN.md preset and palette counts match the exported lists.

## 0.1.0

- Added navigation components. `Menu` is a dropdown menu with keyboard support, links, shortcuts, checkbox and radio items, groups and submenus. `SideNav` is hierarchical side navigation with headed sections, nested collapsible groups, badges and automatic opening of the current page's branch. `AppShell sidebarCollapsible` shrinks the desktop sidebar to an icon rail with tooltips, and SideNav groups become menus there. `Breadcrumbs` gained `maxItems` to collapse long trails, `onNavigate` for client-side routing and a localized landmark name, and now marks only the last item as the current page. Added `useSidebarCollapsed` and four locale messages (English and Hungarian). The mobile drawer now also closes when a link is chosen and stays open when a group is expanded.
- Added Hungarian package messages. `LocaleProvider` now picks built-in messages from the locale's language, so `locale="hu-HU"` shows every package label, error and calendar control in Hungarian; other languages still fall back to English and `messages` overrides still win. Dates, numbers, month and weekday names already follow the locale through `Intl`. Exported `english`, `hungarian` and `messagesFor`.
- Added `CalendarAgenda`, a list of upcoming events grouped by day with relative labels and arrow-key navigation, and calendar events with a yearly repeat for birthdays and anniversaries. `CalendarMonth` and `DatePicker` take `events`. Added `occurrencesBetween`, `yearlyDate`, `daysBetween`, the `CalendarEvent`, `CalendarOccurrence` and `LeapDayRule` types, and two locale messages.
- Added `headingLevel` (2–6) to the titled patterns, `PricingCards` plan names, `Wizard` step titles, `AuthForm` and `EmptyState`, so they fit any page outline. Defaults are unchanged.
- `switchMode` now keeps hand-picked colours that still pass the contrast checks in the new mode, instead of resetting custom themes to the style defaults.
- Async actions in the patterns, Wizard, AuthForm and ConfirmDialog now share one internal `useAsyncAction` hook (pending, failure, duplicate-submit lock and unmount safety). No API change.
- DocumentPreview is print-aware: `bleedMm` grows the sheet beyond the trim and adds trim and crop marks to the guides, `padding="bleed"` lets artwork reach the sheet edge, and `imageResolution` with per-page `images` warns when a photo would print below 300 dpi (configurable). Added `documentImageDpi`. Postcard studio uses a 3 mm bleed and flags its sample photo.
- Added ideas from Refero styles. Themes take an optional `accent: 'restrained'` that keeps the primary colour to the main action, links and focus. Added the warm editorial **Cream** preset and Cream & vermilion palette, restrained by default. Added `Badge variant="stamp" | "label"`, a decorative `Postmark` and an optional `MailFace postmark` slot. Existing theme JSON needs no migration.
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
