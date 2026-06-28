// =============================================================================
// mock-ws.ts — fakes the WebSocket SERVER so tests control the live feed
// =============================================================================
// page.routeWebSocket(url, handler) intercepts the browser's WebSocket
// connection. Unlike a real server, WE decide what messages come back. The
// handler receives a `ws` route object with:
//   • ws.send(data)        → push a server→client message
//   • ws.onMessage(cb)     → react to client→server messages (subscribe etc.)
//   • ws.onClose(cb)
//
// The clever bit: we capture the `ws` object into a closure and return helper
// functions (pushCommentary / pushMatchCreated) so a TEST can trigger a live
// event at the exact moment it wants — e.g. "now a goal happens" — and then
// assert the UI reacted. That's how we test real-time behavior deterministically.
//
// We mirror the real protocol (see realtime docs): welcome on connect,
// subscribed/unsubscribed acks, commentary + match_created broadcasts.
// =============================================================================

import type { Page } from '@playwright/test'
import type { Match, Commentary } from '@/lib/types'

export interface MockWsControls {
  pushCommentary: (event: Commentary) => Promise<void>
  pushMatchCreated: (match: Match) => Promise<void>
}

export async function setupMockWebSocket(page: Page): Promise<MockWsControls> {
  // Holds the live connection once the browser opens it.
  let serverWs: import('@playwright/test').WebSocketRoute | null = null

  // Lets the helpers wait until the connection actually exists before sending,
  // avoiding a race where the test pushes before the app has connected.
  let markConnected: () => void
  const connected = new Promise<void>((resolve) => { markConnected = resolve })

  await page.routeWebSocket(/\/ws(\?|$)/, (ws) => {
    serverWs = ws
    markConnected()

    // The server greets every new connection.
    ws.send(JSON.stringify({ type: 'welcome' }))

    // Echo back subscribe/unsubscribe acks, like the real server does.
    ws.onMessage((raw) => {
      let msg: { type?: string; matchId?: number }
      try {
        msg = JSON.parse(typeof raw === 'string' ? raw : raw.toString())
      } catch {
        return
      }
      if (msg.type === 'subscribe') {
        ws.send(JSON.stringify({ type: 'subscribed', matchId: msg.matchId }))
      } else if (msg.type === 'unsubscribe') {
        ws.send(JSON.stringify({ type: 'unsubscribed', matchId: msg.matchId }))
      }
    })
  })

  return {
    async pushCommentary(event) {
      await connected
      serverWs!.send(JSON.stringify({ type: 'commentary', data: event }))
    },
    async pushMatchCreated(match) {
      await connected
      serverWs!.send(JSON.stringify({ type: 'match_created', data: match }))
    },
  }
}
