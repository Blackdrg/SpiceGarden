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

const mockAdminStats = {
  stats: {
    revenue: 45200,
    totalOrders: 124,
    onlineDrivers: 18,
    fraudAlerts: 3,
    complaints: 0,
    refunds: 0,
    activeRestaurants: 5,
  },
  branches: [
    { name: 'Sector 17 Kitchen', status: 'operational' },
    { name: 'Sector 35 Kitchen', status: 'delayed' },
  ],
};

const mockAdminOrders = [
  { id: 'ORD-001', branch: { branchName: 'Sector 17 Branch' }, status: 'RESTAURANT_ACCEPTED', estimatedTimeMinutes: 15, createdAt: new Date() },
  { id: 'ORD-003', branch: { branchName: 'Sector 35 Branch' }, status: 'READY', estimatedTimeMinutes: 15, createdAt: new Date() },
];

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockAdminStats),
    } as Response),
  ) as jest.Mock;
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.clearAllMocks();
});

describe('Super Admin API integration', () => {
  it('serves platform statistics and risk signals', async () => {
    const res = createResponse();
    await adminStatsHandler({ query: {} } as NextApiRequest, res as unknown as NextApiResponse);

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

  it('serves admin order oversight queue', async () => {
    const res = createResponse();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAdminOrders),
    } as Response);

    await ordersHandler({ query: {} } as NextApiRequest, res as unknown as NextApiResponse);

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
