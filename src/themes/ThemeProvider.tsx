// ============================================================
// ThemeProvider — ADO
// Adapted from CMOFMO ThemeProvider.tsx
// ADO only has one theme (HCI/ADO) — no brand switching needed.
// If multi-brand is added later, follow CMOFMO detectBrand() pattern.
// ============================================================

import React, { createContext, useContext, useEffect } from 'react';
import { adoTheme, type ThemeConfig } from './ado';

const ThemeContext = createContext<ThemeConfig>(adoTheme);

export function useTheme(): ThemeConfig {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = adoTheme;

  useEffect(() => {
    const root = document.documentElement;
    const c = theme.colors;

    // Map to CSS vars consumed by Tailwind brand-* classes (CMOFMO pattern)
    const props: Record<string, string> = {
      '--color-primary':       c.primary,
      '--color-primary-light': c.primaryLight,
      '--color-primary-dim':   c.primaryDim,
      '--color-accent':        c.accent,
      '--color-bg':            c.bg,
      '--color-bg-card':       c.bgCard,
      '--color-bg-elevated':   c.bgElevated,
      '--color-border':        c.border,
      '--color-text':          c.text,
      '--color-text-dim':      c.textDim,
      '--color-text-bright':   c.textBright,
    };

    for (const [key, value] of Object.entries(props)) {
      root.style.setProperty(key, value);
    }

    document.body.style.backgroundColor = c.bg;
    document.body.style.color = c.text;
    document.title = `${theme.shortName} · ${theme.name}`;
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}
