import type { NextApiRequest, NextApiResponse } from 'next';
import categoriesHandler from '../src/pages/api/categories';
import restaurantsHandler from '../src/pages/api/restaurants';

type MockRes = {
  statusCode?: number;
  body?: unknown;
  status: jest.Mock<MockRes, [number]>;
  json: jest.Mock<MockRes, [unknown]>;
};

function createResponse(): MockRes {
  const res = {
    status: jest.fn(function status(this: MockRes, statusCode: number) {
      this.statusCode = statusCode;
      return this;
    }),
    json: jest.fn(function json(this: MockRes, body: unknown) {
      this.body = body;
      return this;
    }),
  } as MockRes;

  return res;
}

const mockRestaurants = [
  { id: '1', name: 'Spice Garden Kitchen', rating: 4.8, isActive: true, cuisine: 'Indian' },
  { id: '2', name: 'Dragon Wok', rating: 4.5, isActive: true, cuisine: 'Chinese' },
];

const mockMenu = [
  { id: 'cat-1', categoryId: '1', categoryName: 'Burgers', name: 'Classic Burger', price: 199 },
  { id: 'cat-5', categoryId: '5', categoryName: 'Healthy', name: 'Salad Bowl', price: 249 },
];

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockRestaurants),
    } as Response),
  ) as jest.Mock;
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.clearAllMocks();
});

describe('Customer Web API integration', () => {
  it('serves active restaurant listings', async () => {
    const res = createResponse();
    await restaurantsHandler({ query: {} } as NextApiRequest, res as unknown as NextApiResponse);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          name: 'Spice Garden Kitchen',
          rating: 4.8,
          isActive: true,
        }),
      ]),
    );
  });

  it('serves category catalog with menu groups', async () => {
    const res = createResponse();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMenu),
    } as Response);

    await categoriesHandler({ query: { restaurantId: '1' } } as NextApiRequest, res as unknown as NextApiResponse);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '1', name: 'Burgers', items: expect.arrayContaining([expect.objectContaining({ name: 'Classic Burger', price: 199 })]) }),
        expect.objectContaining({ id: '5', name: 'Healthy', items: expect.arrayContaining([expect.objectContaining({ name: 'Salad Bowl', price: 249 })]) }),
      ]),
    );
  });
});
