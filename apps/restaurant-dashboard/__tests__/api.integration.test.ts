import type { NextApiRequest, NextApiResponse } from 'next';
import inventoryHandler from '../src/pages/api/inventory';
import ordersHandler from '../src/pages/api/orders';

type MockRes = {
  statusCode?: number;
  body?: unknown;
  status: jest.Mock<MockRes, [number]>;
  json: jest.Mock<MockRes, [unknown]>;
};

function createResponse(): MockRes {
  return {
    status: jest.fn(function status(this: MockRes, statusCode: number) {
      this.statusCode = statusCode;
      return this;
    }),
    json: jest.fn(function json(this: MockRes, body: unknown) {
      this.body = body;
      return this;
    }),
  } as MockRes;
}

const mockOrders = [
  {
    id: 'kds-a1',
    orderNumber: 'SG-A1B2C3',
    customerName: 'Rahul',
    serviceType: 'delivery',
    status: 'PLACED',
    items: [{ name: 'Butter Chicken', qty: 2 }],
    estPrepMins: 14,
  },
];

const mockInventory = [
  { id: 'inv-1', name: 'Burger Buns', quantity: 12, threshold: 20 },
  { id: 'inv-4', name: 'Chicken Patties', quantity: 3, threshold: 25 },
];

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockOrders),
    } as Response),
  ) as jest.Mock;
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.clearAllMocks();
});

describe('Restaurant Dashboard API integration', () => {
  it('serves KDS order queue with prep metadata', async () => {
    const res = createResponse();
    await ordersHandler({ query: {} } as NextApiRequest, res as unknown as NextApiResponse);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'kds-a1',
          orderNumber: 'SG-A1B2C3',
          serviceType: 'delivery',
          status: 'new',
          estPrepMins: 14,
        }),
      ]),
    );
  });

  it('serves inventory thresholds for low-stock detection', async () => {
    const res = createResponse();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockInventory),
    } as Response);

    await inventoryHandler({ query: { branchId: '1' } } as NextApiRequest, res as unknown as NextApiResponse);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'inv-1', name: 'Burger Buns', inStock: 12, threshold: 20 }),
        expect.objectContaining({ id: 'inv-4', name: 'Chicken Patties', inStock: 3, threshold: 25 }),
      ]),
    );
  });
});
