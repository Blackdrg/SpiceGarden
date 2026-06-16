import type { NextApiRequest, NextApiResponse } from 'next';
import adminStatsHandler from '../src/pages/api/admin/stats';
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

describe('Super Admin API integration', () => {
  it('serves platform statistics and risk signals', () => {
    const res = createResponse();
    adminStatsHandler({} as NextApiRequest, res as unknown as NextApiResponse);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        stats: expect.objectContaining({
          revenue: 45200,
          orders: 124,
          driversOnline: 18,
          fraudAlerts: 3,
        }),
        branches: expect.arrayContaining([
          expect.objectContaining({ name: 'Sector 17 Kitchen', status: 'operational' }),
          expect.objectContaining({ name: 'Sector 35 Kitchen', status: 'delayed' }),
        ]),
      }),
    );
  });

  it('serves admin order oversight queue', () => {
    const res = createResponse();
    ordersHandler({} as NextApiRequest, res as unknown as NextApiResponse);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'ORD-001', branch: 'Sector 17 Branch', status: 'confirmed' }),
        expect.objectContaining({ id: 'ORD-003', eta: 15, status: 'ready' }),
      ]),
    );
  });
});
