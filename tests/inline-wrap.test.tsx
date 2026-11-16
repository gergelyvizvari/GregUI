import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Inline } from '@gregui/react';

it('keeps an icon and its sentence on one row when wrap is off', () => {
  const { container, rerender } = render(<Inline>a</Inline>);
  expect(container.firstElementChild).not.toHaveAttribute('data-wrap');
  rerender(<Inline wrap={false}>a</Inline>);
  expect(container.firstElementChild).toHaveAttribute('data-wrap', 'false');
});
