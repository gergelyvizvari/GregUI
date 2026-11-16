import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthForm, LocaleProvider, LoginForm, PasswordlessSignIn } from '@gregui/react';

afterEach(() => {
  vi.useRealTimers();
});

describe('PasswordlessSignIn', () => {
  it('requests a code, shows where it went and verifies it', async () => {
    const requestCode = vi.fn().mockResolvedValue(undefined);
    const verifyCode = vi.fn().mockResolvedValue(undefined);
    const steps = vi.fn();
    render(
      <PasswordlessSignIn
        onRequestCode={requestCode}
        onVerifyCode={verifyCode}
        onStepChange={steps}
      />,
    );
    await userEvent.type(screen.getByLabelText(/Email address/), ' ada@example.com ');
    await userEvent.click(screen.getByRole('button', { name: 'Email me a code' }));
    expect(requestCode).toHaveBeenCalledWith('ada@example.com');
    expect(
      await screen.findByText('Enter the code we sent to ada@example.com.'),
    ).toBeInTheDocument();
    expect(steps).toHaveBeenLastCalledWith('verify', 'ada@example.com');
    await userEvent.type(screen.getByLabelText(/Verification code/), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Verify code' }));
    expect(verifyCode).toHaveBeenCalledWith({ email: 'ada@example.com', code: '123456' });
    expect(await screen.findByText('You are signed in.')).toBeInTheDocument();
    expect(steps).toHaveBeenLastCalledWith('complete', 'ada@example.com');
  });

  it('keeps the code step after a wrong code and shows the safe message', async () => {
    const verifyCode = vi
      .fn()
      .mockResolvedValueOnce({ error: 'That code is not right.' })
      .mockRejectedValueOnce(new Error('private backend details'));
    render(
      <PasswordlessSignIn
        defaultEmail="ada@example.com"
        onRequestCode={vi.fn()}
        onVerifyCode={verifyCode}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Email me a code' }));
    const input = await screen.findByLabelText(/Verification code/);
    await userEvent.type(input, '000000');
    await userEvent.click(screen.getByRole('button', { name: 'Verify code' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('That code is not right.');
    expect(screen.getByLabelText(/Verification code/)).toHaveValue('000000');
    await userEvent.click(screen.getByRole('button', { name: 'Verify code' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    );
    expect(screen.queryByText('private backend details')).not.toBeInTheDocument();
  });

  it('stays on the email step when sending fails', async () => {
    const requestCode = vi.fn().mockResolvedValue({ error: 'Too many requests.' });
    render(
      <PasswordlessSignIn
        defaultEmail="ada@example.com"
        onRequestCode={requestCode}
        onVerifyCode={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Email me a code' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Too many requests.');
    expect(screen.getByLabelText(/Email address/)).toHaveValue('ada@example.com');
  });

  it('waits before resending, then sends again and clears the old code', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const requestCode = vi.fn().mockResolvedValue(undefined);
    render(
      <PasswordlessSignIn
        defaultEmail="ada@example.com"
        resendDelay={30}
        onRequestCode={requestCode}
        onVerifyCode={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Email me a code' }));
    const wait = await screen.findByRole('button', { name: /Resend code in \d+ s/ });
    expect(wait).toBeDisabled();
    await user.type(screen.getByLabelText(/Verification code/), '12');
    await act(async () => {
      vi.advanceTimersByTime(31_000);
    });
    const resend = screen.getByRole('button', { name: 'Resend code' });
    expect(resend).toBeEnabled();
    await user.click(resend);
    expect(requestCode).toHaveBeenCalledTimes(2);
    expect(await screen.findByText('A new code has been requested.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Verification code/)).toHaveValue('');
  });

  it('shows how long the code is valid and blocks verifying once it expires', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const verifyCode = vi.fn();
    render(
      <PasswordlessSignIn
        defaultEmail="ada@example.com"
        resendDelay={0}
        onRequestCode={() => ({ expiresAt: Date.now() + 90_000 })}
        onVerifyCode={verifyCode}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Email me a code' }));
    expect(await screen.findByLabelText(/Verification code/)).toHaveAccessibleDescription(
      /The code is valid for 1:(30|29)\./,
    );
    await act(async () => {
      vi.advanceTimersByTime(91_000);
    });
    expect(screen.getByText('This code has expired. Ask for a new one.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verify code' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Resend code' })).toBeEnabled();
    expect(verifyCode).not.toHaveBeenCalled();
  });

  it('goes back to change the email and keeps what was typed', async () => {
    render(
      <PasswordlessSignIn
        defaultEmail="ada@example.com"
        onRequestCode={vi.fn()}
        onVerifyCode={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Email me a code' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Use a different email' }));
    expect(screen.getByLabelText(/Email address/)).toHaveValue('ada@example.com');
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Sign in with an email code' })).toHaveFocus(),
    );
  });

  it('offers configured providers on the first step and is translated', async () => {
    const microsoft = vi.fn();
    render(
      <LocaleProvider locale="hu-HU">
        <PasswordlessSignIn
          onRequestCode={vi.fn()}
          onVerifyCode={vi.fn()}
          socialProviders={[{ id: 'microsoft', name: 'Microsoft', onSignIn: microsoft }]}
        />
      </LocaleProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Folytatás: Microsoft' }));
    expect(microsoft).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Sikeresen bejelentkeztél.')).toBeInTheDocument();
  });
});

describe('AuthForm social providers', () => {
  it('lists Google, Apple and extra providers in order and shows loading on the active one', async () => {
    let finish!: () => void;
    const okta = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(
      <LoginForm
        onSubmit={vi.fn()}
        onGoogleSignIn={vi.fn()}
        socialProviders={[
          { id: 'okta', name: 'Okta', onSignIn: okta },
          { id: 'sso', name: 'SSO', label: 'Use company sign-in', onSignIn: vi.fn() },
        ]}
      />,
    );
    const names = screen
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label') ?? button.textContent)
      .slice(0, 3);
    expect(names).toEqual(['Continue with Google', 'Continue with Okta', 'Use company sign-in']);
    await userEvent.click(screen.getByRole('button', { name: 'Continue with Okta' }));
    expect(screen.getByRole('button', { name: 'Continue with Okta' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Continue with Google' })).not.toHaveAttribute(
      'aria-busy',
    );
    finish();
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Completed successfully.'),
    );
  });

  it('shows providers on registration only when asked, with a sign-up separator', () => {
    const providers = [{ id: 'google', name: 'Google', onSignIn: vi.fn() }];
    const { rerender } = render(
      <AuthForm mode="register" onSubmit={vi.fn()} socialProviders={providers} />,
    );
    expect(screen.queryByRole('button', { name: 'Continue with Google' })).not.toBeInTheDocument();
    rerender(
      <AuthForm
        mode="register"
        onSubmit={vi.fn()}
        socialProviders={providers}
        socialModes={['login', 'register']}
      />,
    );
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.getByText('or sign up with email')).toBeInTheDocument();
  });

  it('keeps the provider error from a returned result', async () => {
    render(
      <LoginForm
        onSubmit={vi.fn()}
        socialProviders={[
          { id: 'x', name: 'Example', onSignIn: () => ({ error: 'Sign-in was cancelled.' }) },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue with Example' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sign-in was cancelled.');
  });
});
