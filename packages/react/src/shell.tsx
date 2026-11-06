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
import { Icon, renderIcon, type IconSource } from './icons';
import { Inline, Stack } from './layout';
import { Drawer, Tooltip } from './overlays';
import { Heading, Text } from './typography';
/**
 * Hidden until focused; jumps past repeated navigation. AppShell includes one. Put it first in
 * the page and point `href` at the main content, which should accept focus (`tabIndex={-1}`).
 */
export function SkipLink({ href, children }: { href: `#${string}`; children?: ReactNode }) {
  const { messages } = useLocale();
  return (
    <a className="g-skip" href={href}>
      {children ?? messages.skipToContent}
    </a>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  artwork,
  breadcrumbs,
  meta,
  size = 'default',
  tone = 'default',
}: {
  artwork?: ReactNode;
  /**
   * `brand` sets the header on a bold block of the primary colour (a deep tint of it in dark
   * mode), like a landing page hero; text and buttons switch to readable colours on it.
   */
  tone?: 'default' | 'brand';
  breadcrumbs?: ReactNode;
  meta?: ReactNode;
  size?: 'default' | 'compact';
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header
      className="g-page-header"
      data-editorial={Boolean(artwork)}
      data-size={size}
      data-tone={tone === 'brand' ? 'brand' : undefined}
    >
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
}: Clean<ComponentPropsWithoutRef<'button'>> & { active?: boolean; icon?: IconSource }) {
  const collapsed = useSidebarCollapsed();
  const button = (
    <button
      {...props}
      type="button"
      className="g-nav-item"
      aria-current={active ? 'page' : undefined}
    >
      {icon && renderIcon(icon)}
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
export interface PhoneNavItem {
  id: string;
  label: string;
  icon: IconSource;
  href: string;
  /** The one main action (such as "Send a card"), raised in the middle of the bar. */
  primary?: boolean;
}

export function AppShell({
  phoneNav,
  brand,
  subtitle,
  nav,
  footer,
  toolbar,
  toolbarOverflow,
  children,
  viewKey,
  appearance = 'standard',
  tone = 'default',
  stickyToolbar = false,
  stickyMasthead = false,
  brandMark,
  brandHref,
  brandLinkComponent: BrandLink = 'a',
  sidebarCollapsible = false,
  sidebarCollapsed,
  defaultSidebarCollapsed = false,
  onSidebarCollapsedChange,
  banner,
}: {
  /**
   * Phones only: a bar of up to five destinations fixed at the bottom of the screen, within
   * thumb reach, instead of hiding them in the menu drawer. `value` marks the current one;
   * `linkComponent` routes client-side, like `LinkButton component`.
   */
  phoneNav?: {
    label: string;
    items: readonly PhoneNavItem[];
    value?: string;
    linkComponent?: React.ElementType;
  };
  /**
   * Page-level Banner shown across the workspace above the toolbar. A sticky banner stays at the
   * top and a sticky toolbar then sits below it.
   */
  banner?: ReactNode;
  /** Adds a control that shrinks the desktop sidebar to an icon rail. */
  sidebarCollapsible?: boolean;
  sidebarCollapsed?: boolean;
  defaultSidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  appearance?: 'standard' | 'editorial' | 'dashboard';
  /**
   * With `appearance="editorial"`, `brand` sets the masthead (brand, navigation and toolbar) on
   * the primary colour, like a website header on its hero (a deep tint in dark mode).
   */
  tone?: 'default' | 'brand';
  stickyToolbar?: boolean;
  /**
   * With `appearance="editorial"`, keeps the masthead (brand, navigation and toolbar) at the top
   * of wide screens while the page scrolls. Phones keep their own bars.
   */
  stickyMasthead?: boolean;
  brandMark?: ReactNode;
  /** Makes the brand (masthead and phone header) a link home, for example `/home`. */
  brandHref?: string;
  /** Router link component for `brandHref`, like `LinkButton component`; defaults to `a`. */
  brandLinkComponent?: React.ElementType;
  viewKey?: string;
  brand: string;
  subtitle?: string;
  nav: ReactNode;
  footer?: ReactNode;
  toolbar?: ReactNode;
  /**
   * Secondary toolbar items (language, light/dark, sign out): at the end of the toolbar on wide
   * screens, and inside the menu drawer on narrow ones, so the phone header stays one row.
   */
  toolbarOverflow?: ReactNode;
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
  const bannerRef = React.useRef<HTMLDivElement>(null);
  const hasBanner = Boolean(banner);
  React.useEffect(() => {
    const area = bannerRef.current;
    if (!area || typeof ResizeObserver === 'undefined') return;
    // A sticky toolbar is offset by the banner height so the two never overlap.
    const observer = new ResizeObserver(() =>
      area.parentElement?.style.setProperty('--g-shell-banner-size', `${area.offsetHeight}px`),
    );
    observer.observe(area);
    return () => observer.disconnect();
  }, [hasBanner]);
  return (
    <div
      className="g-app-shell"
      data-phone-nav={phoneNav && !toolbarOverflow ? 'only' : phoneNav ? true : undefined}
      data-appearance={appearance}
      data-sticky-masthead={(appearance === 'editorial' && stickyMasthead) || undefined}
      data-tone={tone === 'brand' ? 'brand' : undefined}
    >
      <SkipLink href={`#${mainId}`} />
      <aside className="g-sidebar" data-collapsed={collapsed || undefined}>
        <div className="g-brand">
          {(() => {
            const mark = brandMark ?? (
              <span className="g-brand-mark">
                g<span>↗</span>
              </span>
            );
            // The mark repeats the brand link for pointers; keyboards use the name's link.
            return brandHref ? (
              <BrandLink href={brandHref} className="g-brand-link" tabIndex={-1} aria-hidden="true">
                {mark}
              </BrandLink>
            ) : (
              mark
            );
          })()}
          <Stack gap={0}>
            {brandHref ? (
              <BrandLink href={brandHref} className="g-brand-link">
                <Text weight="strong">{brand}</Text>
              </BrandLink>
            ) : (
              <Text weight="strong">{brand}</Text>
            )}
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
        {hasBanner && (
          <div className="g-shell-banner" ref={bannerRef}>
            {banner}
          </div>
        )}
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
              {toolbarOverflow && <div className="g-drawer-settings">{toolbarOverflow}</div>}
            </Drawer>
            {/* On phones the sidebar is hidden, so the brand rides next to the menu button. */}
            {(() => {
              const content = (
                <>
                  {brandMark ?? (
                    <span className="g-brand-mark" aria-hidden="true">
                      g<span>↗</span>
                    </span>
                  )}
                  <Text weight="strong">{brand}</Text>
                </>
              );
              return brandHref ? (
                <BrandLink href={brandHref} className="g-mobile-brand g-brand-link">
                  {content}
                </BrandLink>
              ) : (
                <span className="g-mobile-brand">{content}</span>
              );
            })()}
          </div>
          {toolbarOverflow ? (
            <div className="g-toolbar-actions">
              {toolbar}
              <div className="g-toolbar-overflow">{toolbarOverflow}</div>
            </div>
          ) : (
            toolbar
          )}
        </div>
        {phoneNav && (
          <nav className="g-phone-nav" aria-label={phoneNav.label}>
            {phoneNav.items.slice(0, 5).map((item) => {
              const Link = phoneNav.linkComponent ?? 'a';
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="g-phone-nav-item"
                  data-primary={item.primary || undefined}
                  aria-current={item.id === phoneNav.value ? 'page' : undefined}
                >
                  <span className="g-phone-nav-icon" aria-hidden="true">
                    {renderIcon(item.icon)}
                  </span>
                  <span className="g-phone-nav-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
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
