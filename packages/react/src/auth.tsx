'use client';
import React, {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { useFormat, useLocale, type Messages } from '@gregui/localization';
import { Button } from './buttons';
import { Alert } from './feedback';
import { Checkbox, Field, Input, TextField } from './forms';
import { Card, Stack } from './layout';
import { Heading, Text } from './typography';
import { useAsyncAction } from './use-async-action';

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
  page = false,
}: {
  brand?: ReactNode;
  introduction?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** The whole screen: fills the viewport and centres the introduction and form in it. */
  page?: boolean;
}) {
  return (
    <section className="g-auth-layout" data-page={page || undefined}>
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
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'verify-email'
  | 'two-factor'
  | 'email-code';
export type AuthSubmission =
  | { mode: 'login'; email: string; password: string; remember: boolean }
  | { mode: 'register'; name: string; email: string; password: string }
  | { mode: 'forgot-password' | 'email-code'; email: string }
  | { mode: 'reset-password'; password: string }
  | { mode: 'verify-email' | 'two-factor'; code: string };
/**
 * Return `false` or `{ error }` when the attempt failed without throwing (for example a wrong
 * password). The form then keeps its values and shows no success message.
 */
export type AuthResult = void | false | { error: string };
/** A social or single sign-on provider button, such as Google, Apple, Microsoft or a company SSO. */
export interface AuthSocialProvider {
  /** Stable id; also tells apart which button shows the loading indicator. */
  id: string;
  /** Provider name, shown as "Continue with {name}". */
  name: string;
  /** Full button text instead of "Continue with {name}". */
  label?: string;
  /** Provider mark shown before the text. Applications supply brand assets. */
  icon?: ReactNode;
  /** Called directly from the click, so a provider popup can open synchronously. */
  onSignIn: () => AuthResult | Promise<AuthResult>;
}
export interface AuthFormProps {
  mode: AuthMode;
  onSubmit: (values: AuthSubmission) => AuthResult | Promise<AuthResult>;
  onNavigate?: (mode: AuthMode) => void;
  onResend?: () => void | Promise<void>;
  onGoogleSignIn?: () => void | Promise<void>;
  onAppleSignIn?: () => void | Promise<void>;
  /**
   * Any number of social or single sign-on providers, shown after Google and Apple when those
   * callbacks are also set.
   */
  socialProviders?: AuthSocialProvider[];
  /** Screens that show the provider buttons. Defaults to `['login']`. */
  socialModes?: AuthMode[];
  title?: string;
  description?: string;
  passwordHint?: string;
  minPasswordLength?: number;
  codeLength?: number;
  error?: string;
  successMessage?: string;
  footer?: ReactNode;
  /** Level of the form title heading. Defaults to 2. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /**
   * Offers passwordless sign-in: the login screen links to `email-code`, where people ask for a
   * one-time code by email and then enter it in `verify-email`. Requires `onNavigate`.
   */
  emailCode?: boolean;
  /**
   * Shows the "create account" link on the login screen. Defaults to true; set false where
   * accounts are made for people (staff tools, invitations).
   */
  registration?: boolean;
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
  socialProviders,
  socialModes = ['login'],
  title,
  description,
  passwordHint,
  minPasswordLength,
  codeLength,
  error,
  successMessage,
  footer,
  headingLevel = 2,
  emailCode = false,
  registration = true,
}: AuthFormProps) {
  const { messages: m } = useLocale();
  const id = useId();
  const { pending, failed, run: runAction, locked } = useAsyncAction();
  const [pendingAction, setPendingAction] = useState('submit');
  const [rejection, setRejection] = useState('');
  const failure = rejection || (failed ? m.authFailure : '');
  const [status, setStatus] = useState('');
  const [mismatch, setMismatch] = useState(false);
  const feedback = useRef<HTMLDivElement>(null);
  const confirm = useRef<HTMLInputElement>(null);
  const email = ['login', 'register', 'forgot-password', 'email-code'].includes(mode);
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
    'email-code': m.authEmailCode,
  };
  const descriptions = {
    login: m.authLoginDescription,
    register: m.authRegisterDescription,
    'forgot-password': m.authForgotDescription,
    'reset-password': m.authResetDescription,
    'verify-email': m.authVerifyDescription,
    'two-factor': m.authTwoFactorDescription,
    'email-code': m.authEmailCodeDescription,
  };
  const providers = socialModes.includes(mode)
    ? builtInProviders(m, onGoogleSignIn, onAppleSignIn, socialProviders)
    : [];
  const action = verification
    ? m.authVerify
    : mode === 'forgot-password'
      ? m.authSendLink
      : mode === 'email-code'
        ? m.authSendCode
        : titles[mode];
  async function run(
    operation: () => AuthResult | Promise<AuthResult>,
    message: string,
    form?: HTMLFormElement,
    source = 'submit',
  ) {
    if (locked.current) return;
    setPendingAction(source);
    setRejection('');
    setStatus('');
    await runAction(async () => {
      const result = await operation();
      if (result === false) return;
      if (result && typeof result === 'object') {
        setRejection(result.error || m.authFailure);
        return;
      }
      form?.reset();
      setStatus(message);
    });
    requestAnimationFrame(() => feedback.current?.focus());
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
        else if (mode === 'forgot-password' || mode === 'email-code')
          values = { mode, email: value('email').trim() };
        else if (mode === 'reset-password') values = { mode, password: value('password') };
        else values = { mode, code: value('code') };
        void run(
          () => onSubmit(values),
          successMessage ??
            (mode === 'forgot-password'
              ? m.authResetSent
              : mode === 'email-code'
                ? m.authEmailCodeSent
                : m.authComplete),
          form,
        );
      }}
    >
      <Stack gap={5}>
        <Stack gap={2}>
          <Heading level={headingLevel} size="section" id={`${id}-title`}>
            {title ?? titles[mode]}
          </Heading>
          <Text tone="muted" size="small">
            {description ?? descriptions[mode]}
          </Text>
        </Stack>
        <div ref={feedback} tabIndex={-1} className="g-auth-feedback">
          {(error || failure) && <Alert tone="danger" title={error || failure} live />}
          <div role="status">{status && !error && <Alert tone="success" title={status} />}</div>
        </div>
        <fieldset disabled={pending} className="g-auth-fields">
          <Stack gap={4}>
            {providers.length > 0 && (
              <>
                <SocialButtons
                  providers={providers}
                  pending={pending}
                  pendingAction={pendingAction}
                  onSignIn={(provider) =>
                    void run(
                      provider.onSignIn,
                      successMessage ?? m.authComplete,
                      undefined,
                      `social:${provider.id}`,
                    )
                  }
                />
                <div className="g-auth-divider">
                  <Text size="small" tone="muted">
                    {mode === 'register' ? m.authOrRegisterEmail : m.authOrEmail}
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
                    {emailCode && (
                      <Button variant="ghost" onClick={() => onNavigate('email-code')}>
                        {m.authUseCode}
                      </Button>
                    )}
                    <Button variant="ghost" onClick={() => onNavigate('forgot-password')}>
                      {m.authForgot}
                    </Button>
                    {registration && (
                      <Button variant="ghost" onClick={() => onNavigate('register')}>
                        {m.authRegister}
                      </Button>
                    )}
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
function builtInProviders(
  m: Messages,
  onGoogleSignIn?: () => void | Promise<void>,
  onAppleSignIn?: () => void | Promise<void>,
  extra: AuthSocialProvider[] = [],
): AuthSocialProvider[] {
  const list: AuthSocialProvider[] = [];
  if (onGoogleSignIn)
    list.push({ id: 'google', name: 'Google', label: m.authGoogle, onSignIn: onGoogleSignIn });
  if (onAppleSignIn)
    list.push({ id: 'apple', name: 'Apple', label: m.authApple, onSignIn: onAppleSignIn });
  return [...list, ...extra];
}
function SocialButtons({
  providers,
  pending,
  pendingAction,
  onSignIn,
}: {
  providers: AuthSocialProvider[];
  pending: boolean;
  pendingAction: string;
  onSignIn: (provider: AuthSocialProvider) => void;
}) {
  const { messages: m } = useLocale();
  return (
    <Stack gap={3}>
      {providers.map((provider) => {
        const label = provider.label ?? m.authContinueWith.replace('{provider}', provider.name);
        return (
          <Button
            key={provider.id}
            variant="secondary"
            aria-label={label}
            icon={provider.icon}
            loading={pending && pendingAction === `social:${provider.id}`}
            onClick={() => onSignIn(provider)}
          >
            {label}
          </Button>
        );
      })}
    </Stack>
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
/** Passwordless sign-in, first step: the email to send a one-time code to. */
export function EmailCodeForm(props: FlowProps) {
  return <AuthForm {...props} mode="email-code" />;
}
/** What `onRequestCode` may resolve with when a code was sent. Times are epoch milliseconds or dates. */
export interface EmailCodeSent {
  /** When the code stops working. Overrides `codeLifetime`. */
  expiresAt?: Date | number;
  /** When another code may be requested. Overrides `resendDelay`. */
  resendAvailableAt?: Date | number;
}
export type EmailCodeRequestResult = AuthResult | EmailCodeSent;
export type PasswordlessStep = 'request' | 'verify' | 'complete';
export interface PasswordlessSignInProps {
  /** Send a one-time code to `email`. Resolve when sent; return `{ error }` or reject on failure. */
  onRequestCode: (email: string) => EmailCodeRequestResult | Promise<EmailCodeRequestResult>;
  /** Check the code. Resolve on success; return `{ error }` for a wrong code, or reject. */
  onVerifyCode: (values: { email: string; code: string }) => AuthResult | Promise<AuthResult>;
  /** Called after each step change, for analytics or to move focus elsewhere. */
  onStepChange?: (step: PasswordlessStep, email: string) => void;
  /** Shows a "Back to sign in" link on the first step, for example to a password form. */
  onBack?: () => void;
  defaultEmail?: string;
  /** Digits in the code: 4–12, default 6. */
  codeLength?: number;
  /** Seconds before another code may be requested. Default 30; 0 allows it at once. */
  resendDelay?: number;
  /** Seconds a code stays valid. Leave unset when the application does not expire codes. */
  codeLifetime?: number;
  /** Social or single sign-on providers offered on the first step. */
  socialProviders?: AuthSocialProvider[];
  title?: string;
  description?: string;
  /** Safe application message shown as an error. */
  error?: string;
  /** Shown after the code is accepted. Defaults to "You are signed in." */
  successMessage?: string;
  /** Replaces the default success message on the last step, for example a "Continue" button. */
  complete?: ReactNode;
  footer?: ReactNode;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}
function toTime(value: Date | number | undefined) {
  return value === undefined ? undefined : typeof value === 'number' ? value : value.getTime();
}
function isSent(result: EmailCodeRequestResult): result is EmailCodeSent {
  return !!result && typeof result === 'object' && !('error' in result);
}
/**
 * Passwordless sign-in as one journey: email, then the emailed code with resend, expiry and
 * retry, then success. Applications own delivery, verification, rate limits and sessions.
 */
export function PasswordlessSignIn({
  onRequestCode,
  onVerifyCode,
  onStepChange,
  onBack,
  defaultEmail = '',
  codeLength,
  resendDelay = 30,
  codeLifetime,
  socialProviders = [],
  title,
  description,
  error,
  successMessage,
  complete,
  footer,
  headingLevel = 2,
}: PasswordlessSignInProps) {
  const { messages: m } = useLocale();
  const { date } = useFormat();
  const id = useId();
  const { pending, failed, run: runAction, locked } = useAsyncAction();
  const [step, setStep] = useState<PasswordlessStep>('request');
  const [email, setEmail] = useState(defaultEmail);
  const [pendingAction, setPendingAction] = useState('submit');
  const [rejection, setRejection] = useState('');
  const [status, setStatus] = useState('');
  const [expiresAt, setExpiresAt] = useState<number>();
  const [resendAt, setResendAt] = useState<number>();
  const [now, setNow] = useState(() => Date.now());
  const feedback = useRef<HTMLDivElement>(null);
  const code = useRef<HTMLInputElement>(null);
  const failure = rejection || (failed ? m.authFailure : '');
  const ticking =
    step === 'verify' &&
    ((expiresAt !== undefined && expiresAt > now) || (resendAt !== undefined && resendAt > now));
  useEffect(() => {
    if (!ticking) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [ticking]);
  const expired = step === 'verify' && expiresAt !== undefined && expiresAt <= now;
  const resendWait = resendAt === undefined ? 0 : Math.max(0, Math.ceil((resendAt - now) / 1000));
  const moved = useRef(false);
  useEffect(() => {
    // Move focus only after a step change, never on first render.
    if (!moved.current) return;
    moved.current = false;
    if (step === 'verify') code.current?.focus();
    else document.getElementById(`${id}-title`)?.focus();
  }, [step, id]);
  function go(next: PasswordlessStep, address: string) {
    moved.current = true;
    setStep(next);
    onStepChange?.(next, address);
  }
  async function request(address: string, source: string) {
    if (locked.current) return;
    setPendingAction(source);
    setRejection('');
    setStatus('');
    let sent = false;
    await runAction(async () => {
      const result = await onRequestCode(address);
      if (result === false) return;
      if (result && typeof result === 'object' && 'error' in result) {
        setRejection(result.error || m.authFailure);
        return;
      }
      const at = Date.now();
      const details = isSent(result) ? result : {};
      setNow(at);
      setExpiresAt(
        toTime(details.expiresAt) ??
          (codeLifetime === undefined ? undefined : at + codeLifetime * 1000),
      );
      setResendAt(toTime(details.resendAvailableAt) ?? at + Math.max(0, resendDelay) * 1000);
      sent = true;
    });
    if (!sent) {
      requestAnimationFrame(() => feedback.current?.focus());
      return;
    }
    if (source === 'resend') {
      setStatus(m.authCodeSent);
      if (code.current) code.current.value = '';
      requestAnimationFrame(() => code.current?.focus());
    } else {
      setStatus(m.authEmailCodeSent);
      go('verify', address);
    }
  }
  async function verify(value: string) {
    if (locked.current || expired) return;
    setPendingAction('submit');
    setRejection('');
    setStatus('');
    let accepted = false;
    await runAction(async () => {
      const result = await onVerifyCode({ email, code: value });
      if (result === false) return;
      if (result && typeof result === 'object') {
        setRejection(result.error || m.authFailure);
        return;
      }
      accepted = true;
    });
    if (accepted) go('complete', email);
    else requestAnimationFrame(() => code.current?.focus());
  }
  const remaining = expiresAt === undefined ? 0 : Math.max(0, expiresAt - now);
  const validFor =
    remaining >= 3_600_000
      ? date(expiresAt!, { hour: 'numeric', minute: '2-digit' })
      : `${Math.floor(remaining / 60_000)}:${String(Math.floor((remaining % 60_000) / 1000)).padStart(2, '0')}`;
  return (
    <form
      className="g-auth-form"
      aria-labelledby={`${id}-title`}
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        if (locked.current) return;
        const data = new FormData(event.currentTarget);
        if (step === 'request') {
          const address = String(data.get('email') ?? '').trim();
          setEmail(address);
          void request(address, 'submit');
        } else if (step === 'verify') void verify(String(data.get('code') ?? ''));
      }}
    >
      <Stack gap={5}>
        <Stack gap={2}>
          <Heading tabIndex={-1} level={headingLevel} size="section" id={`${id}-title`}>
            {step === 'verify' ? m.authVerifyEmail : (title ?? m.authEmailCode)}
          </Heading>
          {step !== 'complete' && (
            <Text tone="muted" size="small">
              {step === 'verify'
                ? m.authCodeSentTo.replace('{email}', email)
                : (description ?? m.authEmailCodeDescription)}
            </Text>
          )}
        </Stack>
        <div ref={feedback} tabIndex={-1} className="g-auth-feedback">
          {(error || failure) && <Alert tone="danger" title={error || failure} live />}
          {expired && !failure && <Alert tone="warning" title={m.authCodeExpired} live />}
          <div role="status">
            {step === 'complete' && !complete && !error ? (
              <Alert tone="success" title={successMessage ?? m.authSignedIn} />
            ) : (
              status && step !== 'complete' && !error && <Alert tone="success" title={status} />
            )}
          </div>
        </div>
        {step === 'complete' ? (
          complete
        ) : (
          <fieldset disabled={pending} className="g-auth-fields">
            <Stack gap={4}>
              {step === 'request' && socialProviders.length > 0 && (
                <>
                  <SocialButtons
                    providers={socialProviders}
                    pending={pending}
                    pendingAction={pendingAction}
                    onSignIn={(provider) => {
                      if (locked.current) return;
                      setPendingAction(`social:${provider.id}`);
                      setRejection('');
                      setStatus('');
                      let done = false;
                      void runAction(async () => {
                        const result = await provider.onSignIn();
                        if (result === false) return;
                        if (result && typeof result === 'object') {
                          setRejection(result.error || m.authFailure);
                          return;
                        }
                        done = true;
                      }).then(() => {
                        if (done) go('complete', '');
                        else requestAnimationFrame(() => feedback.current?.focus());
                      });
                    }}
                  />
                  <div className="g-auth-divider">
                    <Text size="small" tone="muted">
                      {m.authOrEmail}
                    </Text>
                  </div>
                </>
              )}
              {step === 'request' ? (
                <TextField
                  key="email"
                  label={m.authEmail}
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  defaultValue={email}
                  required
                />
              ) : (
                <VerificationCodeField
                  key="code"
                  ref={code}
                  name="code"
                  length={codeLength}
                  required
                  disabled={expired}
                  hint={
                    expiresAt !== undefined && !expired
                      ? m.authCodeValidFor.replace('{time}', validFor)
                      : undefined
                  }
                />
              )}
              <Button
                type="submit"
                disabled={expired}
                loading={pending && pendingAction === 'submit'}
              >
                {step === 'request' ? m.authSendCode : m.authVerify}
              </Button>
              {step === 'verify' && (
                <Button
                  variant={expired ? 'primary' : 'secondary'}
                  disabled={resendWait > 0}
                  loading={pending && pendingAction === 'resend'}
                  onClick={() => void request(email, 'resend')}
                >
                  {resendWait > 0
                    ? m.authResendIn.replace('{seconds}', String(resendWait))
                    : m.authResend}
                </Button>
              )}
              {(step === 'verify' || onBack) && (
                <div className="g-auth-links">
                  {step === 'verify' ? (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setRejection('');
                        setStatus('');
                        setExpiresAt(undefined);
                        go('request', email);
                      }}
                    >
                      {m.authChangeEmail}
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={onBack}>
                      {m.authBackLogin}
                    </Button>
                  )}
                </div>
              )}
            </Stack>
          </fieldset>
        )}
        {footer}
      </Stack>
    </form>
  );
}
