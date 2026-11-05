import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { AuthForm } from '@gregui/react';

it('offers the password as the way back when the code comes first, and can hide remember me', () => {
  const { unmount } = render(
    <AuthForm mode="email-code" codeFirst onSubmit={vi.fn()} onNavigate={vi.fn()} />,
  );
  expect(screen.getByRole('button', { name: 'Sign in with a password' })).toBeInTheDocument();
  unmount();
  render(<AuthForm mode="login" rememberChoice={false} onSubmit={vi.fn()} />);
  expect(screen.queryByRole('checkbox', { name: 'Keep me signed in' })).not.toBeInTheDocument();
});

it('puts the cursor in the code field when the code screen opens, but not on the first screen', () => {
  const { rerender } = render(<AuthForm mode="email-code" onSubmit={vi.fn()} />);
  expect(document.activeElement).not.toBe(screen.getByRole('textbox', { name: /email/i }));
  rerender(<AuthForm mode="verify-email" onSubmit={vi.fn()} />);
  expect(screen.getByLabelText(/code/i, { selector: 'input' })).toHaveFocus();
});
