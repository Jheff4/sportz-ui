import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider }    from '@/providers/ThemeProvider'
import { QueryProvider }    from '@/providers/QueryProvider'
import { PostHogProvider }  from '@/providers/PostHogProvider'
import { NewRelicProvider } from '@/providers/NewRelicProvider'
import './globals.css'

export const metadata: Metadata = {
  title:       'Spotrz — Real-Time Match Broadcast',
  description: 'Live scores, ball-by-ball commentary, and real-time match events delivered via WebSocket.',
}

// =============================================================================
// Provider nesting order — WHY this specific order matters:
//
//  ThemeProvider    (outermost — everything needs theme context)
//  └─ QueryProvider   (data layer — components need this to call useQuery)
//     └─ PostHogProvider (analytics — wraps content so it can track renders)
//        └─ NewRelicProvider (perf monitoring — innermost, no children deps)
//           └─ {children}
//
// Rule: providers that OTHER providers depend on go further out.
// QueryProvider doesn't depend on PostHog. PostHog doesn't depend on New Relic.
// None of them depend on each other — but theme must wrap everything so dark
// mode context is available to all child providers and components.
// =============================================================================

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <QueryProvider>
            <PostHogProvider>
              <NewRelicProvider>
                {children}
              </NewRelicProvider>
            </PostHogProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
