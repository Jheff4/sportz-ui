'use client'

// =============================================================================
// sportz-button.tsx — Sportz design system button
//
// DECISION: New file alongside shadcn's button.tsx, not a replacement.
// Shadcn's button wraps base-ui's ButtonPrimitive which handles accessibility
// (aria-*, role, keyboard) well. Our button wraps a native <button> via
// Framer Motion's motion.button — which also handles all native button
// semantics. We don't touch shadcn's button so we don't risk breaking any
// existing usage.
//
// DECISION: Framer Motion whileTap > CSS :active for tap feedback.
// CSS :active releases the moment the pointer lifts — imperceptible at 120fps.
// Framer Motion's spring keeps the scale depressed for the natural press
// duration, which registers as physical feedback to the user.
//
// DECISION: useReducedMotion disables ALL motion.
// "Prefers reduced motion" is an OS-level accessibility setting used by people
// with vestibular disorders. When active, animations can cause nausea.
// We respect it unconditionally — no opt-out.
// =============================================================================

import { forwardRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'watching' | 'danger'
export type ButtonSize    = 'sm' | 'md' | 'lg'

export interface SportzButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant
  size?:      ButtonSize
  isLoading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-brand-fg border-transparent hover:bg-brand-hover active:bg-brand-active font-semibold shadow-sm',
  secondary:
    'bg-transparent text-foreground border-border hover:bg-muted font-medium',
  ghost:
    'bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted font-medium',
  watching:
    'bg-watching text-watching-fg border-transparent hover:opacity-90 font-semibold shadow-sm',
  danger:
    'bg-red-500 text-white border-transparent hover:bg-red-600 font-semibold shadow-sm',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8  px-3  text-xs  rounded-lg  gap-1.5 min-w-[64px]',
  md: 'h-10 px-4  text-sm  rounded-xl  gap-2   min-w-[80px]',
  lg: 'h-12 px-6  text-base rounded-xl gap-2.5 min-w-[100px]',
}

export const SportzButton = forwardRef<HTMLButtonElement, SportzButtonProps>(
  function SportzButton(
    {
      variant   = 'secondary',
      size      = 'md',
      isLoading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const reduceMotion  = useReducedMotion()
    const isInteractive = !disabled && !isLoading

    return (
      <motion.button
        ref={ref}
        whileHover={isInteractive && !reduceMotion ? { y: -1 } : undefined}
        whileTap={isInteractive && !reduceMotion   ? { scale: 0.97 } : undefined}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        disabled={disabled ?? isLoading}
        className={cn(
          'inline-flex items-center justify-center border select-none',
          'transition-colors duration-150',
          // Accessibility — visible focus ring for keyboard users
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-40',
          variants[variant],
          sizes[size],
          className,
        )}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {isLoading ? (
          // Inline spinner — matches text size, no layout shift
          <span
            aria-hidden
            className="h-[1em] w-[1em] animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : (
          children
        )}
      </motion.button>
    )
  },
)
