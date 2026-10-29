'use client';
import React, { forwardRef, type ReactNode, type ComponentPropsWithoutRef } from 'react';
import { useLocale } from '@gregui/localization';
import type { Clean } from './internal-types';
import { Spinner } from './feedback';
export const Button = forwardRef<
  HTMLButtonElement,
  Clean<ComponentPropsWithoutRef<'button'>> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    icon?: ReactNode;
  }
>(function Button(
  {
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled,
    children,
    icon,
    type = 'button',
    ...props
  },
  ref,
) {
  const { messages } = useLocale();
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className="g-button"
      data-variant={variant}
      data-size={size}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <Spinner label={messages.loading} /> : icon}
      {children}
    </button>
  );
});
export const IconButton = forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<typeof Button>, 'children'> & { label: string; children: ReactNode }
>(function IconButton({ label, title = label, children, ...props }, ref) {
  return (
    <Button {...props} ref={ref} aria-label={label} title={title} data-icon-only>
      {children}
    </Button>
  );
});
