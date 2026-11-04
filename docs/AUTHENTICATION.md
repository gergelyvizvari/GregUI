# Authentication patterns

The React package exports `AuthLayout`, `AuthForm`, `LoginForm`, `RegistrationForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `EmailVerificationForm`, `TwoFactorForm`, `EmailCodeForm`, `PasswordlessSignIn`, `PasswordField` and `VerificationCodeField`.

Open **Authentication** in the workbench for seven screens (including the passwordless email-code journey), English/Hungarian copy, successful and rejected requests, and complete local demonstration flows. The selected theme from Theme studio applies to this page. Demo details stay in memory, no requests are made, and code `123456` completes verification.

## Integration

```tsx
import { AuthLayout, LoginForm } from '@gregui/react';

<AuthLayout brand="Your application">
  <LoginForm
    onSubmit={async (values) => {
      if (values.mode !== 'login') return;
      await auth.signIn({
        email: values.email,
        password: values.password,
        remember: values.remember,
      });
      // Navigate only after your provider confirms authentication.
    }}
    onNavigate={(mode) => navigateToAuthScreen(mode)}
  />
</AuthLayout>;
```

`auth` and `navigateToAuthScreen` above are application-owned adapters. No authentication provider, account, cookie or session is created by gregUI. The remember flag is unchecked by default and is passed only to the login callback. Applications implement its persistence semantics.

`AuthForm` accepts `mode`: `login`, `register`, `forgot-password`, `reset-password`, `verify-email`, `two-factor`, or `email-code`. Passwordless sign-in is `email-code` (email only, submits `{ mode: 'email-code', email }`) followed by `verify-email` for the code; set `emailCode` on the login screen to show an "Email me a code instead" link to it. Its `onSubmit` receives a discriminated `AuthSubmission` containing only that screen's values. Named forms fix the mode for convenience. Resolve the callback after success or reject it on failure. For an expected failure such as a wrong password, return `{ error: 'Safe message' }` (shown as the error) or `false` (when you show the error through the `error` prop); the form then keeps its values and shows no success message. The success message is also hidden while `error` is set. Pending requests disable the form and reject duplicate submissions. Rejections produce a translated generic error rather than exposing exception details. An optional `error` prop can supply a safe application message. `successMessage` overrides the default confirmation.

Verification screens accept optional `onResend`; omit it for authenticator-based verification. The application implements delivery, expiry and retry/rate-limit policies. `codeLength` defaults to six and supports 4–12 numeric digits. Codes use one input with numeric keyboard hints, paste and one-time-code autofill. No auto-submit occurs.

Registration and reset forms compare password confirmation. Use `minPasswordLength` and `passwordHint` for application requirements; no fixed password policy is imposed by the package. Native required/email validation runs before submission. The application must independently validate every value and verify reset/verification tokens. Registration submits name, email and password; it does not implicitly accept terms or subscribe the user to marketing. Add application-specific links or content through `footer`.

Successful submissions clear the form. Changing mode remounts fields so credentials do not cross screens. Password fields initially conceal text and have translated visibility toggles; they preserve password-manager autocomplete. No credential values are logged, persisted or included in status messages by the package.

## Passwordless sign-in journey

`PasswordlessSignIn` is the whole email-code journey in one component: the email, then the emailed code, then success. Use it instead of wiring `EmailCodeForm` and `EmailVerificationForm` together yourself.

```tsx
<PasswordlessSignIn
  codeLifetime={600}
  resendDelay={30}
  onBack={() => navigate('/sign-in')}
  onRequestCode={async (email) => {
    const sent = await auth.sendCode(email);
    return { expiresAt: sent.expiresAt }; // optional; overrides codeLifetime
  }}
  onVerifyCode={async ({ email, code }) => {
    const ok = await auth.verifyCode(email, code);
    if (!ok) return { error: 'That code is not right.' };
    navigate('/home');
  }}
/>
```

- **Request.** `onRequestCode(email)` gets the trimmed address. Resolve to move to the code step; return `{ error }` (shown) or `false`, or reject (translated generic error), to stay on the email step with the address kept. It may resolve with `{ expiresAt, resendAvailableAt }` (dates or epoch milliseconds) when the server decides those times.
- **Entry.** The code step names the address the code went to, focuses the code field and offers "Use a different email", which returns to the first step with the address filled in. `codeLength` is 4–12 digits (default 6). No auto-submit.
- **Resend.** The resend button waits `resendDelay` seconds (default 30, `0` for none) and shows the countdown in its label. A resend clears the typed code, refocuses the field and confirms through the status region.
- **Expiry.** With `codeLifetime` (seconds) or `expiresAt`, the code field's hint shows the time left (`m:ss`, or the clock time when more than an hour remains). When it runs out a warning replaces the hint, the field and Verify are disabled, and Resend becomes the primary action. Without either, no expiry is shown; the server still decides.
- **Verify, error and retry.** `onVerifyCode({ email, code })` follows the same `AuthResult` contract as `AuthForm`: `{ error }` keeps the code in the field and refocuses it; a rejection shows the translated generic error.
- **Success.** The heading receives focus and `successMessage` (default "You are signed in.") is shown, or pass `complete` to render your own content (such as a Continue button). `onStepChange(step, email)` reports `request`, `verify` and `complete`.
- `socialProviders` adds provider buttons above the email on the first step; a successful provider sign-in also ends on the success step. `onBack` shows "Back to sign in" on the first step.

Applications own code generation, delivery, rate limits, expiry enforcement and sessions; the countdowns are presentation only and run from the browser clock.

## Composition and localization

Wrap patterns in `ThemeProvider` and `LocaleProvider`, as with other gregUI components. `AuthLayout` gives a responsive card and optional brand/introduction/footer regions. `AuthForm registration={false}` hides the login screen's "create account" link where accounts are made for people (staff tools, invitations). Set `page` when the layout is the whole screen (an app's sign-in): it fills the viewport and centres the introduction and form together instead of leaving the form at the top. All surfaces use package tokens; consumers need no CSS.

All default form copy comes from the `auth*` keys in `LocaleProvider.messages`, including validation, loading outcomes and navigation. The form title renders as `h2`; set `headingLevel` (2–6) when the form sits under another heading. Optional title/description/passwordHint/footer content belongs to the application and must be translated there. The workbench demonstrates complete English/Hungarian form messages. Native browser validation messages follow the browser language. RTL direction inherits from `LocaleProvider`; numeric codes retain LTR entry.

These are reusable UI patterns, not an authentication service or a certification. Provider-specific integration and real assistive-technology/device validation remain application work.

## Social and single sign-on providers

`LoginForm` (or `AuthForm` in login mode) accepts independent `onGoogleSignIn` and `onAppleSignIn` callbacks. Omit a callback to hide that provider; omit both to keep the email-only layout with no separator.

For any other provider, pass `socialProviders`: a list of `{ id, name, label?, icon?, onSignIn }`. Buttons read "Continue with {name}" (the `authContinueWith` message) unless `label` is given; `icon` takes the application's own provider mark. They follow Google and Apple when those callbacks are also set. `onSignIn` may return the same `AuthResult` as `onSubmit`, so `{ error: 'Sign-in was cancelled.' }` shows a safe message. `socialModes` chooses the screens that show the providers (default `['login']`); with `register` the separator reads "or sign up with email".

```tsx
<AuthForm
  mode={mode}
  onSubmit={submit}
  onGoogleSignIn={() => auth.signInWithProvider('google')}
  socialProviders={[
    {
      id: 'microsoft',
      name: 'Microsoft',
      icon: <MicrosoftMark />,
      onSignIn: () => auth.signInWithProvider('microsoft'),
    },
    { id: 'sso', name: 'SSO', label: 'Use company sign-in', onSignIn: () => auth.startSso() },
  ]}
  socialModes={['login', 'register']}
/>
```

```tsx
<LoginForm
  onSubmit={signInWithEmail}
  onGoogleSignIn={() => auth.signInWithProvider('google')}
  onAppleSignIn={() => auth.signInWithProvider('apple')}
/>
```

These callbacks receive no email/password values and bypass the email form's validation. Each is invoked directly from the user click so the application can open its provider popup synchronously. Return a promise to keep all login actions disabled until the operation completes; reject on failure to show translated retry feedback. The active provider gets the loading indicator. Application adapters own OAuth configuration, redirect/callback handling, cancellation and sessions; no provider SDK or external request is added by gregUI. Resolving a callback uses the same `successMessage` contract as email submission.

The labels and email separator use `authGoogle`, `authApple` and `authOrEmail` locale messages. The workbench's provider selector demonstrates both, either, or neither provider, with simulated success/error responses. These controls are rendered in login mode unless `socialModes` lists other screens.
