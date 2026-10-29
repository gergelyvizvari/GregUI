import { PostcardDemo } from './postcard-demo';
import { BreadcrumbsDemo, MenuDemo, ContextMenuDemo, SideNavDemo } from './navigation-demo';
import { CalendarAgendaDemo, CalendarMonthDemo, DatePickerDemo } from './calendar-demo';
import { samplePhoto, PhotoCredit } from './sample-media';
import { TypographyDemo, PageCompositionDemo } from './content-demo';
import { useEffect, useState, type ReactNode } from 'react';
import {
  ActionMenu,
  ThemeSelector,
  ThemeProvider,
  createTheme,
  type ThemeSelection,
  FieldEditorItem,
  TagInput,
  ThumbnailChoice,
  HighlightedTextarea,
  TextField,
  Select,
  Field,
  Alert,
  ApprovalPanel,
  Badge,
  Button,
  Card,
  Container,
  Combobox,
  type Choice,
  CommandPalette,
  ConfirmDialog,
  CommentsPanel,
  Dashboard,
  DataTable,
  type DataTableSort,
  DateRangePicker,
  FileUpload,
  ImageRegion,
  type ImageRegionValue,
  ListDetail,
  NotificationCentre,
  PricingCards,
  PrivacyPreferences,
  ProfileSettings,
  SearchFilterBar,
  SecuritySettings,
  Stack,
  Status,
  TeamMembers,
  Text,
  Timeline,
  ToastStack,
  TreeView,
  type NotificationItem,
  type MemberItem,
  type CommentItem,
  type ToastItem,
} from '@gregui/react';
export interface CatalogEntry {
  name: string;
  category: string;
  description: string;
  api: string;
  demo: ReactNode;
}
const events = [
  {
    id: 'created',
    title: 'Request received',
    dateTime: '2026-09-27',
    dateLabel: '27 September',
    status: 'complete' as const,
    content: <Text>All required details were supplied.</Text>,
  },
  {
    id: 'review',
    title: 'In review',
    dateTime: '2026-09-29',
    dateLabel: '29 September',
    status: 'current' as const,
    content: <Text>A reviewer is checking the request.</Text>,
  },
  {
    id: 'decision',
    title: 'Decision',
    dateTime: '2026-10-01',
    dateLabel: 'Expected 1 October',
    status: 'upcoming' as const,
  },
];
const projects = [
  { id: '1', name: 'Customer portal', status: 'Active', members: 8 },
  { id: '2', name: 'Design library', status: 'Draft', members: 3 },
  { id: '3', name: 'Help centre', status: 'Active', members: 12 },
  { id: '4', name: 'Mobile app', status: 'Draft', members: 5 },
];

// A local stand-in for an application-owned service. No network requests are made.
function RemoteRecordsDemo() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [fail, setFail] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ rows: projects.slice(0, 2), total: projects.length });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  useEffect(() => {
    setLoading(true);
    setError(undefined);
    const timer = window.setTimeout(() => {
      if (fail) setError('The demo service could not load records. Try again.');
      else {
        const filtered = projects.filter((row) =>
          row.name.toLowerCase().includes(query.toLowerCase()),
        );
        if (sort)
          filtered.sort((a, b) => a.name.localeCompare(b.name) * (sort.descending ? -1 : 1));
        setResult({ rows: filtered.slice((page - 1) * 2, page * 2), total: filtered.length });
      }
      setLoading(false);
    }, 500);
    // Cancel superseded requests so older results cannot overwrite the current query.
    return () => window.clearTimeout(timer);
  }, [page, sort, query, fail, attempt]);
  return (
    <Stack>
      <Text>
        Local service simulation: page data arrives after a short delay. No requests leave this
        browser.
      </Text>
      <TextField
        label="Filter remote records"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setPage(1);
        }}
      />
      <Button variant="secondary" disabled={loading} onClick={() => setFail(true)}>
        Simulate service failure
      </Button>
      <DataTable
        caption="Remote records"
        mode="server"
        rows={result.rows}
        totalRows={result.total}
        rowId={(row) => row.id}
        pageSize={2}
        page={page}
        onPageChange={setPage}
        sort={sort}
        onSortChange={setSort}
        selectedIds={selected}
        onSelectionChange={setSelected}
        loading={loading}
        error={error}
        onRetry={() => {
          setFail(false);
          setAttempt((value) => value + 1);
        }}
        columns={[
          { key: 'name', label: 'Record', value: (row) => row.name, sortable: true },
          { key: 'members', label: 'People', value: (row) => row.members },
        ]}
      />
      <Text>{selected.length} records selected across pages</Text>
    </Stack>
  );
}

const directoryCountries = [
  { value: 'uk', label: 'United Kingdom', aliases: ['uk', 'britain', 'london'] },
  { value: 'fr', label: 'France', aliases: ['fr', 'paris'] },
  { value: 'de', label: 'Germany', aliases: ['de', 'berlin'] },
  { value: 'fi', label: 'Finland', aliases: ['fi', 'helsinki', 'slow'], disabled: true },
];

function RemoteChoicesDemo() {
  const [query, setQuery] = useState<string | null>(null);
  const [selected, setSelected] = useState<Choice>(directoryCountries[1]);
  const [options, setOptions] = useState<Choice[]>(directoryCountries);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setLoading(true);
    setLoadError(undefined);
    const search = (query ?? '').toLowerCase();
    const timer = window.setTimeout(
      () => {
        if (search === 'error' && attempt === 0) {
          setLoadError('The demo directory could not load countries. Try again.');
        } else {
          // Aliases are application data: external results may not contain the query in their labels.
          setOptions(
            directoryCountries.filter(
              (country) =>
                search === 'error' ||
                [country.label, ...country.aliases].some((term) =>
                  term.toLowerCase().includes(search),
                ),
            ),
          );
        }
        setLoading(false);
      },
      search === 'slow' ? 1000 : 400,
    );
    // A superseded search must never replace results for the current query.
    return () => window.clearTimeout(timer);
  }, [query, attempt]);
  return (
    <Stack>
      <Combobox
        label="Search the country directory"
        hint="Try uk for an alias, error for failure/retry, or missing for no matches. Results are simulated locally."
        filterMode="external"
        query={query}
        onQueryChange={(next) => {
          if (next === query) return;
          setQuery(next);
          setAttempt(0);
          setLoading(true);
        }}
        options={options}
        value={selected.value}
        selectedLabel={selected.label}
        onChange={(value) => {
          const country = options.find((option) => option.value === value);
          if (country) setSelected(country);
        }}
        loading={loading}
        loadError={loadError}
        onRetry={() => {
          setLoading(true);
          setAttempt((value) => value + 1);
        }}
      />
      <Text>Selected country: {selected.label}</Text>
      <Button variant="secondary">Continue with selected country</Button>
    </Stack>
  );
}

function AsyncConfirmationDemo() {
  const [attempts, setAttempts] = useState(0);
  const [archived, setArchived] = useState(false);
  return (
    <Stack>
      <Text>
        Local simulation: the first archive attempt fails; retry succeeds. No project data is
        changed.
      </Text>
      <ConfirmDialog
        trigger={<Button variant="danger">Archive sample project</Button>}
        title="Archive this project?"
        description="The project will move out of the active list. Keep this window open while the simulated request completes."
        confirmLabel="Archive project"
        cancelLabel="Keep project"
        errorMessage="The demo service could not archive this project. Please try again."
        onConfirm={async () => {
          setAttempts((value) => value + 1);
          await new Promise<void>((resolve) => window.setTimeout(resolve, 1000));
          if (attempts === 0) throw new Error('Simulated service failure');
          setArchived(true);
        }}
      />
      <Text>Archive requests: {attempts}</Text>
      <Status>{archived ? 'Sample project archived locally.' : ''}</Status>
      {archived && (
        <Button
          variant="secondary"
          onClick={() => {
            setAttempts(0);
            setArchived(false);
          }}
        >
          Reset archive demo
        </Button>
      )}
    </Stack>
  );
}

export function useAdvancedExamples(): CatalogEntry[] {
  const [region, setRegion] = useState<ImageRegionValue | null>(null);
  const [selected, setSelected] = useState('');
  const [choice, setChoice] = useState('uk');
  const [fieldOpen, setFieldOpen] = useState(true);
  const [instructions, setInstructions] = useState(
    'Describe the damage in description. Set urgency to Routine, Urgent or Emergency. Return {"description": "...", "urgency": "Routine"}.',
  );
  const [fieldName, setFieldName] = useState('issue_type');
  const [fieldTags, setFieldTags] = useState([
    'Appliances',
    'Decorating',
    'Electrical',
    'Plumbing',
    'Kitchen',
    'Other',
    'Bathroom',
    'Flooring',
    'Doors',
    'Windows',
    'Leaks',
    'Fire',
    'Infestation',
    'Gas',
    'Stairs',
    'Heating',
    'Mould',
  ]);
  const [query, setQuery] = useState(''),
    [status, setStatus] = useState('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [range, setRange] = useState({ start: '', end: '' });
  const [fileNames, setFileNames] = useState('');
  const [action, setAction] = useState('');
  const [detail, setDetail] = useState('1');
  const [profile, setProfile] = useState({ name: 'Alex Morgan', email: 'alex@example.com' });
  const [profileSaved, setProfileSaved] = useState(false);
  const [sessions, setSessions] = useState([
    {
      id: 'current',
      label: 'This browser',
      description: 'London · current session',
      current: true,
    },
    { id: 'other', label: 'Tablet', description: 'Last active yesterday' },
  ]);
  const [members, setMembers] = useState<MemberItem[]>([
    { id: 'alex', name: 'Alex Morgan', email: 'alex@example.com', role: 'owner' },
    { id: 'sam', name: 'Sam Taylor', email: 'sam@example.com', role: 'member' },
  ]);
  const [invitations, setInvitations] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Your export is ready',
      description: 'The project summary is available.',
      dateLabel: 'Today',
      read: false,
    },
    { id: '2', title: 'Workspace created', dateLabel: 'Yesterday', read: true },
  ]);
  const [consent, setConsent] = useState<string[]>(['necessary']),
    [consentSaved, setConsentSaved] = useState(false);
  const [plan, setPlan] = useState('starter');
  const [comments, setComments] = useState<CommentItem[]>([
    { id: '1', author: 'Sam', dateLabel: 'Today', body: 'The draft is ready for review.' },
  ]);
  const [decision, setDecision] = useState('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [horizontal, setHorizontal] = useState(false);
  const entry = (
    name: string,
    category: string,
    description: string,
    api: string,
    demo: ReactNode,
  ) => ({ name, category, description, api, demo });
  const actions = [
    {
      id: 'open',
      label: 'Open project',
      onAction: () => setAction('Project opened in this local demo.'),
    },
    {
      id: 'archive',
      label: 'Archive project',
      onAction: () => setAction('Project archived in this local demo.'),
    },
    { id: 'unavailable', label: 'Export (unavailable)', disabled: true, onAction: () => {} },
  ];
  return [
    entry(
      'Postcard studio',
      'Patterns',
      'Flat and folded cards with visual selection, inside spreads and separate envelope addresses.',
      '<VisualChoiceGroup label="Design" options={designs} value={design} onChange={setDesign} />\n<AddressFields label="Recipient address" value={address} onChange={setAddress} fields={fields} countries={countries} />\n<DocumentPreview label="Postcard" widthMm={148} heightMm={105} pages={pages} pageId={side} onPageChange={setSide} labels={labels} />',
      <PostcardDemo />,
    ),
    entry(
      'Typography & content',
      'Foundations',
      'Shared text roles, all six heading levels and readable native content.',
      '<Prose><h2>Section</h2><p>Readable content.</p></Prose>',
      <TypographyDemo />,
    ),
    entry(
      'Page foundations',
      'Layout',
      'Compact page introductions with breadcrumbs, metadata, actions and nested sections.',
      '<PageHeader size="compact" title="Page title" breadcrumbs={breadcrumbs} meta={metadata} actions={actions} />',
      <PageCompositionDemo />,
    ),
    entry(
      'Theme Selector',
      'Forms',
      'Five styles and palettes with light/dark modes. Labels and persistence belong to the consumer.',
      '<ThemeSelector value={selection} onChange={setSelection} labels={labels} />',
      <ThemeSelectorDemo />,
    ),
    entry(
      'Tree View',
      'Navigation',
      'Hierarchical single selection, expandable branches, arrow keys, Home/End and first-letter navigation.',
      '<TreeView nodes={nodes} label="Files" onSelect={setSelected} />',
      <Stack>
        <TreeView
          label="Project files"
          selectedId={selected}
          onSelect={setSelected}
          defaultExpanded={['workspace']}
          nodes={[
            {
              id: 'workspace',
              label: 'Workspace',
              children: [
                {
                  id: 'design',
                  label: 'Design',
                  children: [
                    { id: 'tokens', label: 'Tokens' },
                    { id: 'components', label: 'Components' },
                  ],
                },
                { id: 'docs', label: 'Documentation' },
              ],
            },
            { id: 'archive', label: 'Archive' },
          ]}
        />
        <Text>Selected: {selected || 'None'}</Text>
      </Stack>,
    ),
    entry(
      'Timeline View',
      'Data display',
      'Dated milestones with current-step semantics. Switch orientation; horizontal timelines scroll on narrow screens.',
      '<Timeline label="History" items={events} />',
      <Stack>
        <Button variant="secondary" onClick={() => setHorizontal((v) => !v)}>
          Switch timeline orientation
        </Button>
        <Timeline
          label="Request history"
          items={events}
          orientation={horizontal ? 'horizontal' : 'vertical'}
        />
      </Stack>,
    ),
    entry(
      'Data Table',
      'Data display',
      'Client-side sorting, controlled row selection and pagination. Filtered data stays owned by the app.',
      '<DataTable caption="Projects" rows={rows} columns={columns} rowId={row=>row.id} />',
      <Stack>
        <DataTable
          caption="Managed projects"
          rows={projects}
          rowId={(row) => row.id}
          pageSize={3}
          selectedIds={selectedRows}
          onSelectionChange={setSelectedRows}
          columns={[
            { key: 'name', label: 'Project', value: (row) => row.name, sortable: true },
            { key: 'status', label: 'Status', value: (row) => row.status },
            { key: 'members', label: 'Members', value: (row) => row.members, sortable: true },
          ]}
        />
        <Text>{selectedRows.length} selected</Text>
      </Stack>,
    ),
    entry(
      'Remote records',
      'Data display',
      'Application-controlled server mode, loading feedback, failure and retry. Selection survives page changes.',
      '<DataTable mode="server" rows={pageRows} totalRows={total} page={page} onPageChange={setPage} sort={sort} onSortChange={setSort} columns={columns} rowId={row=>row.id} />',
      <RemoteRecordsDemo />,
    ),
    entry(
      'Compact image preview',
      'Media',
      'Read-only image preview without cropping.',
      '<ImageRegion src={url} alt="Reference" compact />',
      <Stack>
        <ImageRegion compact alt={samplePhoto.alt} src={samplePhoto.src} />
        <PhotoCredit />
      </Stack>,
    ),
    entry(
      'Image region',
      'Media',
      'Responsive reference image with one editable region.',
      '<ImageRegion src={url} alt="Reference" value={region} onChange={setRegion} />',
      <Stack>
        <ImageRegion
          src={samplePhoto.src}
          alt={samplePhoto.alt}
          value={region}
          onChange={setRegion}
          label="Mark reference region"
          help="Drag to mark; Enter to start; arrows to move; Shift + arrows to resize; Delete to clear."
        />
        <PhotoCredit />
      </Stack>,
    ),
    entry(
      'Form container',
      'Layout',
      'Bounded form width inside a padded page.',
      '<Container size="form" inset={false}>…</Container>',
      <Container size="form" inset={false}>
        <Card>
          <Text>A readable form stays bounded on wide displays and fits narrow screens.</Text>
        </Card>
      </Container>,
    ),
    entry(
      'Highlighted text',
      'Forms',
      'Plain-text editing with exact field-name emphasis, native selection and undo.',
      '<HighlightedTextarea label="Instructions" value={value} onValueChange={setValue} highlights={["description", "urgency"]} />',
      <HighlightedTextarea
        label="Instructions"
        value={instructions}
        onValueChange={setInstructions}
        highlights={['description', 'urgency']}
      />,
    ),
    entry(
      'Thumbnail choice',
      'Forms',
      'Image or text selection with a native checkbox.',
      '<ThumbnailChoice label="Alpine lake" src={url} checked={checked} onChange={setChecked} />',
      <Stack>
        <ThumbnailChoice
          label="Alpine lake"
          src={samplePhoto.src}
          detail="Select this landscape for your collection"
          checked={fieldOpen}
          onChange={setFieldOpen}
        />
        <PhotoCredit />
      </Stack>,
    ),
    entry(
      'Field editor',
      'Forms',
      'Aligned field controls and integrated removable tags, including long wrapping values.',
      '<FieldEditorItem …><TagInput … /></FieldEditorItem>',
      <FieldEditorItem
        name={fieldName}
        typeLabel="Category"
        summary={fieldTags.slice(0, 3).join(' · ')}
        expanded={fieldOpen}
        onExpandedChange={setFieldOpen}
        editLabel="Edit"
        closeLabel="Close"
        nameField={
          <TextField
            label="Field name"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
          />
        }
        typeField={
          <Field label="Answer type">
            {(props) => (
              <Select {...props}>
                <option>Category</option>
              </Select>
            )}
          </Field>
        }
        hint="Use a short field name for answers and exports."
      >
        <TagInput
          size="small"
          label="Choices"
          inputLabel="New choice"
          addLabel="Add choice"
          removeLabel={(tag) => `Remove choice ${tag}`}
          value={fieldTags}
          onChange={setFieldTags}
        />
      </FieldEditorItem>,
    ),
    entry(
      'Combobox',
      'Forms',
      'Search and choose a value with arrows, Enter or pointer. Escape restores the selected label.',
      '<Combobox label="Region" options={regions} value={region} onChange={setRegion} />',
      <Combobox
        label="Search region"
        options={[
          { value: 'uk', label: 'United Kingdom' },
          { value: 'fr', label: 'France' },
          { value: 'de', label: 'Germany' },
          { value: 'es', label: 'Spain', disabled: true },
        ]}
        value={choice}
        onChange={setChoice}
      />,
    ),
    entry(
      'Async confirmation',
      'Overlays',
      'Await a confirmation, prevent repeated actions, retain failures for retry and return focus after success.',
      '<ConfirmDialog trigger={button} title="Archive?" description="…" confirmLabel="Archive" cancelLabel="Keep" onConfirm={asyncArchive} />',
      <AsyncConfirmationDemo />,
    ),
    entry(
      'Remote choices',
      'Forms',
      'Application-controlled directory search with aliases, delayed results, error recovery and a persistent selected label.',
      '<Combobox filterMode="external" query={query} onQueryChange={setQuery} options={results} value={value} selectedLabel={label} onChange={select} loading={loading} loadError={error} onRetry={retry} label="Country" />',
      <RemoteChoicesDemo />,
    ),
    entry(
      'Date Picker',
      'Forms',
      'Choose one date from a month grid. Apps block dates with a reason, such as postal holidays or print cut-offs.',
      '<DatePicker label="Arrives by" value={date} onChange={setDate} isDateUnavailable={(d) => holidays[d]} />',
      <DatePickerDemo />,
    ),
    entry(
      'Calendar Month',
      'Data display',
      'A keyboard-accessible month grid with blocked dates and short content per day, such as birthdays.',
      '<CalendarMonth label="Send date" month={month} onMonthChange={setMonth} value={date} onSelect={setDate} renderDay={(d) => occasions[d]} />',
      <CalendarMonthDemo />,
    ),
    entry(
      'Calendar Agenda',
      'Data display',
      'Upcoming events grouped by day, with birthdays and anniversaries repeating every year.',
      '<CalendarAgenda label="Coming up" events={occasions} days={45} onSelect={open} renderDetail={({ years }) => `Turns ${years}`} />',
      <CalendarAgendaDemo />,
    ),
    entry(
      'Date Range Picker',
      'Forms',
      'Native localized date controls and range feedback. Apps supply min/max dates and validate before saving.',
      '<DateRangePicker label="Reporting period" {...range} onChange={setRange} />',
      <DateRangePicker label="Reporting period" {...range} onChange={setRange} />,
    ),
    entry(
      'File Upload',
      'Forms',
      'Native picker and file drop with client-side type/size checks. Does not upload or read file contents.',
      '<FileUpload label="Attachments" accept=".pdf" maxBytes={5000000} onFiles={handleFiles} />',
      <Stack>
        <FileUpload
          label="Demo attachments"
          accept=".pdf,.txt"
          multiple
          maxBytes={5000000}
          onFiles={(files) => setFileNames(files.map((file) => file.name).join(', '))}
        />
        <Text>
          PDF or TXT, up to 5 MB per file. Selected: {fileNames || 'None'}. No upload occurs.
        </Text>
        <FileUpload
          label="Demo folder"
          directory
          multiple
          hint="Choose a folder using the file picker."
          onFiles={() => {}}
        />
      </Stack>,
    ),
    entry(
      'Action Menu',
      'Actions',
      'Deprecated: use Menu, which has ARIA menu keyboard semantics. Kept for existing consumers: a focus-managed action popover using normal Tab navigation and Escape to close.',
      '<ActionMenu label="Project actions" actions={actions} />',
      <Stack>
        <ActionMenu label="Project actions" actions={actions} />
        <Text>{action}</Text>
      </Stack>,
    ),
    entry(
      'Menu',
      'Navigation',
      'Dropdown menu with menu semantics: arrow keys, typeahead and Escape. Supports links, shortcuts, checkbox and radio items, groups and submenus.',
      '<Menu trigger={<IconButton label="Actions">…</IconButton>} items={[{ id: "rename", label: "Rename", onSelect }, { type: "separator", id: "s" }, { type: "submenu", id: "export", label: "Export as", items }]} />',
      <MenuDemo />,
    ),
    entry(
      'Context Menu',
      'Navigation',
      'Right-click, long-press, Shift+F10 or ContextMenu key menu for a region. Shares the Menu item model, rendering and keyboard behaviour. Offer the same actions through a visible control too.',
      '<ContextMenu label="Report actions" items={items}><Card tabIndex={0}>…</Card></ContextMenu>',
      <ContextMenuDemo />,
    ),
    entry(
      'Breadcrumbs',
      'Navigation',
      'Location trail with a localized landmark name. maxItems hides the middle behind a "Show full path" button; onNavigate lets the app route links.',
      '<Breadcrumbs items={[{ label: "Clients", href: "/clients" }, { label: "Northwind" }]} maxItems={3} onNavigate={route} />',
      <BreadcrumbsDemo />,
    ),
    entry(
      'Side Navigation',
      'Navigation',
      'Headed sections and nested, collapsible groups. The current page opens its ancestors. In a collapsible AppShell it becomes an icon rail with group menus.',
      '<SideNav sections={[{ id: "work", title: "Work", items }]} value={current} onNavigate={(item, event) => route(item, event)} />',
      <SideNavDemo />,
    ),
    entry(
      'Command Palette',
      'Navigation',
      'Searchable command dialog. The app supplies commands and may wire its own shortcut.',
      '<CommandPalette trigger={<Button>Commands</Button>} title="Commands" description="Find an action" commands={commands} />',
      <Stack>
        <CommandPalette
          trigger={<Button>Open commands</Button>}
          title="Workspace commands"
          description="Search local demonstration actions."
          commands={actions}
        />
        <Text>{action}</Text>
      </Stack>,
    ),
    entry(
      'Toast Stack',
      'Feedback',
      'Persistent dismissible messages with optional actions. No automatic timeout hides important feedback.',
      '<ToastStack items={messages} onDismiss={dismiss} />',
      <Stack>
        <Button
          onClick={() =>
            setToasts((old) => [
              ...old,
              {
                id: String(Date.now()),
                title: 'Changes saved',
                tone: 'success',
                description: 'Local demonstration only.',
              },
            ])
          }
        >
          Show notification
        </Button>
        <ToastStack
          items={toasts}
          onDismiss={(id) => setToasts((old) => old.filter((item) => item.id !== id))}
        />
      </Stack>,
    ),
    entry(
      'Search & Filter Bar',
      'Forms',
      'Composed query, filter choices and reset action. Applications control filtering and URL state.',
      '<SearchFilterBar query={query} onQueryChange={setQuery} filters={filters} onClear={clear} />',
      <Stack>
        <SearchFilterBar
          label="Search projects"
          query={query}
          onQueryChange={setQuery}
          filters={[
            {
              key: 'status',
              label: 'Project status',
              value: status,
              options: [
                { value: 'all', label: 'All statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Draft', label: 'Draft' },
              ],
            },
          ]}
          onFilterChange={(_, value) => setStatus(value)}
          onClear={() => {
            setQuery('');
            setStatus('all');
          }}
        />
        {projects
          .filter(
            (project) =>
              project.name.toLowerCase().includes(query.toLowerCase()) &&
              (status === 'all' || project.status === status),
          )
          .map((project) => (
            <Text key={project.id}>{project.name}</Text>
          ))}
      </Stack>,
    ),
    entry(
      'List Detail',
      'Layout',
      'A responsive selection list and detail surface. On mobile the detail follows the list.',
      '<ListDetail label="Projects" items={items} selectedId={id} onSelect={setId}>…</ListDetail>',
      <ListDetail
        label="Project directory"
        items={projects.map((project) => ({
          id: project.id,
          label: project.name,
          description: project.status,
        }))}
        selectedId={detail}
        onSelect={setDetail}
      >
        <Card>
          <Stack>
            <Text weight="strong">{projects.find((project) => project.id === detail)?.name}</Text>
            <Text>Selected project details and actions belong here.</Text>
          </Stack>
        </Card>
      </ListDetail>,
    ),
    entry(
      'Dashboard',
      'Patterns',
      'Metric cards and a content slot for activity, tables or tasks. Values and trends are application-owned.',
      '<Dashboard title="Overview" metrics={metrics}>…</Dashboard>',
      <Dashboard
        title="Workspace overview"
        metrics={[
          { id: 'projects', label: 'Projects', value: '12', detail: '3 created this month' },
          { id: 'members', label: 'Members', value: '28', detail: 'Across 4 teams' },
          { id: 'tasks', label: 'Tasks complete', value: '84%', detail: 'This month' },
        ]}
      >
        <Timeline label="Latest activity" items={events.slice(0, 2)} />
      </Dashboard>,
    ),
    entry(
      'Profile Settings',
      'Patterns',
      'Ready-made name/email form with validation, saving, error/retry and success states.',
      '<ProfileSettings title="Profile" value={profile} onChange={setProfile} onSave={save} />',
      <Stack>
        <ProfileSettings
          title="Your profile"
          value={profile}
          onChange={setProfile}
          onSave={async () => {
            await new Promise((resolve) => setTimeout(resolve, 300));
            setProfileSaved(true);
          }}
        />
        {profileSaved && <Text>Demo profile saved in memory only.</Text>}
      </Stack>,
    ),
    entry(
      'Security Settings',
      'Patterns',
      'Active sessions with asynchronous revocation, current-session protection and a slot for app security controls.',
      '<SecuritySettings title="Security" sessions={sessions} onRevoke={revoke} />',
      <SecuritySettings
        title="Account security"
        sessions={sessions}
        onRevoke={(id) => setSessions((old) => old.filter((session) => session.id !== id))}
      >
        <Text>This preview does not revoke real sessions or change credentials.</Text>
      </SecuritySettings>,
    ),
    entry(
      'Team Members',
      'Patterns',
      'Invitation form and editable member roles with explicit saves and retry. Authorization is enforced by your application.',
      '<TeamMembers title="Team" members={members} roles={roles} onInvite={invite} onRoleChange={changeRole} />',
      <Stack>
        <TeamMembers
          title="Workspace team"
          members={members}
          roles={[
            { value: 'owner', label: 'Owner' },
            { value: 'member', label: 'Member' },
            { value: 'viewer', label: 'Viewer' },
          ]}
          onInvite={(email) => setInvitations((old) => [...old, email])}
          onRoleChange={(id, role) =>
            setMembers((old) =>
              old.map((member) => (member.id === id ? { ...member, role } : member)),
            )
          }
        />
        <Text>{invitations.length} simulated invitations. No emails are sent.</Text>
      </Stack>,
    ),
    entry(
      'Notification Centre',
      'Patterns',
      'Unread filtering, read state and dismissal, with data controlled by the app.',
      '<NotificationCentre title="Updates" items={items} onRead={markRead} onDismiss={dismiss} />',
      <NotificationCentre
        title="Workspace updates"
        items={notifications}
        onRead={(id) =>
          setNotifications((old) =>
            old.map((item) => (item.id === id ? { ...item, read: true } : item)),
          )
        }
        onDismiss={(id) => setNotifications((old) => old.filter((item) => item.id !== id))}
      />,
    ),
    entry(
      'Privacy Preferences',
      'Patterns',
      'Required/optional categories and explicit saving. This is UI; the app owns actual consent enforcement.',
      '<PrivacyPreferences categories={categories} value={consent} onChange={setConsent} onSave={save} … />',
      <Stack>
        <PrivacyPreferences
          title="Privacy choices"
          description="Choose optional features for this local demonstration."
          categories={[
            {
              id: 'necessary',
              title: 'Necessary',
              description: 'Required to operate the service.',
              required: true,
            },
            {
              id: 'analytics',
              title: 'Usage analytics',
              description: 'Optional aggregate usage measurements.',
            },
            {
              id: 'marketing',
              title: 'Product news',
              description: 'Optional product announcements.',
            },
          ]}
          value={consent}
          onChange={(value) => {
            setConsent(value);
            setConsentSaved(false);
          }}
          onSave={() => setConsentSaved(true)}
        />
        {consentSaved && <Alert title="Preferences saved locally for this demo" tone="success" />}
      </Stack>,
    ),
    entry(
      'Pricing Cards',
      'Patterns',
      'Plan comparison with current/recommended states and asynchronous selection. No payments are taken.',
      '<PricingCards label="Plans" plans={plans} currentId={plan} onSelect={setPlan} />',
      <PricingCards
        label="Example plans"
        currentId={plan}
        onSelect={setPlan}
        plans={[
          {
            id: 'starter',
            name: 'Starter',
            price: 'Free',
            description: 'For personal exploration.',
            features: ['One workspace', 'Core components'],
          },
          {
            id: 'team',
            name: 'Team',
            price: '£12 / month',
            description: 'Fictional demo pricing.',
            recommended: true,
            features: ['Shared workspaces', 'Team permissions'],
          },
          {
            id: 'scale',
            name: 'Scale',
            price: 'Contact us',
            description: 'For larger organisations.',
            features: ['Custom support', 'Organisation controls'],
          },
        ]}
      />,
    ),
    entry(
      'Comments Panel',
      'Patterns',
      'Plain-text discussion with pending submission, preserved drafts on failure and retry.',
      '<CommentsPanel title="Discussion" comments={comments} onSubmit={addComment} />',
      <CommentsPanel
        title="Project discussion"
        comments={comments}
        onSubmit={(body) =>
          setComments((old) => [
            ...old,
            { id: String(Date.now()), author: 'You', dateLabel: 'Just now', body },
          ])
        }
      />,
    ),
    entry(
      'Approval Panel',
      'Patterns',
      'Review details, add a comment and record one decision with pending/error states and timeline history.',
      '<ApprovalPanel title="Review" details={details} onDecision={decide} … />',
      <Stack>
        <ApprovalPanel
          title="Review request"
          description="A simulated decision; no external action occurs."
          details={[
            { term: 'Request', description: 'Publish the project brief' },
            { term: 'Submitted by', description: 'Sam Taylor' },
          ]}
          history={events.slice(0, 2)}
          onDecision={(value) => setDecision(value)}
        />
        {decision && <Text>Demo decision: {decision}</Text>}
      </Stack>,
    ),
  ];
}

function ThemeSelectorDemo() {
  const [selection, setSelection] = useState<ThemeSelection>({
    preset: 'flat',
    palette: 'forest',
    mode: 'light',
  });
  return (
    <Stack>
      <ThemeSelector
        value={selection}
        onChange={setSelection}
        labels={{
          style: 'Visual style',
          palette: 'Colour palette',
          mode: 'Colour mode',
          light: 'Light',
          dark: 'Dark',
        }}
      />
      <ThemeProvider theme={createTheme(selection.preset, selection.mode, selection.palette)}>
        <Card>
          <Stack>
            <Text>Preview your appearance preferences.</Text>
            <Button>Example action</Button>
          </Stack>
        </Card>
      </ThemeProvider>
    </Stack>
  );
}
