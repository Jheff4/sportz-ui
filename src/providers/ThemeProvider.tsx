'use client'

// =============================================================================
// ThemeProvider.tsx
// =============================================================================
// Wraps the app with next-themes so every component can read and toggle the
// current theme. `attribute="class"` means next-themes adds/removes the "dark"
// class on <html>, which matches our @custom-variant dark CSS rule.
//
// `enableSystem` lets it default to the OS preference on first visit.
// `disableTransitionOnChange` is intentionally FALSE so our CSS transitions
// (300ms background, 200ms color in globals.css) run smoothly on toggle.
// =============================================================================

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  )
}
