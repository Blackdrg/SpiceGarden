import '@testing-library/jest-dom';

// Test pure utility functions (extracted from index.tsx)
function statusClassSuffix(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function serviceClassSuffix(serviceType: string): string {
  if (serviceType === 'dine-in' || serviceType === 'dine_in') return 'DineIn';
  return serviceType.charAt(0).toUpperCase() + serviceType.slice(1);
}

function orderElapsed(order: { prepStartedAt?: Date; estPrepMins: number }): number {
  if (!order.prepStartedAt) return 0;
  return Math.max(0, Math.floor((+new Date() - +order.prepStartedAt) / 60000));
}

describe('KitchenDashboard utilities', () => {
  describe('statusClassSuffix', () => {
    it('formats status class suffix correctly', () => {
      expect(statusClassSuffix('new')).toBe('New');
      expect(statusClassSuffix('accepted')).toBe('Accepted');
      expect(statusClassSuffix('preparing')).toBe('Preparing');
      expect(statusClassSuffix('ready')).toBe('Ready');
      expect(statusClassSuffix('delayed')).toBe('Delayed');
      expect(statusClassSuffix('completed')).toBe('Completed');
    });
  });

  describe('serviceClassSuffix', () => {
    it('formats service class suffix correctly', () => {
      expect(serviceClassSuffix('delivery')).toBe('Delivery');
      expect(serviceClassSuffix('takeaway')).toBe('Takeaway');
      expect(serviceClassSuffix('dine-in')).toBe('DineIn');
      expect(serviceClassSuffix('dine_in')).toBe('DineIn');
    });
  });

  describe('orderElapsed', () => {
    it('calculates elapsed minutes for active prep', () => {
      const now = new Date();
      const orders = [
        { prepStartedAt: new Date(now.getTime() - 10 * 60000), estPrepMins: 15 },
        { prepStartedAt: undefined, estPrepMins: 10 },
      ];

      expect(orderElapsed(orders[0]!)).toBe(10);
      expect(orderElapsed(orders[1]!)).toBe(0);
    });
  });

  describe('Inventory utilities', () => {
    interface InventoryItem {
      id: string;
      name: string;
      inStock: number;
      threshold: number;
    }

    function isLowStock(item: InventoryItem): boolean {
      return item.inStock <= item.threshold;
    }

    function stockPercentage(item: InventoryItem): number {
      return Math.min(100, (item.inStock / item.threshold) * 100);
    }

    function updateStock(item: InventoryItem, delta: number): InventoryItem {
      return { ...item, inStock: Math.max(0, item.inStock + delta) };
    }

    const mockItem: InventoryItem = {
      id: 'inv-1',
      name: 'Burger Buns',
      inStock: 3,
      threshold: 20,
    };

    it('identifies low stock items correctly', () => {
      expect(isLowStock(mockItem)).toBe(true);
      expect(isLowStock({ ...mockItem, inStock: 25 })).toBe(false);
    });

    it('calculates stock percentage correctly', () => {
      expect(stockPercentage(mockItem)).toBe(15);
      expect(stockPercentage({ ...mockItem, inStock: 10 })).toBe(50);
      expect(stockPercentage({ ...mockItem, inStock: 50 })).toBe(100);
    });

    it('updates stock correctly', () => {
      expect(updateStock(mockItem, 10).inStock).toBe(13);
      expect(updateStock(mockItem, -5).inStock).toBe(0);
    });
  });
});