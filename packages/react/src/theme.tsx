'use client';
import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import { createTheme, themeVariables, type Theme } from '@gregui/tokens';
import { useLocale } from '@gregui/localization';
const ThemeContext = createContext<Theme>(createTheme());
export function useTheme() {
  return useContext(ThemeContext);
}
function ThemeFrame({
  theme,
  children,
  portal = false,
}: {
  theme: Theme;
  children: ReactNode;
  portal?: boolean;
}) {
  const { locale, direction } = useLocale();
  return (
    <div
      className={`g-theme${portal ? ' g-portal' : ''}`}
      data-preset={theme.preset}
      data-mode={theme.mode}
      data-density={theme.density}
      data-motion={theme.motion}
      style={themeVariables(theme) as CSSProperties}
      lang={locale}
      dir={direction}
    >
      {children}
    </div>
  );
}
export function ThemeProvider({ theme, children }: { theme?: Theme; children: ReactNode }) {
  const inherited = useTheme();
  const value = theme ?? inherited;
  return (
    <ThemeContext.Provider value={value}>
      <ThemeFrame theme={value}>{children}</ThemeFrame>
    </ThemeContext.Provider>
  );
}
export function PortalFrame({ children }: { children: ReactNode }) {
  return (
    <ThemeFrame theme={useTheme()} portal>
      {children}
    </ThemeFrame>
  );
}
