'use client';
import { type ReactNode } from 'react';
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
  | 'edit'
  | 'save';
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
};
export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="g-icon"
      data-icon={name}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
