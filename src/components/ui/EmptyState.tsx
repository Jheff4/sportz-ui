'use client'

// =============================================================================
// EmptyState.tsx — shown when the matches list is empty
//
// DECISION: Icon illustration not a heavy SVG graphic.
// A large SVG illustration adds ~10KB+ and is hard to theme for dark mode.
// A single emoji + composed Lucide icons creates the same emotional meaning
// with zero bundle cost and automatic dark mode support.
//
// DECISION: Refresh button calls window.location.reload() not the React Query
// refetch. Why: if matches are empty, the issue may be that the backend isn't
// running. React Query's refetch would silently fail again without feedback.
// A full page reload gives a fresh attempt and updates the WS connection too.
// =============================================================================

import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { SportzButton } from '@/components/ui/sportz-button'

interface EmptyStateProps {
  title?:       string
  description?: string
  onRefresh?:   () => void
}

export function EmptyState({
  title       = 'No Live Matches',
  description = 'There are no matches available right now. Check back soon.',
  onRefresh,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="col-span-2 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center"
      role="status"
      aria-label={title}
    >
      {/* Stadium icon — composed from emoji + subtitle */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-3xl">
        🏟️
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      </div>

      <SportzButton
        variant="secondary"
        size="sm"
        onClick={onRefresh ?? (() => window.location.reload())}
        aria-label="Refresh page to check for new matches"
      >
        <RefreshCw size={14} />
        Refresh
      </SportzButton>
    </motion.div>
  )
}
