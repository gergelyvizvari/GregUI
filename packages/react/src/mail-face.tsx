'use client';
import type { ReactNode } from 'react';

export interface MailFaceProps {
  label: string;
  variant: 'postcard' | 'envelope';
  recipient: { label: string; content: ReactNode };
  /** Decorative placeholder only; never represents paid postage. */
  postageLabel: string;
  message?: { label: string; content: ReactNode };
  sender?: { label: string; content: ReactNode };
}
/** Mailing-face screen composition. Place in a zero-padding DocumentPreview page. */
export function MailFace({
  label,
  variant,
  recipient,
  postageLabel,
  message,
  sender,
}: MailFaceProps) {
  return (
    <div
      className="g-mail-face"
      data-variant={variant}
      data-sender={!!sender}
      role="group"
      aria-label={label}
      dir="ltr"
    >
      {sender && (
        <section className="g-mail-sender" aria-label={sender.label} dir="auto">
          {sender.content}
        </section>
      )}
      {variant === 'postcard' && message && (
        <section className="g-mail-message" aria-label={message.label} dir="auto">
          {message.content}
        </section>
      )}
      {variant === 'postcard' && <div className="g-mail-divider" aria-hidden="true" />}
      <div className="g-mail-postage" aria-hidden="true">
        {postageLabel}
      </div>
      <section className="g-mail-recipient" aria-label={recipient.label} dir="auto">
        {recipient.content}
      </section>
    </div>
  );
}
