import { useRef, useState } from 'react';
import { presets, type Preset } from '@gregui/tokens';
import {
  AuthForm,
  AuthLayout,
  Badge,
  Button,
  Field,
  Grid,
  Heading,
  LocaleProvider,
  Select,
  Stack,
  Text,
  ThemeProvider,
  type ThemeColorScheme,
  ThemeArtwork,
  PageHeader,
  Alert,
  PasswordlessSignIn,
  type AuthMode,
  type AuthSocialProvider,
  type Theme,
} from '@gregui/react';
type Flow = AuthMode | 'passwordless';
const flows: { value: Flow; label: string }[] = [
  { value: 'login', label: 'Sign in' },
  { value: 'register', label: 'Registration' },
  { value: 'forgot-password', label: 'Forgot password' },
  { value: 'reset-password', label: 'Reset password' },
  { value: 'verify-email', label: 'Email verification' },
  { value: 'two-factor', label: 'Two-step verification' },
  { value: 'passwordless', label: 'Passwordless email code' },
];
export function AuthDemo({
  theme,
  colorScheme,
  onPresetChange,
}: {
  theme: Theme;
  colorScheme: ThemeColorScheme;
  onPresetChange: (preset: Preset) => void;
}) {
  const [mode, setMode] = useState<Flow>('login');
  const [locale, setLocale] = useState('en');
  const [providers, setProviders] = useState('both');
  const [fail, setFail] = useState(false);
  const [complete, setComplete] = useState(false);
  const [resetReady, setResetReady] = useState(false);
  const revision = useRef(0);
  function navigate(next: Flow) {
    revision.current += 1;
    setMode(next);
    setComplete(false);
    setResetReady(false);
  }
  async function socialSignIn() {
    const request = revision.current;
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (request !== revision.current) return;
    if (fail) throw new Error('Demo failure');
    setComplete(true);
  }
  const extraProviders: AuthSocialProvider[] =
    providers === 'more' ? [{ id: 'microsoft', name: 'Microsoft', onSignIn: socialSignIn }] : [];
  const google = providers === 'both' || providers === 'google' || providers === 'more';
  const apple = providers === 'both' || providers === 'apple' || providers === 'more';
  return (
    <Stack gap={5}>
      <PageHeader
        eyebrow="PATTERN LIBRARY / 01"
        title="Authentication patterns"
        description="A welcoming first impression. Seven connected flows, one visual language."
        actions={
          <Field label="Preview style">
            {(p) => (
              <Select
                {...p}
                value={theme.preset}
                onChange={(e) => onPresetChange(e.target.value as Preset)}
              >
                {presets.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        }
      />
      <Text size="small" tone="muted">
        Local demo · Use fictional details. Nothing is sent or stored. Code: 123456. Provider
        buttons simulate sign-in.
      </Text>
      <Grid columns={4}>
        <Field label="Authentication flow">
          {(p) => (
            <Select {...p} value={mode} onChange={(e) => navigate(e.target.value as Flow)}>
              {flows.map((flow) => (
                <option key={flow.value} value={flow.value}>
                  {flow.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Form language">
          {(p) => (
            <Select {...p} value={locale} onChange={(e) => setLocale(e.target.value)}>
              <option value="en">English</option>
              <option value="hu">Magyar</option>
            </Select>
          )}
        </Field>
        <Field label="Demo response">
          {(p) => (
            <Select
              {...p}
              value={fail ? 'error' : 'success'}
              onChange={(e) => setFail(e.target.value === 'error')}
            >
              <option value="success">Success</option>
              <option value="error">Server error</option>
            </Select>
          )}
        </Field>
        <Field label="Social sign-in providers">
          {(p) => (
            <Select {...p} value={providers} onChange={(e) => setProviders(e.target.value)}>
              <option value="both">Google and Apple</option>
              <option value="google">Google only</option>
              <option value="apple">Apple only</option>
              <option value="more">Google, Apple and Microsoft</option>
              <option value="none">Email only</option>
            </Select>
          )}
        </Field>
      </Grid>
      <LocaleProvider locale={locale === 'hu' ? 'hu-HU' : 'en-GB'}>
        <ThemeProvider theme={theme} colorScheme={colorScheme}>
          <AuthLayout
            brand={<Badge tone="primary">STUDIO NORTH</Badge>}
            introduction={
              <Stack gap={5}>
                <ThemeArtwork compact />
                <Heading level={2} size="hero">
                  {locale === 'hu' ? 'Egy hely az ötleteidnek.' : 'A place for your next idea.'}
                </Heading>
                <Text tone="muted">
                  {locale === 'hu'
                    ? 'Kész felületek, a saját alkalmazásodhoz.'
                    : 'Ready-made flows, shaped for your application.'}
                </Text>
              </Stack>
            }
          >
            {complete ? (
              <Stack>
                <Alert
                  tone="success"
                  title={locale === 'hu' ? 'A demófolyamat sikeres.' : 'Demo flow complete.'}
                />
                <Button onClick={() => navigate('login')}>
                  {locale === 'hu' ? 'Újrakezdés' : 'Start again'}
                </Button>
              </Stack>
            ) : mode === 'passwordless' ? (
              <PasswordlessSignIn
                key={locale}
                codeLifetime={600}
                resendDelay={20}
                onBack={() => navigate('login')}
                socialProviders={[
                  ...(google ? [{ id: 'google', name: 'Google', onSignIn: socialSignIn }] : []),
                  ...(apple ? [{ id: 'apple', name: 'Apple', onSignIn: socialSignIn }] : []),
                  ...extraProviders,
                ]}
                onRequestCode={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 600));
                  if (fail) throw new Error('Demo failure');
                }}
                onVerifyCode={async ({ code }) => {
                  await new Promise((resolve) => setTimeout(resolve, 600));
                  if (fail) throw new Error('Demo failure');
                  if (code !== '123456')
                    return {
                      error:
                        locale === 'hu'
                          ? 'Ez a kód nem jó. A demóban: 123456.'
                          : 'That code is not right. The demo code is 123456.',
                    };
                }}
              />
            ) : (
              <AuthForm
                key={locale}
                mode={mode as AuthMode}
                minPasswordLength={8}
                passwordHint={
                  mode === 'register' || mode === 'reset-password'
                    ? locale === 'hu'
                      ? 'A demóhoz legalább 8 karakter.'
                      : 'At least 8 characters for this demo.'
                    : undefined
                }
                emailCode
                onGoogleSignIn={google ? socialSignIn : undefined}
                onAppleSignIn={apple ? socialSignIn : undefined}
                socialProviders={extraProviders}
                socialModes={['login', 'register']}
                onNavigate={(next) => navigate(next === 'email-code' ? 'passwordless' : next)}
                onResend={
                  mode === 'verify-email'
                    ? async () => {
                        await new Promise((resolve) => setTimeout(resolve, 600));
                        if (fail) throw new Error('Demo failure');
                      }
                    : undefined
                }
                onSubmit={async (values) => {
                  const request = revision.current;
                  await new Promise((resolve) => setTimeout(resolve, 600));
                  if (request !== revision.current) return;
                  if (fail || ('code' in values && values.code !== '123456'))
                    throw new Error('Demo failure');
                  if (values.mode === 'login') navigate('two-factor');
                  else if (values.mode === 'register') navigate('verify-email');
                  else if (values.mode === 'forgot-password') setResetReady(true);
                  else setComplete(true);
                }}
                footer={
                  resetReady ? (
                    <Button variant="secondary" onClick={() => navigate('reset-password')}>
                      {locale === 'hu'
                        ? 'Demó visszaállító link megnyitása'
                        : 'Open demo reset link'}
                    </Button>
                  ) : undefined
                }
              />
            )}
          </AuthLayout>
        </ThemeProvider>
      </LocaleProvider>
    </Stack>
  );
}
