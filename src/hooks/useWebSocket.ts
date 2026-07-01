'use client'

// =============================================================================
// useWebSocket.ts — WebSocket connection manager
// =============================================================================
// Handles: connect, reconnect with exponential backoff, subscribe/unsubscribe
// to match rooms, and parsing incoming messages.
//
// Reconnection strategy:
//   attempt 1 → wait 2s
//   attempt 2 → wait 4s
//   attempt 3 → wait 8s  ... capped at WS_RECONNECT_MAX_DELAY (30s)
//   after WS_MAX_RETRIES  → gives up, status = 'disconnected'
//
// A ref holds the WebSocket instance so reconnect logic can always access the
// latest socket without stale closure issues.
// =============================================================================

import { useEffect, useRef, useCallback, useState } from 'react'
import {
  WS_URL,
  WS_RECONNECT_DELAY_MS,
  WS_RECONNECT_MAX_DELAY,
  WS_MAX_RETRIES,
} from '@/lib/constants'
import type { WsIncomingMessage, WsStatus, Match, Commentary } from '@/lib/types'

interface UseWebSocketOptions {
  onMatchCreated?: (match: Match) => void
  onCommentary?: (event: Commentary) => void
  onScoreUpdate?: (match: Match) => void
  // Fired when the socket reopens after a drop (not on the initial connect).
  onReconnected?: () => void
}

interface UseWebSocketReturn {
  status: WsStatus
  subscribe: (matchId: number) => void
  unsubscribe: (matchId: number) => void
}

export function useWebSocket({
  onMatchCreated,
  onCommentary,
  onScoreUpdate,
  onReconnected,
}: UseWebSocketOptions = {}): UseWebSocketReturn {
  const [status, setStatus] = useState<WsStatus>('connecting')

  const wsRef = useRef<WebSocket | null>(null)
  const retriesRef = useRef(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Holds the latest connect() so the reconnect timer can call it without
  // referencing `connect` inside its own definition (React's immutability rule).
  const connectRef = useRef<() => void>(() => {})
  // Keep latest callbacks in refs so the WebSocket handler always calls the
  // current version, not the stale closure from when the socket was opened.
  const onMatchCreatedRef = useRef(onMatchCreated)
  const onCommentaryRef = useRef(onCommentary)
  const onScoreUpdateRef = useRef(onScoreUpdate)
  const onReconnectedRef = useRef(onReconnected)

  useEffect(() => {
    onMatchCreatedRef.current = onMatchCreated
  }, [onMatchCreated])
  useEffect(() => {
    onCommentaryRef.current = onCommentary
  }, [onCommentary])
  useEffect(() => {
    onScoreUpdateRef.current = onScoreUpdate
  }, [onScoreUpdate])
  useEffect(() => {
    onReconnectedRef.current = onReconnected
  }, [onReconnected])

  const connect = useCallback(() => {
    // Clean up any existing socket before opening a new one
    if (wsRef.current) {
      wsRef.current.onclose = null // prevent recursive reconnect
      wsRef.current.close()
    }

    setStatus(retriesRef.current === 0 ? 'connecting' : 'reconnecting')

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      const wasReconnect = retriesRef.current > 0
      retriesRef.current = 0 // reset backoff counter on success
      setStatus('connected')
      // Fire the reconnect side effects from the socket event itself (not an
      // effect), which is where the external state change actually happens.
      if (wasReconnect) onReconnectedRef.current?.()
    }

    ws.onmessage = (event: MessageEvent) => {
      let msg: WsIncomingMessage
      try {
        msg = JSON.parse(event.data as string) as WsIncomingMessage
      } catch {
        return // ignore malformed frames
      }

      switch (msg.type) {
        case 'match_created':
          onMatchCreatedRef.current?.(msg.data)
          break
        case 'commentary':
          onCommentaryRef.current?.(msg.data)
          break
        case 'score_update':
          onScoreUpdateRef.current?.(msg.data)
          break
        // welcome, subscribed, unsubscribed, error — no UI action needed
        default:
          break
      }
    }

    ws.onclose = () => {
      setStatus('reconnecting')

      if (retriesRef.current >= WS_MAX_RETRIES) {
        setStatus('disconnected')
        return
      }

      // Exponential backoff: 2s, 4s, 8s, 16s … capped at 30s
      const delay = Math.min(
        WS_RECONNECT_DELAY_MS * 2 ** retriesRef.current,
        WS_RECONNECT_MAX_DELAY
      )
      retriesRef.current += 1
      retryTimerRef.current = setTimeout(() => connectRef.current(), delay)
    }

    ws.onerror = () => {
      // onclose fires immediately after onerror — let it handle reconnect
      ws.close()
    }
  }, []) // no deps — all callbacks accessed via refs

  // Keep connectRef pointing at the latest connect (the reconnect timer uses it)
  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  // Open the connection on mount, clean up on unmount
  useEffect(() => {
    connect()
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null // prevent reconnect on intentional close
        wsRef.current.close()
      }
    }
  }, [connect])

  // Send a subscribe/unsubscribe message only when the socket is open
  const send = useCallback((payload: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    }
  }, [])

  const subscribe = useCallback((matchId: number) => send({ type: 'subscribe', matchId }), [send])
  const unsubscribe = useCallback(
    (matchId: number) => send({ type: 'unsubscribe', matchId }),
    [send]
  )

  return { status, subscribe, unsubscribe }
}
