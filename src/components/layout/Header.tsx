'use client'

// =============================================================================
// Header.tsx — sticky top bar: logo, API count, WS status, dark mode toggle
//
// DECISION: sticky top-0 z-40, not fixed.
// Fixed positioning pulls the element out of document flow, which means the
// main content needs a manual top-padding to avoid being hidden behind it.
// Sticky participates in flow normally — the browser handles the offset for us.
//
// DECISION: AnimatePresence on the status pill (key=wsStatus).
// When the connection state changes (connected → reconnecting → connected),
// the old pill fades out and the new one fades in rather than the text
// snapping. This communicates "the state changed" rather than just showing
// the new value — important context for the user.
//
// DECISION: matchCount prop optional — Header doesn't fetch its own data.
// The Header is a pure display component. It receives counts from the parent
// (page.tsx which has access to the query). This keeps Header stateless and
// trivially testable.
// =============================================================================

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { WsStatus } from '@/lib/types'

interface HeaderProps {
  wsStatus: WsStatus
  matchCount?: number
}

export function Header({ wsStatus, matchCount }: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const reduceMotion = useReducedMotion()
  // Hydration guard. The toggle's icon depends on the theme, which lives in
  // localStorage (client-only). next-themes resolves `resolvedTheme`
  // SYNCHRONOUSLY on the first client render, so gating on it would still
  // mismatch the server (which has no theme) → hydration error. `mounted` is
  // false on the server AND the first client render, flipping only AFTER
  // hydration — so the toggle renders identically (absent) on both passes.
  // This is the canonical next-themes pattern; the react-hooks rule flags the
  // setState-in-effect, but here it's a deliberate, correct false positive.
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-40 w-full bg-brand shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* ── Logo ──────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5">
          <svg
            width="32"
            height="32"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
            className="shrink-0"
          >
            <rect width="64" height="64" rx="14" fill="#0A0A0A" />
            <circle cx="32" cy="32" r="9" fill="#F4C542" />
          </svg>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-brand-fg leading-none">
              Sportz
            </h1>
            <p className="mt-0.5 text-[11px] font-medium text-brand-fg/80">
              Real-time match data demo
            </p>
          </div>
        </div>

        {/* ── Right controls ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* API count — only visible when data is loaded and non-zero */}
          {typeof matchCount === 'number' && matchCount > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden rounded-lg bg-brand-fg/10 px-2.5 py-1 text-xs font-bold text-brand-fg sm:block"
              aria-label={`${matchCount} matches available`}
            >
              {matchCount} {matchCount === 1 ? 'match' : 'matches'}
            </motion.span>
          )}

          {/* WS status — AnimatePresence gives a crossfade on state change */}
          <AnimatePresence mode="wait">
            <motion.div
              key={wsStatus}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
            >
              <StatusBadge status={wsStatus} />
            </motion.div>
          </AnimatePresence>

          {/* Dark mode toggle — hidden until mounted, to avoid a hydration flash */}
          {mounted && (
            <motion.button
              whileTap={!reduceMotion ? { scale: 0.92 } : undefined}
              transition={{ duration: 0.12 }}
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-fg/10 text-brand-fg transition-colors hover:bg-brand-fg/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-fg/50"
            >
              {/* Icon crossfade on theme change */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={resolvedTheme}
                  initial={!reduceMotion ? { opacity: 0, rotate: -30 } : false}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={!reduceMotion ? { opacity: 0, rotate: 30 } : undefined}
                  transition={{ duration: 0.15 }}
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun size={16} strokeWidth={2.5} />
                  ) : (
                    <Moon size={16} strokeWidth={2.5} />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  )
}
