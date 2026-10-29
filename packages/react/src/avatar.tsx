'use client';
import { useEffect, useState } from 'react';
import { useLocale } from '@gregui/localization';

export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';
export interface AvatarProps {
  /** The person's name: the accessible label and the source of the initials fallback. */
  name: string;
  /** Image URL. Initials show while it is missing or if it fails to load. */
  src?: string;
  size?: 'small' | 'medium' | 'large';
  /** Presence. Each status has its own shape and is included in the accessible label. */
  status?: AvatarStatus;
  /** Hide from assistive technology when the name is already shown beside the avatar. */
  decorative?: boolean;
}
const statusMessages = {
  online: 'statusOnline',
  away: 'statusAway',
  busy: 'statusBusy',
  offline: 'statusOffline',
} as const;
function initials(name: string, locale: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = (word: string | undefined) => (word ? Array.from(word)[0] : '');
  const letters = first(words[0]) + (words.length > 1 ? first(words[words.length - 1]) : '');
  return letters.toLocaleUpperCase(locale);
}
export function Avatar({ name, src, size = 'medium', status, decorative = false }: AvatarProps) {
  const { messages, locale } = useLocale();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const statusLabel = status && messages[statusMessages[status]];
  return (
    <span
      className="g-avatar"
      data-size={size}
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': statusLabel ? `${name}, ${statusLabel}` : name })}
    >
      {src && !failed ? (
        <img className="g-avatar-image" src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        <span className="g-avatar-initials" aria-hidden="true">
          {initials(name, locale)}
        </span>
      )}
      {status && <span className="g-avatar-status" data-status={status} aria-hidden="true" />}
    </span>
  );
}
export interface AvatarGroupProps {
  people: { id: string; name: string; src?: string }[];
  /** Names the group, for example "Project members". */
  label: string;
  /** Avatars shown before the remainder collapses into a "+N" count. */
  max?: number;
  size?: AvatarProps['size'];
}
export function AvatarGroup({ people, label, max = 4, size = 'medium' }: AvatarGroupProps) {
  const { messages } = useLocale();
  const shown = people.length > max ? people.slice(0, Math.max(1, max - 1)) : people;
  const rest = people.length - shown.length;
  return (
    <div className="g-avatar-group" role="group" aria-label={label} data-size={size}>
      {shown.map((person) => (
        <Avatar key={person.id} name={person.name} src={person.src} size={size} />
      ))}
      {rest > 0 && (
        <span
          className="g-avatar g-avatar-more"
          data-size={size}
          role="img"
          aria-label={`${rest} ${messages.morePeople}`}
        >
          <span className="g-avatar-initials" aria-hidden="true">
            +{rest}
          </span>
        </span>
      )}
    </div>
  );
}
