import { test, expect } from '@playwright/test'
import { setupMockApi } from './fixtures/mock-api'
import { mockMatches } from './fixtures/mock-data'

test.describe('Pagination', () => {
  test('the API returns multiple pages, shows pagination controls', async ({ page }) => {
    const matches = Array.from({ length: 8 }, (_, i) => ({ ...mockMatches[0], id: i + 1, homeTeam: `Team ${i}` }))
    await setupMockApi(page, {
      matches,
    })

    await page.goto('/')
    await expect(page.getByText('Page 1 of 2')).toBeVisible()
    await expect(page.getByLabel('Next page')).toBeVisible()
    await page.getByLabel('Next page').click()
    await expect(page.getByLabel('Previous page')).toBeVisible()
    await expect(page.getByText('Page 2 of 2')).toBeVisible()
    await expect(page.getByLabel('Next page')).toHaveAttribute('aria-disabled', 'true')
  })
})

