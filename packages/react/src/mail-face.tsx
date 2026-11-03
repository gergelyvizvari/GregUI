'use client';
import type { ReactNode } from 'react';

export interface MailFaceProps {
  label: string;
  /** `inside`: the inside of a folded card, the message alone, with no postage or address. */
  variant: 'postcard' | 'envelope' | 'inside';
  /** Required for postcards and envelopes; not shown inside a folded card. */
  recipient?: { label: string; content: ReactNode };
  /** Decorative placeholder only; never represents paid postage. Not shown inside a card. */
  postageLabel: string;
  /** Show the postage placeholder; off for cards that are not posted, such as e-cards. */
  postage?: boolean;
  message?: { label: string; content: ReactNode };
  sender?: { label: string; content: ReactNode };
  /** Decorative mark over the postage corner, usually a Postmark. Hidden from assistive technology. */
  postmark?: ReactNode;
}
/** Mailing-face screen composition. Place in a zero-padding DocumentPreview page. */
export function MailFace({
  label,
  variant,
  recipient,
  postageLabel,
  message,
  sender,
  postmark,
  postage = true,
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
      {variant !== 'envelope' && message && (
        <section className="g-mail-message" aria-label={message.label} dir="auto">
          {message.content}
        </section>
      )}
      {variant === 'postcard' && <div className="g-mail-divider" aria-hidden="true" />}
      {postage && variant !== 'inside' && (
        <div className="g-mail-postage" aria-hidden="true">
          {postageLabel}
        </div>
      )}
      {postmark && variant !== 'inside' && (
        <div className="g-mail-postmark" aria-hidden="true">
          {postmark}
        </div>
      )}
      {recipient && variant !== 'inside' && (
        <section className="g-mail-recipient" aria-label={recipient.label} dir="auto">
          {recipient.content}
        </section>
      )}
    </div>
  );
}
