'use client';
import { type ReactNode } from 'react';
import { useLocale } from '@gregui/localization';
import { IconButton } from './buttons';
import { alertIcons } from './feedback';
import { Icon } from './icons';
import { Text } from './typography';

export interface BannerProps {
  title: string;
  /** Supporting description. */
  children?: ReactNode;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  /** Buttons or links, e.g. "Upgrade" or "Review settings". The app owns what they do. */
  actions?: ReactNode;
  /**
   * Shows a dismiss button. The app removes the banner (and remembers the choice if it should).
   * Move focus somewhere sensible afterwards, e.g. the main content, as the button disappears.
   */
  onDismiss?: () => void;
  /** Keeps the banner at the top of the viewport while the page scrolls. */
  sticky?: boolean;
  /**
   * Announce the banner as it appears (danger → alert, others → status). Leave off for banners
   * present on page load; turn on only for banners inserted in response to an event.
   */
  live?: boolean;
}

/**
 * Page-level announcement (maintenance, trial ending, consent placeholder) that spans the page or
 * AppShell workspace. Use Alert for messages in the flow of a form or section.
 */
export function Banner({
  title,
  children,
  tone = 'info',
  actions,
  onDismiss,
  sticky = false,
  live = false,
}: BannerProps) {
  const { messages } = useLocale();
  return (
    <div
      className="g-banner"
      data-tone={tone}
      data-sticky={sticky || undefined}
      role={live ? (tone === 'danger' ? 'alert' : 'status') : undefined}
    >
      <Icon name={alertIcons[tone]} />
      <div className="g-banner-body">
        <Text weight="strong">{title}</Text>
        {children && <div className="g-banner-description">{children}</div>}
      </div>
      {actions && <div className="g-banner-actions">{actions}</div>}
      {onDismiss && (
        <IconButton
          variant="ghost"
          size="small"
          label={`${messages.dismiss}: ${title}`}
          onClick={onDismiss}
        >
          <Icon name="close" />
        </IconButton>
      )}
    </div>
  );
}
