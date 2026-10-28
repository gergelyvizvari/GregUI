# Component contracts

All public exports are typed in `packages/react/src/index.tsx`; generated declarations ship with the package. The workbench's Components page provides live states and usage snippets. Public components omit `className` and `style` from their APIs.

## Composition

- `ThemeProvider`: scopes variables and the selected preset/mode. Nested providers inherit the current theme unless explicitly overridden. Portal components copy theme and locale into their portal root.
- `LocaleProvider`: locale, direction, time zone and replaceable package-owned messages. Supply translated application labels/content yourself. `useFormat` formats numbers/dates and selects plural categories; applications supply plural message forms.
- `Stack`, `Inline`, `Grid`: token-based gaps 0–8. Grid accepts 1–5 columns or `columns="auto"` (width-aware cards with a 15rem minimum) and collapses on small viewports. `Inline` wraps; do not depend on fixed text lengths.
- `Split`, `Container`, `Card`, `Section`, `PageHeader`, `AppShell`: shared responsive composition. AppShell renders a skip link, desktop navigation and a modal navigation drawer on small screens. It does not own routing.
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
- `Breadcrumbs`, `NavItem`, `Link`: apps supply navigation destinations or callbacks. No router dependency.

## Feedback and data

- `Alert` is static unless `live` is requested; danger uses alert semantics, other live alerts use polite status. `Status` is a persistent polite live region.
- `Progress` has a visible label; `Spinner` and `Skeleton` have accessible loading names and honor reduced motion. Skeleton is static.
- `Badge` always includes text; status meaning is not color-only.
- `Table` includes caption, column headers and first-column row headers inside a named scroll region. It deliberately has no sorting, pagination or virtualization.
- `DescriptionList`, `EmptyState`, `CodeBlock`, `Divider` provide content structure without application styling. `CodeBlock wrap` preserves whitespace while wrapping long lines and unbroken strings to the available width; the default retains horizontal scrolling.

## Theme editing

`ColorControl`, `Swatch`, `PresetOption`, `PreviewStage` and `Metric` support preview/documentation interfaces. They belong to the shared package so workbench apps need no custom CSS. Keep the editor controls under a stable provider; put only the edited preview under the draft theme.

`PresetOption` accepts a light/dark `mode` and displays a decorative specimen using that preset's default tokens. Optional `palette` previews the consumer’s selected palette without changing its other preferences. `PreviewComposition` stacks children by default and creates two columns when its container is at least 600px wide. `PreviewStage showcase` adds a stronger decorative backdrop: place all text and controls inside opaque Cards or Alerts when using it. Use the default stage for uncontained content.

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

Container supports `size="page"` (default, 1200px), `size="form"` (42rem) or `size="reading"` (72ch) and `inset={false}` for an already padded parent. The original default padding and page size remain unchanged. Use form width for single-column forms and page width for tables; neither forces a minimum viewport width.

## Editorial application surfaces

AppShell accepts opt-in `appearance="editorial"` (horizontal desktop masthead) or `"dashboard"` (wider operational sidebar), plus a decorative `brandMark` node. Default styling is unchanged. `PulseMark` is an optional decorative identity mark. `FeaturePanel` accepts `image`, `imageAlt` and copy children, with an opaque copy panel and responsive image column. `MediaCard` accepts the same props for image-led articles. Apps supply meaningful image descriptions (or empty alt for decorative stock), attribution and domain copy. These components use existing theme roles in both modes.

FeaturePanel `variant="immersive"` places an opaque theme-text-colored copy panel inside a full photographic frame; the default split variant is unchanged. EditorialLead pairs a feature with supporting content and collapses responsively. SignalCard marks concise updates; ChipLink supports native links and active state. AccentLink accepts a `palette: {background, text}` six-digit hex pair and rejects contrast below 4.5:1; it is an explicit action palette, separate from the theme primary role used for text links. No arbitrary styles are accepted.

Dashboard sidebars stay within the dynamic viewport and scroll independently when navigation is long. Navigation items respect density padding while retaining a 44px minimum target. Compose compact navigation groups with Stack gaps; a labelled field beside an action uses Inline align="end" when there is no hint/error beneath the control.

## Field editing

`FieldEditorItem` is a controlled disclosure for schema builders. It keeps the edit action at the edge, with name/type control slots in two columns (one on mobile). Put shared help in `hint`, below both controls, rather than above one input. Consumers own field data, validation, translated labels and footer actions. Inactive editor content unmounts: hoist persisted drafts.

`TagInput` takes controlled `value: string[]` and `onChange`, plus consumer-owned `label`, `inputLabel`, `addLabel`, and `removeLabel(value)`. Enter or Add trims and adds one unique value; comma-containing values remain intact. Removal is part of each pill, supports keyboard focus continuity, and never detaches on wrap. Long labels wrap; coarse-pointer removal targets are at least 44px. `disabled` disables both addition and removal.

`TagInput size="small"` uses compact 12px tokens with 24px removal buttons on desktop; the default `medium` preserves the original sizing. Both retain 44px removal targets on coarse pointers. Size affects tokens, not entry fields.

`HighlightedTextarea` provides native plain-text selection, paste, undo and resizing with a decorative bold layer for exact, case-sensitive whole-word `highlights`. Props include `label`, controlled `value`, `onValueChange`, `highlights`, `hint`, `error` and native textarea props (without class/style). It uses monospace text so bold emphasis preserves glyph alignment. The mirror is hidden from assistive technology; forced-colors mode uses native text. Domain-specific transformations belong in the consumer.

## Appearance preferences

`ThemeSelector` accepts a controlled `ThemeSelection` (`preset`, `palette`, `mode`), `onChange`, required consumer-translated `labels` (`style`, `palette`, `mode`, `light`, `dark`), and optional `disabled`. It exposes all fifteen built-in styles and sixteen palettes with light/dark mode through labelled native selects; changing one preference preserves the other two. The three-column layout collapses on mobile. Style and palette names are gregUI identifiers/display names. Consumers apply the selection with `createTheme(preset, mode, palette)` and own persistence, density and validation of stored values. The Components catalog includes an isolated live preview. This is an additive API; existing consumers need no migration.

`Dialog size="large"` provides a bounded 1040px desktop workflow surface, scrolling body and fixed header/footer. The default medium size is unchanged.

`ThumbnailChoice` is a whole-card native checkbox with an optional image `src`, text `preview`, `label` and `detail`. Consumers own image fetching and checked state. Images use contain-fit to preserve the full image.

`ImageRegion compact` bounds read-only, unannotated previews to 200px high without cropping. Editable or annotated images retain their natural geometry.

Disclosure controls use + when collapsed and − when expanded. `FieldEditorItem` retains `editLabel` and `closeLabel` for accessible button names.

Action icons: `Icon` supports `edit`, `save` and `plus`. `IconButton` uses its required accessible label as the default hover title; retain text for actions whose scope needs explanation.

Joyful, Professional, Clay and Neumorphic provide distinct material treatments across cards, controls, tabs and navigation. Neumorphic uses a single shared background/surface plane, opposing raised shadows and inset input/pressed-control shadows; palette recognition and light/dark switching preserve that material. Essential text remains on opaque surfaces, and keyboard focus outlines are retained.

The appearance catalogue now features Paper, Workspace, Bloom, Clay, Neumorphic, Glass and Flat (`featuredPresets`). Legacy preset IDs remain valid for saved themes, but are omitted from new-choice cards. `recommendedPalettes` provides coordinated defaults; consumers can use these when selecting a complete visual direction. Workspace uses an ink navigation rail and restrained Iris surfaces; Bloom uses a warm navigation rail and Lagoon surfaces. ThemeSelector retains a saved legacy value as an explicit option.

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

The workbench uses this component for **Edit theme** on Components, Typography & pages, Patterns, Authentication and Foundations. The inspector shares controls, import/export, contrast guards, current theme and Undo history with Theme studio. It offers all fifteen styles, sixteen palettes, modes, density, corners, typography, motion and eleven semantic colours, plus an expandable contrast report. Editor surfaces retain the stable workbench theme while previews update live. Closing keeps changes in the session; Save draft explicitly writes local browser storage. Navigation closes the inspector and keeps the edited theme. Theme studio and Overview retain their inline editors.

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
