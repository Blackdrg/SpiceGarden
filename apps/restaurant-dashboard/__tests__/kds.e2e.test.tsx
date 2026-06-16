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
    expect(screen.getByRole('button', { name: /⏱ Start Prep/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /⏱ Start Prep/i }));
    expect(screen.getByRole('button', { name: /✓ Ready/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /✓ Ready/i }));
    expect(screen.getByRole('button', { name: /✅ Served/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /✅ Served/i }));
    expect(screen.getByText(/DONE/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /📦 Inventory/i }));
    expect(screen.getByText(/Stock Levels/i)).toBeInTheDocument();
    expect(screen.getByText(/4 low/i)).toBeInTheDocument();
  });
});
