'use client'

// =============================================================================
// SuccessModal.tsx — transient success feedback (auto-dismisses at 2500ms)
//
// DECISION: Auto-dismiss not a close button.
// Success feedback should be non-blocking. A close button implies the user
// needs to take action — they don't. The modal dismisses itself and gets
// out of the way. 2500ms is the standard in broadcast UI (long enough to
// read, short enough not to feel sticky).
//
// DECISION: backdrop-blur-sm for depth — not a full dark overlay.
// A full dark overlay (bg-black/50) covers the match grid and commentary,
// which is disorienting during a live match. A light blur preserves context
// while clearly communicating "something just happened here".
//
// DECISION: scale 0.95 → 1 entry animation (not slide from top/bottom).
// Slide animations have directionality — they imply the modal "came from"
// somewhere. A scale animation has no direction — it just "appears". For a
// success message that's incidental to the current activity, directional
// motion would be distracting.
// =============================================================================

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

interface SuccessModalProps {
  message: string
  isVisible: boolean
  onDismiss: () => void
}

const AUTO_DISMISS_MS = 2500

export function SuccessModal({ message, isVisible, onDismiss }: SuccessModalProps) {
  useEffect(() => {
    if (!isVisible) return
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [isVisible, onDismiss])

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 backdrop-blur-sm"
            aria-hidden
          />

          {/* Modal */}
          <motion.div
            key="modal"
            role="status"
            aria-live="assertive"
            aria-label={message}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-card px-8 py-6 shadow-xl ring-1 ring-border max-w-xs w-full pointer-events-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                <CheckCircle size={24} strokeWidth={2} />
              </div>
              <p className="text-center text-sm font-medium text-foreground">{message}</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
