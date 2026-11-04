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
