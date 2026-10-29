'use client';
import React, {
  createContext,
  useContext,
  useId,
  type ReactNode,
  type ComponentPropsWithoutRef,
} from 'react';
import { useLocale } from '@gregui/localization';
import type { Clean } from './internal-types';
import { IconButton } from './buttons';
import { Icon, IconName } from './icons';
import { Inline, Stack } from './layout';
import { Drawer, Tooltip } from './overlays';
import { Heading, Text } from './typography';
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  artwork,
  breadcrumbs,
  meta,
  size = 'default',
}: {
  artwork?: ReactNode;
  breadcrumbs?: ReactNode;
  meta?: ReactNode;
  size?: 'default' | 'compact';
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="g-page-header" data-editorial={Boolean(artwork)} data-size={size}>
      <Stack gap={3}>
        {breadcrumbs}
        {eyebrow && (
          <Text size="eyebrow" tone="primary">
            {eyebrow}
          </Text>
        )}
        <Heading level={1} size="page">
          {title}
        </Heading>
        {description && (
          <Text tone="muted" size="large">
            {description}
          </Text>
        )}
        {meta && <Inline gap={2}>{meta}</Inline>}
      </Stack>
      {actions && <Inline>{actions}</Inline>}
      {artwork && <div className="g-page-artwork">{artwork}</div>}
    </header>
  );
}
const SidebarContext = createContext({ collapsed: false });
/** Whether navigation is rendered in the collapsed AppShell rail (icons only). */
export function useSidebarCollapsed() {
  return useContext(SidebarContext).collapsed;
}
export function NavItem({
  active = false,
  icon,
  children,
  ...props
}: Clean<ComponentPropsWithoutRef<'button'>> & { active?: boolean; icon?: IconName }) {
  const collapsed = useSidebarCollapsed();
  const button = (
    <button
      {...props}
      type="button"
      className="g-nav-item"
      aria-current={active ? 'page' : undefined}
    >
      {icon && <Icon name={icon} />}
      <span className="g-nav-text">{children}</span>
      {active && <span className="g-nav-dot" />}
    </button>
  );
  return collapsed && typeof children === 'string' ? (
    <Tooltip label={children}>{button}</Tooltip>
  ) : (
    button
  );
}
const railContext = { collapsed: true };
const drawerContext = { collapsed: false };
export function AppShell({
  brand,
  subtitle,
  nav,
  footer,
  toolbar,
  children,
  viewKey,
  appearance = 'standard',
  stickyToolbar = false,
  brandMark,
  sidebarCollapsible = false,
  sidebarCollapsed,
  defaultSidebarCollapsed = false,
  onSidebarCollapsedChange,
}: {
  /** Adds a control that shrinks the desktop sidebar to an icon rail. */
  sidebarCollapsible?: boolean;
  sidebarCollapsed?: boolean;
  defaultSidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  appearance?: 'standard' | 'editorial' | 'dashboard';
  stickyToolbar?: boolean;
  brandMark?: ReactNode;
  viewKey?: string;
  brand: string;
  subtitle?: string;
  nav: ReactNode;
  footer?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  const { messages, direction } = useLocale();
  const mainId = useId();
  const [navOpen, setNavOpen] = React.useState(false);
  const [ownCollapsed, setOwnCollapsed] = React.useState(defaultSidebarCollapsed);
  const collapsible = sidebarCollapsible && appearance !== 'editorial';
  const collapsed = collapsible && (sidebarCollapsed ?? ownCollapsed);
  const toggleCollapsed = () => {
    setOwnCollapsed(!collapsed);
    onSidebarCollapsedChange?.(!collapsed);
  };
  React.useEffect(() => {
    if (viewKey) window.scrollTo(0, 0);
  }, [viewKey]);
  return (
    <div className="g-app-shell" data-appearance={appearance}>
      <a className="g-skip" href={`#${mainId}`}>
        {messages.skipToContent}
      </a>
      <aside className="g-sidebar" data-collapsed={collapsed || undefined}>
        <div className="g-brand">
          {brandMark ?? (
            <span className="g-brand-mark">
              g<span>↗</span>
            </span>
          )}
          <Stack gap={0}>
            <Text weight="strong">{brand}</Text>
            {subtitle && (
              <Text size="small" tone="muted">
                {subtitle}
              </Text>
            )}
          </Stack>
          {collapsible && (
            <div className="g-sidebar-toggle">
              <IconButton
                variant="ghost"
                size="small"
                label={collapsed ? messages.expandSidebar : messages.collapseSidebar}
                aria-expanded={!collapsed}
                onClick={toggleCollapsed}
              >
                <Icon name={collapsed !== (direction === 'rtl') ? 'chevron' : 'chevron-back'} />
              </IconButton>
            </div>
          )}
        </div>
        <nav className="g-nav" aria-label={messages.navigation}>
          <SidebarContext.Provider value={collapsed ? railContext : drawerContext}>
            {nav}
          </SidebarContext.Provider>
        </nav>
        {footer && <div className="g-sidebar-footer">{footer}</div>}
      </aside>
      <div className="g-workspace">
        <div className="g-toolbar" data-sticky={stickyToolbar || undefined}>
          <div className="g-mobile-nav">
            <Drawer
              open={navOpen}
              onOpenChange={setNavOpen}
              trigger={
                <IconButton variant="ghost" label={messages.openNavigation}>
                  <Icon name="menu" />
                </IconButton>
              }
              title={brand}
              description={messages.navigation}
            >
              <nav
                className="g-nav"
                aria-label={messages.navigation}
                onClick={(event) => {
                  // Destinations close the drawer; disclosure and menu buttons keep it open.
                  const target = (event.target as HTMLElement).closest('a[href], button');
                  if (target && !target.matches('[aria-expanded], [aria-haspopup]'))
                    setNavOpen(false);
                }}
              >
                {nav}
              </nav>
            </Drawer>
          </div>
          {toolbar}
        </div>
        <main className="g-main" id={mainId} tabIndex={-1}>
          {viewKey ? (
            <div key={viewKey} className="g-page-content">
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
