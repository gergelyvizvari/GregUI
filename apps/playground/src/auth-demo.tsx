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
  ThemeArtwork,
  PageHeader,
  Alert,
  type AuthMode,
  type Theme,
} from '@gregui/react';
const flows: { value: AuthMode; label: string }[] = [
  { value: 'login', label: 'Sign in' },
  { value: 'register', label: 'Registration' },
  { value: 'forgot-password', label: 'Forgot password' },
  { value: 'reset-password', label: 'Reset password' },
  { value: 'verify-email', label: 'Email verification' },
  { value: 'two-factor', label: 'Two-step verification' },
];
const hungarian = {
  required: 'kötelező',
  loading: 'Betöltés',
  authGoogle: 'Folytatás Google-fiókkal',
  authApple: 'Folytatás Apple-fiókkal',
  authOrEmail: 'vagy bejelentkezés e-maillel',
  authShowPassword: 'Jelszó megjelenítése',
  authShow: 'Mutat',
  authHide: 'Elrejt',
  authCode: 'Ellenőrző kód',
  authLogin: 'Bejelentkezés',
  authRegister: 'Fiók létrehozása',
  authForgot: 'Elfelejtett jelszó?',
  authReset: 'Új jelszó megadása',
  authVerifyEmail: 'E-mail-cím megerősítése',
  authTwoFactor: 'Kétlépcsős azonosítás',
  authLoginDescription: 'Üdv újra! Jelentkezz be a folytatáshoz.',
  authRegisterDescription: 'Hozd létre a fiókodat a kezdéshez.',
  authForgotDescription: 'Add meg az e-mail-címedet a visszaállító hivatkozáshoz.',
  authResetDescription: 'Válassz új jelszót a fiókodhoz.',
  authVerifyDescription: 'Add meg az e-mailben kapott kódot.',
  authTwoFactorDescription: 'Add meg a hitelesítő alkalmazás kódját.',
  authVerify: 'Kód ellenőrzése',
  authSendLink: 'Hivatkozás kérése',
  authFailure: 'Nem sikerült. Próbáld újra.',
  authMismatch: 'A két jelszó nem egyezik.',
  authResetSent: 'Ha létezik ilyen fiók, elküldjük a visszaállító hivatkozást.',
  authComplete: 'Sikeresen befejezted.',
  authName: 'Teljes név',
  authEmail: 'E-mail-cím',
  authPassword: 'Jelszó',
  authConfirmPassword: 'Jelszó megerősítése',
  authRemember: 'Maradjak bejelentkezve',
  authCodeSent: 'Új kódot kértél.',
  authResend: 'Kód újraküldése',
  authBackLogin: 'Vissza a bejelentkezéshez',
};
export function AuthDemo({
  theme,
  onPresetChange,
}: {
  theme: Theme;
  onPresetChange: (preset: Preset) => void;
}) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [locale, setLocale] = useState('en');
  const [providers, setProviders] = useState('both');
  const [fail, setFail] = useState(false);
  const [complete, setComplete] = useState(false);
  const [resetReady, setResetReady] = useState(false);
  const revision = useRef(0);
  function navigate(next: AuthMode) {
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
  return (
    <Stack gap={5}>
      <PageHeader
        eyebrow="PATTERN LIBRARY / 01"
        title="Authentication patterns"
        description="A welcoming first impression. Six connected flows, one visual language."
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
            <Select {...p} value={mode} onChange={(e) => navigate(e.target.value as AuthMode)}>
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
              <option value="none">Email only</option>
            </Select>
          )}
        </Field>
      </Grid>
      <LocaleProvider
        locale={locale === 'hu' ? 'hu-HU' : 'en-GB'}
        messages={locale === 'hu' ? hungarian : {}}
      >
        <ThemeProvider theme={theme}>
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
            ) : (
              <AuthForm
                key={locale}
                mode={mode}
                minPasswordLength={8}
                passwordHint={
                  mode === 'register' || mode === 'reset-password'
                    ? locale === 'hu'
                      ? 'A demóhoz legalább 8 karakter.'
                      : 'At least 8 characters for this demo.'
                    : undefined
                }
                onGoogleSignIn={
                  providers === 'both' || providers === 'google' ? socialSignIn : undefined
                }
                onAppleSignIn={
                  providers === 'both' || providers === 'apple' ? socialSignIn : undefined
                }
                onNavigate={navigate}
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
