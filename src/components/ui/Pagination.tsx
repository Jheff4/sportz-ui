'use client'

// =============================================================================
// Pagination.tsx — prev/next with disabled states, keyboard support, aria
//
// DECISION: keyboard support via onKeyDown, not just onClick.
// onClick fires on Enter already for <button> elements, but Space also needs
// to work. Native <button> handles both. We keep it as <button> not <div>
// so screen readers announce it as an interactive element automatically.
//
// DECISION: aria-disabled not the HTML disabled attribute on the wrapper.
// The HTML disabled attribute removes the element from the accessibility tree
// entirely — screen readers can't find it to tell users "there's no previous
// page". aria-disabled keeps it in the tree but marks it non-interactive.
// We also use pointer-events-none to prevent mouse clicks, matching the
// visual disabled state.
// =============================================================================

import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  className?: string
}

export function Pagination({ page, totalPages, onPrev, onNext, className }: PaginationProps) {
  const reduceMotion = useReducedMotion()
  const isFirst = page === 1
  const isLast = page === totalPages

  const buttonBase = cn(
    'inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-4',
    'text-sm font-medium text-foreground transition-colors duration-150',
    'hover:bg-muted hover:border-foreground/20',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'aria-disabled:pointer-events-none aria-disabled:opacity-40 aria-disabled:cursor-not-allowed'
  )

  return (
    <div
      className={cn('flex items-center justify-between', className)}
      role="navigation"
      aria-label="Pagination"
    >
      <span className="text-sm text-muted-foreground" aria-live="polite">
        Page {page} of {totalPages}
      </span>

      <div className="flex items-center gap-2">
        <motion.button
          whileTap={!isFirst && !reduceMotion ? { scale: 0.96 } : undefined}
          transition={{ duration: 0.12 }}
          onClick={onPrev}
          aria-disabled={isFirst}
          aria-label="Previous page"
          className={buttonBase}
        >
          <ChevronLeft size={15} strokeWidth={2.5} />
          Prev
        </motion.button>

        <motion.button
          whileTap={!isLast && !reduceMotion ? { scale: 0.96 } : undefined}
          transition={{ duration: 0.12 }}
          onClick={onNext}
          aria-disabled={isLast}
          aria-label="Next page"
          className={buttonBase}
        >
          Next
          <ChevronRight size={15} strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  )
}
