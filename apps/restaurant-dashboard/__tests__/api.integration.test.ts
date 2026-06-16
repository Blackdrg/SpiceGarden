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

describe('Restaurant Dashboard API integration', () => {
  it('serves KDS order queue with prep metadata', () => {
    const res = createResponse();
    ordersHandler({} as NextApiRequest, res as unknown as NextApiResponse);

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

  it('serves inventory thresholds for low-stock detection', () => {
    const res = createResponse();
    inventoryHandler({} as NextApiRequest, res as unknown as NextApiResponse);

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
