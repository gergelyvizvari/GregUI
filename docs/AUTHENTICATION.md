# Authentication patterns

The React package exports `AuthLayout`, `AuthForm`, `LoginForm`, `RegistrationForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `EmailVerificationForm`, `TwoFactorForm`, `PasswordField` and `VerificationCodeField`.

Open **Authentication** in the workbench for six screens, English/Hungarian copy, successful and rejected requests, and complete local demonstration flows. The selected theme from Theme studio applies to this page. Demo details stay in memory, no requests are made, and code `123456` completes verification.

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

`AuthForm` accepts `mode`: `login`, `register`, `forgot-password`, `reset-password`, `verify-email`, or `two-factor`. Its `onSubmit` receives a discriminated `AuthSubmission` containing only that screen's values. Named forms fix the mode for convenience. Resolve the callback after success or reject it on failure. For an expected failure such as a wrong password, return `{ error: 'Safe message' }` (shown as the error) or `false` (when you show the error through the `error` prop); the form then keeps its values and shows no success message. The success message is also hidden while `error` is set. Pending requests disable the form and reject duplicate submissions. Rejections produce a translated generic error rather than exposing exception details. An optional `error` prop can supply a safe application message. `successMessage` overrides the default confirmation.

Verification screens accept optional `onResend`; omit it for authenticator-based verification. The application implements delivery, expiry and retry/rate-limit policies. `codeLength` defaults to six and supports 4–12 numeric digits. Codes use one input with numeric keyboard hints, paste and one-time-code autofill. No auto-submit occurs.

Registration and reset forms compare password confirmation. Use `minPasswordLength` and `passwordHint` for application requirements; no fixed password policy is imposed by the package. Native required/email validation runs before submission. The application must independently validate every value and verify reset/verification tokens. Registration submits name, email and password; it does not implicitly accept terms or subscribe the user to marketing. Add application-specific links or content through `footer`.

Successful submissions clear the form. Changing mode remounts fields so credentials do not cross screens. Password fields initially conceal text and have translated visibility toggles; they preserve password-manager autocomplete. No credential values are logged, persisted or included in status messages by the package.

## Composition and localization

Wrap patterns in `ThemeProvider` and `LocaleProvider`, as with other gregUI components. `AuthLayout` gives a responsive card and optional brand/introduction/footer regions. All surfaces use package tokens; consumers need no CSS.

All default form copy comes from the `auth*` keys in `LocaleProvider.messages`, including validation, loading outcomes and navigation. The form title renders as `h2`; set `headingLevel` (2–6) when the form sits under another heading. Optional title/description/passwordHint/footer content belongs to the application and must be translated there. The workbench demonstrates complete English/Hungarian form messages. Native browser validation messages follow the browser language. RTL direction inherits from `LocaleProvider`; numeric codes retain LTR entry.

These are reusable UI patterns, not an authentication service or a certification. Provider-specific integration and real assistive-technology/device validation remain application work.

## Optional Google and Apple sign-in

`LoginForm` (or `AuthForm` in login mode) accepts independent `onGoogleSignIn` and `onAppleSignIn` callbacks. Omit a callback to hide that provider; omit both to keep the email-only layout with no separator.

```tsx
<LoginForm
  onSubmit={signInWithEmail}
  onGoogleSignIn={() => auth.signInWithProvider('google')}
  onAppleSignIn={() => auth.signInWithProvider('apple')}
/>
```

These callbacks receive no email/password values and bypass the email form's validation. Each is invoked directly from the user click so the application can open its provider popup synchronously. Return a promise to keep all login actions disabled until the operation completes; reject on failure to show translated retry feedback. The active provider gets the loading indicator. Application adapters own OAuth configuration, redirect/callback handling, cancellation and sessions; no provider SDK or external request is added by gregUI. Resolving a callback uses the same `successMessage` contract as email submission.

The labels and email separator use `authGoogle`, `authApple` and `authOrEmail` locale messages. The workbench's provider selector demonstrates both, either, or neither provider, with simulated success/error responses. These controls are only rendered in login mode.
