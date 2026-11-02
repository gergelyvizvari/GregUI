'use client';
import { forwardRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';
import type { Clean } from './internal-types';

export type LinkButtonProps = Clean<ComponentPropsWithoutRef<'a'>> & {
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  /** Decorative icon shown before the label. */
  icon?: ReactNode;
  /**
   * Link component from the app's router or framework (for example Next.js `Link`). It receives
   * `href`, the other anchor props, `className` and the button data attributes, and must render
   * an `<a>`. Defaults to a native anchor.
   */
  component?: ElementType;
};

/** Navigation that looks like a Button. Use Button for actions and LinkButton for destinations. */
export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
  { variant = 'primary', size = 'medium', icon, children, component: Component = 'a', ...props },
  ref,
) {
  return (
    <Component {...props} ref={ref} className="g-button" data-variant={variant} data-size={size}>
      {icon}
      {children}
    </Component>
  );
});
