import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import KitchenDashboard from '../src/pages';

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

describe('Restaurant Dashboard KDS e2e flow', () => {
  it('accepts, prepares, marks ready, and switches to inventory', () => {
    render(<KitchenDashboard />);

    expect(screen.getByText(/KITCHEN DISPLAY/i)).toBeInTheDocument();
    expect(screen.getByText(/4 orders/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /✓ Accept/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /✓ Accept/i }));
    const startPrepButtons = screen.getAllByRole('button', { name: /⏱ Start Prep/i });
    expect(startPrepButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(startPrepButtons[0]);
    const readyButtons = screen.getAllByRole('button', { name: /✓ Ready/i });
    expect(readyButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(readyButtons[0]);
    const servedButtons = screen.getAllByRole('button', { name: /✅ Served/i });
    expect(servedButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(servedButtons[0]);
    expect(screen.getAllByText(/DONE/i).length).toBeGreaterThanOrEqual(1);

    const inventoryButtons = screen.getAllByRole('button', { name: /📦 Inventory/i });
    fireEvent.click(inventoryButtons[0]);
    expect(screen.getByText(/Stock Levels/i)).toBeInTheDocument();
    expect(screen.getByText(/4 low/i)).toBeInTheDocument();
  });
});
