import { test, expect } from '@playwright/test';

test.describe('Super Admin - Dashboard Navigation E2E', () => {
  test('should load super admin dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SpiceGarden/i);
  });

  test('should display dashboard header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/SpiceGarden/i)).toBeVisible();
  });

  test('should display revenue card', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Revenue Today/i)).toBeVisible();
  });

  test('should display navigation tabs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Live Orders/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Kitchen Monitor/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Support/i })).toBeVisible();
  });

  test('should navigate to live orders', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Live Orders/i }).click();
    await expect(page).toHaveURL(/\/orders/);
  });

  test('should have accessible navigation links', async ({ page }) => {
    await page.goto('/');
    const navLinks = page.getByRole('link');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});