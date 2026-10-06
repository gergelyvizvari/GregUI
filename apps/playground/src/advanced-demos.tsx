import { useState, type ReactNode } from 'react';
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
  CommandPalette,
  CommentsPanel,
  Dashboard,
  DataTable,
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
      'Compact image preview',
      'Media',
      'Read-only image preview without cropping.',
      '<ImageRegion src={url} alt="Reference" compact />',
      <ImageRegion
        compact
        alt="Portrait reference"
        src={
          'data:image/svg+xml,' +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="640"><rect width="180" height="640" fill="#53667d"/></svg>',
          )
        }
      />,
    ),
    entry(
      'Image region',
      'Media',
      'Responsive reference image with one editable region.',
      '<ImageRegion src={url} alt="Reference" value={region} onChange={setRegion} />',
      <ImageRegion
        src={
          'data:image/svg+xml,' +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#e8edf1"/><rect x="80" y="80" width="480" height="160" fill="#53667d"/><text x="100" y="160" fill="white" font-size="24">Mark part of this reference</text></svg>',
          )
        }
        alt="Example reference panel"
        value={region}
        onChange={setRegion}
        label="Mark reference region"
        help="Drag to mark; Enter to start; arrows to move; Shift + arrows to resize; Delete to clear."
      />,
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
      '<ThumbnailChoice label="Sample" checked={checked} onChange={setChecked} />',
      <ThumbnailChoice
        label="Sample"
        preview="Text preview"
        checked={fieldOpen}
        onChange={setFieldOpen}
      />,
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
      'A focus-managed action popover using normal Tab navigation and Escape to close.',
      '<ActionMenu label="Project actions" actions={actions} />',
      <Stack>
        <ActionMenu label="Project actions" actions={actions} />
        <Text>{action}</Text>
      </Stack>,
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
