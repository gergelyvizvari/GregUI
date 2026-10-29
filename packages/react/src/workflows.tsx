'use client';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useLocale } from '@gregui/localization';
import { Button } from './buttons';
import { Alert } from './feedback';
import { Inline, Stack } from './layout';

export interface AccordionItem {
  value: string;
  title: string;
  content: ReactNode;
}
/** Independent native disclosures. Item values must be unique. */
export function Accordion({
  items,
  defaultOpen = [],
}: {
  items: AccordionItem[];
  defaultOpen?: string[];
}) {
  return (
    <div className="g-accordion">
      {items.map((item) => (
        <details
          key={item.value}
          className="g-disclosure"
          open={defaultOpen.includes(item.value) || undefined}
        >
          <summary>
            {item.title}
            <span aria-hidden="true" className="g-disclosure-mark" />
          </summary>
          <div className="g-disclosure-content">{item.content}</div>
        </details>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  label,
  disabled = false,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  label?: string;
  disabled?: boolean;
}) {
  const { messages } = useLocale();
  const count = Math.max(1, Math.floor(Number.isFinite(pageCount) ? pageCount : 1));
  const current = Math.min(count, Math.max(1, Math.floor(Number.isFinite(page) ? page : 1)));
  const pages = [...new Set([1, current - 1, current, current + 1, count])]
    .filter((p) => p >= 1 && p <= count)
    .sort((a, b) => a - b);
  return (
    <nav aria-label={label ?? messages.pagination} className="g-pagination">
      <Button
        variant="secondary"
        size="small"
        disabled={disabled || current === 1}
        onClick={() => onPageChange(current - 1)}
      >
        {messages.previous}
      </Button>
      <ol>
        {pages.map((p, i) => (
          <li key={p}>
            {i > 0 && p - pages[i - 1] > 1 && (
              <span aria-hidden="true" className="g-pagination-gap">
                …
              </span>
            )}
            <Button
              variant={p === current ? 'primary' : 'ghost'}
              size="small"
              aria-label={`${messages.page} ${p}`}
              aria-current={p === current ? 'page' : undefined}
              disabled={disabled}
              onClick={() => {
                if (p !== current) onPageChange(p);
              }}
            >
              {p}
            </Button>
          </li>
        ))}
      </ol>
      <Button
        variant="secondary"
        size="small"
        disabled={disabled || current === count}
        onClick={() => onPageChange(current + 1)}
      >
        {messages.next}
      </Button>
    </nav>
  );
}

export interface StepItem {
  value: string;
  label: string;
  description?: string;
}
/** Non-interactive progress: currentStep is zero-based. */
export function Stepper({
  steps,
  currentStep,
  label,
}: {
  steps: StepItem[];
  currentStep: number;
  label?: string;
}) {
  const { messages } = useLocale();
  return (
    <ol className="g-stepper" aria-label={label ?? messages.steps}>
      {steps.map((step, i) => (
        <li
          key={step.value}
          aria-current={i === currentStep ? 'step' : undefined}
          data-complete={i < currentStep}
        >
          <span className="g-step-number" aria-hidden="true">
            {i < currentStep ? '✓' : i + 1}
          </span>
          <span>
            <span className="g-step-label">{step.label}</span>
            {step.description && <span className="g-step-description">{step.description}</span>}
            {i < currentStep && <span className="g-sr-only"> · {messages.completed}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

export interface WizardStep extends StepItem {
  content: ReactNode;
  /** Return false after showing field errors, or throw to show the generic retry message. */
  validate?: () => boolean | Promise<boolean>;
}
/** Keep field state in the consumer. Only the active step's content is mounted. */
export function Wizard({
  steps,
  onComplete,
  finishLabel,
  label,
}: {
  steps: WizardStep[];
  onComplete: () => void | Promise<void>;
  finishLabel?: string;
  label?: string;
}) {
  const { messages } = useLocale();
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const lock = useRef(false);
  const title = useRef<HTMLHeadingElement>(null);
  const previousIndex = useRef(index);
  const id = useId();
  const step = steps[index];
  useEffect(() => {
    if (previousIndex.current !== index) title.current?.focus();
    previousIndex.current = index;
  }, [index]);
  if (!step) return null;
  async function advance() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(false);
    try {
      if (step.validate && !(await step.validate())) return;
      if (index < steps.length - 1) setIndex((i) => i + 1);
      else await onComplete();
    } catch {
      setError(true);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Stack gap={5}>
      <Stepper steps={steps} currentStep={index} label={label} />
      <form
        className="g-wizard"
        aria-labelledby={id}
        aria-busy={busy}
        onSubmit={(event) => {
          event.preventDefault();
          void advance();
        }}
      >
        <Stack gap={5}>
          <div>
            <h3 id={id} ref={title} tabIndex={-1} className="g-wizard-title">
              {step.label}
            </h3>
            {step.description && <p className="g-wizard-description">{step.description}</p>}
          </div>
          <fieldset disabled={busy} className="g-wizard-fields">
            {step.content}
          </fieldset>
          {error && <Alert tone="danger" live title={messages.workflowError} />}
          <Inline justify="between">
            <Button
              variant="ghost"
              disabled={index === 0 || busy}
              onClick={() => {
                setError(false);
                setIndex((i) => i - 1);
              }}
            >
              {messages.back}
            </Button>
            <Button type="submit" loading={busy}>
              {index === steps.length - 1 ? (finishLabel ?? messages.finish) : messages.continue}
            </Button>
          </Inline>
        </Stack>
      </form>
    </Stack>
  );
}
