# gregUI guide for AI contributors and consumers

Read this alongside the repository's [AGENTS.md](../AGENTS.md). This guide describes implemented capabilities as reviewed on 28 October 2026. It is not a promise that proposed features exist.

## Start here

Building an app in a specific style? Read its guide in [styles](styles/README.md), or the DESIGN.md exported from the workbench for a custom theme.

1. Read [README](../README.md) and [component contracts](COMPONENTS.md). For library changes, also read [contributing](CONTRIBUTING.md).
2. Find the relevant implementation using the map below. Confirm props and exports in source before writing usage; do not infer APIs from another UI library.
3. Read the matching tests and existing consumer examples. [Expanded components](EXPANDED-COMPONENTS.md) and [authentication](AUTHENTICATION.md) explain specialised contracts.
4. Make the smallest reusable change, then run the checks appropriate to its behaviour. Record executed verification and gaps in [VERIFICATION.md](VERIFICATION.md).

For a portable agent skill, use [gregui-development](../skills/gregui-development/SKILL.md). For possible future work, see [component development candidates](COMPONENT-ROADMAP.md); those proposals are not current APIs.

## Source of truth and ownership

Public exports and their source types describe the current API. Package manifests describe installable entry points. Generated `dist/index.d.ts` describes the last build and can be stale until rebuilt. Tests demonstrate specific checked behaviour; their existence does not prove that they passed in the current checkout. If prose and source disagree, report and reconcile the mismatch rather than inventing a workaround.

| Concern                                                                                      | Owner and entry point                                       |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Theme schema, semantic roles, presets, palettes, parsing, contrast and exports               | `packages/tokens/src/index.ts`                              |
| Locale, direction, package messages and formatting                                           | `packages/localization/src/index.tsx`                       |
| Public React exports (primitives live in the modules beside it)                              | `packages/react/src/index.tsx`                              |
| All shared component CSS, responsive rules and material treatments                           | `packages/react/src/styles.css`                             |
| Domain state, application copy, routing, validation, permissions and network/storage effects | Consumer application                                        |
| Workbench and public usage examples                                                          | `apps/playground/src/` and `examples/consumer/src/main.tsx` |
| Package entry points and peer dependencies                                                   | Each package's `package.json`                               |

Applications import `@gregui/react`, `@gregui/tokens` and, when needed, `@gregui/localization`. Import `@gregui/react/styles.css` once. React and React DOM 19 are peers. Packages ship ESM and declarations; there is no public deep-import API for individual source modules.

Keep presentation in `packages/react` or `packages/tokens`. Consumer code must not add CSS, arbitrary `style`/`className`, styling-library imports or private source imports. Use typed layout/variant props. If composition is insufficient, extend the smallest shared capability. Business-specific labels and rules remain in consumers even when a shared pattern owns pending/error feedback.

## Workbench navigation

Typography & pages (`?page=typography`) is the direct destination for Text styles, Reading content, Page elements and Type scale. Components (`?page=components`) uses category/search filters and an index grouped under collapsible category headings, with the selected category kept open with one selected preview. A stable `component` query value, such as `team-members`, opens a specific example. Usage snippets are collapsed under Usage example. The workbench retains theme/history while navigating in the same session; a URL is navigation state, not an automatically saved theme.

## Find an existing capability

Paths below are relative to `packages/react/src/`. All listed components are exported through `index.tsx`; never import a module directly from an app.

| Need                                                   | Existing exports                                                                                                                                                            | Implementation                                                                              |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Layout and page structure                              | Stack, Inline, Grid, Split, Container, Card, Section, PageHeader, AppShell                                                                                                  | `layout.tsx`; `shell.tsx`                                                                   |
| Text, actions, fields and feedback                     | Text, Heading, Prose, Button, IconButton, Field, Input, TextField, Textarea, Select, Checkbox, Switch, RadioGroup, Alert, Status, ErrorSummary, Progress, Spinner, Skeleton | `typography.tsx`, `buttons.tsx`, `forms.tsx`, `feedback.tsx`                                |
| Dialogs and navigation                                 | Dialog, Drawer, FullscreenDialog, FloatingPanel, ConfirmDialog, DialogClose, Popover, Tooltip, Tabs, Breadcrumbs, NavItem, SideNav, Menu, Link                              | `overlays.tsx`; `navigation.tsx`, `side-nav.tsx`, `menu.tsx`, `shell.tsx`, `typography.tsx` |
| Basic and interactive data                             | Table, DescriptionList; DataTable, TreeView, Timeline, SearchFilterBar, ListDetail                                                                                          | `tables.tsx`; `data.tsx`                                                                    |
| Searchable choices, dates, file selection and commands | Combobox, DateRangePicker, FileUpload, ActionMenu, CommandPalette                                                                                                           | `advanced-inputs.tsx`                                                                       |
| Disclosure and steps                                   | Accordion, Pagination, Stepper, Wizard                                                                                                                                      | `workflows.tsx`                                                                             |
| Authentication UI                                      | AuthLayout, AuthForm, LoginForm, RegistrationForm, ForgotPasswordForm, ResetPasswordForm, EmailVerificationForm, TwoFactorForm, PasswordField, VerificationCodeField        | `auth.tsx`                                                                                  |
| Composed application panels                            | Dashboard, ToastStack, ProfileSettings, SecuritySettings, TeamMembers, NotificationCentre, PrivacyPreferences, PricingCards, CommentsPanel, ApprovalPanel                   | `patterns.tsx`                                                                              |
| Schema and text editing                                | FieldEditorItem, TagInput; HighlightedTextarea                                                                                                                              | `field-editor.tsx`; `highlighted-textarea.tsx`                                              |
| Long forms                                             | EditorLayout, FormSection, FormActions                                                                                                                                      | `form-layout.tsx`                                                                           |
| Address entry                                          | AddressFields                                                                                                                                                               | `address-fields.tsx`                                                                        |
| Visual choices and document proofing                   | VisualChoiceGroup; DocumentPreview; DocumentSpread; MailFace                                                                                                                | `visual-choice-group.tsx`; `document-preview.tsx`                                           |
| Images and brand previews                              | ImageRegion; ThumbnailChoice; BrandPreview                                                                                                                                  | Corresponding kebab-case `.tsx` files                                                       |
| Theme preferences                                      | ThemeSelector; PresetOption, ColorControl, Swatch, PreviewStage, PreviewComposition                                                                                         | `theme-selector.tsx`; `workbench.tsx`                                                       |
| Editorial surfaces                                     | FeaturePanel, MediaCard, EditorialLead, SignalCard, ChipLink, AccentLink, ThemeArtwork, PulseMark                                                                           | `editorial.tsx`; `workbench.tsx`                                                            |

## Boundaries that prevent incorrect implementations

- Text roles come from exported `typography` in the token package. Heading semantic levels h1–h6 are independent of visual size; Section supports h2–h6. Prose provides opt-in native reading content, not a Markdown parser or rich-text editor. PageHeader supports compact/breadcrumb/meta composition and Container has a reading width. Keep the theme version 1 schema unchanged when using these static role tokens.
- `Table` is static. `DataTable<T>` defaults to in-memory sorting/pagination, supports controlled page/sort, and has an explicit `mode="server"` that renders supplied page rows unchanged using `totalRows`. Selection is controlled through IDs. `activeRowId` highlights detail context independently of selection. Server mode requires controlled page/sort callbacks; loading/error/retry are supported. There is no virtualisation, column resizing or built-in fetching. See expanded contracts for state ownership.
- `Combobox` is a controlled single choice with local filtering by default. `filterMode="external"` accepts app-filtered remote results and requires controlled `query`/`onQueryChange`; `null` restores the selection label. Supply `selectedLabel` when the selected option is absent from results. `loading`, `loadError`/`onRetry` and field `hint`/`error` provide feedback. Apps own fetching and stale-response cancellation; multiselect is not supported. `TagInput` accepts free-text string tags; it is not a multiselect over predefined options.
- `DateRangePicker` uses native date inputs and ISO date strings. It is not a custom calendar, time picker or timezone conversion layer.
- `FileUpload` selects and validates files locally. It does not upload, read or persist their contents. Native directory selection is supported; directory drops are ignored. Consumers own transfer progress, cancellation and server validation.
- `ActionMenu` uses button/Tab interaction within a popover, not ARIA menu keyboard semantics; `Menu` is the ARIA menu with arrow keys, checkbox/radio items and submenus. `CommandPalette` uses Tab through commands; the app owns global shortcuts.
- `FloatingPanel` provides a non-modal desktop inspector and a modal drawer at viewport widths up to 760px. Outside desktop interactions keep it open. Hoist drafts because collapsing or switching presentation can unmount the body. The workbench uses it for Edit theme, sharing Theme studio state/history and keeping the editor under stable tokens.
- `ConfirmDialog` awaits returned promises and ignores their resolved values. Throw/reject to report failure; returning false does not veto the action. Pending state locks duplicate actions and dismissal. Failure stays open with safe feedback and retry focus; success closes and returns trigger focus. Apps own mutations, service timeouts, cancellation and rollback. See COMPONENTS.md for the full contract.
- `TreeView` has controlled single selection and internal expansion. Stable IDs are required; lazy loading, multiselect and controlled expansion are not supported.
- `ToastStack` has controlled messages and no automatic expiry. Authentication forms are UI only; applications implement authentication, session storage and authorisation.
- Inactive Tabs panels, Wizard steps and FieldEditorItem content unmount. Hoist draft state that must survive navigation. Wizard owns a form: do not nest another form in its steps.
- For async patterns documented to await callbacks, reject on failure and resolve only when the operation has succeeded. The pattern does not supply backend enforcement or persistence.

## Themes, localisation and accessibility

Use the exported lists rather than hard-coded choices. Currently there are sixteen `presets`, eight `featuredPresets` and seventeen `paletteOptions`. Cream (`cream`) is the warm editorial preset and defaults to `accent: 'restrained'`. Workspace's stable ID is `professional`; Bloom's is `joyful`. Retain legacy preset IDs when reading saved preferences. A display-name change is not a schema migration.

Theme JSON is version 1. Pass external JSON through `parseTheme` before applying it. Schema validity and contrast validity are separate: `exportTheme` rejects failing declared colour pairs. `applyPalette` changes colours; `switchMode` preserves other theme properties, moves the closest built-in palette (or preset defaults) to the new mode and keeps hand-picked colour roles that still pass `checkContrast` there. Keep parsing, all presets, modes and exports aligned when adding a token.

Wrap consumers in LocaleProvider and ThemeProvider, as shown in README. Set locale, timezone and direction explicitly where needed; LocaleProvider defaults to `en-GB`, `UTC` and `ltr` and does not infer RTL from the locale. Keep server/client inputs consistent. Package messages ship in English and Hungarian and are chosen from the locale language (`hu-HU` gives Hungarian); other languages fall back to English. They remain replaceable; application content requires its own translation. Do not promise that every display name is translated automatically.

Preserve theme and locale inheritance through portals. Overlay triggers must be single focusable, ref-forwarding controls. Preserve field labels/error associations, focus containment and return, keyboard operation, reduced motion and touch targets. Glass cards are translucent: check their text against the actual backdrop; inputs and overlays use opaque surfaces. Automated colour and axe checks are not accessibility certification.

Scope is React for UK/European applications with a rolling 24-month browser policy. [Compatibility](COMPATIBILITY.md) records support targets separately from execution evidence. Modern WebKit is not proof of historical Safari support; mobile Chromium emulation is not a physical iOS test.

## Verification workflow

| Change or question                                 | Check                                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Library source changed before preview/browser work | `npm run build:packages` — consumers resolve built exports                                            |
| General implementation baseline                    | `npm run check` — types, style boundary, unit/interaction/SSR tests, packages and both consumers      |
| Specific interaction in a browser                  | `npm run test:e2e -- --project=chromium -g 'test title'` (choose the relevant existing title/project) |
| Full configured browser workflows                  | `npm run test:e2e` — Chromium, Firefox, WebKit and mobile Chromium emulation                          |
| Package distribution or external installation      | `npm run test:package` — isolated tarballs, requires registry/cache access                            |
| Formatting                                         | `npm run format:check`                                                                                |

`npm run test:e2e` first builds the workspace and then starts a fresh preview on port 4174. Unit tests alias source directly; a passing unit test alone does not verify built exports. The style-boundary script covers the two existing consumer source roots; update it for new consumers. It is a convention check, not a security boundary.

Tests are grouped by feature under `tests/`; expanded data/input/panel contracts are mainly in `tests/expansion.test.tsx`, theme invariants in `tests/tokens.test.ts`, and browser workflows in `tests/browser/`. Read the relevant assertions before choosing coverage. Add tests for meaningful changed behaviour, including failure/retry and keyboard/focus states when affected.

At handoff, state what changed, executed commands/results and remaining gaps. Update component contracts for API changes and the portable skill only when an actual API or workflow change warrants it. Do not edit generated declarations as source. Publication and deployment are separate tasks.

The workbench owns persisted catalog expansion preferences in `gregui.catalog.groups.v1`. ListDetail supplies controlled expandedGroups/onExpandedGroupsChange; it never owns storage. Selected categories stay open independently of saved manual choices.
