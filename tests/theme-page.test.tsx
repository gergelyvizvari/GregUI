import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Dialog, ThemeProvider } from '@gregui/react';
import { createTheme } from '@gregui/tokens';

describe('ThemeProvider page', () => {
  it('marks only the page root, not nested providers or portals', () => {
    const { container } = render(
      <ThemeProvider theme={createTheme('joyful', 'dark')} page>
        <ThemeProvider theme={createTheme('paper')}>
          <span>Nested</span>
        </ThemeProvider>
        <Dialog
          open
          onOpenChange={() => {}}
          trigger={<button>Open</button>}
          title="Details"
          description="More"
        >
          <span>Inside</span>
        </Dialog>
      </ThemeProvider>,
    );
    const root = container.querySelector('.g-theme')!;
    expect(root).toHaveAttribute('data-page', 'true');
    expect(root).toHaveAttribute('data-mode', 'dark');
    expect(screen.getByText('Nested').closest('.g-theme')).not.toHaveAttribute('data-page');
    expect(screen.getByText('Inside').closest('.g-theme')).not.toHaveAttribute('data-page');
  });
  it('leaves the default markup unchanged', () => {
    const { container } = render(
      <ThemeProvider theme={createTheme('flat')}>
        <span>Content</span>
      </ThemeProvider>,
    );
    expect(container.querySelector('.g-theme')).not.toHaveAttribute('data-page');
  });
});
