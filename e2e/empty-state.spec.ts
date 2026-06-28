import { test, expect } from '@playwright/test'
import { setupMockApi } from './fixtures/mock-api'

test.describe('Empty state', () => {
  test('the API returns no matches, shows the "No Live Matches" empty state instead of cards', async ({ page }) => {
    await setupMockApi(page, {
      matches: [],
    })

    await page.goto('/')
    await expect(page.getByRole('status', { name: /No Live Matches/i })).toContainText(/No Live Matches/i)
  })
})