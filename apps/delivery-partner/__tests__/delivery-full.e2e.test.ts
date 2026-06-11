describe('Delivery Partner E2E - Full Delivery Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Driver Authentication & Status', () => {
    it('should display offline status by default', async () => {
      await expect(element(by.text('● OFFLINE'))).toBeVisible();
    });

    it('should toggle online status', async () => {
      await element(by.accessibilityLabel('Toggle online status')).tap();
      await expect(element(by.text('● ONLINE'))).toBeVisible();
    });
  });

  describe('Order Assignment Flow', () => {
    it('should receive and display incoming order when online', async () => {
      await element(by.accessibilityLabel('Toggle online status')).tap();
      await element(by.text('Demo Incoming Order')).tap();

      await expect(element(by.text('NEW ORDER ARRIVED'))).toBeVisible();
      await expect(element(by.text(/#SG-/))).toBeVisible();
    });

    it('should accept order and start delivery', async () => {
      await element(by.accessibilityLabel('Toggle online status')).tap();
      await element(by.text('Demo Incoming Order')).tap();

      await element(by.accessibilityLabel('Accept order')).tap();
      await expect(element(by.text('ASSIGNED'))).toBeVisible();
    });

    it('should reject order', async () => {
      await element(by.accessibilityLabel('Toggle online status')).tap();
      await element(by.text('Demo Incoming Order')).tap();

      await element(by.accessibilityLabel('Reject order')).tap();
      await expect(element(by.text('Waiting for orders…'))).toBeVisible();
    });
  });

  describe('Active Delivery Flow', () => {
    it('should navigate through delivery stages', async () => {
      await element(by.accessibilityLabel('Toggle online status')).tap();
      await element(by.text('Demo Incoming Order')).tap();
      await element(by.accessibilityLabel('Accept order')).tap();

      await expect(element(by.text('→ PICKUP'))).toBeVisible();
      await element(by.text("I'm at Restaurant")).tap();
      await expect(element(by.text('AT PICKUP'))).toBeVisible();
    });

    it('should auto-fill and verify OTP', async () => {
      await element(by.accessibilityLabel('Toggle online status')).tap();
      await element(by.text('Demo Incoming Order')).tap();
      await element(by.accessibilityLabel('Accept order')).tap();
      await element(by.text("I'm at Restaurant")).tap();

      await element(by.text('Auto-fill OTP')).tap();
      await element(by.text('Confirm OTP')).tap();

      await expect(element(by.text('→ CUSTOMER'))).toBeVisible();
    });

    it('should complete delivery', async () => {
      await element(by.accessibilityLabel('Toggle online status')).tap();
      await element(by.text('Demo Incoming Order')).tap();
      await element(by.accessibilityLabel('Accept order')).tap();
      await element(by.text("I'm at Restaurant")).tap();
      await element(by.text('Auto-fill OTP')).tap();
      await element(by.text('Confirm OTP')).tap();
      await element(by.text('Mark Delivered')).tap();

      await expect(element(by.text('Waiting for orders…'))).toBeVisible();
    });
  });

  describe('Earnings Screen', () => {
    it('should navigate to earnings screen', async () => {
      await element(by.text('Earnings')).tap();
      await expect(element(by.text('Lifetime Earnings'))).toBeVisible();
    });
  });

  describe('Issue Reporting', () => {
    it('should open issue report panel', async () => {
      await element(by.accessibilityLabel('Toggle online status')).tap();
      await element(by.text('Demo Incoming Order')).tap();
      await element(by.accessibilityLabel('Accept order')).tap();

      await element(by.accessibilityLabel('Report an issue')).tap();
      await expect(element(by.text('Road Blocked'))).toBeVisible();
    });
  });
});