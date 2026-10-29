'use client';
import { useCallback, useRef, useState } from 'react';

/**
 * Value state that is controlled when `value` is defined and internal otherwise.
 * `onChange` is called for every requested change in both modes.
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange: ((value: T) => void) | undefined,
) {
  const [internal, setInternal] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const set = useCallback(
    (next: T) => {
      if (!controlled) setInternal(next);
      onChangeRef.current?.(next);
    },
    [controlled],
  );
  return [current, set] as const;
}
