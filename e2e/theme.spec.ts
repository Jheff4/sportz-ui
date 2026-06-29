import { test, expect } from '@playwright/test'

test.describe('Theme', () => {
  test('toggles between light and dark modes', async ({ page }) => {
    await page.goto('/')

    // Check initial theme (likely light)
    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    // Toggle back to light mode
    await page.getByRole('button', { name: 'Switch to light mode' }).click()
    await expect(page.locator('html')).toHaveClass(/light/)
  })
})
