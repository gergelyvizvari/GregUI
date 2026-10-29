import React, { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AppShell,
  Banner,
  Button,
  LocaleProvider,
  ToastStack,
  type ToastItem,
} from '@gregui/react';

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('ToastStack timing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    setVisibility('visible');
  });
  const advance = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });

  it('never expires without a duration', () => {
    const dismiss = vi.fn();
    render(<ToastStack items={[{ id: 'a', title: 'Saved' }]} onDismiss={dismiss} />);
    advance(60_000);
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('expires with the stack default and lets an item override or opt out', () => {
    const dismiss = vi.fn();
    render(
      <ToastStack
        duration={5000}
        items={[
          { id: 'default', title: 'Default' },
          { id: 'short', title: 'Short', duration: 2000 },
          { id: 'kept', title: 'Kept', duration: 0 },
        ]}
        onDismiss={dismiss}
      />,
    );
    advance(1999);
    expect(dismiss).not.toHaveBeenCalled();
    advance(1);
    expect(dismiss).toHaveBeenLastCalledWith('short');
    advance(3000);
    expect(dismiss).toHaveBeenLastCalledWith('default');
    advance(60_000);
    expect(dismiss).toHaveBeenCalledTimes(2);
  });

  it('keeps danger toasts unless expiry is forced', () => {
    const dismiss = vi.fn();
    render(
      <ToastStack
        duration={3000}
        items={[
          { id: 'error', title: 'Failed', tone: 'danger', duration: 1000 },
          { id: 'forced', title: 'Offline', tone: 'danger', duration: 1000, forceExpiry: true },
        ]}
        onDismiss={dismiss}
      />,
    );
    advance(30_000);
    expect(dismiss.mock.calls).toEqual([['forced']]);
  });

  it('pauses on hover and resumes with the remaining time', () => {
    const dismiss = vi.fn();
    render(
      <ToastStack duration={5000} items={[{ id: 'a', title: 'Saved' }]} onDismiss={dismiss} />,
    );
    const stack = screen.getByRole('region', { name: 'Notifications' });
    advance(3000);
    fireEvent.pointerEnter(stack);
    expect(stack).toHaveAttribute('data-paused', 'true');
    advance(20_000);
    expect(dismiss).not.toHaveBeenCalled();
    fireEvent.pointerLeave(stack);
    advance(1999);
    expect(dismiss).not.toHaveBeenCalled();
    advance(1);
    expect(dismiss).toHaveBeenCalledWith('a');
  });

  it('pauses while focus is inside the stack', () => {
    const dismiss = vi.fn();
    render(
      <>
        <button>Outside</button>
        <ToastStack duration={5000} items={[{ id: 'a', title: 'Saved' }]} onDismiss={dismiss} />
      </>,
    );
    advance(4000);
    act(() => screen.getByRole('button', { name: 'Dismiss: Saved' }).focus());
    advance(20_000);
    expect(dismiss).not.toHaveBeenCalled();
    act(() => screen.getByRole('button', { name: 'Outside' }).focus());
    advance(999);
    expect(dismiss).not.toHaveBeenCalled();
    advance(1);
    expect(dismiss).toHaveBeenCalledWith('a');
  });

  it('pauses while the document is hidden', () => {
    const dismiss = vi.fn();
    render(
      <ToastStack duration={5000} items={[{ id: 'a', title: 'Saved' }]} onDismiss={dismiss} />,
    );
    advance(1000);
    act(() => setVisibility('hidden'));
    advance(60_000);
    expect(dismiss).not.toHaveBeenCalled();
    act(() => setVisibility('visible'));
    advance(4000);
    expect(dismiss).toHaveBeenCalledOnce();
  });

  it('runs the action, dismisses by default and keeps open on request', () => {
    const undo = vi.fn(),
      retry = vi.fn(),
      dismiss = vi.fn();
    render(
      <ToastStack
        items={[
          { id: 'a', title: 'Saved', action: { label: 'Undo', onAction: undo } },
          {
            id: 'b',
            title: 'Failed',
            tone: 'danger',
            action: { label: 'Retry', onAction: retry, keepOpen: true },
          },
        ]}
        onDismiss={dismiss}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(undo).toHaveBeenCalledOnce();
    expect(dismiss).toHaveBeenCalledWith('a');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
    expect(dismiss).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss: Failed' }));
    expect(dismiss).toHaveBeenLastCalledWith('b');
  });

  it('keeps announcements live and leaves focus where it was', () => {
    function Host() {
      const [items, setItems] = useState<ToastItem[]>([]);
      return (
        <>
          <Button onClick={() => setItems([{ id: 'a', title: 'Saved', tone: 'success' }])}>
            Save
          </Button>
          <ToastStack
            duration={4000}
            items={items}
            onDismiss={(id) => setItems((old) => old.filter((item) => item.id !== id))}
          />
        </>
      );
    }
    render(<Host />);
    const save = screen.getByRole('button', { name: 'Save' });
    act(() => save.focus());
    fireEvent.click(save);
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    expect(save).toHaveFocus();
    advance(4000);
    expect(screen.queryByRole('status')).toBeNull();
  });
});

describe('Banner', () => {
  it('is silent by default and announces only when live', () => {
    const { rerender } = render(<Banner title="Maintenance" tone="warning" />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(document.querySelector('.g-banner > .g-icon')).toHaveAttribute('data-icon', 'warning');
    rerender(<Banner title="Maintenance" tone="warning" live />);
    expect(screen.getByRole('status')).toHaveTextContent('Maintenance');
    rerender(<Banner title="Outage" tone="danger" live />);
    expect(screen.getByRole('alert')).toHaveTextContent('Outage');
  });

  it('shows actions and a localized dismiss button', () => {
    const dismiss = vi.fn();
    render(
      <LocaleProvider locale="hu-HU">
        <Banner
          title="Próbaidő"
          sticky
          actions={<Button size="small">Csomagválasztás</Button>}
          onDismiss={dismiss}
        >
          Hamarosan lejár.
        </Banner>
      </LocaleProvider>,
    );
    expect(document.querySelector('.g-banner')).toHaveAttribute('data-sticky', 'true');
    expect(screen.getByRole('button', { name: 'Csomagválasztás' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Elvetés: Próbaidő' }));
    expect(dismiss).toHaveBeenCalledOnce();
  });

  it('omits the dismiss button without onDismiss', () => {
    render(<Banner title="Read only" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders in AppShell above the toolbar and before main content', () => {
    const { container } = render(
      <AppShell
        brand="App"
        nav={null}
        toolbar={<span>Toolbar</span>}
        banner={<Banner title="Maintenance" sticky />}
      >
        <p>Content</p>
      </AppShell>,
    );
    const workspace = container.querySelector('.g-workspace')!;
    expect([...workspace.children].map((child) => child.className)).toEqual([
      'g-shell-banner',
      'g-toolbar',
      'g-main',
    ]);
    expect(workspace.querySelector('.g-shell-banner .g-banner')).toHaveTextContent('Maintenance');
  });

  it('leaves AppShell unchanged without a banner', () => {
    const { container } = render(
      <AppShell brand="App" nav={null}>
        <p>Content</p>
      </AppShell>,
    );
    expect(container.querySelector('.g-shell-banner')).toBeNull();
  });
});
