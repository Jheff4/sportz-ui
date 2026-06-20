'use client'

// =============================================================================
// Header.tsx — yellow top bar with logo, subtitle, WS status, theme toggle
// =============================================================================

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { WsStatus } from '@/lib/types'

interface HeaderProps {
  wsStatus: WsStatus
}

const statusConfig = {
  connected:    { dot: 'bg-connected ws-pulse', label: 'LIVE CONNECTED',  border: 'border-connected/40'  },
  connecting:   { dot: 'bg-yellow-400 animate-pulse',  label: 'CONNECTING…',      border: 'border-yellow-400/40' },
  reconnecting: { dot: 'bg-orange-400 animate-pulse',  label: 'RECONNECTING…',    border: 'border-orange-400/40' },
  disconnected: { dot: 'bg-red-500',                   label: 'DISCONNECTED',      border: 'border-red-400/40'    },
}

export function Header({ wsStatus }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  // next-themes hydration guard — avoid mismatched server/client render
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { dot, label, border } = statusConfig[wsStatus]

  return (
    <header className="bg-brand px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* ── Logo + tagline ── */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-fg">Spotrz</h1>
          <p className="text-xs font-medium text-brand-fg/60">Real-time match data demo</p>
        </div>

        {/* ── Right side: WS status + theme toggle ── */}
        <div className="flex items-center gap-3">
          {/* WebSocket status pill */}
          <AnimatePresence mode="wait">
            <motion.div
              key={wsStatus}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1   }}
              exit={{    opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-2 rounded-full border bg-white/20 px-3 py-1.5 backdrop-blur-sm ${border}`}
              role="status"
              aria-label={`WebSocket status: ${label}`}
            >
              <span className={`h-2 w-2 rounded-full ${dot}`} />
              <span className="text-xs font-bold tracking-wide text-brand-fg">
                {label}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Dark mode toggle — hidden until mounted to avoid hydration flash */}
          {mounted && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-fg/10 text-brand-fg transition-colors hover:bg-brand-fg/20"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{    rotate: 90,  opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  )
}
