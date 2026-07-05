'use client'

// =============================================================================
// DemoBanner.tsx — a slim, dismissible notice that this is a live demo
// =============================================================================
// Tells visitors two things: the scores/commentary are SIMULATED in real time
// (so it reads as an intentional live demo, not stale/fake data), and the
// free-tier backend may cold-start on first load (so a slow first load reads as
// "waking up", not "broken"). Dismissal persists in localStorage.
// =============================================================================

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const DISMISSED_KEY = 'sportz_demo_banner_dismissed_v1'

export function DemoBanner() {
  const [show, setShow] = useState(false)
  // Read the dismissed flag after mount (localStorage is client-only). Same
  // hydration-safe pattern as the theme toggle — false on the server and the
  // first client render, so no mismatch; the react-hooks rule is a false
  // positive here.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setShow(!localStorage.getItem(DISMISSED_KEY)), [])

  if (!show) return null

  return (
    <div className="flex items-center justify-center gap-2 border-b border-border bg-muted/40 px-4 py-2 text-center text-xs text-muted-foreground">
      <span aria-hidden>🔴</span>
      <p>
        <strong className="font-semibold text-foreground">Live demo</strong> — scores &amp;
        commentary are simulated in real time. The free-tier backend may take a few seconds to wake
        on first load.
      </p>
      <button
        onClick={() => {
          localStorage.setItem(DISMISSED_KEY, '1')
          setShow(false)
        }}
        aria-label="Dismiss demo notice"
        className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X size={14} />
      </button>
    </div>
  )
}
