'use client'

// =============================================================================
// ErrorModal.tsx — connection lost / WS disconnected error state
//
// DECISION: One subtle shake animation, not a looping one.
// The prompt specifies "one shake, never loop". A looping shake would be
// anxiety-inducing over a long disconnection. One shake at mount says
// "attention required" without becoming background noise.
//
// DECISION: "Retry" calls onRetry, "Dismiss" hides the modal.
// Retry = tells the parent to reset the WS connection (or reload the page).
// Dismiss = user acknowledges the error but wants to continue watching
// (they may have spotty connectivity and are waiting for auto-reconnect).
// Both are valid user choices — we surface both.
//
// DECISION: Static red dot, no animation on error.
// Already established in StatusBadge — static red = calm urgency.
// A pulsing red dot in a modal on top of a pulsing red dot in the header
// would be visually chaotic.
// =============================================================================

import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff }   from 'lucide-react'
import { SportzButton } from '@/components/ui/sportz-button'

interface ErrorModalProps {
  isVisible: boolean
  onRetry:   () => void
  onDismiss: () => void
}

// One shake: start center, move right, left, right, left, back to center

export function ErrorModal({ isVisible, onRetry, onDismiss }: ErrorModalProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={onDismiss}
            aria-hidden
          />

          {/* Modal — shakes once on mount via animate prop */}
          <motion.div
            key="error-modal"
            role="alertdialog"
            aria-modal
            aria-label="Connection lost"
            aria-describedby="error-description"
            initial={{ opacity: 0, scale: 0.95, x: 0 }}
            animate={{ opacity: 1, scale: 1, x: [0, 8, -8, 6, -6, 0] }}
            exit={{    opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="flex w-full max-w-sm flex-col gap-5 rounded-2xl bg-card px-6 py-6 shadow-xl ring-1 ring-border">
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                <WifiOff size={22} strokeWidth={2} />
              </div>

              {/* Copy */}
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-semibold text-foreground">
                  Connection Lost
                </h3>
                <p id="error-description" className="text-sm text-muted-foreground">
                  The live data connection was interrupted. Attempting to reconnect automatically.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5">
                <SportzButton
                  variant="danger"
                  size="sm"
                  onClick={onRetry}
                  className="flex-1"
                  aria-label="Retry connection"
                >
                  Retry
                </SportzButton>
                <SportzButton
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="flex-1"
                  aria-label="Dismiss error"
                >
                  Dismiss
                </SportzButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
