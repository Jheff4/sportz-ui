import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { setupMockApi } from './fixtures/mock-api'

test.describe('Accessibility', () => {
  test('home page has no automatically-detectable a11y violations', async ({ page }) => {
    await setupMockApi(page)
    await page.goto('/')
    await expect(page.getByTestId('match-card-1')).toHaveCSS('opacity', '1')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
})