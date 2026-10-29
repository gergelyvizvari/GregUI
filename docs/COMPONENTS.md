# Component contracts

All public exports go through `packages/react/src/index.tsx`, which re-exports the component modules beside it; generated declarations ship with the package. The workbench's Components page provides live states and usage snippets. Public components omit `className` and `style` from their APIs.

## Composition

- `ThemeProvider`: scopes variables and the selected preset/mode. Nested providers inherit the current theme unless explicitly overridden. Portal components copy theme and locale into their portal root. `colorScheme="system"` follows the device's light/dark setting; see [system colour mode](#system-colour-mode).
- `LocaleProvider`: locale, direction, time zone and replaceable package-owned messages. Built-in messages follow the locale's language: English (default) and Hungarian (`hu`, for example `hu-HU`, informal register). `messages` overrides are applied on top. `english`, `hungarian` and `messagesFor(locale)` are exported for apps that build their own catalogs. Supply translated application labels/content yourself. `useFormat` formats numbers/dates and selects plural categories; applications supply plural message forms.
- `Stack`, `Inline`, `Grid`: token-based gaps 0–8. Grid accepts 1–5 columns or `columns="auto"` (width-aware cards with a 15rem minimum) and collapses on small viewports. `Inline` wraps; do not depend on fixed text lengths.
- `Split`, `Container`, `Card`, `Section`, `PageHeader`, `AppShell`: shared responsive composition. AppShell renders a skip link, desktop navigation, a toolbar row and a modal navigation drawer on small screens; `sidebarCollapsible` adds an icon rail. It does not own routing.
- `Card` accepts an optional `footer` for actions anchored to the bottom of equal-height grid cards.
- `Text`, `Heading`: explicit semantic heading levels (h1–h6) and separate visual sizes. Text adds opt-in `lead` and `caption` roles. Application authors must choose logical heading order.
- `Prose`: opt-in reading flow for native headings, paragraphs, lists, quotes, figures/captions, links, code and simple tables; defaults to a 65ch reading measure. `measure="full"` removes that cap.
- `Section level` chooses h2–h6 for correctly nested named sections; the default remains h2. PageHeader adds optional breadcrumbs/meta slots and `size="compact"`. See [typography and page foundations](#typography-and-page-foundations).

## Forms and actions

- `Button`: primary/secondary/ghost/danger, small/medium/large. Default type is `button`; use `type="submit"` in forms. `loading` sets `aria-busy` and disables repeated actions. `IconButton` requires `label`.
- `TextField`: label, hint, error and generated stable IDs. Native input props remain available. Use `Field`'s render callback with `Input`, `Textarea` or `Select` for other labeled controls.
- `Checkbox`, `Switch`: native checkbox state/events; Checkbox optionally accepts `hideLabel` for compact table selection while retaining its accessible name; Switch exposes switch semantics. `RadioGroup` requires controlled value/onChange and options.
- `Combobox` supports local filtering or app-owned remote results through a controlled query, with loading/retry feedback and a persistent selection label. See [expanded contracts](EXPANDED-COMPONENTS.md#remote-and-controlled-choices) for query reset, error and focus behaviour.
- Form validation remains in the application. `ErrorSummary` links errors to field IDs. On failed submission, move focus to the summary or first invalid field; on success use `Status`.
- Compact density uses 36px standard controls; comfortable uses 52px, with coordinated vertical padding, button widths and label spacing. Small buttons use 32/44px and large buttons use 44/60px. Touch-capable devices keep a 44px minimum target. Textarea minimum heights are 80/112px. Input text remains 16px; label hit areas for checkbox/radio/switch remain at least 44px. Do not shrink controls with app overrides.

## Overlays and navigation

- `Dialog`, `Drawer`, `FullscreenDialog` require a trigger, title and description. Trigger must be one focusable element/component forwarding its ref, such as Button. Optional controlled open/onOpenChange, content and footer. All three are modal: focus is contained, background interaction is blocked, Escape closes, and focus returns to the trigger. Drawer is not a persistent non-modal sidebar.
- `FloatingPanel`: floating inspector with a fixed launcher, a non-modal desktop panel and a modal drawer at viewport widths up to 760px. Outside interactions leave the desktop panel open. Close or Escape collapses it and restores launcher focus; theme/locale follow the nearest providers. See [floating inspectors](#floating-inspectors).
- `DialogClose` wraps a single ref-forwarding control. On narrow screens Dialog takes a full-screen presentation.
- `ConfirmDialog` focuses Cancel first and invokes `onConfirm` only for the explicit action. It awaits returned promises, locks actions/dismissal while pending, closes on success and retains failures for retry. Applications own the mutation and rollback; see [async confirmation](#async-confirmation) for the callback and focus contracts.
- `Tooltip` supplements an already named trigger. `Popover` accepts interactive content and a label; Escape closes and restores focus. Never put essential instructions only in a tooltip.
- `Tabs`: items have stable value/label/content; supports controlled state and direction-aware arrow-key navigation. Inactive panels unmount: hoist state if it must survive tab changes.
- `Breadcrumbs`, `NavItem`, `SideNav`, `Menu`, `Link`: apps supply navigation destinations or callbacks. No router dependency. See [application navigation](#application-navigation).

## Feedback and data

- `Alert` is static unless `live` is requested; danger uses alert semantics, other live alerts use polite status. `Status` is a persistent polite live region.
- `Progress` has a visible label; `Spinner` and `Skeleton` have accessible loading names and honor reduced motion. Skeleton is static.
- `Badge` always includes text; status meaning is not color-only. Optional `variant="stamp"` draws a perforated postage-stamp edge with an inner frame; `variant="label"` draws a pointed luggage-label tag with a punched eyelet that points to the inline start and mirrors under RTL. Both keep `tone` and stay plain text for assistive technology. The default is `variant="standard"`.
- `Table` includes caption, column headers and first-column row headers inside a named scroll region. It deliberately has no sorting, pagination or virtualization.
- `DescriptionList`, `EmptyState`, `CodeBlock`, `Divider` provide content structure without application styling. `EmptyState` titles render as `h3`; set `headingLevel` (2–6) to fit the page outline. `CodeBlock wrap` preserves whitespace while wrapping long lines and unbroken strings to the available width; the default retains horizontal scrolling.

## Theme editing

`ColorControl`, `Swatch`, `PresetOption`, `PreviewStage` and `Metric` support preview/documentation interfaces. They belong to the shared package so workbench apps need no custom CSS. Keep the editor controls under a stable provider; put only the edited preview under the draft theme.

`PresetOption` accepts a light/dark `mode` and displays a decorative specimen using that preset's default tokens. Optional `palette` previews the consumer’s selected palette without changing its other preferences. `PreviewComposition` stacks children by default and creates two columns when its container is at least 600px wide. `PreviewStage showcase` adds a stronger decorative backdrop: place all text and controls inside opaque Cards or Alerts when using it. Use the default stage for uncontained content.

All theme colors are six-digit hex values. Theme import rejects unknown fields, unsupported versions and malformed values. Schema-valid drafts may have contrast failures; JSON/CSS exports are blocked until checked pairs pass. CSS export is a token snapshot for adapters or generated stylesheets. React consumers should import the JSON into ThemeProvider; its inline variables take precedence over a separately imported CSS snapshot. No schema migrations exist yet because only version 1 exists.

### System colour mode

`ThemeProvider colorScheme?: ThemeColorScheme` (`'theme' | 'system'`) chooses where light/dark comes from. The default, `'theme'`, uses `theme.mode` exactly as before. With `'system'` the provider follows `matchMedia('(prefers-color-scheme: dark)')`, including live changes, and applies `switchMode(theme, resolved)`; hand-picked colours stay when they still pass contrast. It is a runtime preference: stored theme JSON stays version 1 with `mode: 'light' | 'dark'`, so persist the user's "match system" choice separately.

To avoid painting the wrong mode before JavaScript runs, a system provider renders a `<style>` element immediately before its theme element. It holds the variables that differ between modes, light by default and dark inside `@media (prefers-color-scheme: dark)`, scoped to a per-provider `data-g-scheme` value. Until the preference is read (server render and hydration) the theme element has `data-mode="system"` and `color-scheme: light dark`; afterwards `data-mode` is the resolved `light` or `dark`. Both renders produce the same markup, so hydration does not mismatch.

`useTheme()` returns the effective theme, so `useTheme().mode` is the resolved mode once it is known; during server rendering and hydration it is the supplied theme. `useSystemMode()` returns the device's `'light' | 'dark'` (live) or `undefined` during server rendering and hydration. A nested provider without `theme` reuses its parent's system state; one that passes its own `theme` uses that theme's mode unless it also sets `colorScheme="system"`. Portals receive the resolved `data-mode` and the same `data-g-scheme`. Without `matchMedia` the system mode resolves to light.

Themes accept an optional `accent: 'expressive' | 'restrained'`. Omitted means expressive, so existing version 1 JSON is unchanged. With `restrained`, `primary` appears only on primary buttons, links and focus; selected states, checkboxes, switches, tabs, progress, primary badges, current navigation and decorative art use `text` on `surface` (CSS `--g-selection` / `--g-onSelection`), and tint and atmosphere washes use ink. Both pairs are already covered by the contrast checks. `ThemeProvider` exposes it as `data-accent`. The Cream preset defaults to restrained; any preset can opt in, and mode or palette changes keep the setting.

## Authentication

`AuthLayout` and six named forms provide ready-made authentication screens; `AuthForm` selects the flow dynamically. `PasswordField` and `VerificationCodeField` are independently reusable. See [authentication contracts and integration](AUTHENTICATION.md) for callback payloads, validation, async states, translations and provider responsibilities.

## Editorial composition

`PageHeader` optionally accepts an `artwork` node to create a responsive editorial header. `ThemeArtwork` supplies a decorative, theme-aware material study; `compact` fits introduction panels. It is hidden from assistive technology and carries no essential information. `AppShell viewKey` optionally remounts the page content with a brief entrance and resets scroll when the key changes; keep persistent form state outside that keyed content if required.

## Disclosure and multi-step workflows

- `Accordion`: independent native `details`/`summary` disclosures with unique item `value`, plain-text `title` and rich `content`. `defaultOpen` selects initially expanded items. Multiple items may stay open; Enter/Space toggle the focused summary. Do not put interactive controls in titles.
- `Pagination`: controlled, one-based `page`, `pageCount` and `onPageChange`. Renders first/last/current/neighbour pages with gaps and disabled boundary actions; the current page has `aria-current="page"`. `disabled` locks navigation during data fetching. Invalid numeric bounds are clamped for rendering; apps own fetching, result announcements and page resets after filters. Optional `label` distinguishes multiple paginators.
- `Stepper`: non-interactive progress list; `currentStep` is zero-based. Stable step values, visible numbers/checks, current-step semantics and localized completed text convey progress beyond colour. It does not skip steps or navigate.
- `Wizard`: ready-made form shell with Stepper, Back/Continue/Finish, native required/type validation, step-heading focus, pending locking and generic failure/retry feedback. Supply stable, non-empty `steps` with unique values, labels, descriptions and content, plus `onComplete`. Optional step `validate` may asynchronously return false (consumer must show field errors/focus the invalid field) or reject (generic retry alert). `finishLabel` replaces the last action label. Step titles render as `h3`; set `headingLevel` (2–6) to fit the page outline. Do not nest forms inside step content. Keep entered values in the consuming app because only the active content is mounted. Keep step structure stable during a run; remount with a new React key to restart with a different structure. The app replaces the wizard or navigates after successful completion; the library does not persist data or invent a success destination.

Package-owned navigation, progress and error labels can be replaced through `LocaleProvider.messages`. Application step names, descriptions and validation messages remain consumer-owned. The Components catalog demonstrates all four exports; Patterns → Onboarding provides a complete local setup flow including simulated save failure and retry.

## Extended application kit

Tree View, Timeline, Data Table, advanced inputs and ten composed application patterns are documented in [Expanded components](EXPANDED-COMPONENTS.md), including current feature boundaries and integration responsibilities.

Container supports `size="page"` (default, 1200px), `size="form"` (42rem) or `size="reading"` (72ch) and `inset={false}` for an already padded parent. The original default padding and page size remain unchanged. Use form width for single-column forms and page width for tables; neither forces a minimum viewport width.

## Editorial application surfaces

AppShell accepts opt-in `appearance="editorial"` (horizontal desktop masthead) or `"dashboard"` (wider operational sidebar), plus a decorative `brandMark` node. Default styling is unchanged. `PulseMark` is an optional decorative identity mark. `FeaturePanel` accepts `image`, `imageAlt` and copy children, with an opaque copy panel and responsive image column. `MediaCard` accepts the same props for image-led articles. Apps supply meaningful image descriptions (or empty alt for decorative stock), attribution and domain copy. These components use existing theme roles in both modes.

FeaturePanel `variant="immersive"` places an opaque theme-text-colored copy panel inside a full photographic frame; the default split variant is unchanged. EditorialLead pairs a feature with supporting content and collapses responsively. SignalCard marks concise updates; ChipLink supports native links and active state. AccentLink accepts a `palette: {background, text}` six-digit hex pair and ignores a malformed pair or contrast below 4.5:1, falling back to the theme's action colours with a development warning; it is an explicit action palette, separate from the theme primary role used for text links. No arbitrary styles are accepted.

Dashboard sidebars stay within the dynamic viewport and scroll independently when navigation is long. Navigation items respect density padding while retaining a 44px minimum target. Compose compact navigation groups with Stack gaps; a labelled field beside an action uses Inline align="end" when there is no hint/error beneath the control.

## Field editing

`FieldEditorItem` is a controlled disclosure for schema builders. It keeps the edit action at the edge, with name/type control slots in two columns (one on mobile). Put shared help in `hint`, below both controls, rather than above one input. Consumers own field data, validation, translated labels and footer actions. Inactive editor content unmounts: hoist persisted drafts.

`TagInput` takes controlled `value: string[]` and `onChange`, plus consumer-owned `label`, `inputLabel`, `addLabel`, and `removeLabel(value)`. Enter or Add trims and adds one unique value; comma-containing values remain intact. Removal is part of each pill, supports keyboard focus continuity, and never detaches on wrap. Long labels wrap; coarse-pointer removal targets are at least 44px. `disabled` disables both addition and removal.

`TagInput size="small"` uses compact 12px tokens with 24px removal buttons on desktop; the default `medium` preserves the original sizing. Both retain 44px removal targets on coarse pointers. Size affects tokens, not entry fields.

`HighlightedTextarea` provides native plain-text selection, paste, undo and resizing with a decorative bold layer for exact, case-sensitive whole-word `highlights`. Props include `label`, controlled `value`, `onValueChange`, `highlights`, `hint`, `error` and native textarea props (without class/style). It uses monospace text so bold emphasis preserves glyph alignment. The mirror is hidden from assistive technology; forced-colors mode uses native text. Domain-specific transformations belong in the consumer.

## Appearance preferences

`ThemeSelector` accepts a controlled `ThemeSelection` (`preset`, `palette`, `mode`), `onChange`, required consumer-translated `labels` (`style`, `palette`, `mode`, `light`, `dark`), and optional `disabled`. It exposes the eight featured styles (keeping a current legacy style selectable) and seventeen palettes with light/dark mode through labelled native selects; changing one preference preserves the other two. The three-column layout collapses on mobile. Style and palette names are gregUI identifiers/display names. Consumers apply the selection with `createTheme(preset, mode, palette)` and own persistence, density and validation of stored values. The Components catalog includes an isolated live preview. This is an additive API; existing consumers need no migration.

`Dialog size="large"` provides a bounded 1040px desktop workflow surface, scrolling body and fixed header/footer. The default medium size is unchanged.

`ThumbnailChoice` is a whole-card native checkbox with an optional image `src`, text `preview`, `label` and `detail`. Consumers own image fetching and checked state. Images use contain-fit to preserve the full image.

`ImageRegion compact` bounds read-only, unannotated previews to 200px high without cropping. Editable or annotated images retain their natural geometry.

Disclosure controls use + when collapsed and − when expanded. `FieldEditorItem` retains `editLabel` and `closeLabel` for accessible button names.

Icons: `Icon` draws one of the built-in `iconNames` (navigation, people, files, status and common actions), or SVG children on the same 24×24 stroke grid for an application glyph: `<Icon><path d="…" /></Icon>`. Icons are decorative (`aria-hidden`). Every `icon` prop (`SideNav`, `Menu`, `NavItem`) takes an `IconSource`: a built-in name or such an element. `Alert` uses a distinct icon per tone (info, check, warning, error), so tones never rely on colour alone. `IconButton` uses its required accessible label as the default hover title; retain text for actions whose scope needs explanation.

Joyful, Professional, Clay and Neumorphic provide distinct material treatments across cards, controls, tabs and navigation. Neumorphic uses a single shared background/surface plane, opposing raised shadows and inset input/pressed-control shadows; palette recognition and light/dark switching preserve that material. Essential text remains on opaque surfaces, and keyboard focus outlines are retained.

The appearance catalogue now features Paper, Cream, Workspace, Bloom, Clay, Neumorphic, Glass and Flat (`featuredPresets`). Legacy preset IDs remain valid for saved themes, but are omitted from new-choice cards. `recommendedPalettes` provides coordinated defaults; consumers can use these when selecting a complete visual direction. Workspace uses an ink navigation rail and restrained Iris surfaces; Bloom uses a warm navigation rail and Lagoon surfaces. ThemeSelector retains a saved legacy value as an explicit option.

DataTable columns accept `width: "compact"` for narrow selection/action cells. Tables size from their content and scroll only when their natural minimum requires it.

`Metric compact` places a smaller value beside its label for low-emphasis summary strips. Nested panel surfaces use subtle separators; table rows retain accessible control sizes while reducing surrounding padding.

`DataTable activeRowId` subtly marks the row currently open in a detail panel. It is independent of `selectedIds` (bulk selection).

Clay cards reserve at least 24px of padding for their rounded corners and inset shading. Larger requested spacing is preserved; explicit `padding={0}` remains edge-to-edge. Other presets keep their requested spacing.

Accordion headers reserve at least 16px of vertical padding. Header and body horizontal insets match, including the Clay card minimum, in both collapsed and expanded states.

`FileUpload` provides a themed native picker and drop target with selected filenames, clear action, accept/size validation and disabled state (see Expanded components). Optional `directory` enables native folder selection; folder drag-and-drop is not supported. Optional `hint` supplies consumer guidance. Applications filter folder contents and own uploading/progress.

`HighlightedTextarea size="small"` uses 14px text and a matching emphasis layer on desktop with a fine pointer. Mobile/touch retains 16px. The default medium size stays unchanged.

`HighlightedTextarea font="body"` uses the shared theme font. Its emphasis uses a same-width visual stroke so the native caret and mirror wrapping stay aligned with proportional letters. The default `mono` font is unchanged.

Glass cards use 36% surface tint in light mode and 46% in dark mode, with 18px backdrop blur, 1.25 saturation, a diagonal reflection and illuminated inset edges. Reduced-transparency preferences and browsers without backdrop filtering use solid surfaces. Inputs and overlays retain their existing fills. No API migration is required; rebuild and synchronize consumer packages. Check card text against the consuming application’s actual backdrop.

Glass backgrounds use broad, low-chroma mist with a warm light source, with a quieter treatment in dark mode. The atmosphere fills the entire workspace and continues beneath short pages. Workbench previews use the same atmosphere.

AppShell standard/dashboard layouts fill the dynamic viewport even with short content. The main area grows below the toolbar, while decorative backgrounds cover the full workspace independently of the content width limit.

AppShell accepts `stickyToolbar` to keep its toolbar visible at the top of the viewport while scrolling. It defaults to false and preserves the toolbar’s space in the layout on desktop and mobile.

## Application navigation

gregUI has no router. Every navigation component renders ordinary links for `href` destinations and reports activation through a callback, so an application can call `event.preventDefault()` and route client-side, or let the browser follow the link.

```tsx
<AppShell
  brand="Acme"
  sidebarCollapsible
  nav={<SideNav sections={sections} value={currentId} onNavigate={route} />}
  toolbar={<Breadcrumbs items={trail} maxItems={4} onNavigate={route} />}
>
  …
</AppShell>
```

- `AppShell` is the app layout: sidebar (brand, `nav`, `footer`), a toolbar row used as the page header (`toolbar`, optional `stickyToolbar`), the main content area and, at 760px and below, a modal drawer opened from the toolbar. `sidebarCollapsible` adds a collapse control beside the brand that shrinks the desktop sidebar to a 72px icon rail; use `sidebarCollapsed`/`onSidebarCollapsedChange` to control or persist it, or `defaultSidebarCollapsed` for the initial state. In the rail, item labels stay in the accessibility tree and appear as tooltips, the footer is hidden, and the drawer always shows full labels. The editorial appearance ignores the option. Clicking a link or a destination button inside the drawer closes it; disclosure and menu buttons (`aria-expanded`/`aria-haspopup`) keep it open.
- `useSidebarCollapsed()` reports whether the surrounding AppShell sidebar is in rail mode, for custom navigation content.
- `NavItem` is a flat destination button. In the rail it shows its icon with a tooltip when its child is a string.
- `SideNav` takes `items` or headed `sections` (`{ id, title?, items }`). Items have `id`, `label`, optional `icon`, `href`, `badge`, `disabled` and child `items`. Parents are disclosure buttons with `aria-expanded`/`aria-controls`; leaves are links (`href`) or buttons, and the item whose id equals `value` gets `aria-current="page"`. Groups that contain the current item open automatically, including when `value` changes. Use `expanded`/`onExpandedChange` to control open groups or `defaultExpanded` for the first render. Pass `label` to wrap the lists in a named `<nav>`; inside AppShell, leave it unset because the shell already provides the landmark. In the rail, top-level groups open as a `Menu` with the group name as its heading. Badges are visual; include anything important in the label. Disabled links have no `href` and are skipped by Tab.
- `Breadcrumbs` takes the trail from root to the current page; the last item is the current page (`aria-current="page"`) and is never a link. The landmark is named with the localized "Breadcrumb" message unless `label` is set. `maxItems` keeps the first item and the last `maxItems - 1` items and hides the rest behind a "Show full path" button; revealing moves focus to the first revealed link. Separators flip in RTL.
- `Menu` is a dropdown with ARIA menu semantics (arrow keys, Home/End, typeahead, Escape returns focus to the trigger). `trigger` must be one ref-forwarding button such as `Button` or `IconButton`. `items` accepts action items (`label`, `icon`, `shortcut`, `href`, `danger`, `disabled`, `current`, `onSelect`), `checkbox` items, `radio` groups, labelled `group`s, `submenu`s and `separator`s. Checkbox and radio items keep the menu open. `shortcut` is a visual hint only; the application owns the key binding. Use `ActionMenu` instead when a few buttons with ordinary Tab navigation are enough.

## Long-form editing

EditorLayout keeps the main document before its optional named aside ({label, content}); it uses a wider editor column and stacks at 1100px. FormSection groups fields with a named heading (level 2–4), optional description and decorative number. FormActions is an opaque, in-flow sticky action surface; it becomes static in viewports at most 550px high. Keep the footer compact. Applications own forms, state, labels, save/error handling and validation. Native inputs remain mounted; there is no wizard or automatic saving. All three use shared theme roles and logical spacing, with no application CSS needed.

`BrandPreview` renders a scoped landing-page specimen with consumer-provided `label`, `name`, optional `logo`, decorative `cover`, `title`, `description`, content `language` and children. `compact` constrains the preview to 390px without horizontal overflow; it is a width preview, not an iframe/device emulator. Place it inside ThemeProvider. Media validation, URLs, translations and persistence remain consumer responsibilities.

## Async confirmation

`ConfirmDialog` exports `ConfirmDialogProps` and supports both synchronous callbacks and returned promises. Return the actual service promise, or await it inside an async callback. Resolve only after the app considers the action successful; throw/reject on failure. Synchronous and resolved return values are ignored, including `false`; a return value does not veto confirmation. Existing synchronous usage remains supported.

```tsx
<ConfirmDialog
  trigger={<Button variant="danger">Archive project</Button>}
  title="Archive this project?"
  description="The project will move out of your active list."
  confirmLabel="Archive project"
  cancelLabel="Keep project"
  onConfirm={async () => {
    await projects.archive(projectId);
    refreshProjects();
  }}
/>
```

The dialog owns its open/pending/error state. Cancel receives initial focus. During a request, the callback cannot run again, both action buttons are disabled, and Cancel/Escape cannot dismiss the dialog. Outside interaction remains blocked by the alert-dialog contract. Focus moves to the dialog while actions are disabled, and the shared `loading` message is announced outside the busy action area. There is no automatic timeout or request cancellation: the application owns service deadlines and abort behaviour.

Success closes the dialog and returns focus to the trigger if it remains available. Keep the trigger mounted when relying on focus return; applications that remove or navigate away from the triggering content must arrange their destination focus. Unmounting the component does not cancel the service operation, and subsequent settlement does not update the unmounted UI.

A thrown/rejected operation leaves the dialog open, shows a live danger alert and enables both actions. Focus moves to retry, labelled with the package `retry` message followed by the original confirm label. Cancel or Escape can then close it. A new attempt clears the old error; cancelling and reopening starts with a clean state and Cancel focus. Raw exception details are never displayed. Set optional `errorMessage` to safe, translated application copy, or override the package `confirmError` message in LocaleProvider. Applications providing a complete `Messages` object must add `confirmError`; partial overrides retain the English default.

Use the workbench's **Async confirmation** example to try a delayed first-attempt failure, retry success, success feedback and reset without real data changes. Backend permissions, idempotency, data updates, auditing and rollback remain application responsibilities. For application-controlled dismissal or abort-specific flows, compose the existing controlled Dialog.

## Floating inspectors

`FloatingPanel` exports `FloatingPanelProps` with required `trigger`, `title`, `description` and `children`. The trigger must be a single focusable ref-forwarding control, such as Button. Optional `footer` stays visible beneath the independently scrolling body, and `closeLabel` replaces the package Close label. `open`/`onOpenChange` provide controlled state; omitting `open` lets the component manage collapse/expand locally. The launcher is hidden while the panel is open.

```tsx
<FloatingPanel
  trigger={<Button>Edit appearance</Button>}
  title="Appearance"
  description="Adjust the current preview."
  footer={<Button onClick={savePreferences}>Save preferences</Button>}
>
  <ThemeSelector value={appearance} onChange={setAppearance} labels={labels} />
</FloatingPanel>
```

The panel and launcher are portaled with theme and locale inheritance. They anchor to the logical end of the viewport, including RTL. On desktop it is a non-modal dialog: the page remains interactive and clicking/focusing outside does not dismiss the panel. Escape or the close control collapses it. At widths up to 760px, it becomes a full-height modal drawer with a backdrop, contained focus and blocked background interaction. Header and footer remain visible while long body content scrolls. Other dialogs opened from inside the panel retain their own focus/close behaviour; Escape closes the topmost modal first.

Use one floating inspector per view to avoid overlapping launchers. Collapsing or changing between desktop/modal presentation can unmount body content; hoist drafts that must survive those changes. The component does not own editor data or persistence. Existing Dialog/Drawer semantics are unchanged.

The workbench uses this component for **Edit theme** on Components, Typography & pages, Patterns, Authentication and Foundations. The inspector shares controls, import/export, contrast guards, current theme and Undo history with Theme studio. It offers all sixteen styles, seventeen palettes, modes, restrained or expressive accent, density, corners, typography, motion and eleven semantic colours, plus an expandable contrast report. Editor surfaces retain the stable workbench theme while previews update live. Closing keeps changes in the session; Save draft explicitly writes local browser storage. Navigation closes the inspector and keeps the edited theme. Theme studio and Overview retain their inline editors.

## Typography and page foundations

The token package exports `typography` and `TypographyRole` for body, small, caption, large, lead, eyebrow, hero, page, section and card roles. Each role defines font size, line height and tracking. `themeVariables` and CSS exports include `--g-type-<role>-size`, `--g-type-<role>-line-height` and `--g-type-<role>-tracking`. Existing role sizes remain the defaults; new lead/caption styles are opt-in. Presets continue to select their font family and display weight, and explicit system/humanist/mono preferences remain effective. No theme JSON fields or version changed.

Use Heading `level` for document structure and `size` for appearance: an h6 may use a page/hero size when the surrounding hierarchy requires it. PageHeader remains the page's h1. `Section level={3}` creates a named section with an h3; its label stays linked through the generated ID. Text `size="lead"` introduces a topic; `size="caption"` suits short nonessential source/figure metadata. Existing small/body/large/eyebrow roles remain available. Keep essential labels and instructions at an appropriate reading size.

`Prose` accepts React children and clean native div attributes, including lang, dir and accessible naming. It styles native content without parsing Markdown/HTML or injecting markup. Applications own any parsing/sanitisation needed before producing children. It uses a 65ch maximum measure, comfortable paragraph rhythm, logical list/quote insets, theme-aware links and code that scrolls within its column. `measure="full"` permits the full parent width. Explicit Heading/Text visual roles remain available inside it; native headings receive reading-oriented sizes. It is a content surface, not an editable rich-text component.

```tsx
<Container size="reading">
  <PageHeader
    size="compact"
    title="Project guide"
    breadcrumbs={<Breadcrumbs label="Guide location" items={locations} />}
    meta={
      <Text as="span" size="caption">
        Updated today
      </Text>
    }
    actions={<Button onClick={save}>Save</Button>}
  />
  <Section title="Getting started">
    <Prose>
      <p>Introduce the task in plain language.</p>
      <ol>
        <li>First step</li>
        <li>Next step</li>
      </ol>
    </Prose>
    <Section level={3} title="Further details">
      <Text>Supporting content.</Text>
    </Section>
  </Section>
</Container>
```

Container `size="reading"` caps the complete container at 72ch, including its existing insets; `inset={false}` is useful in already padded surfaces. PageHeader `breadcrumbs` renders above the eyebrow/title and `meta` below the description. Applications supply meaningful breadcrumb labels, metadata, translated copy and action behaviour. `size="compact"` opts into a smaller title/spacing; omitted props retain the existing layout.

The main **Typography & pages** navigation destination (`?page=typography`) separates Text styles, Reading content, Page elements and Type scale into tabs. Foundations also renders its typography specimen under the draft theme, and includes a page-composition specimen. The catalog offers **Typography & content** and **Page foundations**. The floating theme editor updates these examples live. Authentication completion remains a deferred milestone in COMPONENT-ROADMAP.md.

Paper is a featured preset (`createTheme('paper')`) with the Paper & ink palette, pure white light mode and graphite dark mode. It uses a shared background/surface colour, square corners by default, fine separators, neutral ink actions and semantic status colours. Cards, controls, navigation and overlays have no depth shadows; buttons remain stationary on hover and press, with colour feedback and keyboard focus retained. Other palettes, corners and fonts remain configurable. Existing preset IDs and version 1 theme JSON are unchanged.

Paper removes ordinary card outlines and secondary-action frames, using spacing for grouping. Text inputs, selects and textareas use a single underline, including an error-coloured underline for invalid fields. Keyboard focus outlines and modal/popup edges remain visible. The redundant Mono style has been removed; imported version 1 themes with preset `mono` migrate to Paper while retaining their colours. Graphite remains a palette (`mono`), not a separate style. Paper defaults to Pure white (`paper`): white surfaces and neutral charcoal actions. Coral, Citrus, Mint and Violet add fresh accent choices; older Forest, Plum, Clay, Ink & cream, Ocean, Rose, Amber and Cobalt light palettes have cleaner grounds. All palettes have dark counterparts. Reapply a palette to refresh saved explicit colours; custom values are never silently recoloured. `paletteOptions[].preset` is a suggested material, not the palette's colour identity; use `applyPalette` or `createTheme` to resolve colours.

## Browsing indexed content

`ListDetail stickyNavigation` opts into a compact, sticky, independently scrollable navigation pane on desktop and a bounded navigation list above the detail on narrow viewports. Its default layout remains unchanged. Navigation-list styles are scoped to the actual nav items so buttons and lists inside arbitrary detail content keep their own presentation. Consumers still own selection and routing.

The workbench Components page composes this mode with category/search filters, a focused preview and a collapsible usage example. Exact-name searches open that component; the index can choose another matching result. Page and component query parameters support direct entry, bookmarking and browser history. Category/search updates replace the current component address rather than creating a history entry for each typed character. Browser history restores the selected component with cleared filters.

TeamMembers invite and role-save actions align with the bottom of their adjacent input/select. A role-save failure appears below the control row, preserves the selected draft and permits retry; changing the role clears that member's previous error.

Palette review: Iris and Lagoon retain their existing clean, distinct accents. Forest moves from grey-green to fresher green; Plum and Rose gain clearer violet/raspberry accents; Ocean becomes a cleaner cyan-blue. Clay's beige ground becomes pale peach, Amber's muted tan becomes a lighter warm ground, and Ink & cream loses its yellow-green cast. Cobalt retains its blue accent with a lighter ground. Dark counterparts retain their readable established colours; the four new accents and Pure white include matching dark values. These choices are visual direction, not claims of user preference research.

## Visual single selection

`VisualChoiceGroup` exports `VisualChoiceGroupProps` and `VisualChoiceOption`. It takes a `label`, controlled `value: string | null`, `onChange(value)` and `options` with unique stable `value`, `label`, decorative `preview`, optional `description`, `disabled` and translated `status`. Previews must be noninteractive; their contents are hidden from assistive technology. Labels and descriptions carry the accessible meaning. Use disabled/status together for generating or unavailable options. The group supports `hint`, `error`, `required`, `disabled` and an optional native form `name`. Generated names isolate multiple groups. Native radios provide form, Tab and Space semantics; shared arrow/Home/End handling keeps focus and selection consistent across browsers, including RTL and skipping disabled choices. The application owns options, selection, validation and asynchronous generation. There is no automatic selection or fallback when options change; retain the selected option or update the controlled value. `ThumbnailChoice` retains its existing independent-checkbox API.

```tsx
<VisualChoiceGroup
  label="Design"
  value={design}
  onChange={setDesign}
  options={[
    { value: 'lake', label: 'Lake', preview: <img src={lakeUrl} alt="" /> },
    { value: 'hello', label: 'Greeting', preview: <Text>Hello</Text> },
  ]}
/>
```

## Document preview

`DocumentPreview` exports `DocumentPreviewProps`, `DocumentPreviewPage`, `DocumentPreviewImage`, `DocumentImageResolution`, `DocumentImageResolutionIssue` and the `documentImageDpi` helper. Required props are `label`, positive finite `widthMm`/`heightMm`, nonempty `pages`, controlled `pageId`/`onPageChange` and translated `labels` (`page`, `zoom`, `fit`, `guides`). Each page has a unique `id`, `label` and `content`; Invalid dimensions or an empty `pages` list throw. A `pageId` that matches no page shows the first page, a safe area that doesn't fit hides the safe-area guide, and a negative or non-finite bleed is ignored; each logs a development warning instead of crashing the screen. Page content unmounts on side changes: keep editable state in the application.

The preview owns fit/50/100/150/200-percent zoom and optional guide visibility. Fit shrinks oversized pages to the viewport without enlarging smaller pages. Fixed physical dimensions use CSS's reference conversion of 96 pixels per inch; 100% is not a calibrated physical measurement on the user's screen. Zoom scrolls inside a keyboard-focusable region. A ResizeObserver refits after resizing; it disconnects on unmount. Page geometry is retained on narrow screens; explicit Grid column counts inside document content do not collapse with the surrounding UI. Other responsive components may still depend on the browser viewport, so use simple composition for fixed documents.

Pages default to `padding="standard"` (8mm inside the trim); `padding="none"` fills the trimmed page and `padding="bleed"` fills the page and its bleed for edge-to-edge artwork. A single direct image fills the available page area with contain-fit, preserving the whole image. White paper and neutral ink remain fixed in dark mode, while the toolbar follows the surrounding theme. Pages inherit provider direction, with optional per-page `direction` overrides. `safeAreaMm` enables a labelled guide toggle; the inset is measured from the trim, must be nonnegative and less than half the shorter dimension. Guides are decorative and are hidden initially.

### Bleed and trim marks

`bleedMm` adds that much artwork beyond each trimmed edge. `widthMm`/`heightMm` stay the trimmed (finished) size, which the caption keeps showing; the sheet grows to `widthMm + 2 × bleedMm` by `heightMm + 2 × bleedMm` and fit/zoom measure the whole sheet. Bleed alone also enables the guide toggle. With guides on, the bleed is tinted, the trim edge is outlined, crop marks extend each trim edge through the bleed at all four corners and the safe area sits `safeAreaMm` inside the trim. A single direct image on a `padding="bleed"` page uses cover-fit, cropping rather than leaving white edges. Pages with `standard` or `none` padding stay on the trimmed page, so mailing faces and text are unaffected by bleed. Common postcard bleed is 2–3 mm; check the printer's specification.

### Image resolution warning

List the raster images on a page as `images: { label, widthPx, heightPx, widthMm?, heightMm? }[]`. Pixel sizes come from the application, for example an upload's `naturalWidth`/`naturalHeight`; zero or unknown sizes are skipped until known. Printed size defaults to the whole sheet including bleed, which matches full-bleed artwork. Supply `imageResolution: { title, describe, minimumDpi? }` to check them: images on the shown page whose effective density is below `minimumDpi` (default 300) appear in a warning alert between the toolbar and the page, one translated `describe({ label, dpi, minimumDpi })` line each. Without `imageResolution` no check runs. `documentImageDpi(image, widthMm, heightMm)` returns the same rounded-down density for applications that want to block export; it uses the lower of the two axes, which is what a cover-fit image prints at. The warning is advisory and does not detect upscaled or compressed source files.

```tsx
<DocumentPreview
  label="Postcard preview"
  widthMm={148}
  heightMm={105}
  safeAreaMm={5}
  bleedMm={3}
  imageResolution={{
    title: 'Image may print blurry',
    describe: ({ label, dpi, minimumDpi }) => `${label}: ${dpi} dpi (needs ${minimumDpi})`,
  }}
  pageId={side}
  onPageChange={setSide}
  labels={{ page: 'Side', zoom: 'Zoom', fit: 'Fit to view', guides: 'Show print guides' }}
  pages={[
    {
      id: 'front',
      label: 'Front',
      padding: 'bleed',
      content: <img src={artwork.src} alt="Lake" />,
      images: [{ label: 'Lake photo', widthPx: artwork.width, heightPx: artwork.height }],
    },
    { id: 'back', label: 'Back', content: <Text>{message}</Text> },
  ]}
/>
```

This is a screen-proofing surface, not a print renderer. Overflowing document content is clipped to the page. Applications own text-fit validation, the printer's bleed and resolution requirements, asset loading/errors, export composition and PDF/print delivery. Guides and the resolution warning alone do not establish print readiness. Postcard templates, addresses and personalisation rules stay in the consumer. Open **Postcard studio** in the Components catalog (`?page=components&component=postcard-studio`) for a local template/message/recipient/front/back example. AI generation and printing are not connected.

## Address fields

`AddressFields` exports `AddressFieldsProps`, `AddressValue`, `AddressFieldKey`, `AddressFieldConfig` and `AddressCountryOption`. It is a controlled, named fieldset composed from shared Field/Input/Select controls. `AddressValue` contains string keys `recipient`, `addressLine1`, `addressLine2`, `locality`, `region`, `postalCode` and `countryCode`. Those original keys are present, including empty strings for unused data. Optional `dependentLocality` supports a village or locality below post-town level, with `address-level3` autocomplete; existing values need no migration. Country values are stable application-supplied codes; labels come from `countries: { value, label, disabled? }[]`. No country catalogue, postal rules or address lookup service is bundled.

Supply `label`, `value`, `onChange(nextValue, changedField)`, `fields` and `countries`. `fields` is an ordered list of unique `{ key, label, hint?, placeholder?, required?, inputMode? }` entries. Consumers can change field order, labels, visibility and requiredness when the country changes. Recipient and street lines take a full row; remaining controls wrap into columns according to available space. Omitted fields retain their controlled values but are absent from native form submission. Country changes never clear, transform or validate other fields. Applications decide whether retained hidden values belong in a rendered/exported address.

`errors` maps field keys to application-owned translated messages. These are associated with the inputs alongside field hints through the existing Field contract. `onBlur(field)` supports application validation timing; `disabled` disables the complete fieldset. Group `hint` is associated with the legend/fieldset. Labels, hints, country display names, required flags and validation messages belong to the consumer. Native `required` flags are supported without imposing country-specific formats; postal codes remain text to preserve letters and leading zeroes. No trimming or normalisation occurs in AddressFields. Field `inputMode` accepts text/numeric keyboard hints; the underlying control remains text.

`namePrefix` gives native form names such as `recipient.addressLine1`; otherwise a generated prefix isolates groups. IDs and autocomplete sections are unique per instance and stable across server rendering/hydration. `autoComplete="shipping"` or `"billing"` groups the standard name/address/country autocomplete tokens; omit it for an unqualified address section or use `"off"`. Actual browser autofill depends on the browser and saved user data. A country placeholder uses the configured field `placeholder`, falling back to the field label. An unknown controlled country code is displayed as a disabled option, preserving the supplied value rather than appearing to select another country. Applications must validate membership in their allowed country list.

```tsx
const [address, setAddress] = useState<AddressValue>({
  recipient: '',
  addressLine1: '',
  addressLine2: '',
  locality: '',
  region: '',
  postalCode: '',
  countryCode: 'GB',
});

<AddressFields
  label="Recipient address"
  value={address}
  onChange={setAddress}
  namePrefix="recipient"
  autoComplete="shipping"
  countries={[
    { value: 'GB', label: 'United Kingdom' },
    { value: 'FR', label: 'France' },
  ]}
  fields={[
    { key: 'countryCode', label: 'Country', placeholder: 'Choose a country', required: true },
    { key: 'recipient', label: 'Recipient name', required: true },
    { key: 'addressLine1', label: 'Address line 1', required: true },
    { key: 'addressLine2', label: 'Address line 2' },
    { key: 'locality', label: 'Town or city', required: true },
    { key: 'postalCode', label: 'Postcode', required: true },
  ]}
/>;
```

The Postcard studio example defaults to Hungary and supplies Hungary/UK configurations, basic postcode-format feedback and its own preview formatting. See the country policy below. This is not a complete international postal-address policy. Applications own address verification, storage, permitted countries, formatting, country-change policy and personal-data handling. Existing consumer APIs are unchanged.

### Hungary and UK postcard addressing

The playground owns these policies in `apps/playground/src/postcard-address.ts`; they are not built-in country rules in AddressFields. Hungary is the initial destination and posting country, with Hungary first in both selectors. A single full-name field preserves the entered name order and accented letters.

- **Hungary:** numeric keyboard hint for the text postcode control; four-digit syntax check; settlement, street name/type and house number, plus optional building/staircase/floor/door details. The preview renders recipient, capitalised settlement, street/details and postcode on separate lines, following [Magyar Posta's domestic addressing order](https://www.posta.hu/static/internet/download/Correct_addressing_of_letter-mail_items.pdf) and the [UPU Hungary address sheet](https://www.upu.int/UPU/media/upu/PostalEntitiesFiles/addressingUnit/hunEn.pdf).
- **UK:** optional flat/sub-building above the building/street, optional dependent locality, capitalised post town and postcode on its own line. Counties are omitted. The application accepts basic postcode shapes (including GIR 0AA), lower case and missing spaces, and renders an uppercase postcode with one space before the final three characters. The original input value is retained. See the [UPU UK address sheet](https://www.upu.int/UPU/media/upu/PostalEntitiesFiles/addressingUnit/gbrEn.pdf) and [Royal Mail's clear-addressing guide](https://www.royalmailtechnical.com/rmt_docs/User_Guides_2024/Guide_For_Clear_Addressing_20240402.pdf).

**Posting from** controls the country line: domestic mail omits it; UK-to-Hungary adds HUNGARY; Hungary-to-UK adds EGYESÜLT KIRÁLYSÁG / UNITED KINGDOM. The latter includes the Hungarian and English country names described in Magyar Posta's international guidance, while retaining the destination's UK line layout. Country changes preserve entered details and revalidate the active postcode format after the user has requested a check. They do not replace user data with country-specific sample details.

This first policy covers ordinary geographical addresses. Postcode shape checks do not confirm an allocated postcode, its match to the settlement/street or deliverability. Full international formats, PO-box/poste-restante workflows, exceptional address structures and carrier-specific machine-readable print areas require application work. The screen preview does not establish print suitability.

AddressFields shares label, hint, control and error rows between adjacent fields so optional guidance, wrapped labels and validation messages do not shift neighbouring input positions. Country selection takes a full row. DocumentPreview uses the shared Field, Select and Checkbox primitives, including the current theme/density and select chevron; its guide checkbox aligns with the select controls.

## Two-panel document spreads and card formats

`DocumentSpread` exports `DocumentSpreadProps` and `DocumentSpreadPanel`. Supply an accessible `label` and a `panels` tuple containing exactly two `{ label, content }` objects. Each panel is a named section in reading order, occupies half the spread and has 8mm internal padding. Both columns remain fixed on narrow screens; place the spread in a `DocumentPreview` page with `padding="none"` and let the preview fit/zoom the complete sheet. Optional `showFold` draws a decorative centre guide; it defaults to false. Panels follow logical reading order in the surrounding document direction. Their content clips within the panel. The component owns presentation, not print imposition, fold policy or card content.

Postcard studio offers **Flat card** and **Folded card** through the shared Select. **Mailing method** is a separate choice for flat cards: direct mail puts the message and recipient address on the back, while an enveloped flat card has a message-only back and puts its address exclusively on the envelope. Folded cards always use an envelope in this example. **Card orientation** selects landscape (148 × 105 mm) or portrait (105 × 148 mm) for both formats. Folded cards have a cover and back cover at the selected closed size, and an **Inside (open spread)** at 296 × 105 mm in landscape or 210 × 148 mm in portrait. Both orientations open side by side with a central vertical fold. The left message is optional; the main message occupies the right panel. The back-cover text is editable. The fold line is an illustrative guide in the inside preview.

For either card format, envelope recipient details belong to a separate **Envelope address** draft and a separate 162 × 114 mm **Envelope preview**. They never appear on an enveloped card's front, back or inside. Both address drafts use the same Hungary/UK field and formatting policy; switching formats or mailing methods retains the direct-mail/envelope drafts, both inside messages, artwork choice and back-cover text. The flat-card mailing preference is retained while using the folded format. Format changes reset the selected card surface to Front/Cover to keep the controlled page ID valid. Card and envelope previews have independent zoom/guide state. Orientation changes preserve the selected surface, text, artwork and address drafts; the envelope remains a separate 162 × 114 mm landscape specimen. All document content is application-owned.

The example envelope size and recipient position demonstrate composition only. Actual duplex outside/inside print spreads, print/PDF output, paper/printer margins, envelope positioning and production checks remain future application work. No print/export capability is implied by these screen previews.

The format/mailing distinction follows the physical examples in [VistaPrint UK's note-card guide](https://www.vistaprint.co.uk/stationery/note-cards), which offers both flat and folded cards with optional envelopes. Postal layout guidance distinguishes the addressed outer envelope from the directly addressed postcard; see [Magyar Posta's postcard and envelope diagrams](https://www.posta.hu/static/internet/download/Correct_addressing_of_letter-mail_items.pdf). These sources inform the consumer example, not an automatic postal-production validation claim.

## Postal mailing faces

`MailFace` exports `MailFaceProps`. It composes a `variant="postcard" | "envelope"` mailing face inside a zero-padding DocumentPreview page. Required props are an accessible `label`, `postageLabel` and `recipient: { label, content }`. Optional `message: { label, content }` renders only for postcards; envelope variants omit the message and divider even if a message was supplied. Optional `sender: { label, content }` occupies the upper-left area, moving the postcard message below it when present. Each supplied content area is a named section; divider and postage placeholder are decorative. The placeholder represents reserved space, not paid postage or an actual stamp.

Optional `postmark` is a decorative node, usually a `Postmark`, laid over the postage corner and hidden from assistive technology. `Postmark` (exports `PostmarkProps`) draws an ink ring with `place`, a pre-formatted `date` and optional `detail`, plus wavy cancellation lines (`cancellation`, default true) and a slight `tilt` (default true). Format the date with `useFormat` for the current locale. Outside a MailFace it uses the theme's muted ink; inside it uses the mailing face's fixed print grey. It never represents real postage or a postal service mark.

Physical positions remain fixed under RTL: postage upper right, recipient lower right, optional sender upper left. Slot text uses automatic direction. Direct postcards place the message to the left of a central divider and the address to the right. The mailing face leaves 15mm at the right and at least 15mm along the bottom; the recipient ends 20mm above the bottom. Postage is an illustrative 24 × 28 mm box, inset 8mm from the top. Address slots use regular 10pt Arial/Helvetica text and consistent line spacing on white paper, independent of the UI theme. Long content is clipped within its reserved region: applications must validate fit before production.

These positions reflect [Magyar Posta's postcard diagram and blank-bottom-strip guidance](https://www.posta.hu/static/internet/download/Correct_addressing_of_letter-mail_items.pdf) and [Royal Mail's upper-right postage area](https://www.royalmailtechnical.com/rmt_docs/User_Guides_2024/Guide_For_Clear_Addressing_20240402.pdf). This visual layout does not implement every carrier/product specification. Applications own formatting, actual postage, sender/recipient data, address/asset validation and final print-area compliance.

Postcard studio uses MailFace for directly mailed postcard backs and outer envelope fronts, in either card orientation. Enveloped cards retain their message-only surface with no mailing face; the sender slot is populated by the shared Sender / return address fields. Envelope recipient placement now uses the lower-right address region rather than a generic half-page panel.

Postcard studio provides one **Sender / return address** draft, preserved across both card formats, orientations and mailing methods. It reuses AddressFields and the Hungarian/UK policy with a Sender name label. The existing **Posting from** selector is the sender country source of truth; the sender field group omits a duplicate country control. Changing that country preserves entered values and changes the field labels/postcode validation. **Check address fields** checks both sender and active recipient fields. Sender and recipient state, form names and autocomplete sections remain independent.

Direct postcards show the sender upper left above the message; envelopes show the sender upper left opposite the postage space. Enveloped cards keep both sender and recipient details off the card's artwork/message/inside/back. Sender names and address lines are regular text, with a country line when sender and destination countries differ. For this return address, formatting uses the recipient country as the reference country, rather than treating it as another outbound recipient. No address lookup, storage or postal verification is configured.

ListDetail items now accept optional `group` text. Grouped items render under named category lists and level-two headings; entries without groups keep the existing flat-list presentation. Groups follow their first occurrence in the supplied items, so consumers own category ordering. Descriptions remain optional. Selection, callbacks and detail content keep their existing contract.

With stickyNavigation, the navigation's maximum height follows its actual viewport position on page scroll, resize and pane-size changes. It leaves bottom padding so the final item and focus outline remain reachable. Narrow screens retain the bounded navigation pane above the detail. The workbench groups its component index by category, puts Foundations and Layout first, and retains search, category filtering, keyboard selection and direct-link/history behavior.

`ListDetail collapsibleGroups` opts grouped navigation into disclosure controls. It defaults to false, preserving existing grouped and flat consumers. With it enabled, categories start collapsed except for the selected item's group. Unselected categories can be opened/closed independently by mouse, Enter or Space; each toggle exposes aria-expanded/aria-controls. The selected category is always open and its toggle is aria-disabled (focusable, with no collapse action). A controlled selection change, search result or direct link opens the relevant category immediately. By default, manual expansion choices remain in memory while the component is mounted, including through filtering; applications may control them as described below. Ungrouped entries remain directly visible. The Components catalog enables this option. Group titles render as `h2` by default; set `groupHeadingLevel` (2–6) to fit the surrounding page outline.

ListDetail also accepts controlled `expandedGroups?: readonly string[]` and `onExpandedGroupsChange(groups)` for application-owned preferences. These represent manual expansion choices; the selected item's group is still forced open even when absent from the controlled array. Without controlled props, expansion remains local component state. The shared component never reads or writes browser storage.

The playground saves manual category expansion in `localStorage` under `gregui.catalog.groups.v1` as `{ version: 1, expandedGroups: string[] }`. It restores valid preferences when mounting/refreshing and writes only when the user toggles a category. Missing, malformed or unsupported values fall back to collapsed groups plus the selected category. Unknown group names have no visible effect. If storage reads/writes fail, the catalog remains usable with session state. Selected-category visibility never overwrites a saved manual collapse choice. Preferences are local to the browser origin and are not account/device-synchronised.

## Calendar dates

`CalendarMonth` and `DatePicker` work with plain `YYYY-MM-DD` strings (`CalendarDate`) and `YYYY-MM` months. No time zone is applied, so a date never shifts a day when it crosses the server. The helpers `addDays`, `addMonths` (clamps 31 Jan + 1 month to the end of February), `isCalendarDate` and `todayDate` (the browser's local date) are exported.

```tsx
<DatePicker
  label="Arrives by"
  value={date}
  onChange={setDate}
  name="arrival"
  min={earliestDelivery}
  isDateUnavailable={(d) => postalHolidays[d] ?? (isSunday(d) && 'No deliveries on Sundays')}
/>
```

- `isDateUnavailable(date)` returns a short, translated reason or nothing. Blocked dates stay focusable, are announced with their reason and are shown hatched; selecting them does nothing. Dates outside `min`/`max` are only muted and use the `dateBeforeMin`/`dateAfterMax` messages.
- `CalendarMonth` is controlled by `month`/`onMonthChange` and `value`/`onSelect`. Keyboard: arrows move by day and week, Page Up/Down by month (with Shift by year), Home/End to the week edges. Moving past the month edge calls `onMonthChange`. `renderDay(date)` adds short content (for example a birthday) inside a day; keep it to one word or a badge.
- `weekStartsOn` is 1 (Monday) by default; pass 0 for Sunday. `today` can be fixed for tests and server rendering.
- `DatePicker` opens the grid in a popover, focuses the current or selected date, closes on selection or Escape and returns focus to the field. `name` adds a hidden input so native forms post the ISO date.
- New locale messages: `chooseDate`, `previousMonth`, `nextMonth`, `dateBeforeMin`, `dateAfterMax`. Apps providing a complete `Messages` object must add them.
- Holiday calendars, collection days and print cut-offs are application policy; the components only display them.

### Events, yearly repeats and the agenda

A `CalendarEvent` is `{ id, date, title, repeat?: 'yearly', until? }`. Store the first occurrence as `date` (for a birthday, the birth date); `repeat: 'yearly'` repeats it on the same day every year from then on, up to `until` if set. Extend the type with your own fields (`interface Occasion extends CalendarEvent { kind: 'birthday' }`); the components pass your objects back unchanged.

```tsx
const occasions = [
  { id: 'anna', title: "Anna's birthday", date: '1994-12-12', repeat: 'yearly' },
  { id: 'card', title: 'Post the card', date: '2026-12-10' },
];

<CalendarMonth label="Send date" month={month} onMonthChange={setMonth} events={occasions} />
<CalendarAgenda
  label="Coming up"
  events={occasions}
  days={45}
  onSelect={({ event, date }) => openOccasion(event.id, date)}
  renderDetail={({ years }) => `Turns ${years}`}
/>
```

- `occurrencesBetween(events, from, to)` returns `{ event, date, years }` for every occurrence in the inclusive range, sorted by date and then input order. `years` counts whole years since `event.date` (32 on a 32nd birthday, 0 on the first occurrence). Repeats never appear before `event.date`.
- 29 February falls on 28 February in common years. Pass `leapDay: 'mar1'` (to `occurrencesBetween`, `CalendarMonth`, `DatePicker` or `CalendarAgenda`) for 1 March. `yearlyDate(date, year, leapDay)` gives the single date for a year. `daysBetween(from, to)` counts whole days.
- `CalendarMonth events` (and `DatePicker events`) shows the first title in each day with a `+N` count for more. All titles are added to the day button's description, after any blocked-date reason. `renderDay` still works alongside it.
- `CalendarAgenda` shows `days` days (default 30) from `from` (default `today`). It is a labelled region with a heading (`headingLevel`, default 2) and an ordered list of days; each day has the next heading level, a `<time>` element, the full date and a relative label from `Intl.RelativeTimeFormat` ("today", "tomorrow", "in 5 days"). Yearly entries show the `repeatsYearly` message. Empty ranges show `emptyMessage` or `agendaEmpty`.
- With `onSelect`, entries are buttons described by their date. The list is one tab stop; Arrow Up/Down move between entries across days and Home/End jump to the first and last. Without `onSelect` entries are plain text.
- New locale messages: `repeatsYearly`, `agendaEmpty`. Apps providing a complete `Messages` object must add them.
- Recurrence beyond yearly (weekly, monthly, "last Friday"), time zones and reminders are application concerns.

## People, keys and hidden text

- `Avatar` shows a person as `src` or, while the image is missing or fails, initials from the first and last words of `name` (so `Vizvári Gergely` → VG), upper-cased in the provider locale. `size` is small/medium/large. `status` (`online`, `away`, `busy`, `offline`) draws a presence marker with its own shape — filled, ring with a dot, bar, hollow ring — and appends the localized status to the accessible name (`Alex Morgan, away`). Use `decorative` when the name is already shown beside the avatar. The application owns images, presence and any link around the avatar.
- `AvatarGroup` overlaps `people` (`{ id, name, src? }`) in a named `group`; past `max` the remainder becomes a `+N` item announced with the `morePeople` message.
- `Kbd` marks up a key (`<Kbd>/</Kbd>`) or a combination (`<Kbd keys={['Ctrl', 'K']} />`, one nested `<kbd>` per key). It is visual; the application owns key bindings.
- `VisuallyHidden` keeps text for assistive technology only, such as the unit after a count.
- `SkipLink` is hidden until focused and jumps to `href` (`#id` of main content that accepts focus). `AppShell` already renders one; use it in custom layouts.
- New locale messages: `statusOnline`, `statusAway`, `statusBusy`, `statusOffline`, `morePeople`. Apps providing a complete `Messages` object must add them.

## Segmented control, slider and number field

- `SegmentedControl` is one choice among two to five short options (`{ value, label, icon?, disabled? }`), such as List/Grid or Day/Week/Month. It renders native radio inputs in a `fieldset` named by the required `label`; `hideLabel` keeps that name for assistive technology only. Controlled `value`/`onValueChange` or uncontrolled `defaultValue` (default: the first enabled option). Tab enters at the selected segment; Arrow keys move and select, skipping disabled options and wrapping; Home/End jump to the ends; Left/Right are reversed in RTL. `icon` takes an `IconSource` and is decorative: every option keeps its text label. `hint` and `error` describe the group, `disabled` disables all options, `size="small"` uses the small button height and `fullWidth` stretches equal segments. The selected segment is filled and bold; in forced colours it is outlined and underlined, so selection does not rely on colour alone. Height follows density, with 44px targets on coarse pointers.
- `Slider` is a styled native `<input type="range">` with `min` (0), `max` (100), `step` (1), controlled `value`/`onValueChange` or `defaultValue` (default `min`), `hint`, `error`, `required` and `disabled`. The value is formatted with `useFormat().number(value, formatOptions)`, shown beside the label (`hideValue` hides it visually) and announced through `aria-valuetext`. Optional `marks` (`{ value, label? }`) are visual reference points under the track; the mark at the current value adds its label to the announced text (`£50, Standard`). Marks do not restrict values; use `step`. The fill and marks mirror in RTL. A two-thumb range slider is not provided; use two Sliders or NumberFields for a start/end pair.
- `NumberField` is a text input with `inputMode="decimal"` and locale-aware parsing: it accepts the provider locale's decimal and grouping separators (en-GB `1,234.5`; hu-HU `1 234,5`, with a full stop also accepted as the decimal mark), currency/percent/unit affixes from `formatOptions`, and Unicode minus signs. Typed text is never rewritten while typing; on blur valid text is normalised to the display format and the value follows the formatted precision (for example two decimals for currency). `onValueChange` receives the parsed number while typing, or `null` for empty or unparsable text. Values outside `min`/`max` are reported as typed; after the first blur the field shows the `numberTooLow`/`numberTooHigh` (or `numberInvalid`) message, which an application `error` replaces. ArrowUp/ArrowDown and the decrement/increment buttons change by `step` (default 1, or 0.01 for percent), PageUp/PageDown by `largeStep` (default ten steps); stepping clamps to the range and starts from `min` (or 0) when empty. The buttons are outside the tab order (the keys do the same), are named by `numberDecrease`/`numberIncrease`, point at the input with `aria-controls` and disable at the limits. `formatOptions` sets currency, percent (`0.25` shows as `25%`) or unit display. `name` submits the unformatted number through a hidden input.
- New locale messages: `numberIncrease`, `numberDecrease`, `numberInvalid`, `numberTooLow`, `numberTooHigh`. The range messages contain `{min}`/`{max}` placeholders that are replaced with the formatted limit. Apps providing a complete `Messages` object must add them.
- `Icon` gains `minus` (`iconNames` lists 50).
