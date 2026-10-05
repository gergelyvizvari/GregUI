'use client';
import React, {
  forwardRef,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { useLocale } from '@gregui/localization';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Field,
  Heading,
  Input,
  Stack,
  Text,
  TextField,
} from './index';

type InputProps = Omit<ComponentPropsWithoutRef<'input'>, 'className' | 'style' | 'type'>;
export const PasswordField = forwardRef<
  HTMLInputElement,
  InputProps & { label: string; hint?: string; error?: string }
>(function PasswordField({ label, hint, error, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  const { messages } = useLocale();
  return (
    <Field label={label} hint={hint} error={error} id={props.id} required={props.required}>
      {(field) => (
        <div className="g-password-field">
          <Input {...props} {...field} ref={ref} type={visible ? 'text' : 'password'} />
          <Button
            variant="ghost"
            size="small"
            disabled={props.disabled}
            aria-controls={field.id}
            aria-pressed={visible}
            aria-label={`${messages.authShowPassword}: ${label}`}
            onClick={() => setVisible(!visible)}
          >
            {visible ? messages.authHide : messages.authShow}
          </Button>
        </div>
      )}
    </Field>
  );
});
export const VerificationCodeField = forwardRef<
  HTMLInputElement,
  Omit<InputProps, 'maxLength' | 'minLength' | 'pattern' | 'inputMode'> & {
    label?: string;
    hint?: string;
    error?: string;
    length?: number;
  }
>(function VerificationCodeField({ label, hint, error, length = 6, ...props }, ref) {
  const { messages } = useLocale();
  const digits = Math.max(4, Math.min(12, Math.trunc(length) || 6));
  return (
    <Field
      label={label ?? messages.authCode}
      hint={hint}
      error={error}
      id={props.id}
      required={props.required}
    >
      {(field) => (
        <Input
          {...props}
          {...field}
          ref={ref}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          minLength={digits}
          maxLength={digits}
          pattern={`[0-9]{${digits}}`}
          dir="ltr"
        />
      )}
    </Field>
  );
});
export function AuthLayout({
  brand,
  introduction,
  children,
  footer,
}: {
  brand?: ReactNode;
  introduction?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="g-auth-layout">
      {(brand || introduction) && (
        <div className="g-auth-intro">
          <Stack gap={5}>
            {brand}
            {introduction}
          </Stack>
        </div>
      )}
      <div className="g-auth-panel">
        <Card>
          <Stack gap={5}>{children}</Stack>
        </Card>
        {footer && <div className="g-auth-footer">{footer}</div>}
      </div>
    </section>
  );
}
export type AuthMode =
  'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email' | 'two-factor';
export type AuthSubmission =
  | { mode: 'login'; email: string; password: string; remember: boolean }
  | { mode: 'register'; name: string; email: string; password: string }
  | { mode: 'forgot-password'; email: string }
  | { mode: 'reset-password'; password: string }
  | { mode: 'verify-email' | 'two-factor'; code: string };
export interface AuthFormProps {
  mode: AuthMode;
  onSubmit: (values: AuthSubmission) => void | Promise<void>;
  onNavigate?: (mode: AuthMode) => void;
  onResend?: () => void | Promise<void>;
  onGoogleSignIn?: () => void | Promise<void>;
  onAppleSignIn?: () => void | Promise<void>;
  title?: string;
  description?: string;
  passwordHint?: string;
  minPasswordLength?: number;
  codeLength?: number;
  error?: string;
  successMessage?: string;
  footer?: ReactNode;
}
/** Providers own authentication, session persistence, token validation and rate limits. */
export function AuthForm(props: AuthFormProps) {
  // Remount transient inputs when changing flow; credentials do not cross screens.
  return <AuthFormScreen key={props.mode} {...props} />;
}
function AuthFormScreen({
  mode,
  onSubmit,
  onNavigate,
  onResend,
  onGoogleSignIn,
  onAppleSignIn,
  title,
  description,
  passwordHint,
  minPasswordLength,
  codeLength,
  error,
  successMessage,
  footer,
}: AuthFormProps) {
  const { messages: m } = useLocale();
  const id = useId();
  const locked = useRef(false);
  const [pending, setPending] = useState(false);
  const [pendingAction, setPendingAction] = useState('submit');
  const [failure, setFailure] = useState('');
  const [status, setStatus] = useState('');
  const [mismatch, setMismatch] = useState(false);
  const feedback = useRef<HTMLDivElement>(null);
  const confirm = useRef<HTMLInputElement>(null);
  const email = ['login', 'register', 'forgot-password'].includes(mode);
  const password = ['login', 'register', 'reset-password'].includes(mode);
  const newPassword = mode === 'register' || mode === 'reset-password';
  const verification = mode === 'verify-email' || mode === 'two-factor';
  const titles = {
    login: m.authLogin,
    register: m.authRegister,
    'forgot-password': m.authForgot,
    'reset-password': m.authReset,
    'verify-email': m.authVerifyEmail,
    'two-factor': m.authTwoFactor,
  };
  const descriptions = {
    login: m.authLoginDescription,
    register: m.authRegisterDescription,
    'forgot-password': m.authForgotDescription,
    'reset-password': m.authResetDescription,
    'verify-email': m.authVerifyDescription,
    'two-factor': m.authTwoFactorDescription,
  };
  const action = verification
    ? m.authVerify
    : mode === 'forgot-password'
      ? m.authSendLink
      : titles[mode];
  async function run(
    operation: () => void | Promise<void>,
    message: string,
    form?: HTMLFormElement,
    source = 'submit',
  ) {
    if (locked.current) return;
    locked.current = true;
    setPendingAction(source);
    setPending(true);
    setFailure('');
    setStatus('');
    try {
      await operation();
      form?.reset();
      setStatus(message);
    } catch {
      setFailure(m.authFailure);
    } finally {
      locked.current = false;
      setPending(false);
      requestAnimationFrame(() => feedback.current?.focus());
    }
  }
  return (
    <form
      className="g-auth-form"
      aria-labelledby={`${id}-title`}
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        if (locked.current) return;
        const form = event.currentTarget;
        const data = new FormData(form);
        const value = (key: string) => String(data.get(key) ?? '');
        if (newPassword && value('password') !== value('confirmPassword')) {
          setMismatch(true);
          confirm.current?.focus();
          return;
        }
        let values: AuthSubmission;
        if (mode === 'login')
          values = {
            mode,
            email: value('email').trim(),
            password: value('password'),
            remember: data.has('remember'),
          };
        else if (mode === 'register')
          values = {
            mode,
            name: value('name').trim(),
            email: value('email').trim(),
            password: value('password'),
          };
        else if (mode === 'forgot-password') values = { mode, email: value('email').trim() };
        else if (mode === 'reset-password') values = { mode, password: value('password') };
        else values = { mode, code: value('code') };
        void run(
          () => onSubmit(values),
          successMessage ?? (mode === 'forgot-password' ? m.authResetSent : m.authComplete),
          form,
        );
      }}
    >
      <Stack gap={5}>
        <Stack gap={2}>
          <Heading level={2} size="section" id={`${id}-title`}>
            {title ?? titles[mode]}
          </Heading>
          <Text tone="muted" size="small">
            {description ?? descriptions[mode]}
          </Text>
        </Stack>
        <div ref={feedback} tabIndex={-1} className="g-auth-feedback">
          {(error || failure) && <Alert tone="danger" title={error || failure} live />}
          <div role="status">{status && <Alert tone="success" title={status} />}</div>
        </div>
        <fieldset disabled={pending} className="g-auth-fields">
          <Stack gap={4}>
            {mode === 'login' && (onGoogleSignIn || onAppleSignIn) && (
              <>
                <Stack gap={3}>
                  {onGoogleSignIn && (
                    <Button
                      variant="secondary"
                      aria-label={m.authGoogle}
                      loading={pending && pendingAction === 'google'}
                      onClick={() => void run(onGoogleSignIn, m.authComplete, undefined, 'google')}
                    >
                      {m.authGoogle}
                    </Button>
                  )}
                  {onAppleSignIn && (
                    <Button
                      variant="secondary"
                      aria-label={m.authApple}
                      loading={pending && pendingAction === 'apple'}
                      onClick={() => void run(onAppleSignIn, m.authComplete, undefined, 'apple')}
                    >
                      {m.authApple}
                    </Button>
                  )}
                </Stack>
                <div className="g-auth-divider">
                  <Text size="small" tone="muted">
                    {m.authOrEmail}
                  </Text>
                </div>
              </>
            )}
            {mode === 'register' && (
              <TextField label={m.authName} name="name" autoComplete="name" required />
            )}
            {email && (
              <TextField
                label={m.authEmail}
                name="email"
                type="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
              />
            )}
            {password && (
              <PasswordField
                label={m.authPassword}
                name="password"
                autoComplete={newPassword ? 'new-password' : 'current-password'}
                hint={passwordHint}
                minLength={newPassword ? minPasswordLength : undefined}
                required
                onInput={() => setMismatch(false)}
              />
            )}
            {newPassword && (
              <PasswordField
                ref={confirm}
                label={m.authConfirmPassword}
                error={mismatch ? m.authMismatch : undefined}
                name="confirmPassword"
                autoComplete="new-password"
                required
                onInput={() => setMismatch(false)}
              />
            )}
            {verification && <VerificationCodeField name="code" length={codeLength} required />}
            {mode === 'login' && <Checkbox name="remember" label={m.authRemember} />}
            <Button
              type="submit"
              loading={pending && pendingAction === 'submit'}
              aria-label={action}
            >
              {action}
            </Button>
            {verification && onResend && (
              <Button
                variant="secondary"
                loading={pending && pendingAction === 'resend'}
                onClick={() => void run(onResend, m.authCodeSent, undefined, 'resend')}
              >
                {m.authResend}
              </Button>
            )}
            {onNavigate && (
              <div className="g-auth-links">
                {mode === 'login' ? (
                  <>
                    <Button variant="ghost" onClick={() => onNavigate('forgot-password')}>
                      {m.authForgot}
                    </Button>
                    <Button variant="ghost" onClick={() => onNavigate('register')}>
                      {m.authRegister}
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" onClick={() => onNavigate('login')}>
                    {m.authBackLogin}
                  </Button>
                )}
              </div>
            )}
          </Stack>
        </fieldset>
        {footer}
      </Stack>
    </form>
  );
}
type FlowProps = Omit<AuthFormProps, 'mode'>;
export function LoginForm(props: FlowProps) {
  return <AuthForm {...props} mode="login" />;
}
export function RegistrationForm(props: FlowProps) {
  return <AuthForm {...props} mode="register" />;
}
export function ForgotPasswordForm(props: FlowProps) {
  return <AuthForm {...props} mode="forgot-password" />;
}
export function ResetPasswordForm(props: FlowProps) {
  return <AuthForm {...props} mode="reset-password" />;
}
export function EmailVerificationForm(props: FlowProps) {
  return <AuthForm {...props} mode="verify-email" />;
}
export function TwoFactorForm(props: FlowProps) {
  return <AuthForm {...props} mode="two-factor" />;
}
