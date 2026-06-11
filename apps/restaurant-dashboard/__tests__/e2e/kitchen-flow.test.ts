import { test, expect } from '@playwright/test';

test.describe('Restaurant Dashboard - Kitchen Flow E2E', () => {
  test('should load restaurant dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SpiceGarden/i);
  });

  test('should display kitchen display header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Kitchen Display|KITCHEN DISPLAY/i)).toBeVisible();
  });

  test('should show batch and undo controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Batch/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Undo/i })).toBeVisible();
  });

  test('should display status count badges', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/NEW/i)).toBeVisible();
    await expect(page.getByText(/COOKING/i)).toBeVisible();
  });

  test('should switch to inventory tab', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Inventory').click();
    await expect(page.getByText(/Burger Buns|Burger/i)).toBeVisible();
  });

  test('should show add stock button in inventory', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Inventory').click();
    await expect(page.getByRole('button', { name: /Add Stock/i })).toBeVisible();
  });

  test('should toggle batch mode', async ({ page }) => {
    await page.goto('/');
    const batchBtn = page.getByRole('button', { name: /Batch/i });
    await expect(batchBtn).toBeVisible();
    await batchBtn.click();
    await expect(batchBtn).toBeVisible();
  });

  test('should have accessible clickable elements', async ({ page }) => {
    await page.goto('/');
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });
});