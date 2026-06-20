import { cn } from '@/lib/utils'

interface LiveBadgeProps {
  className?: string
}

export function LiveBadge({ className }: LiveBadgeProps) {
  return (
    <span className={cn('flex items-center gap-1.5 text-sm font-medium text-foreground/80', className)}>
      {/* The red dot — CSS pulse animation via globals.css .ws-pulse is reused here
          as a smaller variant without the glow, just a simple filled dot */}
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
      </span>
      Live
    </span>
  )
}
