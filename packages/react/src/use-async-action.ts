'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Shared pending/error state for one async action at a time.
 * `run` ignores calls while an action is in flight and skips state updates after unmount.
 * It resolves true on success, false when the action threw, and null when it was skipped.
 */
export function useAsyncAction() {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const locked = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const run = useCallback(async (action: () => unknown): Promise<boolean | null> => {
    if (locked.current) return null;
    locked.current = true;
    setPending(true);
    setFailed(false);
    try {
      await action();
      return true;
    } catch {
      if (mounted.current) setFailed(true);
      return false;
    } finally {
      locked.current = false;
      if (mounted.current) setPending(false);
    }
  }, []);
  const reset = useCallback(() => setFailed(false), []);
  return { pending, failed, run, reset, locked };
}
