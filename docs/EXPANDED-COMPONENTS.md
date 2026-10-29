# Application components and patterns

All exports below ship from `@gregui/react`. Import the shared stylesheet once. Each inherits its nearest ThemeProvider and LocaleProvider, uses the shared preset and light/dark theme system and keeps presentation inside the shared package. Application callbacks own network calls, storage, authorisation and navigation. Playground data is fictional and stays in memory.

## Data, navigation and inputs

| Export            | Contract and supported behaviour                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TreeView`        | Unique stable node IDs, text labels and optional nested children. Single controlled selection through `selectedId`/`onSelect`; expansion is internal with `defaultExpanded`. Up/Down, Home/End, direction-aware Left/Right, Enter/Space and first-letter navigation. Clicking a branch selects and toggles it. No drag/drop, multiselect, virtualisation or lazy fetching in this version. Replace/remount the tree for a different dataset. |
| `Timeline`        | `items` supply ID, title, machine-readable `dateTime`, localized `dateLabel`, optional content and complete/current/upcoming status. Vertical by default; horizontal mode scrolls within its container. The app orders items and supplies explicit status wording where it matters.                                                                                                                                                          |
| `DataTable<T>`    | Typed columns, locale-aware client sorting, optional controlled page/sort, and controlled cross-page selection. `mode="server"` renders supplied page rows unchanged using `totalRows` for pagination. Loading/error/retry feedback is supported; apps own fetching, cancellation, filters and selection pruning. No virtualisation or column resizing.                                                                                      |
| `Combobox`        | Controlled single value, optional controlled query and external result filtering, selected-label fallback, loading/error/retry feedback, and linked field hint/validation. Keyboard selection skips disabled options; active choice follows stable IDs as results change. Apps own remote requests and cancellation. No free-text submission or multi-selection.                                                                             |
| `DateRangePicker` | Controlled ISO date strings (`YYYY-MM-DD` or empty) with native date inputs, optional min/max bounds, disabled state and linked range-error feedback. Browser/OS determines the calendar and date display. Applications must validate the complete range before saving.                                                                                                                                                                      |
| `FileUpload`      | Native chooser plus drop target. `accept` supports extensions, MIME types and MIME wildcards; optional `multiple` and `maxBytes` validate before `onFiles`. Callback receives File objects. Clear selected files resets the native chooser and calls `onFiles([])`. Files are not read, uploaded or persisted by the component. Client checks are UX only; servers must validate uploads. Apps supply progress, cancellation and storage.    |
| `ActionMenu`      | A labelled action popover with disabled/danger actions. Uses ordinary button/Tab semantics rather than ARIA menu semantics; Escape and Close return focus. Actions run synchronously; choosing an enabled action closes the popover and returns focus. Apps own async action state and confirmation where needed.                                                                                                                            |
| `CommandPalette`  | Searchable modal dialog built on the existing Dialog focus contract. Controlled internally through its trigger; selecting a command closes the dialog. Apps supply commands and wire any global shortcut. Tab navigates results; no global keyboard listener is installed.                                                                                                                                                                   |
| `SearchFilterBar` | Controlled query and filter selections, with explicit Clear filters callback. `filters` supply keys, labels, values and options. Applications own result filtering, result announcements and URL state.                                                                                                                                                                                                                                      |
| `ListDetail`      | Controlled selection list with labels/descriptions and a detail-content slot. Side-by-side on desktop, stacked on narrow screens. No routing or automatic detail fetching. Apps decide whether mobile detail needs a separate route.                                                                                                                                                                                                         |

## Composed patterns

| Export               | Contract and supported behaviour                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ToastStack`         | Controlled persistent messages with severity, optional action and dismissal callbacks. New alerts use the shared live-region behaviour. No automatic timeout; the host controls placement and lifetime.                                                                                                                                                                                                                       |
| `Dashboard`          | Responsive metric cards plus a content slot for tables, activity or tasks. Values, formats, trends and empty/loading states belong to the app. No charting or data aggregation engine.                                                                                                                                                                                                                                        |
| `ProfileSettings`    | Controlled name/email form with native required/email validation, async `onSave`, duplicate-submit protection, disabled fields while pending, failure/retry and success feedback. Optional children add application-owned fields.                                                                                                                                                                                             |
| `SecuritySettings`   | Session list, current-session badge and async revocation actions with retry. Current session has no revoke control. Children accept application-owned security controls. Real session enforcement, password changes and MFA are backend responsibilities.                                                                                                                                                                     |
| `TeamMembers`        | Email invitation form plus explicit per-member role save. Callbacks may return promises; pending/error states are handled; role choices lock while saving and report success. The app supplies allowed roles, member state, permission checks and invitation lifecycle. It does not send mail by itself.                                                                                                                      |
| `NotificationCentre` | Controlled notification data with unread filter, mark-read and dismiss callbacks. Apps own navigation destinations, persistence and live updates.                                                                                                                                                                                                                                                                             |
| `PrivacyPreferences` | Controlled category selection. Required categories remain checked and are always included in the saved payload. Necessary-only and select-all change the draft; saving invokes the async callback, locks draft controls and reports success. This is a preference UI, not a consent enforcement engine or a compliance certification.                                                                                         |
| `PricingCards`       | Caller-formatted prices/features, separate current/recommended badges, a current-card outline and aligned action areas. Actions include the plan name in their accessible label. One shared request lock prevents competing selections; errors stay on the requested card and the controlled current ID changes only when the app updates it. No payment, billing or subscription side effects without application callbacks. |
| `CommentsPanel`      | Plain-text comments with a required composer, whitespace rejection, async posting, draft preservation on failure and clearing after success. No HTML execution, rich text, attachments or realtime transport. Apps append confirmed comments to the controlled list.                                                                                                                                                          |
| `ApprovalPanel`      | Review details, optional timeline history, comment and approve/reject actions. A shared lock blocks both actions while a decision is pending; failure permits retry and success replaces actions with confirmation. Remount with a new request key for another review. Apps enforce workflow permissions and persist audit history.                                                                                           |

Patterns with a title (`Dashboard`, `ProfileSettings`, `SecuritySettings`, `TeamMembers`, `NotificationCentre`, `PrivacyPreferences`, `CommentsPanel`, `ApprovalPanel`) render it as `h2` by default; set `headingLevel` (2–6) to fit the surrounding page outline. Nested headings, such as the SecuritySettings session list, follow one level below. `PricingCards headingLevel` sets the plan-name level (default `h3`).

## Integration example

```tsx
const [selected, setSelected] = useState<string[]>([]);

<DataTable
  caption="Projects"
  rows={projects}
  rowId={(project) => project.id}
  columns={[
    { key: 'name', label: 'Project', value: (project) => project.name, sortable: true },
    { key: 'members', label: 'Members', value: (project) => project.memberCount, sortable: true },
  ]}
  selectedIds={selected}
  onSelectionChange={setSelected}
/>;
```

Callbacks should reject on failed asynchronous mutations so the shared feedback can offer retry. Resolve only after the app considers the operation successful. Do not report success before a server accepts a mutation. Package-owned labels are replaceable via `LocaleProvider.messages`; application copy and date/price formatting remain explicit inputs.

The Components catalog includes every export as a searchable, interactive example. A page-level style selector lets you compare materials without leaving the catalog. The existing authentication and onboarding patterns remain separate from this expansion.

## ImageRegion

Responsive image with one optional rectangular annotation. Pass `src`, meaningful `alt`, percentage `value` (`x`, `y`, `width`, `height`), and `onChange` for editing. Without `onChange` it is read-only. Provide localized `label` and `help` in editing mode. Drag to draw; Enter starts a centered region, arrows move it, Shift+arrows resize, Delete clears. Application owns upload, authorization, captions and persistence. No image pixels are modified.

## Controlled and server-driven tables

Existing DataTable usage remains client-side by default, with internal sort/page state and `pageSize={5}`. Client mode optionally accepts `page` with `onPageChange`, and independently `sort` with `onSortChange`. Each controlled value requires its callback. Keep a table consistently controlled or uncontrolled for its lifetime.

`DataTableSort` is `{ key: string; descending: boolean }`; `sort={null}` means unsorted. Keys refer to stable column keys; use sortable columns for sort state. Sorting emits the new sort and a page-one request. Controlled values change only when the consumer updates props. Page numbers are one-based.

Server mode requires `mode="server"`, `totalRows`, `page`, `onPageChange`, `sort` and `onSortChange`. Supply only the rows returned for the current page; DataTable never sorts or slices them. `pageSize` describes the service page size and `totalRows` is the complete filtered result count. Bounds are clamped for display without emitting callbacks; the app must reconcile an invalid page after totals change. Invalid/non-finite page sizes fall back to a positive size, and invalid totals render as zero.

```tsx
const [page, setPage] = useState(1);
const [sort, setSort] = useState<DataTableSort | null>(null);

<DataTable
  caption="Projects"
  mode="server"
  rows={result.rows}
  totalRows={result.total}
  pageSize={20}
  page={page}
  onPageChange={setPage}
  sort={sort}
  onSortChange={setSort}
  columns={columns}
  rowId={(row) => row.id}
  loading={loading}
  error={safeErrorMessage}
  onRetry={retryRequest}
/>;
```

The consumer requests data from its chosen service when page/sort/filter state changes, resets page to one when filters or page size change, and cancels or ignores obsolete responses. Batch sort and page updates rather than issuing a request directly from each callback. No service SDK, credentials or network transport is included. See the workbench's **Remote records** example for a local delayed service simulation with cancellation and failure/retry.

`loading` marks the scroll region busy, announces the translated `loading` message and disables sort buttons, row-selection checkboxes and pagination. Supplied rows remain visible during loading and error states; the consumer chooses whether to retain or clear them. An `error` string is safe consumer-owned display text; it appears as a live danger alert, optionally with `onRetry` and the translated `retry` label. Loading takes precedence over error; neither state shows a misleading empty message. Empty feedback appears only after a successful, non-loading result with no visible rows. Custom rendered cell controls remain consumer-owned and must receive their own pending/error guards.

Selection preserves IDs from other pages and filters; the table cannot determine whether unseen IDs were deleted. Apps decide when to clear/prune selections and enforce permissions when applying bulk actions. `activeRowId` continues to highlight detail context independently of checked rows.

These props are additive; existing callers need no migration. Applications that provide a complete `Messages` object should include the new `retry` message; `LocaleProvider.messages` partial overrides retain its English default.

## Remote and controlled choices

Combobox keeps its local single-selection behaviour by default. `filterMode="local"` filters option labels case-insensitively using the provider locale; existing callers require no migration. Local mode can also accept a controlled `query`/`onQueryChange` pair. New exported `ComboboxProps` describes both modes.

`filterMode="external"` requires `query: string | null` and `onQueryChange`. In this mode, `options` are displayed in their supplied order without additional filtering: services may match aliases, identifiers or other fields absent from display labels. Values must be unique and stable. This mode does not initiate requests or depend on a service SDK.

- `query={null}` displays the selected label; `query=""` is an actively empty search. Typing emits the string. Choosing an option, Escape or leaving the entire control emits `null`. The consumer must apply controlled updates; do not switch between controlled and uncontrolled query during a mounted lifetime.
- `selectedLabel` supplies the current selection's display text when its option is absent from the current result set. Keep it aligned with `value`; without it, the component looks up the label in `options`. Selection remains independent of the search text, and uncommitted text is discarded on Escape/blur.
- `loading` leaves the input editable, marks it and its list busy, announces the package `loading` message and hides stale options from selection. `loadError` shows a safe consumer-owned request error and optional `onRetry` action; loading takes precedence. The package `retry` label is translated through LocaleProvider. No-results feedback appears only for a completed, error-free search.
- `hint` and `error` use the shared Field association contract. `error` describes field validation; `loadError` describes a failed lookup and is separately linked to the input while visible. The retry button is outside the listbox, accessible through Tab, and returns focus to the input without clearing the query. Tab out of the complete control discards the draft query.
- Arrow keys, Home/End and Enter select enabled results. The active choice follows its stable value after reordering; removal or disabling falls back to the first enabled result. Loading/error/empty states have no stale active descendant. Enter during IME composition does not commit a choice. Escape closes the popup first and leaves a surrounding dialog open; a subsequent Escape can reach that dialog.

```tsx
const [query, setQuery] = useState<string | null>(null);
const [selected, setSelected] = useState<Choice | null>(null);

<Combobox
  label="Country"
  filterMode="external"
  query={query}
  onQueryChange={setQuery}
  options={result.options}
  value={selected?.value ?? ''}
  selectedLabel={selected?.label ?? ''}
  onChange={(value) => {
    const option = result.options.find((item) => item.value === value);
    if (option) setSelected(option);
  }}
  loading={loading}
  loadError={safeLookupError}
  onRetry={retryLookup}
/>;
```

Applications own fetching, debouncing, minimum-query rules, caching, permissions and cancellation/response ordering. Mark a new query as loading immediately while older results remain in props, and cancel or ignore obsolete responses. `null` is a display/reset signal, not an instruction to a backend; the application decides whether it fetches initial suggestions. Retry callbacks should start the app's loading/error lifecycle and handle service failures there. The workbench's **Remote choices** example demonstrates alias matching, a slower superseded search, a simulated failure/retry, empty results and a selection that survives result replacement. All data stays local.
