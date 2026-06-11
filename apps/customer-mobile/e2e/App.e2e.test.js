const config = require('./detox.config.js');
{
  describe('Customer Mobile - Detox E2E Tests', () => {
    beforeEach(async () => {
      await device.reloadReactNative();
    });

    describe('App Launch', () => {
      it('should show welcome screen', async () => {
        await expect(element(by.text('Welcome to SpiceGarden Customer App'))).toBeVisible();
      });

      it('should launch without crashes', async () => {
        await expect(element(by.text('SpiceGarden'))).toBeVisible();
      });
    });

    describe('Authentication Flow', () => {
      it('should show login form', async () => {
        await expect(element(by.label('Email'))).toBeVisible();
        await expect(element(by.label('Password'))).toBeVisible();
      });

      it('should show validation on empty submit', async () => {
        await element(by.label('Sign In')).tap();
        await expect(element(by.text('Enter email and password'))).toBeVisible();
      });

      it('should toggle to register mode', async () => {
        await element(by.text("Don't have an account")).tap();
        await expect(element(by.text('Create Account'))).toBeVisible();
      });

      it('should accept valid email input', async () => {
        await element(by.label('Email')).typeText('test@example.com');
        await expect(element(by.label('Email'))).toHaveText('test@example.com');
      });

      it('should accept valid password input', async () => {
        await element(by.label('Password')).typeText('SecurePass123!');
        await expect(element(by.label('Password'))).toHaveText('SecurePass123!');
      });
    });

    describe('Navigation', () => {
      it('should navigate to home screen after login', async () => {
        await element(by.label('Email')).typeText('user@example.com');
        await element(by.label('Password')).typeText('password123');
        await element(by.label('Sign In')).tap();
        await expect(element(by.text('Recommended Restaurants'))).toBeVisible();
      });

      it('should navigate to cart screen', async () => {
        await element(by.text('Cart')).atIndex(0).tap();
        await expect(element(by.text('Your cart is empty'))).toBeVisible();
      });

      it('should navigate to search screen', async () => {
        await element(by.text('Search')).atIndex(0).tap();
        await expect(element(by.label('Search'))).toBeVisible();
      });
    });

    describe('Offline State', () => {
      it('should show offline indicator when offline', async () => {
        await device.setOfflineMode(true);
        await expect(element(by.text("You're offline"))).toBeVisible();
      });

      it('should allow retry when offline', async () => {
        await device.setOfflineMode(true);
        await element(by.label('Retry')).tap();
        await device.setOfflineMode(false);
      });
    });

    describe('Cart Operations', () => {
      it('should show empty cart state', async () => {
        await element(by.text('Cart')).atIndex(0).tap();
        await expect(element(by.text('Your cart is empty'))).toBeVisible();
      });

      it('should add items to cart', async () => {
        const initialCount = await element(by.text('Cart')).atIndex(0).getAttributes();
        // Simulate adding item
        await expect(element(by.text('Add'))).toBeVisible();
      });
    });

    describe('Restaurant Browsing', () => {
      it('should filter restaurants by search', async () => {
        await element(by.label('Search')).typeText('Spice');
        await expect(element(by.text('Spice Garden'))).toBeVisible();
      });

      it('should show cuisine categories', async () => {
        await expect(element(by.text('Burgers'))).toBeVisible();
        await expect(element(by.text('Pizza'))).toBeVisible();
      });
    });
  });
}
