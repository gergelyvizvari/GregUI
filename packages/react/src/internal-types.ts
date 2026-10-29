import type { ComponentPropsWithoutRef } from 'react';

/** Props without style escape hatches: presentation stays in the package. */
export type Clean<T> = Omit<T, 'style' | 'className'>;
export type DivProps = Clean<ComponentPropsWithoutRef<'div'>>;
