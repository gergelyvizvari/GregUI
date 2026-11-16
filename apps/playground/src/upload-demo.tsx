import { useEffect, useRef, useState } from 'react';
import { FileUpload, Stack, Text, UploadList, type UploadItem } from '@gregui/react';

/** Simulated transfers: nothing leaves the browser. Files with "fail" in the name fail at 60%. */
export function UploadListDemo() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const next = useRef(0);
  useEffect(() => {
    if (!items.some((item) => item.status === 'uploading' || item.status === 'queued')) return;
    const timer = setInterval(() => {
      setItems((list) => {
        let started = list.filter((item) => item.status === 'uploading').length;
        return list.map((item) => {
          if (item.status === 'queued' && started < 2) {
            started += 1;
            return { ...item, status: 'uploading', progress: 0 };
          }
          if (item.status !== 'uploading') return item;
          const progress = Math.min(100, (item.progress ?? 0) + 12);
          if (/fail/i.test(item.name) && progress >= 60)
            return {
              ...item,
              status: 'error',
              progress: undefined,
              error: 'The demo server rejected this file.',
            };
          return progress >= 100
            ? { ...item, status: 'complete', progress: undefined }
            : { ...item, progress };
        });
      });
    }, 400);
    return () => clearInterval(timer);
  }, [items]);
  const update = (id: string, change: Partial<UploadItem>) =>
    setItems((list) => list.map((item) => (item.id === id ? { ...item, ...change } : item)));
  return (
    <Stack>
      <FileUpload
        label="Demo photos"
        multiple
        showSelection={false}
        onFiles={(files) =>
          setItems((list) => [
            ...list,
            ...files.map((file) => ({
              id: `file-${(next.current += 1)}`,
              name: file.name,
              size: file.size,
              status: 'queued' as const,
            })),
          ])
        }
      />
      <UploadList
        label="Demo uploads"
        items={items}
        onCancel={(id) => update(id, { status: 'cancelled', progress: undefined })}
        onRetry={(id) => update(id, { status: 'queued', error: undefined })}
        onRemove={(id) => setItems((list) => list.filter((item) => item.id !== id))}
      />
      <Text size="small" tone="muted">
        Simulated: two files upload at a time and nothing is sent. A file with “fail” in its name
        fails at 60%, so Retry and Remove can be tried.
      </Text>
    </Stack>
  );
}
