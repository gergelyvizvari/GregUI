import { samplePhoto, PhotoCredit } from './sample-media';
import {
  TypographyDemo,
  PageCompositionDemo,
  TextStylesDemo,
  ReadingContentDemo,
} from './content-demo';
import { useAdvancedExamples } from './advanced-demos';
import { OnboardingDemo, PaginatedListDemo } from './workflow-demo';
import { AuthDemo } from './auth-demo';
import React, { useId, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Accordion,
  BrandPreview,
  EditorLayout,
  FormSection,
  FormActions,
  Stepper,
  AppShell,
  FeaturePanel,
  AccentLink,
  EditorialLead,
  SignalCard,
  ChipLink,
  MediaCard,
  PulseMark,
  NavItem,
  Icon,
  iconNames,
  IconButton,
  Avatar,
  AvatarGroup,
  Kbd,
  VisuallyHidden,
  Button,
  Badge,
  Postmark,
  Text,
  Heading,
  Stack,
  Inline,
  Grid,
  Split,
  Card,
  Section,
  PageHeader,
  ThemeProvider,
  ThemeArtwork,
  LocaleProvider,
  Field,
  Input,
  TextField,
  Textarea,
  Select,
  Checkbox,
  Switch,
  RadioGroup,
  Alert,
  Status,
  Progress,
  Skeleton,
  EmptyState,
  DescriptionList,
  Table,
  Breadcrumbs,
  Tabs,
  Dialog,
  Drawer,
  FloatingPanel,
  FullscreenDialog,
  DialogClose,
  ConfirmDialog,
  Tooltip,
  Popover,
  PreviewStage,
  PreviewComposition,
  PresetOption,
  ColorControl,
  Swatch,
  CodeBlock,
  Code,
  Divider,
  Link,
  ListDetail,
  ErrorSummary,
  useFormat,
} from '@gregui/react';
import {
  createTheme,
  typography,
  switchMode,
  paletteOptions,
  getPalette,
  applyPalette,
  type Palette,
  checkContrast,
  parseTheme,
  exportTheme,
  designMarkdown,
  colorRoles,
  presets,
  featuredPresets,
  presetInfo,
  type Theme,
  type Preset,
} from '@gregui/tokens';
import '@gregui/react/styles.css';

// The editing workspace keeps a stable paper/ink palette while the specimens change.
const workbenchTheme: Theme = {
  ...createTheme(),
  density: 'compact',
  colors: {
    ...createTheme().colors,
    background: '#f6f6f2',
    surface: '#fffefa',
    text: '#292923',
    muted: '#66665b',
    border: '#89897a',
    primary: '#34362e',
    onPrimary: '#ffffff',
    focus: '#49563e',
  },
};
const translations = {
  en: {
    title: 'Workspace settings',
    description: 'A small space to make your own.',
    name: 'Workspace name',
    email: 'Contact email',
    region: 'Region',
    updates: 'Product updates',
    hint: 'Only the updates you choose. No tracking.',
    save: 'Save changes',
    cancel: 'Reset',
    saved: 'Your preview changes are saved for this session.',
    nameError: 'Enter a workspace name.',
    emailError: 'Enter a valid email address.',
  },
  hu: {
    title: 'Munkaterület beállításai',
    description: 'Egy kis tér, amelyet sajátoddá tehetsz.',
    name: 'Munkaterület neve',
    email: 'Kapcsolattartási e-mail',
    region: 'Régió',
    updates: 'Termékfrissítések',
    hint: 'Csak a kiválasztott frissítések. Követés nélkül.',
    save: 'Módosítások mentése',
    cancel: 'Visszaállítás',
    saved: 'Az előnézet módosításai mentve erre a munkamenetre.',
    nameError: 'Add meg a munkaterület nevét.',
    emailError: 'Adj meg egy érvényes e-mail-címet.',
  },
  ar: {
    title: 'إعدادات مساحة العمل',
    description: 'مساحة صغيرة تجعلها خاصة بك.',
    name: 'اسم مساحة العمل',
    email: 'البريد الإلكتروني',
    region: 'المنطقة',
    updates: 'تحديثات المنتج',
    hint: 'التحديثات التي تختارها فقط. دون تتبع.',
    save: 'حفظ التغييرات',
    cancel: 'إعادة تعيين',
    saved: 'تم حفظ تغييرات المعاينة لهذه الجلسة.',
    nameError: 'أدخل اسم مساحة العمل.',
    emailError: 'أدخل عنوان بريد إلكتروني صالحًا.',
  },
};
type Language = keyof typeof translations;
function SettingsExample({ language = 'en' }: { language?: Language }) {
  const t = translations[language];
  const uid = useId();
  const [name, setName] = useState('Studio North');
  const [email, setEmail] = useState('hello@example.com');
  const [region, setRegion] = useState('uk');
  const [updates, setUpdates] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [saved, setSaved] = useState('');
  const format = useFormat();
  function reset() {
    setName('Studio North');
    setEmail('hello@example.com');
    setRegion('uk');
    setUpdates(false);
    setErrors({});
    setSaved('');
  }
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const issues = {
      name: name.trim() ? undefined : t.nameError,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? undefined : t.emailError,
    };
    setErrors(issues);
    setSaved('');
    if (issues.name || issues.email) {
      const target = e.currentTarget.elements.namedItem(issues.name ? 'workspace' : 'email');
      if (target instanceof HTMLElement) target.focus();
    } else setSaved(t.saved);
  }
  return (
    <Card padding={5}>
      <form onSubmit={submit} noValidate>
        <Stack gap={4}>
          <Inline justify="between">
            <Badge tone="primary">{language === 'ar' ? 'مساحة العمل' : 'WORKSPACE'}</Badge>
            <Icon name="layers" />
          </Inline>
          <Stack gap={2}>
            <Heading level={3} size="section">
              {t.title}
            </Heading>
            <Text size="small" tone="muted">
              {t.description}
            </Text>
          </Stack>
          {(errors.name || errors.email) && (
            <ErrorSummary
              title={
                language === 'en'
                  ? 'Check your details'
                  : language === 'hu'
                    ? 'Ellenőrizd az adatokat'
                    : 'تحقق من التفاصيل'
              }
              errors={[
                ...(errors.name ? [{ id: `${uid}-name`, message: errors.name }] : []),
                ...(errors.email ? [{ id: `${uid}-email`, message: errors.email }] : []),
              ]}
            />
          )}
          <TextField
            id={`${uid}-name`}
            name="workspace"
            label={t.name}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved('');
            }}
            required
            error={errors.name}
          />
          <TextField
            id={`${uid}-email`}
            name="email"
            type="email"
            autoComplete="email"
            label={t.email}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSaved('');
            }}
            required
            error={errors.email}
          />
          <Field label={t.region}>
            {(p) => (
              <Select {...p} value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="uk">
                  {language === 'ar'
                    ? 'المملكة المتحدة'
                    : language === 'hu'
                      ? 'Egyesült Királyság'
                      : 'United Kingdom'}
                </option>
                <option value="eu">
                  {language === 'ar'
                    ? 'الاتحاد الأوروبي'
                    : language === 'hu'
                      ? 'Európai Unió'
                      : 'European Union'}
                </option>
              </Select>
            )}
          </Field>
          <Divider />
          <Checkbox
            label={t.updates}
            hint={t.hint}
            checked={updates}
            onChange={(e) => setUpdates(e.target.checked)}
          />
          <Inline>
            <Button type="submit" icon={<Icon name="check" />}>
              {t.save}
            </Button>
            <Button variant="ghost" onClick={reset}>
              {t.cancel}
            </Button>
          </Inline>
          <Status>{saved}</Status>
          <Text size="small" tone="muted">
            {language === 'en'
              ? 'Sample content · no data is sent'
              : language === 'hu'
                ? 'Mintaadatok · nincs adattovábbítás'
                : 'بيانات تجريبية · لا يتم إرسال بيانات'}{' '}
            · {format.number(1250)}
          </Text>
        </Stack>
      </form>
    </Card>
  );
}
function LocalePreview({
  theme,
  language,
  children,
}: {
  theme: Theme;
  language: Language;
  children: ReactNode;
}) {
  return (
    <LocaleProvider
      locale={language === 'en' ? 'en-GB' : language === 'hu' ? 'hu-HU' : 'ar'}
      direction={language === 'ar' ? 'rtl' : 'ltr'}
      messages={
        language === 'ar'
          ? { close: 'إغلاق', required: 'مطلوب', loading: 'جار التحميل' }
          : undefined
      }
    >
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </LocaleProvider>
  );
}
const workbenchPages = [
  'overview',
  'components',
  'typography',
  'themes',
  'foundations',
  'patterns',
  'auth',
  'quality',
];
function pageFromLocation() {
  const requested = new URLSearchParams(window.location.search).get('page');
  return requested && workbenchPages.includes(requested) ? requested : 'overview';
}

function App() {
  const [page, setPageState] = useState(pageFromLocation);
  const [theme, setTheme] = useState<Theme>(createTheme('glass'));
  const [history, setHistory] = useState<Theme[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [notice, setNotice] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [search, setSearch] = useState('');
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  const panelAvailable = ['components', 'typography', 'patterns', 'auth', 'foundations'].includes(
    page,
  );
  function setPage(next: string) {
    if (next === page) return;
    const url = new URL(window.location.href);
    url.searchParams.set('page', next);
    url.hash = '';
    window.history.pushState(null, '', url);
    setPageState(next);
    setThemePanelOpen(false);
  }
  React.useEffect(() => {
    const back = () => {
      const next = pageFromLocation();
      if (next !== page) {
        setPageState(next);
        setThemePanelOpen(false);
      }
    };
    window.addEventListener('popstate', back);
    return () => window.removeEventListener('popstate', back);
  }, [page]);
  const checks = checkContrast(theme);
  const failures = checks.filter((c) => !c.pass);
  function edit(next: Theme) {
    setHistory((h) => [...h.slice(-49), theme]);
    setTheme(next);
    setNotice('');
  }
  function changePreset(preset: Preset) {
    edit({
      ...createTheme(preset, theme.mode),
      name: theme.name,
      density: theme.density,
      motion: theme.motion,
    });
    setNotice(
      `${presetInfo[preset].name} palette and shape loaded. Your previous theme is available with Undo.`,
    );
  }
  function undo() {
    if (history.length) {
      setTheme(history[history.length - 1]);
      setHistory((h) => h.slice(0, -1));
      setNotice('Previous theme restored.');
    }
  }
  function download(format: 'json' | 'css' | 'md') {
    try {
      const data = format === 'md' ? designMarkdown(theme) : exportTheme(theme, format);
      const type = { json: 'application/json', css: 'text/css', md: 'text/markdown' }[format];
      const url = URL.createObjectURL(new Blob([data], { type }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = format === 'md' ? 'DESIGN.md' : `gregui-theme.${format}`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(
        'Theme downloaded. Contrast checks passed; full accessibility review is still required.',
      );
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  function save() {
    let draft: Theme;
    try {
      draft = parseTheme(theme);
    } catch (error) {
      setNotice((error as Error).message);
      return;
    }
    try {
      localStorage.setItem('gregui.theme.v1', JSON.stringify(draft));
      setNotice('Draft saved on this device.');
    } catch {
      setNotice('This browser could not save your draft. Download or copy the theme JSON instead.');
    }
  }
  function restore() {
    try {
      const stored = localStorage.getItem('gregui.theme.v1');
      if (!stored) {
        setNotice('No saved draft on this device.');
        return;
      }
      edit(parseTheme(JSON.parse(stored)));
      setNotice('Saved draft restored.');
    } catch {
      setNotice('The saved draft could not be read. Import a version 1 theme instead.');
    }
  }
  const navigation = [
    { key: 'overview', label: 'Overview', icon: 'grid' },
    { key: 'components', label: 'Components', icon: 'layers' },
    { key: 'typography', label: 'Typography & pages', icon: 'code' },
    { key: 'themes', label: 'Theme studio', icon: 'palette' },
    { key: 'foundations', label: 'Foundations', icon: 'code' },
    { key: 'patterns', label: 'Patterns', icon: 'grid' },
    { key: 'auth', label: 'Authentication', icon: 'shield' },
    { key: 'quality', label: 'Accessibility & support', icon: 'shield' },
  ] as const;
  const themeActions = (
    <Inline gap={2}>
      <Button
        variant="secondary"
        size="small"
        icon={<Icon name="undo" />}
        onClick={undo}
        disabled={!history.length}
      >
        Undo
      </Button>
      <Button
        size="small"
        icon={<Icon name="download" />}
        disabled={failures.length > 0}
        onClick={() => download('json')}
      >
        Export theme
      </Button>
    </Inline>
  );
  const presetCards = (
    <Grid columns="auto" gap={3}>
      {featuredPresets.map((p) => (
        <PresetOption
          key={p}
          preset={p}
          mode={theme.mode}
          {...presetInfo[p]}
          selected={theme.preset === p}
          onClick={() => changePreset(p)}
        />
      ))}
    </Grid>
  );
  const controlsContent = (
    <Stack gap={4}>
      <Inline justify="between">
        <Heading level={2} size="section">
          Make it yours
        </Heading>
        <Badge>LIVE</Badge>
      </Inline>
      <Text size="small" tone="muted">
        Palette, shape and density. Every change is live.
      </Text>
      <TextField
        label="Theme name"
        value={theme.name}
        maxLength={80}
        onChange={(e) => edit({ ...theme, name: e.target.value })}
      />
      <Field label="Palette">
        {(p) => (
          <Select
            {...p}
            value={getPalette(theme) ?? 'custom'}
            onChange={(e) => edit(applyPalette(theme, e.target.value as Palette))}
          >
            {!getPalette(theme) && (
              <option value="custom" disabled>
                Custom colours
              </option>
            )}
            {paletteOptions.map((palette) => (
              <option key={palette.id} value={palette.id}>
                {palette.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Grid columns={3} gap={2}>
        <Swatch label="Canvas" color={theme.colors.background} />
        <Swatch label="Surface" color={theme.colors.surface} />
        <Swatch label="Accent" color={theme.colors.primary} />
      </Grid>
      <Switch
        label="Dark mode"
        checked={theme.mode === 'dark'}
        onChange={(e) => {
          edit(switchMode(theme, e.target.checked ? 'dark' : 'light'));
          setNotice(
            'Mode changed. Your custom colours are kept where they stay readable; the rest follow the palette.',
          );
        }}
      />
      <Field label="Density">
        {(p) => (
          <Select
            {...p}
            value={theme.density}
            onChange={(e) => edit({ ...theme, density: e.target.value as Theme['density'] })}
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </Select>
        )}
      </Field>
      <Grid>
        <Field label="Corners">
          {(p) => (
            <Select
              {...p}
              value={theme.radius}
              onChange={(e) => edit({ ...theme, radius: e.target.value as Theme['radius'] })}
            >
              <option value="square">Square</option>
              <option value="rounded">Rounded</option>
              <option value="pill">Soft round</option>
            </Select>
          )}
        </Field>
        <Field label="Typography">
          {(p) => (
            <Select
              {...p}
              value={theme.font}
              onChange={(e) => edit({ ...theme, font: e.target.value as Theme['font'] })}
            >
              <option value="system">System sans</option>
              <option value="humanist">Humanist</option>
              <option value="mono">Monospace</option>
            </Select>
          )}
        </Field>
      </Grid>
      <Switch
        label="Restrained accent"
        checked={theme.accent === 'restrained'}
        onChange={(e) => edit({ ...theme, accent: e.target.checked ? 'restrained' : 'expressive' })}
      />
      <Switch
        label="Reduce motion"
        checked={theme.motion === 'reduced'}
        onChange={(e) => edit({ ...theme, motion: e.target.checked ? 'reduced' : 'standard' })}
      />
      <Divider />
      <Stack gap={2}>
        <Text size="eyebrow" tone="muted">
          Semantic colors
        </Text>
        {(page === 'themes' || panelAvailable
          ? colorRoles
          : (['primary', 'background', 'surface', 'text', 'border'] as const)
        ).map((role) => (
          <ColorControl
            key={role}
            label={role === 'onPrimary' ? 'On primary' : role[0].toUpperCase() + role.slice(1)}
            value={theme.colors[role]}
            onChange={(color) => edit({ ...theme, colors: { ...theme.colors, [role]: color } })}
          />
        ))}
      </Stack>
      <Divider />
      <Alert
        title={
          failures.length
            ? `${failures.length} contrast pairs need attention`
            : 'Palette checks passed'
        }
        tone={failures.length ? 'warning' : 'success'}
      >
        <Text size="small">
          {failures.length
            ? 'Adjust your colors before exporting. Draft previews remain available.'
            : 'All 15 checked pairs meet their thresholds. This is not an accessibility certification.'}
        </Text>
      </Alert>
      <Inline gap={2}>
        <Button variant="secondary" size="small" onClick={save}>
          Save draft
        </Button>
        <Button variant="ghost" size="small" onClick={restore}>
          Restore draft
        </Button>
        <ConfirmDialog
          trigger={
            <Button variant="ghost" size="small">
              Reset theme
            </Button>
          }
          title="Reset this theme?"
          description="Reset colors, typography, density and corners for this preset and mode. You can undo this change."
          confirmLabel="Reset theme"
          cancelLabel="Keep editing"
          onConfirm={() => edit(createTheme(theme.preset, theme.mode))}
        />
      </Inline>
    </Stack>
  );
  const controls = <Card padding={5}>{controlsContent}</Card>;
  const transferActions = (
    <Inline>
      <Dialog
        open={importOpen}
        onOpenChange={setImportOpen}
        trigger={
          <Button variant="secondary" icon={<Icon name="upload" />}>
            Import JSON
          </Button>
        }
        title="Import a theme"
        description="Paste a gregUI version 1 JSON theme, or select a local JSON file."
        footer={
          <Button
            onClick={() => {
              try {
                edit(parseTheme(JSON.parse(importText)));
                setImportError('');
                setImportOpen(false);
                setNotice('Theme imported. Review any contrast findings.');
              } catch (e) {
                setImportError((e as Error).message);
              }
            }}
          >
            Apply theme
          </Button>
        }
      >
        <Stack>
          <Field label="Theme file">
            {(p) => (
              <Input
                {...p}
                type="file"
                accept=".json,application/json"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 64000) {
                    setImportError('Choose a theme smaller than 64 KB.');
                    return;
                  }
                  try {
                    setImportText(await f.text());
                    setImportError('');
                  } catch {
                    setImportError('The file could not be read.');
                  }
                }}
              />
            )}
          </Field>
          <Field label="Theme JSON" error={importError}>
            {(p) => (
              <Textarea
                {...p}
                rows={12}
                maxLength={64000}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
            )}
          </Field>
        </Stack>
      </Dialog>
      <Button variant="secondary" onClick={() => download('css')} disabled={failures.length > 0}>
        Export CSS tokens
      </Button>
      <Button variant="secondary" onClick={() => download('md')} disabled={failures.length > 0}>
        Export DESIGN.md
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          edit(createTheme('flat'));
          setNotice('Default flat theme loaded. Use Undo to compare with your previous theme.');
        }}
      >
        Compare with default
      </Button>
    </Inline>
  );
  const contrastTable = (
    <Table
      caption="Theme color contrast"
      columns={['Color pair', 'Ratio', 'Required', 'Result']}
      rows={checks.map((c) => [
        c.label,
        `${c.ratio.toFixed(2)}:1`,
        `${c.minimum}:1`,
        <Badge tone={c.pass ? 'success' : 'danger'}>{c.pass ? 'Pass' : 'Adjust'}</Badge>,
      ])}
    />
  );
  const preview = (
    <Stack gap={4}>
      <Inline justify="between">
        <Inline gap={2}>
          <Text size="eyebrow" tone="muted">
            Live preview
          </Text>
          <Badge>{presetInfo[theme.preset].name}</Badge>
        </Inline>
        <Field label="Preview language">
          {(p) => (
            <Select
              {...p}
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              <option value="en">English</option>
              <option value="hu">Magyar · long labels</option>
              <option value="ar">العربية · RTL</option>
            </Select>
          )}
        </Field>
      </Inline>
      <LocalePreview theme={theme} language={language}>
        <PreviewStage showcase>
          <PreviewComposition>
            <SettingsExample language={language} />
            <Stack gap={5}>
              <Card>
                <Stack gap={4}>
                  <Inline justify="between">
                    <Badge tone="success">Active</Badge>
                    <Icon name="arrow" />
                  </Inline>
                  <Stack gap={2}>
                    <Text size="eyebrow" tone="muted">
                      Sample project
                    </Text>
                    <Heading level={3} size="section">
                      Website launch
                    </Heading>
                    <Text size="small" tone="muted">
                      A little progress, every day.
                    </Text>
                  </Stack>
                  <Inline gap={2}>
                    <Badge>AN</Badge>
                    <Badge>JL</Badge>
                    <Badge>+2</Badge>
                    <Text size="small" tone="muted">
                      Your team
                    </Text>
                  </Inline>
                  <Divider />
                  <Progress value={72} label="Project setup" />
                  <Text size="small" tone="muted">
                    18 of 25 tasks complete
                  </Text>
                </Stack>
              </Card>
              <Card>
                <Stack gap={4}>
                  <Icon name="layers" />
                  <Heading level={3} size="card">
                    A place for every detail.
                  </Heading>
                  <Text size="small" tone="muted">
                    Open a focused view. The same visual language follows you.
                  </Text>
                  <Dialog
                    size="large"
                    trigger={<Button variant="secondary">Open dialog</Button>}
                    title="A focused conversation"
                    description="This dialog uses the preview’s theme, language and direction."
                    footer={
                      <DialogClose>
                        <Button>Got it</Button>
                      </DialogClose>
                    }
                  >
                    <Text>
                      Tab stays within the dialog. Escape closes it and returns focus to the
                      trigger.
                    </Text>
                  </Dialog>
                </Stack>
              </Card>
              <Alert title="Everything in sync" tone="success">
                Shared tokens keep every detail connected.
              </Alert>
            </Stack>
          </PreviewComposition>
        </PreviewStage>
      </LocalePreview>
      <Text size="small" tone="muted">
        Preview styles are isolated. The editor stays readable while you experiment.
      </Text>
    </Stack>
  );
  return (
    <LocaleProvider>
      <ThemeProvider theme={workbenchTheme}>
        <AppShell
          viewKey={page}
          sidebarCollapsible
          brand="gregUI"
          subtitle="Interface atelier"
          nav={navigation.map((n) => (
            <NavItem
              key={n.key}
              icon={n.icon}
              active={page === n.key}
              onClick={() => {
                setPage(n.key);
                setThemePanelOpen(false);
                setNotice('');
              }}
            >
              {n.label}
            </NavItem>
          ))}
          footer={
            <Stack gap={3}>
              <Divider />
              <Inline gap={2}>
                <Badge tone="primary">0.1.0</Badge>
                <Text size="small" tone="muted">
                  Foundation release
                </Text>
              </Inline>
              <Text size="small" tone="muted">
                Compose once.
                <br />
                Build what comes next.
              </Text>
            </Stack>
          }
          toolbar={
            <>
              <Breadcrumbs
                items={[
                  { label: 'Design system' },
                  { label: navigation.find((n) => n.key === page)?.label ?? 'Overview' },
                ]}
              />
              <Inline gap={3}>
                <Badge>REACT</Badge>
                <Text size="small" tone="muted">
                  Components / Patterns / Tokens
                </Text>
              </Inline>
            </>
          }
        >
          {page === 'overview' && (
            <>
              <PageHeader
                eyebrow="GREGUI — INTERFACE STUDIES / 01"
                artwork={
                  <ThemeProvider theme={theme}>
                    <ThemeArtwork />
                  </ThemeProvider>
                }
                title="Seven directions. One foundation."
                description="A considered collection of surfaces, shapes and interactions. Built to feel like you."
                actions={themeActions}
              />
              <Stack gap={7}>
                <Section
                  title="The collection"
                  description="Seven considered directions, from quiet precision to expressive depth."
                  action={
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => setPage('themes')}
                      icon={<Icon name="arrow" />}
                    >
                      Theme studio
                    </Button>
                  }
                >
                  {presetCards}
                </Section>
                <Split>
                  {preview}
                  {controls}
                </Split>
              </Stack>
            </>
          )}
          {page === 'themes' && (
            <>
              <PageHeader
                eyebrow="Theme studio"
                title="Your identity. Every detail."
                description="Tune semantic tokens, compare styles and take your theme into any gregUI app."
                actions={themeActions}
              />
              <Stack gap={6}>
                {presetCards}
                {transferActions}
                <Split>
                  {preview}
                  {controls}
                </Split>
                <Section
                  title="Contrast report"
                  description="Computed checks for opaque token pairs. Interactive behavior and rendered pages need separate review."
                >
                  {contrastTable}
                </Section>
              </Stack>
            </>
          )}
          {page === 'components' && (
            <>
              <PageHeader
                eyebrow="The building blocks"
                title="Small pieces. Shared standards."
                description="Filter by category or search, then select an example from the index. Each example has a bookmarkable address."
                actions={
                  <Field label="Preview style">
                    {(p) => (
                      <Select
                        {...p}
                        value={theme.preset}
                        onChange={(e) => changePreset(e.target.value as Preset)}
                      >
                        {featuredPresets.map((preset) => (
                          <option key={preset} value={preset}>
                            {presetInfo[preset].name}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                }
              />
              <ComponentCatalog theme={theme} search={search} onSearchChange={setSearch} />
            </>
          )}
          {page === 'typography' && (
            <>
              <PageHeader
                eyebrow="Typography & pages"
                title="Typography and page elements"
                description="Explore text styles, reading content and reusable page structure. Use Edit theme to compare appearances."
              />
              <Tabs
                label="Typography and page examples"
                items={[
                  {
                    value: 'text',
                    label: 'Text styles',
                    content: (
                      <Section title="Text styles">
                        <ThemeProvider theme={theme}>
                          <PreviewStage label="Text styles preview">
                            <TextStylesDemo />
                          </PreviewStage>
                        </ThemeProvider>
                      </Section>
                    ),
                  },
                  {
                    value: 'reading',
                    label: 'Reading content',
                    content: (
                      <Section title="Reading content">
                        <ThemeProvider theme={theme}>
                          <PreviewStage label="Reading content preview">
                            <ReadingContentDemo />
                          </PreviewStage>
                        </ThemeProvider>
                      </Section>
                    ),
                  },
                  {
                    value: 'pages',
                    label: 'Page elements',
                    content: (
                      <Section title="Page elements">
                        <ThemeProvider theme={theme}>
                          <PreviewStage label="Page elements preview">
                            <PageCompositionDemo />
                          </PreviewStage>
                        </ThemeProvider>
                      </Section>
                    ),
                  },
                  {
                    value: 'scale',
                    label: 'Type scale',
                    content: (
                      <Section title="Type scale">
                        <Table
                          caption="Typography roles"
                          columns={['Role', 'Size', 'Line height', 'Tracking']}
                          rows={Object.entries(typography).map(([role, token]) => [
                            role,
                            token.fontSize,
                            token.lineHeight,
                            token.letterSpacing,
                          ])}
                        />
                      </Section>
                    ),
                  },
                ]}
              />
            </>
          )}
          {page === 'foundations' && (
            <>
              <PageHeader
                eyebrow="Foundations"
                title="Consistency starts here."
                description="Semantic roles connect your brand to every component. Change a token once, carry it everywhere."
              />
              <Stack gap={7}>
                <Section
                  title="Color roles"
                  description="The current draft theme, expressed as purpose rather than arbitrary hex values."
                >
                  <Grid columns={4}>
                    {colorRoles.map((role) => (
                      <Swatch key={role} label={role} color={theme.colors[role]} />
                    ))}
                  </Grid>
                </Section>
                <Section
                  title="Typography"
                  description="Local system fonts. No external font requests."
                >
                  <ThemeProvider theme={theme}>
                    <PreviewStage label="Typography preview">
                      <TypographyDemo />
                    </PreviewStage>
                  </ThemeProvider>
                </Section>
                <Section
                  title="Page foundations"
                  description="Page titles, context, reading measures and semantic section nesting."
                >
                  <ThemeProvider theme={theme}>
                    <PreviewStage label="Page composition preview">
                      <PageCompositionDemo />
                    </PreviewStage>
                  </ThemeProvider>
                </Section>
                <Grid>
                  <Section title="Space & shape">
                    <DescriptionList
                      items={[
                        { term: 'Spacing scale', description: '4, 8, 12, 16, 24, 32, 48, 64 px' },
                        { term: 'Corners', description: 'Square / rounded / soft round' },
                        { term: 'Density', description: 'Comfortable / compact' },
                        { term: 'Layout', description: 'Stack / Inline / Grid / Split' },
                      ]}
                    />
                  </Section>
                  <Section title="Behavior first">
                    <Alert title="A style never changes the interaction">
                      Keyboard controls, names, validation and focus behavior stay consistent across
                      all sixteen presets.
                    </Alert>
                    <Text size="small" tone="muted">
                      Reduced motion and forced colors are supported independently of the visual
                      preset.
                    </Text>
                  </Section>
                </Grid>
                <Section title="Use in your application">
                  <CodeBlock>{`import { ThemeProvider, Button, Stack } from '@gregui/react';\nimport { createTheme } from '@gregui/tokens';\nimport '@gregui/react/styles.css';\n\n<ThemeProvider theme={createTheme('flat')}>\n  <Stack gap={4}>\n    <Button onClick={save}>Save changes</Button>\n  </Stack>\n</ThemeProvider>`}</CodeBlock>
                </Section>
              </Stack>
            </>
          )}
          {page === 'auth' && <AuthDemo theme={theme} onPresetChange={changePreset} />}
          {page === 'patterns' && (
            <Stack gap={8}>
              <PageHeader
                eyebrow="Patterns"
                title="Reusable page patterns"
                description="Explore how gregUI components work together as complete layouts and flows. Choose an example below, then change Preview style to compare themes. These local demos do not save data or connect to services."
                actions={
                  <Field label="Preview style">
                    {(p) => (
                      <Select
                        {...p}
                        value={theme.preset}
                        onChange={(e) => changePreset(e.target.value as Preset)}
                      >
                        {featuredPresets.map((preset) => (
                          <option key={preset} value={preset}>
                            {presetInfo[preset].name}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                }
              />
              <Tabs
                label="Pattern examples"
                items={[
                  {
                    value: 'brand-preview',
                    label: 'Brand preview',
                    content: (
                      <BrandPreview
                        label="Local brand preview"
                        cover={samplePhoto.src}
                        name="Harbour Arts"
                        title="At the harbour"
                        description="Independent exhibitions and performances."
                        compact
                      >
                        <Button
                          onClick={() =>
                            setNotice('Demo action: your application supplies the destination.')
                          }
                        >
                          Explore
                        </Button>
                        <PhotoCredit />
                      </BrandPreview>
                    ),
                  },
                  {
                    value: 'editor',
                    label: 'Document editor',
                    content: (
                      <EditorLayout
                        aside={{
                          label: 'Review',
                          content: (
                            <Card>
                              <Text>Private draft</Text>
                            </Card>
                          ),
                        }}
                      >
                        <form onSubmit={(e) => e.preventDefault()}>
                          <Stack>
                            <FormSection title="Details" number={1}>
                              <TextField label="Title" />
                            </FormSection>
                            <FormSection title="Schedule" number={2}>
                              <TextField label="Date" type="date" />
                            </FormSection>
                            <FormActions>
                              <Button type="submit">Save draft</Button>
                            </FormActions>
                          </Stack>
                        </form>
                      </EditorLayout>
                    ),
                  },
                  {
                    value: 'onboarding',
                    label: 'Onboarding',
                    content: (
                      <ThemeProvider theme={theme}>
                        <PreviewStage>
                          <OnboardingDemo />
                        </PreviewStage>
                      </ThemeProvider>
                    ),
                  },
                  {
                    value: 'settings',
                    label: 'Settings form',
                    content: (
                      <LocalePreview theme={theme} language={language}>
                        <PreviewStage>
                          <SettingsExample language={language} />
                        </PreviewStage>
                      </LocalePreview>
                    ),
                  },
                  {
                    value: 'data',
                    label: 'Data page',
                    content: (
                      <LocalePreview theme={theme} language={language}>
                        <Card>
                          <Stack>
                            <Heading level={3}>Your projects</Heading>
                            <Text tone="muted">Sample data for a reusable list page.</Text>
                            <Table
                              caption="Sample projects"
                              columns={['Project', 'Status', 'Owner']}
                              rows={[
                                ['Customer portal', <Badge tone="success">Active</Badge>, 'Alex'],
                                ['Team workspace', <Badge tone="warning">Draft</Badge>, 'Sam'],
                              ]}
                            />
                          </Stack>
                        </Card>
                      </LocalePreview>
                    ),
                  },
                  {
                    value: 'empty',
                    label: 'Empty state',
                    content: (
                      <Card>
                        <EmptyState
                          title="A little room for something new"
                          description="Your projects will appear here when you create one."
                          action={
                            <Button
                              onClick={() =>
                                setNotice(
                                  'Example action: connect this callback to your app’s create flow.',
                                )
                              }
                              icon={<Icon name="plus" />}
                            >
                              Create project
                            </Button>
                          }
                        />
                      </Card>
                    ),
                  },
                  {
                    value: 'editorial',
                    label: 'Editorial layouts',
                    content: (
                      <Stack gap={8}>
                        <EditorialLead
                          feature={
                            <FeaturePanel
                              variant="immersive"
                              image={samplePhoto.src}
                              imageAlt={samplePhoto.alt}
                            >
                              <Heading level={3}>Featured story</Heading>
                              <Text>Readable copy on an opaque surface.</Text>
                            </FeaturePanel>
                          }
                          aside={
                            <SignalCard>
                              <Heading level={3}>Supporting update</Heading>
                              <ChipLink
                                href="#main"
                                onClick={() =>
                                  setNotice('Demo link: your application supplies the destination.')
                                }
                              >
                                Read more
                              </ChipLink>
                            </SignalCard>
                          }
                        />

                        <FeaturePanel image={samplePhoto.src} imageAlt={samplePhoto.alt}>
                          <Stack>
                            <PulseMark />
                            <Heading level={3}>Split image and text</Heading>
                            <AccentLink
                              href="#main"
                              palette={{ background: '#ff654f', text: '#0f3029' }}
                            >
                              Explore the collection →
                            </AccentLink>
                            <Text>
                              Opaque copy surfaces, responsive imagery and the current theme.
                            </Text>
                          </Stack>
                        </FeaturePanel>
                        <MediaCard image={samplePhoto.src} imageAlt={samplePhoto.alt}>
                          <Heading level={3}>Article card</Heading>
                          <Text>
                            Applications supply content, attribution and meaningful image
                            descriptions.
                          </Text>
                        </MediaCard>
                        <PhotoCredit />
                      </Stack>
                    ),
                  },
                ].map((example) => ({
                  ...example,
                  content: (
                    <Section
                      title={example.label}
                      description={
                        {
                          'brand-preview':
                            'A compact brand landing page with a name, introduction and primary action.',
                          editor:
                            'A long-form editor with grouped fields, a review sidebar and a shared action bar.',
                          onboarding:
                            'A guided setup flow. Try validation, moving between steps and completing the demo.',
                          settings:
                            'An editable settings form with grouped preferences and save feedback.',
                          data: 'A simple project list combining a page heading, status badges and a table.',
                          empty:
                            'A first-use screen that explains missing content and offers a next action.',
                          editorial:
                            'Three content compositions: a lead story with a supporting update, a split feature and an image-led article card. Includes a locally bundled, credited Unsplash photograph.',
                        }[example.value]
                      }
                    >
                      {example.content}
                    </Section>
                  ),
                }))}
              />
            </Stack>
          )}
          {page === 'quality' && (
            <>
              <PageHeader
                eyebrow="Built with care"
                title="Trust needs evidence."
                description="Accessibility is a shared responsibility. These are the system’s targets and the checks still needed for production adoption."
              />
              <Stack gap={6}>
                <Alert title="Foundation release · not certified" tone="warning">
                  Automated checks are part of the repository. Manual screen-reader testing and
                  historical browser/device verification remain required before production claims.
                </Alert>
                <Grid>
                  <Card>
                    <Stack>
                      <Icon name="shield" />
                      <Heading level={2}>Accessibility</Heading>
                      <DescriptionList
                        items={[
                          { term: 'Engineering target', description: 'WCAG 2.2 AA' },
                          { term: 'Interaction primitives', description: 'Radix + semantic HTML' },
                          {
                            term: 'Review scope',
                            description: 'Components + complete app workflows',
                          },
                          { term: 'Europe', description: 'Map applicable EN 301 549 criteria' },
                        ]}
                      />
                    </Stack>
                  </Card>
                  <Card>
                    <Stack>
                      <Icon name="layers" />
                      <Heading level={2}>Browser compatibility</Heading>
                      <Text size="small" tone="muted">
                        A rolling 24-month support policy, with conservative build targets.
                        Compilation alone does not verify browser behavior.
                      </Text>
                      <DescriptionList
                        items={[
                          { term: 'Desktop', description: 'Chrome, Edge, Firefox, Safari' },
                          { term: 'Mobile', description: 'iOS/iPadOS Safari, Android Chrome' },
                          { term: 'Enterprise', description: 'Firefox ESR' },
                          {
                            term: 'Minimum-version changes',
                            description: 'Documented major releases',
                          },
                        ]}
                      />
                    </Stack>
                  </Card>
                </Grid>
                <Section title="Privacy by default">
                  <Text>
                    No analytics, remote fonts or network calls from UI components. Theme drafts are
                    saved locally only when you choose Save draft. Application data handling remains
                    the application’s responsibility.
                  </Text>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      try {
                        localStorage.removeItem('gregui.theme.v1');
                        setNotice('Local theme draft deleted.');
                      } catch {
                        setNotice('Browser storage is unavailable.');
                      }
                    }}
                  >
                    Delete saved draft
                  </Button>
                </Section>
                <Section title="Reference standards">
                  <Stack gap={2}>
                    <Link href="https://www.w3.org/TR/WCAG22/">WCAG 2.2 — W3C</Link>
                    <Link href="https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps">
                      UK public-sector accessibility requirements
                    </Link>
                    <Link href="https://digital-strategy.ec.europa.eu/en/policies/web-accessibility-directive-standards-and-harmonisation">
                      EU accessibility standards and harmonisation
                    </Link>
                  </Stack>
                </Section>
              </Stack>
            </>
          )}
          <Status>{themePanelOpen && panelAvailable ? '' : notice}</Status>
        </AppShell>
        {panelAvailable && (
          <FloatingPanel
            trigger={<Button icon={<Icon name="palette" />}>Edit theme</Button>}
            title="Live theme editor"
            description="Changes update the current previews immediately."
            closeLabel="Collapse theme editor"
            open={themePanelOpen}
            onOpenChange={setThemePanelOpen}
            footer={
              <Stack gap={2}>
                {themeActions}
                <Text size="small" tone="muted">
                  Closing keeps your changes. Save draft stores them on this device.
                </Text>
              </Stack>
            }
          >
            <Stack gap={4}>
              <Status>{notice}</Status>
              <Field label="Style">
                {(props) => (
                  <Select
                    {...props}
                    value={theme.preset}
                    onChange={(event) => changePreset(event.target.value as Preset)}
                  >
                    {presets.map((preset) => (
                      <option key={preset} value={preset}>
                        {presetInfo[preset].name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              {controlsContent}
              {transferActions}
              <Accordion
                items={[{ value: 'contrast', title: 'Contrast details', content: contrastTable }]}
              />
            </Stack>
          </FloatingPanel>
        )}
      </ThemeProvider>
    </LocaleProvider>
  );
}
function ComponentCatalog({
  theme,
  search,
  onSearchChange,
}: {
  theme: Theme;
  search: string;
  onSearchChange: (search: string) => void;
}) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('gregui.catalog.groups.v1') ?? 'null');
      if (
        saved &&
        typeof saved === 'object' &&
        'version' in saved &&
        saved.version === 1 &&
        'expandedGroups' in saved &&
        Array.isArray(saved.expandedGroups) &&
        saved.expandedGroups.every((group) => typeof group === 'string' && group.length > 0)
      )
        return [...new Set(saved.expandedGroups as string[])];
    } catch {
      /* Browser preferences may be unavailable or malformed. */
    }
    return [];
  });
  const saveExpandedGroups = (groups: string[]) => {
    setExpandedGroups(groups);
    try {
      localStorage.setItem(
        'gregui.catalog.groups.v1',
        JSON.stringify({ version: 1, expandedGroups: groups }),
      );
    } catch {
      /* Keep the current session usable when storage is blocked. */
    }
  };
  const [category, setCategory] = useState('all');
  const [selectedId, setSelectedId] = useState(
    () => new URLSearchParams(window.location.search).get('component') ?? 'typography-content',
  );
  const locationSearch = React.useRef(window.location.search);
  React.useEffect(() => {
    const back = () => {
      if (window.location.search === locationSearch.current) return;
      locationSearch.current = window.location.search;
      setSelectedId(
        new URLSearchParams(window.location.search).get('component') ?? 'typography-content',
      );
      setCategory('all');
      onSearchChange('');
    };
    window.addEventListener('popstate', back);
    return () => window.removeEventListener('popstate', back);
  }, [onSearchChange]);
  const [radio, setRadio] = useState('monthly');
  const [value, setValue] = useState('');
  const [action, setAction] = useState('');
  const entries: {
    name: string;
    category: string;
    description: string;
    api: string;
    demo: ReactNode;
  }[] = [
    {
      name: 'Accordion',
      category: 'Disclosure',
      description: 'Native keyboard-operated disclosures. Multiple sections can remain open.',
      api: '<Accordion items={[{ value: "help", title: "Need help?", content: <Text>Contact us.</Text> }]} />',
      demo: (
        <Accordion
          items={[
            {
              value: 'start',
              title: 'How do I get started?',
              content: <Text>Choose a style, then compose shared components.</Text>,
            },
            {
              value: 'theme',
              title: 'Can I change the theme later?',
              content: <Text>Yes. Theme tokens update every component together.</Text>,
            },
          ]}
        />
      ),
    },
    {
      name: 'Pagination',
      category: 'Navigation',
      description:
        'Controlled pagination with boundary states and a compact page range. Apps own data fetching.',
      api: '<Pagination page={page} pageCount={10} onPageChange={setPage} />',
      demo: <PaginatedListDemo />,
    },
    {
      name: 'Stepper',
      category: 'Navigation',
      description:
        'Non-interactive progress with current and completed steps; supports long labels and narrow screens.',
      api: '<Stepper steps={steps} currentStep={1} />',
      demo: (
        <Stepper
          currentStep={1}
          steps={[
            { value: 'details', label: 'Details' },
            { value: 'preferences', label: 'Preferences' },
            { value: 'review', label: 'Review' },
          ]}
        />
      ),
    },
    {
      name: 'Wizard',
      category: 'Patterns',
      description:
        'A complete multi-step form with native validation, async submission, retry and focus management. Try it in Patterns → Onboarding.',
      api: '<Wizard steps={steps} onComplete={save} />',
      demo: <OnboardingDemo />,
    },
    {
      name: 'Button',
      category: 'Actions',
      description:
        'Native button semantics. Loading disables repeated actions. Icon-only buttons require a label.',
      api: '<Button variant="primary" loading={saving} onClick={save}>Save</Button>',
      demo: (
        <Inline>
          <Button onClick={() => setAction('Primary action activated.')}>Primary</Button>
          <Button variant="secondary" onClick={() => setAction('Secondary action activated.')}>
            Secondary
          </Button>
          <Button disabled>Disabled</Button>
          <Button loading>Saving</Button>
        </Inline>
      ),
    },
    {
      name: 'Text field',
      category: 'Forms',
      description:
        'Labels, hints and errors are linked by generated stable IDs. Apps own validation rules.',
      api: '<TextField label="Email" type="email" error={error} required />',
      demo: (
        <Stack>
          <TextField
            label="Email address"
            type="email"
            placeholder="you@example.com"
            hint="We use this to contact you."
          />
          <TextField
            label="Invalid example"
            error="Enter a value before continuing."
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Stack>
      ),
    },
    {
      name: 'Select & textarea',
      category: 'Forms',
      description: 'Native select keyboard support and a resizable multiline field.',
      api: '<Field label="Region">{props => <Select {...props}>…</Select>}</Field>',
      demo: (
        <Stack>
          <Field label="Region">
            {(p) => (
              <Select {...p}>
                <option>United Kingdom</option>
                <option>European Union</option>
              </Select>
            )}
          </Field>
          <Field label="Notes">
            {(p) => <Textarea {...p} placeholder="Add a little context…" />}
          </Field>
        </Stack>
      ),
    },
    {
      name: 'Checkbox, radio & switch',
      category: 'Forms',
      description:
        'Native controls with visible labels. Space toggles checkboxes; arrow keys move between radio choices.',
      api: '<Switch label="Notifications" checked={enabled} onChange={handleChange} />',
      demo: (
        <Stack>
          <Checkbox label="Send a receipt" />
          <Switch label="Email notifications" />
          <RadioGroup
            legend="Billing period"
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
            value={radio}
            onChange={setRadio}
          />
        </Stack>
      ),
    },
    {
      name: 'Dialog',
      category: 'Overlays',
      description:
        'Modal focus containment, Escape dismissal and focus return. Title and description are required.',
      api: '<Dialog trigger={<Button>Open</Button>} title="Edit" description="Edit details">…</Dialog>',
      demo: (
        <Dialog
          trigger={<Button>Open modal</Button>}
          title="Edit details"
          description="A keyboard-accessible modal example."
          footer={
            <DialogClose>
              <Button>Done</Button>
            </DialogClose>
          }
        >
          <TextField label="Display name" defaultValue="Alex" />
        </Dialog>
      ),
    },
    {
      name: 'Drawer',
      category: 'Overlays',
      description:
        'A modal side panel with the same focus contract as Dialog. Opens from the logical end in RTL.',
      api: '<Drawer trigger={<Button>Open</Button>} title="Filters" description="Refine results">…</Drawer>',
      demo: (
        <Drawer
          trigger={<Button variant="secondary">Open drawer</Button>}
          title="Filter results"
          description="Choose which sample projects to show."
          footer={
            <DialogClose>
              <Button>Apply filters</Button>
            </DialogClose>
          }
        >
          <Checkbox label="Active projects" defaultChecked />
        </Drawer>
      ),
    },
    {
      name: 'Fullscreen & confirmation',
      category: 'Overlays',
      description:
        'Full-screen tasks preserve modal semantics. Confirmation starts focus on the safe cancel action.',
      api: '<ConfirmDialog trigger={button} title="Delete?" description="…" confirmLabel="Delete" cancelLabel="Cancel" onConfirm={remove} />',
      demo: (
        <Inline>
          <FullscreenDialog
            trigger={<Button variant="secondary">Full-screen page</Button>}
            title="A focused workspace"
            description="A full-screen modal flow."
            footer={
              <DialogClose>
                <Button>Finish</Button>
              </DialogClose>
            }
          >
            <TextField label="Project title" />
          </FullscreenDialog>
          <ConfirmDialog
            trigger={<Button variant="danger">Delete example</Button>}
            title="Delete the example?"
            description="This demonstrates confirmation. No real data will be deleted."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={() => setAction('Example deletion confirmed.')}
          />
        </Inline>
      ),
    },
    {
      name: 'Tooltip & popover',
      category: 'Overlays',
      description:
        'Tooltips supplement labels. Popovers contain interactive content, close with Escape and restore focus.',
      api: '<Tooltip label="More information"><IconButton label="Help">…</IconButton></Tooltip>',
      demo: (
        <Inline>
          <Tooltip label="Semantic tokens power every component">
            <IconButton variant="secondary" label="About tokens">
              <Icon name="palette" />
            </IconButton>
          </Tooltip>
          <Popover
            trigger={<Button variant="secondary">More details</Button>}
            label="Token details"
          >
            <Text>Semantic colors keep every component connected to your theme.</Text>
          </Popover>
        </Inline>
      ),
    },
    {
      name: 'Tabs',
      category: 'Navigation',
      description:
        'Arrow keys move between tabs; Home/End reach the first/last tab. Direction follows the locale.',
      api: '<Tabs label="Project views" items={[{value:"one",label:"One",content:…}]} />',
      demo: (
        <Tabs
          label="Example views"
          items={[
            { value: 'one', label: 'Overview', content: <Text>Everything in one place.</Text> },
            { value: 'two', label: 'Activity', content: <Text>No new activity.</Text> },
          ]}
        />
      ),
    },
    {
      name: 'Alert & status',
      category: 'Feedback',
      description:
        'Static alerts do not announce on page load. Use live for newly inserted messages; Status is polite.',
      api: '<Alert title="Saved" tone="success" live>Your changes are ready.</Alert>',
      demo: (
        <Stack>
          <Alert title="You’re all set" tone="success">
            Changes have been saved.
          </Alert>
          <Alert title="Review required" tone="warning">
            Check your details before continuing.
          </Alert>
          <Alert title="Payment failed" tone="danger">
            Your card was declined.
          </Alert>
          <Alert title="New version available">Reload to update.</Alert>
        </Stack>
      ),
    },
    {
      name: 'Progress & skeleton',
      category: 'Feedback',
      description:
        'Named progress indicators and static skeletons. Reduced-motion preferences stop spinner animation.',
      api: '<Progress value={65} label="Upload" />',
      demo: (
        <Stack>
          <Progress value={65} label="Project setup" />
          <Skeleton label="Loading example content" lines={2} />
        </Stack>
      ),
    },
    {
      name: 'Badges & descriptions',
      category: 'Data display',
      description:
        'Statuses include text, not color alone. Description lists preserve term/value relationships.',
      api: '<Badge tone="success">Active</Badge>',
      demo: (
        <Stack>
          <Inline>
            <Badge tone="success">Active</Badge>
            <Badge tone="warning">Pending</Badge>
            <Badge tone="danger">Failed</Badge>
          </Inline>
          <DescriptionList
            items={[
              { term: 'Plan', description: 'Workspace' },
              { term: 'Region', description: 'United Kingdom' },
            ]}
          />
        </Stack>
      ),
    },
    {
      name: 'Avatar',
      category: 'Data display',
      description:
        'A person as an image or initials. Presence has its own shape and is part of the accessible name. Use decorative when the name is shown beside it.',
      api: '<Avatar name="Alex Morgan" src={url} status="online" />',
      demo: (
        <Stack>
          <Inline>
            <Avatar name="Alex Morgan" size="small" />
            <Avatar name="Vizvári Gergely" status="online" />
            <Avatar name="Sam Taylor" status="away" />
            <Avatar name="Priya Shah" status="busy" />
            <Avatar name="Jordan Lee" size="large" status="offline" />
          </Inline>
          <AvatarGroup
            label="Project members"
            max={4}
            people={[
              { id: 'alex', name: 'Alex Morgan' },
              { id: 'sam', name: 'Sam Taylor' },
              { id: 'priya', name: 'Priya Shah' },
              { id: 'jordan', name: 'Jordan Lee' },
              { id: 'kim', name: 'Kim Novak' },
              { id: 'ola', name: 'Ola Berg' },
            ]}
          />
        </Stack>
      ),
    },
    {
      name: 'Icons',
      category: 'Data display',
      description:
        'Decorative line icons on a 24px stroke grid; the adjacent text carries meaning. Pass SVG children to Icon for an application-specific glyph, and that element to any icon prop.',
      api: '<Icon name="settings" />  ·  <Icon><path d="M4 12h16" /></Icon>',
      demo: (
        <Grid columns="auto" gap={3}>
          {iconNames.map((name) => (
            <Inline key={name} gap={2}>
              <Icon name={name} />
              <Text as="span" size="small">
                {name}
              </Text>
            </Inline>
          ))}
        </Grid>
      ),
    },
    {
      name: 'Keyboard keys & hidden text',
      category: 'Data display',
      description:
        'Kbd shows a key or combination; the application owns the shortcut. VisuallyHidden adds context for assistive technology only.',
      api: '<Kbd keys={["Ctrl", "K"]} />  ·  <VisuallyHidden>unread messages</VisuallyHidden>',
      demo: (
        <Stack>
          <Text>
            Open the command palette with <Kbd keys={['Ctrl', 'K']} />, or press <Kbd>/</Kbd> to
            search.
          </Text>
          <Text>
            3<VisuallyHidden> unread messages</VisuallyHidden>
          </Text>
        </Stack>
      ),
    },
    {
      name: 'Stamps, labels & postmarks',
      category: 'Data display',
      description:
        'Tactile details for postcards and greetings. Stamp and label badges keep their text; postmarks are decorative ink and never represent real postage.',
      api: '<Badge variant="stamp" tone="primary">First class</Badge>',
      demo: (
        <Inline>
          <Badge variant="stamp" tone="primary">
            First class
          </Badge>
          <Badge variant="stamp">Greetings</Badge>
          <Badge variant="label">Fragile</Badge>
          <Badge variant="label" tone="success">
            Delivered
          </Badge>
          <Postmark place="Szeged" date="29 Oct" detail="2026" />
        </Inline>
      ),
    },
    {
      name: 'Layouts',
      category: 'Layout',
      description:
        'Compose with typed spacing and responsive grids. Presentation stays in the package.',
      api: '<Grid columns={2} gap={4}><Card>One</Card><Card>Two</Card></Grid>',
      demo: (
        <Grid>
          <Card>
            <Text>One</Text>
          </Card>
          <Card>
            <Text>Two</Text>
          </Card>
        </Grid>
      ),
    },
    {
      name: 'Table',
      category: 'Data display',
      description:
        'A caption, column and row headers, plus a named keyboard-focusable overflow region.',
      api: '<Table caption="Projects" columns={["Name","Status"]} rows={rows} />',
      demo: (
        <Table
          caption="Sample projects"
          columns={['Name', 'Status']}
          rows={[
            ['Website', 'Active'],
            ['Portal', 'Draft'],
          ]}
        />
      ),
    },
  ];
  const advancedEntries = useAdvancedExamples();
  const all = [...entries, ...advancedEntries].map((entry) => ({
    ...entry,
    id: entry.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
  }));
  const categories = [...new Set(all.map((entry) => entry.category))].sort();
  const query = search.trim().toLowerCase();
  const filtered = all
    .filter(
      (entry) =>
        (category === 'all' || entry.category === category) &&
        `${entry.name} ${entry.category} ${entry.description} ${entry.api}`
          .toLowerCase()
          .includes(query),
    )
    .sort((a, b) => {
      const priority = (name: string) => (name === 'Foundations' ? 0 : name === 'Layout' ? 1 : 2);
      return (
        priority(a.category) - priority(b.category) ||
        a.category.localeCompare(b.category) ||
        a.name.localeCompare(b.name)
      );
    });
  const current =
    filtered.find((entry) => entry.id === selectedId) ??
    filtered.find((entry) => entry.name.toLowerCase() === query) ??
    filtered[0];
  React.useEffect(() => {
    if (!current) return;
    const url = new URL(window.location.href);
    url.searchParams.set('page', 'components');
    url.searchParams.set('component', current.id);
    window.history.replaceState(null, '', url);
    locationSearch.current = window.location.search;
  }, [current?.id]);
  return (
    <Stack gap={4}>
      <Grid columns={2}>
        <TextField
          label="Find a component"
          type="search"
          placeholder="Search names, descriptions or APIs…"
          value={search}
          onChange={(event) => {
            setSelectedId('');
            onSearchChange(event.target.value);
          }}
        />
        <Field label="Component category">
          {(props) => (
            <Select
              {...props}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name} ({all.filter((entry) => entry.category === name).length})
                </option>
              ))}
            </Select>
          )}
        </Field>
      </Grid>
      <Inline justify="between">
        <Text size="small" tone="muted" as="span" role="status">
          {filtered.length} of {all.length} examples
        </Text>
        <Button
          variant="ghost"
          size="small"
          disabled={!search && category === 'all'}
          onClick={() => {
            onSearchChange('');
            setCategory('all');
          }}
        >
          Clear filters
        </Button>
      </Inline>
      <Status>{action}</Status>
      {!current ? (
        <EmptyState
          title="No matching components"
          description="Try another name or choose All categories."
        />
      ) : (
        <ListDetail
          expandedGroups={expandedGroups}
          onExpandedGroupsChange={saveExpandedGroups}
          collapsibleGroups
          stickyNavigation
          label="Component index"
          items={filtered.map((entry) => ({
            id: entry.id,
            label: entry.name,
            group: entry.category,
          }))}
          selectedId={current.id}
          onSelect={(id) => {
            setSelectedId(id);
            const url = new URL(window.location.href);
            url.searchParams.set('component', id);
            url.hash = '';
            window.history.pushState(null, '', url);
            locationSearch.current = window.location.search;
            requestAnimationFrame(() =>
              document.getElementById('component-example-heading')?.focus(),
            );
          }}
        >
          <Card key={current.id}>
            <Stack gap={5}>
              <Inline justify="between">
                <Heading level={2} id="component-example-heading" tabIndex={-1}>
                  {current.name}
                </Heading>
                <Badge>{current.category}</Badge>
              </Inline>
              <Text size="small" tone="muted">
                {current.description}
              </Text>
              <ThemeProvider theme={theme}>
                <PreviewStage>{current.demo}</PreviewStage>
              </ThemeProvider>
              <Accordion
                items={[
                  {
                    value: 'usage',
                    title: 'Usage example',
                    content: (
                      <CodeBlock wrap label={`${current.name} usage`}>
                        {current.api}
                      </CodeBlock>
                    ),
                  },
                ]}
              />
            </Stack>
          </Card>
        </ListDetail>
      )}
    </Stack>
  );
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
