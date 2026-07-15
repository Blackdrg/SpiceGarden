import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KitchenDashboard from '../src/pages';

const queryClient = new QueryClient();

function renderWithQueryClient(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>,
  );
}

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    disconnect: jest.fn(),
    id: 'socket-test',
  })),
}));

jest.mock('../src/pages/index.module.css', () => new Proxy({}, {
  get: (_target, prop) => String(prop),
}));

const mockOrders = [
  { id: 'o1', orderNumber: 'SG-000001', diner: 'Guest 1', table: 'T-1', serviceType: 'delivery', items: [], createdAt: new Date().toISOString(), status: 'new', estPrepMins: 14 },
  { id: 'o2', orderNumber: 'SG-000002', diner: 'Guest 2', table: 'T-2', serviceType: 'dine-in', items: [], createdAt: new Date().toISOString(), status: 'accepted', estPrepMins: 14 },
  { id: 'o3', orderNumber: 'SG-000003', diner: 'Guest 3', table: 'T-3', serviceType: 'takeaway', items: [], createdAt: new Date().toISOString(), status: 'preparing', estPrepMins: 14 },
  { id: 'o4', orderNumber: 'SG-000004', diner: 'Guest 4', table: 'T-4', serviceType: 'delivery', items: [], createdAt: new Date().toISOString(), status: 'ready', estPrepMins: 14 },
];

const mockInventory = [
  { id: 'i1', name: 'Burger Buns', inStock: 3, threshold: 20 },
  { id: 'i2', name: 'Cheese Slices', inStock: 8, threshold: 50 },
  { id: 'i3', name: 'Tomato', inStock: 2, threshold: 15 },
  { id: 'i4', name: 'Ice Cream', inStock: 1, threshold: 10 },
];

describe('Restaurant Dashboard KDS e2e flow', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/orders')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockOrders) } as any);
      }
      if (typeof url === 'string' && url.includes('/api/inventory')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockInventory) } as any);
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) } as any);
    });
  });

  it('accepts, prepares, marks ready, and switches to inventory', async () => {
    renderWithQueryClient(<KitchenDashboard />);

    expect(screen.getByText(/KITCHEN DISPLAY/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/4 orders/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /✓ Accept/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /✓ Accept/i }));
    const startPrepButtons = await screen.findAllByRole('button', { name: /⏱ Start Prep/i });
    expect(startPrepButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(startPrepButtons[0]);
    const readyButtons = await screen.findAllByRole('button', { name: /✓ Ready/i });
    expect(readyButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(readyButtons[0]);
    const servedButtons = await screen.findAllByRole('button', { name: /✅ Served/i });
    expect(servedButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(servedButtons[0]);
    await waitFor(() => expect(screen.getAllByText(/DONE/i).length).toBeGreaterThanOrEqual(1));

    const inventoryButtons = screen.getAllByRole('button', { name: /📦 Inventory/i });
    fireEvent.click(inventoryButtons[0]);
    expect(screen.getByText(/Stock Levels/i)).toBeInTheDocument();
    expect(screen.getByText(/4 low/i)).toBeInTheDocument();
  });
});
