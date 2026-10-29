'use client';
import { type ReactElement, type ReactNode } from 'react';
export type IconName =
  | 'grid'
  | 'palette'
  | 'layers'
  | 'arrow'
  | 'check'
  | 'close'
  | 'menu'
  | 'sun'
  | 'moon'
  | 'download'
  | 'upload'
  | 'undo'
  | 'search'
  | 'shield'
  | 'code'
  | 'external'
  | 'chevron'
  | 'chevron-back'
  | 'calendar'
  | 'plus'
  | 'minus'
  | 'edit'
  | 'save'
  | 'home'
  | 'user'
  | 'users'
  | 'settings'
  | 'bell'
  | 'inbox'
  | 'mail'
  | 'folder'
  | 'file'
  | 'chart'
  | 'help'
  | 'info'
  | 'warning'
  | 'error'
  | 'trash'
  | 'logout'
  | 'more'
  | 'filter'
  | 'eye'
  | 'eye-off'
  | 'lock'
  | 'link'
  | 'copy'
  | 'refresh'
  | 'star'
  | 'clock';
/**
 * A built-in icon name, or an element such as `<Icon>…</Icon>` for an application-specific glyph.
 * Accepted wherever a component takes an `icon` prop.
 */
export type IconSource = IconName | ReactElement;
const paths: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  palette: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="8" cy="9" r="1" />
      <circle cx="14" cy="7" r="1" />
      <path d="M20 14h-5a3 3 0 0 0-3 3v4" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" />
    </>
  ),
  moon: <path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z" />,
  download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
  upload: <path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5" />,
  undo: <path d="M4 10h10a6 6 0 0 1 0 12M4 10l5-5m-5 5 5 5" />,
  search: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="m15 15 6 6" />
    </>
  ),
  shield: (
    <>
      <path d="m12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5z" />
      <path d="m8 11 3 3 5-5" />
    </>
  ),
  code: <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-5 3 2-18" />,
  external: <path d="M14 3h7v7m0-7-11 11M10 3H3v18h18v-7" />,
  chevron: <path d="m8 4 8 8-8 8" />,
  'chevron-back': <path d="m16 4-8 8 8 8" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4m8-4v4" />
    </>
  ),
  plus: <path d="M12 4v16M4 12h16" />,
  minus: <path d="M4 12h16" />,
  edit: (
    <>
      <path d="m16 3 5 5-12 12-6 1 1-6Z" />
      <path d="m14 5 5 5" />
    </>
  ),
  save: (
    <>
      <path d="M5 3h12l4 4v14H3V3Z" />
      <path d="M7 3v6h10V3M7 21v-8h10v8" />
    </>
  ),
  home: <path d="M3 11 12 3l9 8M5 9.5V21h5v-6h4v6h5V9.5" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 13.5a7 7 0 0 1 4 6.5" />
    </>
  ),
  settings: (
    <>
      <path d="M4 6h10m4 0h2M4 12h4m4 0h8M4 18h12m4 0h0" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="18" cy="18" r="2" />
    </>
  ),
  bell: <path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4ZM10 21h4" />,
  inbox: <path d="M3 13 6 4h12l3 9v7H3ZM3 13h5l1 3h6l1-3h5" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  folder: <path d="M3 6a1 1 0 0 1 1-1h6l2 2h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />,
  file: <path d="M6 3h8l5 5v13H6ZM14 3v5h5" />,
  chart: <path d="M4 4v16h16M8 16v-5m4 5V8m4 8v-3" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14m0 3.5v.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6m0-9.5v.01" />
    </>
  ),
  warning: <path d="M12 3 22 20H2ZM12 10v4m0 3.5v.01" />,
  error: <path d="M8 3h8l5 5v8l-5 5H8l-5-5V8ZM12 8v5m0 3.5v.01" />,
  trash: <path d="M4 7h16M10 3h4M6 7l1 14h10l1-14M10 11v6m4-6v6" />,
  logout: <path d="M10 4H5v16h5m4-12 4 4-4 4m4-4H9" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8Z" />,
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'eye-off': (
    <path d="m3 3 18 18M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3 3.6M6.6 6.6C3.8 8.4 2 12 2 12s4 7 10 7a9.6 9.6 0 0 0 4.4-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  link: (
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  ),
  copy: (
    <>
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4" />
    </>
  ),
  refresh: (
    <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8m0-4v4h4m-4 5a8 8 0 0 0 14.3 4.9L20 16m0 4v-4h-4" />
  ),
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9Z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
};
/** Every built-in icon name, in declaration order. */
export const iconNames = Object.keys(paths) as IconName[];
/**
 * A decorative line icon. Pass `name` for a built-in glyph, or SVG children drawn on the same
 * 24×24 stroke grid (no fill, round caps) for an application-specific one.
 */
export function Icon(
  props: { name: IconName; children?: never } | { name?: never; children: ReactNode },
) {
  return (
    <svg
      className="g-icon"
      data-icon={props.name ?? 'custom'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {props.name ? paths[props.name] : props.children}
    </svg>
  );
}
/** Renders an `icon` prop: built-in names become `<Icon>`, elements are used as given. */
export function renderIcon(source: IconSource) {
  return typeof source === 'string' ? <Icon name={source} /> : source;
}
