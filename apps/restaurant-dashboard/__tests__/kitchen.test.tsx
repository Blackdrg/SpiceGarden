import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('socket.io-client', () => ({
  io: () => ({
    on: jest.fn(),
    disconnect: jest.fn(),
  }),
}));

import RestaurantDashboard from '../src/pages/index';

describe('RestaurantDashboard', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders kitchen display header', () => {
    render(<RestaurantDashboard />);
    expect(screen.getByText(/Kitchen Display|KITCHEN DISPLAY/i)).toBeInTheDocument();
  });

  it('shows batch and undo controls', () => {
    render(<RestaurantDashboard />);
    expect(screen.getByRole('button', { name: /Batch/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Undo/i })).toBeInTheDocument();
  });

  it('shows status count badges', () => {
    render(<RestaurantDashboard />);
    expect(screen.getByText(/NEW\s*\(/)).toBeInTheDocument();
    expect(screen.getByText(/COOKING\s*\(/)).toBeInTheDocument();
  });

  it('switches to inventory tab', () => {
    render(<RestaurantDashboard />);
    fireEvent.click(screen.getByText('Inventory'));
    expect(screen.getByText(/Burger Buns/)).toBeInTheDocument();
  });

  it('shows add stock button in inventory', () => {
    render(<RestaurantDashboard />);
    fireEvent.click(screen.getByText('Inventory'));
    expect(screen.getByRole('button', { name: /Add Stock/i })).toBeInTheDocument();
  });

  it('toggles batch mode', () => {
    render(<RestaurantDashboard />);
    const btn = screen.getByRole('button', { name: /Batch/i });
    fireEvent.click(btn);
    expect(btn).toHaveTextContent(/Batch/);
  });
});
