import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Checkout from '../src/pages/checkout';

const mockRouter = { push: jest.fn() };

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector: (state: unknown) => unknown) => selector({
    auth: { user: { id: 'user-1', email: 'test@example.com', role: 'customer' } },
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
    refreshToken: jest.fn(async () => ({ data: { refresh_token: 'refreshed-token' } })),
  },
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

    expect(screen.getByRole('heading', { name: /Review & Place Order|Checkout/i })).toBeInTheDocument();
    expect(screen.getByText(/Item Subtotal|Item Total/i)).toBeInTheDocument();
    expect(screen.getAllByText(/₹480/i).length).toBeGreaterThanOrEqual(1);

    fireEvent.change(screen.getByPlaceholderText(/ENTER PROMO CODE|promo code/i), { target: { value: 'WELCOME50' } });
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    await waitFor(() => {
      expect(screen.getByText(/WELCOME50 applied!/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /place order/i }));

    await waitFor(() => {
      expect(useRouter().push).toHaveBeenCalledWith(expect.stringContaining('/tracking?order='));
    }, { timeout: 2000 });
  });
});
