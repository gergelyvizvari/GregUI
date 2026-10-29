import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  AuthForm,
  LoginForm,
  LocaleProvider,
  PasswordField,
  VerificationCodeField,
} from '@gregui/react';

describe('authentication patterns', () => {
  it('reveals passwords without losing value or field associations, with translated controls', async () => {
    render(
      <LocaleProvider
        messages={{
          authShowPassword: 'Jelszó megjelenítése',
          authShow: 'Mutat',
          authHide: 'Elrejt',
        }}
      >
        <PasswordField label="Jelszó" hint="Titkos" defaultValue="demo-secret" />
      </LocaleProvider>,
    );
    const input = screen.getByLabelText('Jelszó');
    expect(input).toHaveAttribute('type', 'password');
    const toggle = screen.getByRole('button', { name: 'Jelszó megjelenítése: Jelszó' });
    await userEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue('demo-secret');
    expect(input).toHaveAccessibleDescription('Titkos');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggle).toHaveAttribute('aria-controls', input.id);
  });
  it('submits remember preference once, locks pending requests and clears credentials on success', async () => {
    let finish!: () => void;
    const submit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(<LoginForm onSubmit={submit} />);
    await userEvent.type(screen.getByLabelText(/Email address/), 'demo@example.com');
    await userEvent.type(screen.getByLabelText(/^Password/), 'secret123');
    await userEvent.click(screen.getByLabelText('Keep me signed in'));
    await userEvent.dblClick(screen.getByRole('button', { name: 'Sign in' }));
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith({
      mode: 'login',
      email: 'demo@example.com',
      password: 'secret123',
      remember: true,
    });
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
    finish();
    await waitFor(() => expect(screen.getByLabelText(/^Password/)).toHaveValue(''));
    expect(screen.getByRole('status')).toHaveTextContent('Completed successfully.');
  });
  it('handles rejected requests without leaking server errors and supports retry', async () => {
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new Error('private backend details'))
      .mockResolvedValue(undefined);
    render(<AuthForm mode="forgot-password" onSubmit={submit} />);
    await userEvent.type(screen.getByLabelText(/Email address/), 'demo@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    );
    expect(screen.queryByText('private backend details')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('If an account matches this email'),
    );
  });
  it('accepts a pasted code in one autofill-compatible field and clears secrets between flows', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<VerificationCodeField label="Code" />);
    await user.click(screen.getByLabelText('Code'));
    await user.paste('123456');
    expect(screen.getByLabelText('Code')).toHaveValue('123456');
    expect(screen.getByLabelText('Code')).toHaveAttribute('autocomplete', 'one-time-code');
    unmount();
    const { rerender } = render(<AuthForm mode="login" onSubmit={() => {}} />);
    await user.type(screen.getByLabelText(/^Password/), 'private-value');
    rerender(<AuthForm mode="reset-password" onSubmit={() => {}} />);
    expect(screen.getByLabelText(/^Password/)).toHaveValue('');
  });
});

it('shows only configured login providers and never submits credentials for social sign-in', async () => {
  const submit = vi.fn();
  const google = vi.fn().mockResolvedValue(undefined);
  const { rerender } = render(<LoginForm onSubmit={submit} />);
  expect(screen.queryByRole('button', { name: 'Continue with Google' })).not.toBeInTheDocument();
  expect(screen.queryByText('or sign in with email')).not.toBeInTheDocument();
  rerender(<LoginForm onSubmit={submit} onGoogleSignIn={google} />);
  expect(screen.queryByRole('button', { name: 'Continue with Apple' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
  await waitFor(() => expect(google).toHaveBeenCalledTimes(1));
  expect(google).toHaveBeenCalledWith();
  expect(submit).not.toHaveBeenCalled();
});
it('locks all login methods while a provider is pending and recovers from rejection', async () => {
  let reject!: (error: Error) => void;
  const apple = vi.fn(
    () =>
      new Promise<void>((_, fail) => {
        reject = fail;
      }),
  );
  const google = vi.fn();
  render(<LoginForm onSubmit={vi.fn()} onAppleSignIn={apple} onGoogleSignIn={google} />);
  await userEvent.dblClick(screen.getByRole('button', { name: 'Continue with Apple' }));
  expect(apple).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Continue with Apple' })).toHaveAttribute(
    'aria-busy',
    'true',
  );
  expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
  reject(new Error('Private provider error'));
  expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');
  await userEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
  expect(google).toHaveBeenCalledTimes(1);
});

describe('application-reported failures', () => {
  async function submit(onSubmit: () => unknown, error?: string) {
    const user = userEvent.setup();
    render(
      <LoginForm onSubmit={onSubmit as () => undefined} error={error} successMessage="Signed in" />,
    );
    await user.type(screen.getByLabelText(/email/i), 'sam@example.com');
    await user.type(document.querySelector<HTMLInputElement>('input[type="password"]')!, 'pw');
    await user.click(screen.getByRole('button', { name: /sign in|log in/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    return user;
  }
  it('keeps values and shows the returned error instead of success', async () => {
    await submit(vi.fn(async () => ({ error: 'Wrong password' })));
    expect(await screen.findByText('Wrong password')).toBeInTheDocument();
    expect(screen.queryByText('Signed in')).toBeNull();
    expect(screen.getByLabelText(/email/i)).toHaveValue('sam@example.com');
  });
  it('shows no success when the callback returns false or the error prop is set', async () => {
    const onSubmit = vi.fn(async () => false as const);
    await submit(onSubmit);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /sign in|log in/i })).toBeEnabled(),
    );
    expect(screen.queryByText('Signed in')).toBeNull();
    expect(screen.getByLabelText(/email/i)).toHaveValue('sam@example.com');
  });
  it('hides success while the application error prop is set', async () => {
    await submit(
      vi.fn(async () => {}),
      'Wrong password',
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /sign in|log in/i })).toBeEnabled(),
    );
    expect(screen.getByText('Wrong password')).toBeInTheDocument();
    expect(screen.queryByText('Signed in')).toBeNull();
  });
});
