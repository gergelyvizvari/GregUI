import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { BrandPreview } from '../packages/react/src/index';
it('keeps the named preview and identity when the optional hero is removed', () => {
  const { rerender } = render(
    <BrandPreview
      label="Preview"
      name="Harbour"
      title="Hello"
      description="Local arts"
      logo="blob:logo"
      cover="blob:cover"
    />,
  );
  expect(screen.getByRole('region', { name: 'Preview' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Hello' })).toBeTruthy();
  rerender(<BrandPreview label="Preview" name="Harbour" compact />);
  expect(screen.getByText('Harbour')).toBeTruthy();
  expect(screen.queryByRole('heading')).toBeNull();
  expect(screen.queryByText('Local arts')).toBeNull();
});
