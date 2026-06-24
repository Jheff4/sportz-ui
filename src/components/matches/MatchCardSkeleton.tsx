// =============================================================================
// MatchCardSkeleton.tsx — loading placeholder matching the MatchCard layout
//
// DECISION: skeleton screens not spinners.
// Spinners show "something is happening but we don't know the shape".
// Skeletons show "here is the exact shape of what's loading". This eliminates
// layout shift when real data arrives — the skeleton occupies the same space
// as the real card, so the page doesn't jump.
//
// DECISION: This is a server component (no 'use client', no interactivity).
// Skeletons are purely visual — they have no state, no events, no effects.
// Rendering them on the server saves JavaScript for the client bundle.
//
// DECISION: The shimmer animation is pure CSS (bg-gradient + animate-pulse).
// Using Framer Motion here would add overhead to elements that are immediately
// discarded. Tailwind's animate-pulse is compositor-thread CSS — zero JS cost.
// =============================================================================

import { cn } from '@/lib/utils'

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-muted',
        className,
      )}
    />
  )
}

export function MatchCardSkeleton() {
  return (
    <div
      aria-hidden  // screen readers skip skeletons — real data will announce itself
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      {/* Row 1: sport badge + live indicator */}
      <div className="flex items-center justify-between">
        <Bone className="h-5 w-24 rounded-full" />
        <Bone className="h-5 w-12 rounded-full" />
      </div>

      {/* Row 2: home team + score */}
      <div className="flex items-center justify-between">
        <Bone className="h-5 w-32" />
        <Bone className="h-10 w-10 rounded-xl" />
      </div>

      {/* Row 3: away team + score */}
      <div className="flex items-center justify-between">
        <Bone className="h-5 w-28" />
        <Bone className="h-10 w-10 rounded-xl" />
      </div>

      {/* Divider */}
      <Bone className="h-px w-full rounded-none" />

      {/* Row 4: time + button */}
      <div className="flex items-center justify-between">
        <Bone className="h-4 w-20" />
        <Bone className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  )
}
