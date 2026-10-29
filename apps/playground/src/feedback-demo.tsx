import { useState } from 'react';
import { Banner, Button, Inline, Stack, Text, ToastStack, type ToastItem } from '@gregui/react';

export function ToastDemo() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [undone, setUndone] = useState(0);
  const add = (item: Omit<ToastItem, 'id'>) =>
    setToasts((old) => [...old, { ...item, id: String(Date.now() + old.length) }]);
  const dismiss = (id: string) => setToasts((old) => old.filter((item) => item.id !== id));
  return (
    <Stack>
      <Inline>
        <Button
          onClick={() =>
            add({
              title: 'Changes saved',
              tone: 'success',
              description: 'Closes after 6 seconds. Hover or focus to pause.',
              action: { label: 'Undo', onAction: () => setUndone((count) => count + 1) },
            })
          }
        >
          Show timed notification
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            add({
              title: 'Upload failed',
              tone: 'danger',
              description: 'Errors stay until dismissed.',
              action: { label: 'Retry', onAction: () => undefined, keepOpen: true },
            })
          }
        >
          Show error
        </Button>
      </Inline>
      <Text tone="muted">Undo used {undone} times.</Text>
      <ToastStack items={toasts} duration={6000} onDismiss={dismiss} />
    </Stack>
  );
}

export function BannerDemo() {
  const [showTrial, setShowTrial] = useState(true);
  return (
    <Stack>
      <Banner title="Scheduled maintenance" tone="warning">
        The service is read-only on Sunday from 02:00 to 04:00 UK time.
      </Banner>
      {showTrial ? (
        <Banner
          title="Your trial ends in 3 days"
          actions={
            <Button size="small" variant="secondary">
              Choose a plan
            </Button>
          }
          onDismiss={() => setShowTrial(false)}
        >
          Keep your projects by choosing a plan.
        </Banner>
      ) : (
        <Button variant="ghost" onClick={() => setShowTrial(true)}>
          Show trial banner again
        </Button>
      )}
      <Banner title="Payment method expired" tone="danger">
        Update your card to avoid interruption.
      </Banner>
      <Banner title="Account verified" tone="success" />
    </Stack>
  );
}
