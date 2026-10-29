'use client';
import { useRef, useState, type ReactNode } from 'react';
import { useLocale } from '@gregui/localization';
import { Button } from './buttons';
import { Timeline, type TimelineItem } from './data';
import { Alert, Badge, Status } from './feedback';
import { Checkbox, Field, Select, Textarea, TextField } from './forms';
import { Card, Inline, Stack } from './layout';
import { DescriptionList } from './tables';
import { Heading, Text } from './typography';
import { Metric } from './workbench';

function AsyncAction({
  children,
  onAction,
  danger = false,
  disabled = false,
  onBusyChange,
  onErrorChange,
}: {
  children: ReactNode;
  onAction: () => void | Promise<void>;
  danger?: boolean;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onErrorChange?: (error: boolean) => void;
}) {
  const { messages } = useLocale();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(false);
  const lock = useRef(false);
  return (
    <Stack gap={2}>
      <Button
        variant={danger ? 'danger' : 'secondary'}
        disabled={disabled}
        loading={busy}
        onClick={async () => {
          if (lock.current) return;
          lock.current = true;
          setBusy(true);
          onBusyChange?.(true);
          setError(false);
          onErrorChange?.(false);
          try {
            await onAction();
          } catch {
            setError(true);
            onErrorChange?.(true);
          } finally {
            lock.current = false;
            setBusy(false);
            onBusyChange?.(false);
          }
        }}
      >
        {children}
      </Button>
      {error && !onErrorChange && <Alert title={messages.workflowError} tone="danger" live />}
    </Stack>
  );
}

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  read?: boolean;
  dateLabel?: string;
}
export function NotificationCentre({
  title,
  items,
  onRead,
  onDismiss,
}: {
  title: string;
  items: NotificationItem[];
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const { messages } = useLocale();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const shown = items.filter((item) => !unreadOnly || !item.read);
  return (
    <Card>
      <Stack>
        <Inline justify="between">
          <Heading level={2}>{title}</Heading>
          <Checkbox
            label={messages.unreadOnly}
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
          />
        </Inline>
        {!shown.length && <Text>{messages.noResults}</Text>}
        {shown.map((item) => (
          <article className="g-notification" key={item.id}>
            <Stack gap={2}>
              <Inline justify="between">
                <Text weight="strong">{item.title}</Text>
                {!item.read && <Badge>{messages.unread}</Badge>}
              </Inline>
              {item.dateLabel && (
                <Text size="small" tone="muted">
                  {item.dateLabel}
                </Text>
              )}
              {item.description && <Text>{item.description}</Text>}
              <Inline>
                {!item.read && (
                  <Button variant="ghost" size="small" onClick={() => onRead(item.id)}>
                    {messages.markRead}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => onDismiss(item.id)}
                  aria-label={`${messages.dismiss}: ${item.title}`}
                >
                  {messages.dismiss}
                </Button>
              </Inline>
            </Stack>
          </article>
        ))}
      </Stack>
    </Card>
  );
}
export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  action?: { label: string; onAction: () => void };
}
/** Persistent until dismissed; avoids losing information to automatic timeouts. */
export function ToastStack({
  items,
  onDismiss,
  label,
}: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
  label?: string;
}) {
  const { messages } = useLocale();
  return (
    <section className="g-toast-stack" aria-label={label ?? messages.notifications}>
      {items.map((item) => (
        <Alert key={item.id} title={item.title} tone={item.tone} live>
          <Stack gap={2}>
            {item.description && <Text>{item.description}</Text>}
            <Inline>
              {item.action && (
                <Button variant="ghost" size="small" onClick={item.action.onAction}>
                  {item.action.label}
                </Button>
              )}
              <Button
                variant="ghost"
                size="small"
                aria-label={`${messages.dismiss}: ${item.title}`}
                onClick={() => onDismiss(item.id)}
              >
                {messages.dismiss}
              </Button>
            </Inline>
          </Stack>
        </Alert>
      ))}
    </section>
  );
}

export function Dashboard({
  title,
  metrics,
  children,
}: {
  title: string;
  metrics: { id: string; label: string; value: string; detail?: string }[];
  children?: ReactNode;
}) {
  return (
    <Stack gap={5}>
      <Heading level={2}>{title}</Heading>
      <div className="g-pattern-cards">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <Stack gap={2}>
              <Metric label={metric.label} value={metric.value} />
              {metric.detail && (
                <Text tone="muted" size="small">
                  {metric.detail}
                </Text>
              )}
            </Stack>
          </Card>
        ))}
      </div>
      {children}
    </Stack>
  );
}

export interface ProfileValues {
  name: string;
  email: string;
}
export function ProfileSettings({
  title,
  value,
  onChange,
  onSave,
  children,
}: {
  title: string;
  value: ProfileValues;
  onChange: (value: ProfileValues) => void;
  onSave: (value: ProfileValues) => void | Promise<void>;
  children?: ReactNode;
}) {
  const { messages } = useLocale();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(false),
    [saved, setSaved] = useState(false);
  const lock = useRef(false);
  return (
    <Card>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (lock.current) return;
          lock.current = true;
          setBusy(true);
          setError(false);
          setSaved(false);
          try {
            await onSave(value);
            setSaved(true);
          } catch {
            setError(true);
          } finally {
            lock.current = false;
            setBusy(false);
          }
        }}
      >
        <Stack>
          <Heading level={2}>{title}</Heading>
          <fieldset className="g-fieldset" disabled={busy}>
            <Stack>
              <TextField
                label={messages.authName}
                autoComplete="name"
                required
                value={value.name}
                onChange={(e) => {
                  setSaved(false);
                  onChange({ ...value, name: e.target.value });
                }}
              />
              <TextField
                label={messages.authEmail}
                autoComplete="email"
                type="email"
                required
                value={value.email}
                onChange={(e) => {
                  setSaved(false);
                  onChange({ ...value, email: e.target.value });
                }}
              />
              {children}
            </Stack>
          </fieldset>
          {error && <Alert title={messages.workflowError} tone="danger" live />}
          <Status>{saved ? messages.saved : ''}</Status>
          <Button type="submit" loading={busy}>
            {messages.saveChanges}
          </Button>
        </Stack>
      </form>
    </Card>
  );
}

export interface SessionItem {
  id: string;
  label: string;
  description: string;
  current?: boolean;
}
export function SecuritySettings({
  title,
  sessions,
  onRevoke,
  children,
}: {
  title: string;
  sessions: SessionItem[];
  onRevoke: (id: string) => void | Promise<void>;
  children?: ReactNode;
}) {
  const { messages } = useLocale();
  return (
    <Card>
      <Stack>
        <Heading level={2}>{title}</Heading>
        {children}
        <Heading level={3}>{messages.sessions}</Heading>
        {sessions.map((session) => (
          <div className="g-notification" key={session.id}>
            <Inline justify="between">
              <Stack gap={1}>
                <Text weight="strong">{session.label}</Text>
                <Text tone="muted">{session.description}</Text>
              </Stack>
              {session.current ? (
                <Badge>{messages.currentSession}</Badge>
              ) : (
                <AsyncAction danger onAction={() => onRevoke(session.id)}>
                  {messages.revoke}
                </AsyncAction>
              )}
            </Inline>
          </div>
        ))}
      </Stack>
    </Card>
  );
}

export interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: string;
}
export function TeamMembers({
  title,
  members,
  roles,
  onInvite,
  onRoleChange,
}: {
  title: string;
  members: MemberItem[];
  roles: { value: string; label: string }[];
  onInvite: (email: string) => void | Promise<void>;
  onRoleChange: (id: string, role: string) => void | Promise<void>;
}) {
  const { messages } = useLocale();
  const [email, setEmail] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(false),
    [sent, setSent] = useState(false);
  const lock = useRef(false);
  return (
    <Card>
      <Stack>
        <Heading level={2}>{title}</Heading>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (lock.current) return;
            lock.current = true;
            setBusy(true);
            setError(false);
            setSent(false);
            try {
              await onInvite(email);
              setEmail('');
              setSent(true);
            } catch {
              setError(true);
            } finally {
              lock.current = false;
              setBusy(false);
            }
          }}
        >
          <Inline align="end">
            <TextField
              label={messages.inviteEmail}
              type="email"
              required
              value={email}
              disabled={busy}
              onChange={(e) => {
                setEmail(e.target.value);
                setSent(false);
              }}
            />
            <Button type="submit" loading={busy}>
              {messages.invite}
            </Button>
          </Inline>
        </form>
        {error && <Alert live tone="danger" title={messages.workflowError} />}
        <Status>{sent ? messages.invitationSent : ''}</Status>
        {members.map((member) => (
          <MemberRow key={member.id} member={member} roles={roles} onSave={onRoleChange} />
        ))}
      </Stack>
    </Card>
  );
}
function MemberRow({
  member,
  roles,
  onSave,
}: {
  member: MemberItem;
  roles: { value: string; label: string }[];
  onSave: (id: string, role: string) => void | Promise<void>;
}) {
  const { messages } = useLocale();
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div className="g-notification">
      <Stack gap={2}>
        <Text weight="strong">{member.name}</Text>
        <Text tone="muted">{member.email}</Text>
        <Inline align="end">
          <Field label={`${messages.role}: ${member.name}`}>
            {(p) => (
              <Select
                {...p}
                disabled={busy}
                value={draft ?? member.role}
                onChange={(e) => {
                  setSaved(false);
                  setError(false);
                  setDraft(e.target.value);
                }}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <AsyncAction
            onBusyChange={setBusy}
            onErrorChange={setError}
            disabled={draft === null || draft === member.role}
            onAction={async () => {
              await onSave(member.id, draft ?? member.role);
              setDraft(null);
              setSaved(true);
            }}
          >
            {messages.saveChanges}
          </AsyncAction>
        </Inline>
        {error && <Alert title={messages.workflowError} tone="danger" live />}
        <Status>{saved ? messages.saved : ''}</Status>
      </Stack>
    </div>
  );
}

export interface ConsentCategory {
  id: string;
  title: string;
  description: string;
  required?: boolean;
}
export function PrivacyPreferences({
  title,
  description,
  categories,
  value,
  onChange,
  onSave,
}: {
  title: string;
  description: string;
  categories: ConsentCategory[];
  value: string[];
  onChange: (value: string[]) => void;
  onSave: (value: string[]) => void | Promise<void>;
}) {
  const { messages } = useLocale();
  const [busy, setBusy] = useState(false);
  const [savedValue, setSavedValue] = useState<string | null>(null);
  const normalized = (ids: string[]) => [
    ...new Set([
      ...ids,
      ...categories.filter((category) => category.required).map((category) => category.id),
    ]),
  ];
  return (
    <Card>
      <Stack>
        <Heading level={2}>{title}</Heading>
        <Text>{description}</Text>
        {categories.map((category) => (
          <div className="g-notification" key={category.id}>
            <Checkbox
              label={category.title}
              checked={!!category.required || value.includes(category.id)}
              disabled={category.required || busy}
              onChange={(e) =>
                onChange(
                  normalized(
                    e.target.checked
                      ? [...value, category.id]
                      : value.filter((id) => id !== category.id),
                  ),
                )
              }
            />
            <Text tone="muted">{category.description}</Text>
          </div>
        ))}
        <Inline>
          <Button variant="ghost" disabled={busy} onClick={() => onChange(normalized([]))}>
            {messages.necessaryOnly}
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => onChange(categories.map((category) => category.id))}
          >
            {messages.selectAll}
          </Button>
          <AsyncAction
            onBusyChange={setBusy}
            onAction={async () => {
              setSavedValue(null);
              await onSave(normalized(value));
              setSavedValue(JSON.stringify([...value].sort()));
            }}
          >
            {messages.savePreferences}
          </AsyncAction>
        </Inline>
        <Status>{savedValue === JSON.stringify([...value].sort()) ? messages.saved : ''}</Status>
      </Stack>
    </Card>
  );
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
}
export function PricingCards({
  plans,
  currentId,
  onSelect,
  label,
}: {
  plans: PricingPlan[];
  currentId?: string;
  onSelect: (id: string) => void | Promise<void>;
  label: string;
}) {
  const { messages } = useLocale();
  const [pending, setPending] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const lock = useRef(false);
  async function select(id: string) {
    if (lock.current || id === currentId) return;
    lock.current = true;
    setPending(id);
    setFailed(null);
    try {
      await onSelect(id);
    } catch {
      setFailed(id);
    } finally {
      lock.current = false;
      setPending(null);
    }
  }
  return (
    <section aria-label={label}>
      <div className="g-pattern-cards g-pricing-grid">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className="g-card g-pricing-card"
            aria-label={plan.name}
            data-current={currentId === plan.id}
            aria-current={currentId === plan.id ? 'true' : undefined}
          >
            <div className="g-plan-badges">
              {currentId === plan.id && (
                <Badge tone="primary">
                  <span aria-hidden="true">✓ </span>
                  {messages.currentPlan}
                </Badge>
              )}
              {plan.recommended && <Badge>{messages.recommended}</Badge>}
            </div>
            <Heading level={3}>{plan.name}</Heading>
            <Text size="large" weight="strong">
              {plan.price}
            </Text>
            <Text tone="muted">{plan.description}</Text>
            <ul className="g-feature-list">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div className="g-plan-action">
              <Button
                variant={currentId === plan.id ? 'primary' : 'secondary'}
                disabled={currentId === plan.id || pending !== null}
                loading={pending === plan.id}
                aria-label={`${currentId === plan.id ? messages.currentPlan : messages.choosePlan}: ${plan.name}`}
                onClick={() => void select(plan.id)}
              >
                {currentId === plan.id ? messages.currentPlan : messages.choosePlan}
              </Button>
              {failed === plan.id && <Alert tone="danger" live title={messages.workflowError} />}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export interface CommentItem {
  id: string;
  author: string;
  dateLabel: string;
  body: string;
}
export function CommentsPanel({
  title,
  comments,
  onSubmit,
}: {
  title: string;
  comments: CommentItem[];
  onSubmit: (body: string) => void | Promise<void>;
}) {
  const { messages } = useLocale();
  const [body, setBody] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(false);
  const lock = useRef(false);
  return (
    <Card>
      <Stack>
        <Heading level={2}>{title}</Heading>
        {comments.map((comment) => (
          <article className="g-notification" key={comment.id}>
            <Inline justify="between">
              <Text weight="strong">{comment.author}</Text>
              <Text size="small" tone="muted">
                {comment.dateLabel}
              </Text>
            </Inline>
            <p className="g-comment-body">{comment.body}</p>
          </article>
        ))}
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (lock.current || !body.trim()) return;
            lock.current = true;
            setBusy(true);
            setError(false);
            try {
              await onSubmit(body.trim());
              setBody('');
            } catch {
              setError(true);
            } finally {
              lock.current = false;
              setBusy(false);
            }
          }}
        >
          <Stack>
            <Field label={messages.comment}>
              {(p) => (
                <Textarea
                  {...p}
                  required
                  disabled={busy}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              )}
            </Field>
            {error && <Alert tone="danger" live title={messages.workflowError} />}
            <Button type="submit" loading={busy} disabled={!body.trim()}>
              {messages.postComment}
            </Button>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}

export function ApprovalPanel({
  title,
  description,
  details,
  onDecision,
  history = [],
}: {
  title: string;
  description: string;
  details: { term: string; description: ReactNode }[];
  onDecision: (decision: 'approve' | 'reject', comment: string) => void | Promise<void>;
  history?: TimelineItem[];
}) {
  const { messages } = useLocale();
  const [comment, setComment] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(false),
    [done, setDone] = useState(false);
  const lock = useRef(false);
  async function decide(decision: 'approve' | 'reject') {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(false);
    try {
      await onDecision(decision, comment);
      setDone(true);
    } catch {
      setError(true);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Card>
      <Stack>
        <Heading level={2}>{title}</Heading>
        <Text>{description}</Text>
        <DescriptionList items={details} />
        {done ? (
          <Alert live tone="success" title={messages.decisionSaved} />
        ) : (
          <>
            <Field label={messages.comment}>
              {(p) => (
                <Textarea
                  {...p}
                  value={comment}
                  disabled={busy}
                  onChange={(e) => setComment(e.target.value)}
                />
              )}
            </Field>
            {error && <Alert tone="danger" live title={messages.workflowError} />}
            <Inline>
              <Button disabled={busy} onClick={() => void decide('approve')}>
                {messages.approve}
              </Button>
              <Button variant="danger" disabled={busy} onClick={() => void decide('reject')}>
                {messages.reject}
              </Button>
            </Inline>
            {busy && <Status>{messages.loading}</Status>}
          </>
        )}
        {!!history.length && <Timeline label={messages.history} items={history} />}
      </Stack>
    </Card>
  );
}
