import { test, expect } from '@playwright/test';

test.describe('Customer Web E2E Regression', () => {
  test('homepage loads with greeting and search bar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Guest')).toBeVisible();
    await expect(page.locator('text=Search restaurants, dishes')).toBeVisible();
  });

  test('bottom navigation shows all tabs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Search' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Account' })).toBeVisible();
  });

  test('auth page loads', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('text=Sign in')).toBeVisible();
    await expect(page.locator('text=SpiceGarden')).toBeVisible();
  });

  test('search page loads', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('text=Search')).toBeVisible();
  });

  test('cart page shows empty state', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('offers page loads', async ({ page }) => {
    await page.goto('/offers');
    await expect(page.locator('text=Offers')).toBeVisible();
  });

  test('profile page loads', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('text=Profile')).toBeVisible();
  });

  test('restaurant page loads', async ({ page }) => {
    await page.goto('/restaurant');
    await expect(page.locator('text=Menu')).toBeVisible();
  });
});
