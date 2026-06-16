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

describe('Customer Web API integration', () => {
  it('serves active restaurant listings', () => {
    const res = createResponse();
    restaurantsHandler({} as NextApiRequest, res as unknown as NextApiResponse);

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

  it('serves category catalog with menu groups', () => {
    const res = createResponse();
    categoriesHandler({} as NextApiRequest, res as unknown as NextApiResponse);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '1', name: 'Burgers', items: [] }),
        expect.objectContaining({ id: '5', name: 'Healthy', items: [] }),
      ]),
    );
  });
});
