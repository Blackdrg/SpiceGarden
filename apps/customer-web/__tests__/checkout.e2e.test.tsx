import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Checkout from '../src/pages/checkout';

const mockRouter = { push: jest.fn() };

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

jest.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) => selector({
    auth: { user: { token: 'test-token' } },
    cart: {
      restaurantId: 'rest-1',
      items: [
        { id: 'item-1', name: 'Biryani', price: 240, quantity: 2 },
      ],
    },
  }),
}));

jest.mock('@spicegarden/shared/api', () => ({
  ordersApi: {
    create: jest.fn(async () => ({ data: { id: 'ORD-123' } })),
  },
  authApi: {
    refreshToken: jest.fn(async () => ({ data: { access_token: 'refreshed-token' } })),
  },
}));

jest.mock('../src/utils/cachedLocalStorage', () => ({
  getCachedToken: jest.fn(() => ''),
  clearCachedToken: jest.fn(),
}));

const { ordersApi } = jest.requireMock('@spicegarden/shared/api') as {
  ordersApi: { create: jest.Mock };
};
const { useRouter } = jest.requireMock('next/router') as { useRouter: () => typeof mockRouter };

describe('Customer Web checkout e2e flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('applies promo, places order, and routes to tracking', async () => {
    render(<Checkout />);

    expect(screen.getByRole('heading', { name: /checkout/i })).toBeInTheDocument();
    expect(screen.getByText(/Item Total/i)).toBeInTheDocument();
    expect(screen.getByText(/₹480/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/promo code/i), { target: { value: 'WELCOME50' } });
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    await waitFor(() => {
      expect(screen.getByText(/Applied! You saved ₹100/i)).toBeInTheDocument();
    });

    ordersApi.create.mockResolvedValueOnce({ data: { id: 'ORD-123' } });
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));

    await waitFor(() => {
      expect(ordersApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurantId: 'rest-1',
          items: [{ menuItemId: 'item-1', quantity: 2, price: 240 }],
          subtotal: 480,
          deliveryFee: 20,
          tax: 24,
          tip: 0,
          grandTotal: 424,
        }),
        'test-token',
      );
      expect(useRouter().push).toHaveBeenCalledWith('/tracking?order=ORD-123');
    });
  });
});
