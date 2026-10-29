'use client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
export const english = {
  clearFiles: 'Clear selected files',
  selection: 'Selection',
  selectRow: 'Select row',
  noResults: 'No results found.',
  retry: 'Try again',
  confirmError: 'Could not complete the action. Please try again.',
  search: 'Search',
  clearFilters: 'Clear filters',
  startDate: 'Start date',
  endDate: 'End date',
  dateRangeError: 'End date must be on or after the start date.',
  chooseDate: 'Choose a date',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  dateBeforeMin: 'Too early to choose',
  dateAfterMax: 'Too late to choose',
  repeatsYearly: 'Every year',
  agendaEmpty: 'Nothing coming up in this period.',
  dropFiles: 'Choose files or drop them here.',
  fileError: 'Check the file type, size and number of files.',
  notifications: 'Notifications',
  unreadOnly: 'Unread only',
  unread: 'Unread',
  markRead: 'Mark as read',
  saved: 'Saved successfully.',
  saveChanges: 'Save changes',
  sessions: 'Active sessions',
  currentSession: 'Current session',
  revoke: 'Sign out session',
  inviteEmail: 'Invitation email',
  invite: 'Send invitation',
  invitationSent: 'Invitation sent.',
  role: 'Role',
  necessaryOnly: 'Necessary only',
  selectAll: 'Select all',
  savePreferences: 'Save preferences',
  recommended: 'Recommended',
  currentPlan: 'Current plan',
  choosePlan: 'Choose plan',
  comment: 'Comment',
  postComment: 'Post comment',
  approve: 'Approve',
  reject: 'Reject',
  decisionSaved: 'Decision recorded.',
  history: 'History',
  pagination: 'Pagination',
  previous: 'Previous',
  next: 'Next',
  page: 'Page',
  steps: 'Progress',
  completed: 'Completed',
  back: 'Back',
  continue: 'Continue',
  finish: 'Finish',
  workflowError: 'Could not continue. Please try again.',
  authGoogle: 'Continue with Google',
  authApple: 'Continue with Apple',
  authOrEmail: 'or sign in with email',
  authShowPassword: 'Show password',
  authShow: 'Show',
  authHide: 'Hide',
  authCode: 'Verification code',
  authLogin: 'Sign in',
  authRegister: 'Create account',
  authForgot: 'Forgot password?',
  authReset: 'Set new password',
  authVerifyEmail: 'Verify your email',
  authTwoFactor: 'Two-step verification',
  authLoginDescription: 'Welcome back. Sign in to continue.',
  authRegisterDescription: 'Create your account to get started.',
  authForgotDescription: 'Enter your email to request a password reset link.',
  authResetDescription: 'Choose a new password for your account.',
  authVerifyDescription: 'Enter the code sent to your email.',
  authTwoFactorDescription: 'Enter the code from your authenticator app.',
  authVerify: 'Verify code',
  authSendLink: 'Send reset link',
  authFailure: 'Something went wrong. Please try again.',
  authMismatch: 'The passwords do not match.',
  authResetSent: 'If an account matches this email, a reset link will be sent.',
  authComplete: 'Completed successfully.',
  authName: 'Full name',
  authEmail: 'Email address',
  authPassword: 'Password',
  authConfirmPassword: 'Confirm password',
  authRemember: 'Keep me signed in',
  authCodeSent: 'A new code has been requested.',
  authResend: 'Resend code',
  authBackLogin: 'Back to sign in',
  close: 'Close',
  navigation: 'Navigation',
  openNavigation: 'Open navigation',
  skipToContent: 'Skip to content',
  loading: 'Loading',
  dismiss: 'Dismiss',
  required: 'required',
};
export type Messages = typeof english;
interface LocaleValue {
  locale: string;
  direction: 'ltr' | 'rtl';
  timeZone: string;
  messages: Messages;
}
const LocaleContext = createContext<LocaleValue>({
  locale: 'en-GB',
  direction: 'ltr',
  timeZone: 'UTC',
  messages: english,
});
const noOverrides: Partial<Messages> = {};
export function LocaleProvider({
  locale = 'en-GB',
  direction = 'ltr',
  timeZone = 'UTC',
  messages = noOverrides,
  children,
}: {
  locale?: string;
  direction?: 'ltr' | 'rtl';
  timeZone?: string;
  messages?: Partial<Messages>;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ locale, direction, timeZone, messages: { ...english, ...messages } }),
    [locale, direction, timeZone, messages],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
export function useLocale() {
  return useContext(LocaleContext);
}
export function useFormat() {
  const { locale, timeZone } = useLocale();
  return useMemo(
    () => ({
      number: (value: number, options?: Intl.NumberFormatOptions) =>
        new Intl.NumberFormat(locale, options).format(value),
      date: (value: Date | number, options?: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat(locale, { timeZone, ...options }).format(value),
      plural: (value: number) => new Intl.PluralRules(locale).select(value),
    }),
    [locale, timeZone],
  );
}
