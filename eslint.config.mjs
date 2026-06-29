// =============================================================================
// eslint.config.mjs — frontend lint rules (ESLint 9 flat config)
// =============================================================================
//
// Two things combined:
//   1. Next.js's recommended rules (core-web-vitals + typescript) — React-hooks
//      rules, Next-specific checks (e.g. no <img>), TS rules. eslint-config-next
//      v16 ships these as NATIVE flat-config arrays, so we import the subpath
//      exports and spread them directly. (The older FlatCompat bridge crashes
//      against v16 with "Converting circular structure to JSON" — it's the wrong
//      tool now that the config is already flat.)
//   2. Prettier as a lint rule (eslint-plugin-prettier/recommended) — formatting
//      problems surface as ESLint errors, and eslint-config-prettier (bundled in
//      the "recommended" preset) turns off ESLint's own stylistic rules so the
//      two don't fight. Same approach as the backend's eslint.config.js.
// =============================================================================

import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierRecommended,
  {
    ignores: [
      '.next/',
      'node_modules/',
      'out/',
      'coverage/',
      'playwright-report/',
      'test-results/',
      'next-env.d.ts',
    ],
  },
]

export default eslintConfig
