'use client';
import { useState, useRef, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as AlertPrimitive from '@radix-ui/react-alert-dialog';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useLocale } from '@gregui/localization';
import { mediaQuery } from '@gregui/tokens';
import { Button, IconButton } from './buttons';
import { Alert } from './feedback';
import { Icon } from './icons';
import { Inline, Stack } from './layout';
import { PortalFrame } from './theme';
import { useAsyncAction } from './use-async-action';
interface OverlayProps {
  size?: 'medium' | 'large';
  trigger: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  footer?: ReactNode;
}
function Overlay({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  onOpenChange,
  presentation = 'dialog',
  size = 'medium',
}: OverlayProps & { presentation?: 'dialog' | 'drawer' | 'fullscreen' }) {
  const { messages } = useLocale();
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <PortalFrame>
          <DialogPrimitive.Overlay className="g-backdrop" />
          <DialogPrimitive.Content
            className="g-dialog"
            data-presentation={presentation}
            data-size={size}
          >
            <div className="g-dialog-header">
              <Stack gap={2}>
                <DialogPrimitive.Title className="g-dialog-title">{title}</DialogPrimitive.Title>
                <DialogPrimitive.Description className="g-hint">
                  {description}
                </DialogPrimitive.Description>
              </Stack>
              <DialogPrimitive.Close asChild>
                <IconButton variant="ghost" label={messages.close}>
                  <Icon name="close" />
                </IconButton>
              </DialogPrimitive.Close>
            </div>
            <div className="g-dialog-body">{children}</div>
            {footer && <div className="g-dialog-footer">{footer}</div>}
          </DialogPrimitive.Content>
        </PortalFrame>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export function Dialog(props: OverlayProps) {
  return <Overlay {...props} />;
}
export function Drawer(props: OverlayProps) {
  return <Overlay {...props} presentation="drawer" />;
}
export function FullscreenDialog(props: OverlayProps) {
  return <Overlay {...props} presentation="fullscreen" />;
}
export function DialogClose({ children }: { children: ReactNode }) {
  return <DialogPrimitive.Close asChild>{children}</DialogPrimitive.Close>;
}
function subscribeToPanelViewport(change: () => void) {
  if (typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia(mediaQuery('compact'));
  query.addEventListener('change', change);
  return () => query.removeEventListener('change', change);
}
function isCompactPanelViewport() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(mediaQuery('compact')).matches
    : false;
}
export interface FloatingPanelProps {
  trigger: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
/** Non-modal desktop inspector; a modal drawer on narrow viewports. */
export function FloatingPanel({
  trigger,
  title,
  description,
  children,
  footer,
  closeLabel,
  open: controlledOpen,
  onOpenChange,
}: FloatingPanelProps) {
  const { messages } = useLocale();
  const compact = useSyncExternalStore(
    subscribeToPanelViewport,
    isCompactPanelViewport,
    () => false,
  );
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen ?? localOpen;
  return (
    <DialogPrimitive.Root
      open={open}
      modal={compact}
      onOpenChange={(next) => {
        if (controlledOpen === undefined) setLocalOpen(next);
        onOpenChange?.(next);
      }}
    >
      <DialogPrimitive.Portal forceMount>
        <PortalFrame>
          <div className="g-floating-launcher" hidden={open}>
            <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
          </div>
        </PortalFrame>
      </DialogPrimitive.Portal>
      <DialogPrimitive.Portal>
        <PortalFrame>
          {compact && <DialogPrimitive.Overlay className="g-backdrop" />}
          <DialogPrimitive.Content
            className="g-floating-panel"
            aria-modal={compact || undefined}
            data-modal={compact}
            onInteractOutside={(event) => {
              if (!compact) event.preventDefault();
            }}
          >
            <div className="g-dialog-header">
              <Stack gap={2}>
                <DialogPrimitive.Title className="g-dialog-title">{title}</DialogPrimitive.Title>
                <DialogPrimitive.Description className="g-hint">
                  {description}
                </DialogPrimitive.Description>
              </Stack>
              <DialogPrimitive.Close asChild>
                <IconButton variant="ghost" label={closeLabel ?? messages.close} tabIndex={0}>
                  <Icon name="close" />
                </IconButton>
              </DialogPrimitive.Close>
            </div>
            <div className="g-dialog-body">{children}</div>
            {footer && <div className="g-dialog-footer">{footer}</div>}
          </DialogPrimitive.Content>
        </PortalFrame>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Returned promises are awaited; synchronous and resolved values are ignored. */
  onConfirm: () => unknown;
  errorMessage?: string;
}
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  errorMessage,
}: ConfirmDialogProps) {
  const { messages } = useLocale();
  const [open, setOpen] = useState(false);
  const { pending, failed, run, reset, locked } = useAsyncAction();
  const content = useRef<HTMLDivElement>(null);
  const action = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open && failed && !pending) action.current?.focus();
  }, [open, failed, pending]);
  function confirm() {
    void run(async () => {
      // Keep focus in the modal while both actions are disabled.
      content.current?.focus();
      await onConfirm();
      setOpen(false);
    });
  }
  return (
    <AlertPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (locked.current) return;
        setOpen(next);
        reset();
      }}
    >
      <AlertPrimitive.Trigger asChild>{trigger}</AlertPrimitive.Trigger>
      <AlertPrimitive.Portal>
        <PortalFrame>
          <AlertPrimitive.Overlay className="g-backdrop" />
          <AlertPrimitive.Content
            ref={content}
            className="g-dialog"
            onEscapeKeyDown={(event) => {
              if (locked.current) event.preventDefault();
            }}
          >
            <div className="g-dialog-header">
              <Stack gap={2}>
                <AlertPrimitive.Title className="g-dialog-title">{title}</AlertPrimitive.Title>
                <AlertPrimitive.Description className="g-hint">
                  {description}
                </AlertPrimitive.Description>
              </Stack>
            </div>
            <div className={pending || failed ? 'g-dialog-body' : undefined}>
              <div role="status" aria-live="polite" className={pending ? 'g-status' : 'g-sr-only'}>
                {pending ? messages.loading : ''}
              </div>
              {failed && <Alert title={errorMessage ?? messages.confirmError} tone="danger" live />}
            </div>
            <div className="g-dialog-footer" aria-busy={pending}>
              <Inline justify="end">
                <AlertPrimitive.Cancel asChild>
                  <Button variant="secondary" disabled={pending} tabIndex={0}>
                    {cancelLabel}
                  </Button>
                </AlertPrimitive.Cancel>
                <AlertPrimitive.Action asChild>
                  <Button
                    ref={action}
                    variant="danger"
                    loading={pending}
                    tabIndex={0}
                    onClick={(event) => {
                      event.preventDefault();
                      confirm();
                    }}
                  >
                    {failed ? `${messages.retry}: ${confirmLabel}` : confirmLabel}
                  </Button>
                </AlertPrimitive.Action>
              </Inline>
            </div>
          </AlertPrimitive.Content>
        </PortalFrame>
      </AlertPrimitive.Portal>
    </AlertPrimitive.Root>
  );
}
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <PortalFrame>
            <TooltipPrimitive.Content className="g-tooltip" sideOffset={8}>
              {label}
            </TooltipPrimitive.Content>
          </PortalFrame>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
export function Popover({
  trigger,
  label,
  children,
}: {
  trigger: ReactNode;
  label: string;
  children: ReactNode;
}) {
  const { messages } = useLocale();
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PortalFrame>
          <PopoverPrimitive.Content className="g-popover" aria-label={label} sideOffset={8}>
            <Stack>
              {children}
              <PopoverPrimitive.Close asChild>
                <Button size="small" variant="secondary">
                  {messages.close}
                </Button>
              </PopoverPrimitive.Close>
            </Stack>
          </PopoverPrimitive.Content>
        </PortalFrame>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
