import { ImageResponse } from 'next/og'

// Site Open Graph image — served at /opengraph-image and auto-wired into
// <meta property="og:image"> by Next. So a shared link (X, Telegram, Slack…)
// renders a branded card instead of a bare text preview.
export const alt = 'Sportz — Real-Time Match Broadcast'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const GOLD = '#F5C842'

// Load Geist (the app font) as raw data for the renderer; fall back to the
// default font if the fetch ever fails, so the route never breaks.
async function loadGeist(weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Geist:wght@${weight}`)
    ).text()
    const url = css.match(/src:\s*url\((https:\/\/[^)]+)\)/)?.[1]
    if (!url) return null
    return await (await fetch(url)).arrayBuffer()
  } catch {
    return null
  }
}

export default async function OpengraphImage() {
  const [regular, bold] = await Promise.all([loadGeist(400), loadGeist(700)])
  const fonts = [
    regular && { name: 'Geist', data: regular, weight: 400 as const, style: 'normal' as const },
    bold && { name: 'Geist', data: bold, weight: 700 as const, style: 'normal' as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }[]

  const pill = (text: string) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 20px',
        borderRadius: 999,
        border: '1px solid #262626',
        backgroundColor: '#141414',
        color: '#d4d4d4',
        fontSize: 24,
      }}
    >
      {text}
    </div>
  )

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#0a0a0a',
        backgroundImage:
          'radial-gradient(1100px circle at 20% -10%, rgba(245,200,66,0.20), rgba(245,200,66,0) 45%)',
        color: '#fafafa',
        padding: 72,
        fontFamily: fonts.length ? 'Geist' : 'sans-serif',
      }}
    >
      {/* Top — mark + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 76,
            height: 76,
            borderRadius: 20,
            backgroundColor: GOLD,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 22,
              height: 22,
              borderRadius: 999,
              backgroundColor: '#0a0a0a',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 34, fontWeight: 700 }}>Sportz</div>
          <div style={{ fontSize: 20, color: '#a3a3a3' }}>Real-time match data</div>
        </div>
      </div>

      {/* Middle — headline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-2px',
          }}
        >
          Real-Time Match Broadcast
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            color: '#a3a3a3',
            lineHeight: 1.4,
            maxWidth: 980,
          }}
        >
          Live scores and ball-by-ball commentary, streamed over WebSockets at sub-second latency.
        </div>
      </div>

      {/* Bottom — pills + url */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {pill('Sub-second latency')}
        {pill('WebSockets')}
        {pill('Live commentary')}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            color: GOLD,
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          sportz-ui.vercel.app
        </div>
      </div>
    </div>,
    { ...size, fonts }
  )
}
