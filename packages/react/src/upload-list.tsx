'use client';
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useFormat, useLocale } from '@gregui/localization';
import { IconButton } from './buttons';
import { Icon } from './icons';
import { Text, VisuallyHidden } from './typography';

export type UploadStatus = 'queued' | 'uploading' | 'complete' | 'error' | 'cancelled';
export interface UploadItem {
  /** Stable id from the application; keeps rows, focus and announcements right for duplicate names. */
  id: string;
  name: string;
  /** Bytes, shown as a short size. */
  size?: number;
  status: UploadStatus;
  /** 0–100 while uploading. Leave unset when the transport cannot report progress. */
  progress?: number;
  /** Safe, translated message shown under a failed file. */
  error?: string;
  /** Small preview such as an `<img>` the application made from an object URL it also revokes. */
  preview?: ReactNode;
}
export interface UploadListProps {
  /** Accessible name of the list, such as "Photos". */
  label: string;
  items: UploadItem[];
  /** Shown on queued and uploading files. */
  onCancel?: (id: string) => void;
  /** Shown on failed and cancelled files. */
  onRetry?: (id: string) => void;
  /** Shown on every file that is not uploading. */
  onRemove?: (id: string) => void;
  /** Shows "{done} of {total} uploaded" above the list. Defaults to true when there are files. */
  summary?: boolean;
}

/**
 * Per-file upload state for files the application is sending. Controlled: the application owns
 * the transport, the item list and object URLs; the list reports cancel, retry and remove.
 */
export function UploadList({
  label,
  items,
  onCancel,
  onRetry,
  onRemove,
  summary = true,
}: UploadListProps) {
  const { messages: m } = useLocale();
  const format = useFormat();
  const root = useRef<HTMLDivElement>(null);
  const rows = useRef(new Map<string, HTMLLIElement>());
  const focused = useRef<{ id: string; index: number } | null>(null);
  const previous = useRef(new Map<string, UploadStatus>());
  const [announcement, setAnnouncement] = useState('');

  const names = useMemo(() => {
    const totals = new Map<string, number>();
    for (const item of items) totals.set(item.name, (totals.get(item.name) ?? 0) + 1);
    const seen = new Map<string, number>();
    return new Map(
      items.map((item) => {
        if ((totals.get(item.name) ?? 0) < 2) return [item.id, item.name];
        const n = (seen.get(item.name) ?? 0) + 1;
        seen.set(item.name, n);
        return [item.id, `${item.name} (${n})`];
      }),
    );
  }, [items]);

  // When the focused file disappears, focus the file now in its place, the one before, or the list.
  useLayoutEffect(() => {
    const last = focused.current;
    if (!last || items.some((item) => item.id === last.id)) return;
    const active = document.activeElement;
    if (active && active !== document.body && root.current && !root.current.contains(active))
      return;
    const next = items[Math.min(last.index, items.length - 1)];
    const row = next && rows.current.get(next.id);
    focused.current = null;
    const target = row?.querySelector<HTMLElement>('button:not(:disabled)') ?? root.current;
    target?.focus();
  }, [items]);

  useEffect(() => {
    const messages: string[] = [];
    for (const item of items) {
      const before = previous.current.get(item.id);
      if (before && before !== item.status) {
        const name = names.get(item.id) ?? item.name;
        if (item.status === 'complete')
          messages.push(m.uploadAnnounceComplete.replace('{name}', name));
        if (item.status === 'error') messages.push(m.uploadAnnounceFailed.replace('{name}', name));
      }
    }
    previous.current = new Map(items.map((item) => [item.id, item.status]));
    if (messages.length) setAnnouncement(messages.join(' '));
  }, [items, names, m]);

  const done = items.filter((item) => item.status === 'complete').length;
  const size = (bytes: number) =>
    bytes < 1000
      ? format.number(bytes, { style: 'unit', unit: 'byte', unitDisplay: 'short' })
      : bytes < 1_000_000
        ? format.number(bytes / 1000, {
            style: 'unit',
            unit: 'kilobyte',
            unitDisplay: 'short',
            maximumFractionDigits: 0,
          })
        : format.number(bytes / 1_000_000, {
            style: 'unit',
            unit: 'megabyte',
            unitDisplay: 'short',
            maximumFractionDigits: 1,
          });
  const statusText = (item: UploadItem) => {
    switch (item.status) {
      case 'queued':
        return m.uploadWaiting;
      case 'uploading':
        return item.progress === undefined
          ? m.uploadUploading
          : m.uploadProgress.replace(
              '{percent}',
              format.number(Math.max(0, Math.min(100, item.progress)) / 100, { style: 'percent' }),
            );
      case 'complete':
        return m.uploadComplete;
      case 'error':
        return m.uploadFailed;
      case 'cancelled':
        return m.uploadCancelled;
    }
  };
  const icons = {
    queued: 'clock',
    uploading: 'upload',
    complete: 'check',
    error: 'error',
    cancelled: 'close',
  } as const;

  return (
    <div className="g-upload-list" ref={root} tabIndex={-1} aria-label={label} role="group">
      {summary && items.length > 0 && (
        <Text size="small" tone="muted">
          {m.uploadSummary
            .replace('{done}', format.number(done))
            .replace('{total}', format.number(items.length))}
        </Text>
      )}
      <ul>
        {items.map((item, index) => {
          const name = names.get(item.id) ?? item.name;
          const active = item.status === 'queued' || item.status === 'uploading';
          return (
            <li
              key={item.id}
              ref={(node) => {
                if (node) rows.current.set(item.id, node);
                else rows.current.delete(item.id);
              }}
              className="g-upload-item"
              data-status={item.status}
              onFocus={() => {
                focused.current = { id: item.id, index };
              }}
            >
              <span className="g-upload-item-mark" aria-hidden="true">
                {item.preview ?? <Icon name={icons[item.status]} />}
              </span>
              <div className="g-upload-item-body">
                <span className="g-upload-item-name">{item.name}</span>
                <Text as="span" size="small" tone={item.status === 'error' ? 'danger' : 'muted'}>
                  {item.size !== undefined && (
                    <>
                      {size(item.size)}
                      <span aria-hidden="true"> · </span>
                      <VisuallyHidden>, </VisuallyHidden>
                    </>
                  )}
                  {statusText(item)}
                </Text>
                {item.status === 'uploading' && (
                  <progress
                    className="g-progress"
                    aria-label={name}
                    max={100}
                    {...(item.progress === undefined
                      ? {}
                      : { value: Math.max(0, Math.min(100, item.progress)) })}
                  />
                )}
                {item.status === 'error' && item.error && (
                  <Text as="span" size="small">
                    {item.error}
                  </Text>
                )}
              </div>
              <div className="g-upload-item-actions">
                {active && onCancel && (
                  <IconButton
                    variant="ghost"
                    size="small"
                    label={`${m.uploadCancel}: ${name}`}
                    onClick={() => onCancel(item.id)}
                  >
                    <Icon name="close" />
                  </IconButton>
                )}
                {(item.status === 'error' || item.status === 'cancelled') && onRetry && (
                  <IconButton
                    variant="ghost"
                    size="small"
                    label={`${m.uploadRetry}: ${name}`}
                    onClick={() => onRetry(item.id)}
                  >
                    <Icon name="refresh" />
                  </IconButton>
                )}
                {item.status !== 'uploading' && onRemove && (
                  <IconButton
                    variant="ghost"
                    size="small"
                    label={`${m.uploadRemove}: ${name}`}
                    onClick={() => onRemove(item.id)}
                  >
                    <Icon name="trash" />
                  </IconButton>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div role="status" className="g-sr-only">
        {announcement}
      </div>
    </div>
  );
}
