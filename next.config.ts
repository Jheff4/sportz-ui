// =============================================================================
// next.config.ts
// =============================================================================

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // output: 'standalone' — ONLY for the Docker image (gated behind DOCKER_BUILD=1).
  // It makes `next build` emit a self-contained .next/standalone/ (minimal
  // server.js + only the deps actually used), which the Docker runner stage
  // copies instead of running `npm ci`.
  //
  // We gate it because `next start` (used by the Playwright webServer, and the
  // normal/Vercel run) WARNS and misbehaves with standalone — standalone must be
  // launched via `node .next/standalone/server.js`, which only the Dockerfile
  // does. So: Docker build sets DOCKER_BUILD=1 → standalone; everything else →
  // a normal build that `next start` serves cleanly.
  ...(process.env.DOCKER_BUILD === '1' ? { output: 'standalone' as const } : {}),
}

export default nextConfig
