# Component contracts

All public exports are typed in `packages/react/src/index.tsx`; generated declarations ship with the package. The workbench's Components page provides live states and usage snippets. Public components omit `className` and `style` from their APIs.

## Composition

- `ThemeProvider`: scopes variables and the selected preset/mode. Nested providers inherit the current theme unless explicitly overridden. Portal components copy theme and locale into their portal root.
- `LocaleProvider`: locale, direction, time zone and replaceable package-owned messages. Supply translated application labels/content yourself. `useFormat` formats numbers/dates and selects plural categories; applications supply plural message forms.
- `Stack`, `Inline`, `Grid`: token-based gaps 0–8. Grid accepts 1–5 columns and collapses on small viewports. `Inline` wraps; do not depend on fixed text lengths.
- `Split`, `Container`, `Card`, `Section`, `PageHeader`, `AppShell`: shared responsive composition. AppShell renders a skip link, desktop navigation and a modal navigation drawer on small screens. It does not own routing.
- `Text`, `Heading`: explicit semantic heading levels and separate visual sizes. Application authors must choose logical heading order.

## Forms and actions

- `Button`: primary/secondary/ghost/danger, small/medium/large. Default type is `button`; use `type="submit"` in forms. `loading` sets `aria-busy` and disables repeated actions. `IconButton` requires `label`.
- `TextField`: label, hint, error and generated stable IDs. Native input props remain available. Use `Field`'s render callback with `Input`, `Textarea` or `Select` for other labeled controls.
- `Checkbox`, `Switch`: native checkbox state/events; Checkbox optionally accepts `hideLabel` for compact table selection while retaining its accessible name; Switch exposes switch semantics. `RadioGroup` requires controlled value/onChange and options.
- Form validation remains in the application. `ErrorSummary` links errors to field IDs. On failed submission, move focus to the summary or first invalid field; on success use `Status`.
- Compact density uses 36px standard controls; comfortable uses 52px, with coordinated vertical padding, button widths and label spacing. Small buttons use 32/44px and large buttons use 44/60px. Touch-capable devices keep a 44px minimum target. Textarea minimum heights are 80/112px. Input text remains 16px; label hit areas for checkbox/radio/switch remain at least 44px. Do not shrink controls with app overrides.

## Overlays and navigation

- `Dialog`, `Drawer`, `FullscreenDialog` require a trigger, title and description. Trigger must be one focusable element/component forwarding its ref, such as Button. Optional controlled open/onOpenChange, content and footer. All three are modal: focus is contained, background interaction is blocked, Escape closes, and focus returns to the trigger. Drawer is not a persistent non-modal sidebar.
- `DialogClose` wraps a single ref-forwarding control. On narrow screens Dialog takes a full-screen presentation.
- `ConfirmDialog` focuses Cancel first and invokes onConfirm only for the explicit action. It does not handle asynchronous destructive operations, failed mutations or rollback automatically.
- `Tooltip` supplements an already named trigger. `Popover` accepts interactive content and a label; Escape closes and restores focus. Never put essential instructions only in a tooltip.
- `Tabs`: items have stable value/label/content; supports controlled state and direction-aware arrow-key navigation. Inactive panels unmount: hoist state if it must survive tab changes.
- `Breadcrumbs`, `NavItem`, `Link`: apps supply navigation destinations or callbacks. No router dependency.

## Feedback and data

- `Alert` is static unless `live` is requested; danger uses alert semantics, other live alerts use polite status. `Status` is a persistent polite live region.
- `Progress` has a visible label; `Spinner` and `Skeleton` have accessible loading names and honor reduced motion. Skeleton is static.
- `Badge` always includes text; status meaning is not color-only.
- `Table` includes caption, column headers and first-column row headers inside a named scroll region. It deliberately has no sorting, pagination or virtualization.
- `DescriptionList`, `EmptyState`, `CodeBlock`, `Divider` provide content structure without application styling.

## Theme editing

`ColorControl`, `Swatch`, `PresetOption`, `PreviewStage` and `Metric` support preview/documentation interfaces. They belong to the shared package so workbench apps need no custom CSS. Keep the editor controls under a stable provider; put only the edited preview under the draft theme.

`PresetOption` accepts a light/dark `mode` and displays a decorative specimen using that preset's default tokens. `PreviewComposition` stacks children by default and creates two columns when its container is at least 600px wide. `PreviewStage showcase` adds a stronger decorative backdrop: place all text and controls inside opaque Cards or Alerts when using it. Use the default stage for uncontained content.

All theme colors are six-digit hex values. Theme import rejects unknown fields, unsupported versions and malformed values. Schema-valid drafts may have contrast failures; JSON/CSS exports are blocked until checked pairs pass. CSS export is a token snapshot for adapters or generated stylesheets. React consumers should import the JSON into ThemeProvider; its inline variables take precedence over a separately imported CSS snapshot. No schema migrations exist yet because only version 1 exists.

## Authentication

`AuthLayout` and six named forms provide ready-made authentication screens; `AuthForm` selects the flow dynamically. `PasswordField` and `VerificationCodeField` are independently reusable. See [authentication contracts and integration](AUTHENTICATION.md) for callback payloads, validation, async states, translations and provider responsibilities.

## Editorial composition

`PageHeader` optionally accepts an `artwork` node to create a responsive editorial header. `ThemeArtwork` supplies a decorative, theme-aware material study; `compact` fits introduction panels. It is hidden from assistive technology and carries no essential information. `AppShell viewKey` optionally remounts the page content with a brief entrance and resets scroll when the key changes; keep persistent form state outside that keyed content if required.

## Disclosure and multi-step workflows

- `Accordion`: independent native `details`/`summary` disclosures with unique item `value`, plain-text `title` and rich `content`. `defaultOpen` selects initially expanded items. Multiple items may stay open; Enter/Space toggle the focused summary. Do not put interactive controls in titles.
- `Pagination`: controlled, one-based `page`, `pageCount` and `onPageChange`. Renders first/last/current/neighbour pages with gaps and disabled boundary actions; the current page has `aria-current="page"`. `disabled` locks navigation during data fetching. Invalid numeric bounds are clamped for rendering; apps own fetching, result announcements and page resets after filters. Optional `label` distinguishes multiple paginators.
- `Stepper`: non-interactive progress list; `currentStep` is zero-based. Stable step values, visible numbers/checks, current-step semantics and localized completed text convey progress beyond colour. It does not skip steps or navigate.
- `Wizard`: ready-made form shell with Stepper, Back/Continue/Finish, native required/type validation, step-heading focus, pending locking and generic failure/retry feedback. Supply stable, non-empty `steps` with unique values, labels, descriptions and content, plus `onComplete`. Optional step `validate` may asynchronously return false (consumer must show field errors/focus the invalid field) or reject (generic retry alert). `finishLabel` replaces the last action label. Do not nest forms inside step content. Keep entered values in the consuming app because only the active content is mounted. Keep step structure stable during a run; remount with a new React key to restart with a different structure. The app replaces the wizard or navigates after successful completion; the library does not persist data or invent a success destination.

Package-owned navigation, progress and error labels can be replaced through `LocaleProvider.messages`. Application step names, descriptions and validation messages remain consumer-owned. The Components catalog demonstrates all four exports; Patterns → Onboarding provides a complete local setup flow including simulated save failure and retry.

## Extended application kit

Tree View, Timeline, Data Table, advanced inputs and ten composed application patterns are documented in [Expanded components](EXPANDED-COMPONENTS.md), including current feature boundaries and integration responsibilities.

Container supports `size="page"` (default, 1200px) or `size="form"` (42rem) and `inset={false}` for an already padded parent. The original default padding and page size remain unchanged. Use form width for single-column forms and page width for tables; neither forces a minimum viewport width.

## Editorial application surfaces

AppShell accepts opt-in `appearance="editorial"` (horizontal desktop masthead) or `"dashboard"` (wider operational sidebar), plus a decorative `brandMark` node. Default styling is unchanged. `PulseMark` is an optional decorative identity mark. `FeaturePanel` accepts `image`, `imageAlt` and copy children, with an opaque copy panel and responsive image column. `MediaCard` accepts the same props for image-led articles. Apps supply meaningful image descriptions (or empty alt for decorative stock), attribution and domain copy. These components use existing theme roles in both modes.

FeaturePanel `variant="immersive"` places an opaque theme-text-colored copy panel inside a full photographic frame; the default split variant is unchanged. EditorialLead pairs a feature with supporting content and collapses responsively. SignalCard marks concise updates; ChipLink supports native links and active state. AccentLink accepts a `palette: {background, text}` six-digit hex pair and rejects contrast below 4.5:1; it is an explicit action palette, separate from the theme primary role used for text links. No arbitrary styles are accepted.
