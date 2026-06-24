import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AnalyticsOverview from '../src/pages/analytics';

const analyticsPayload = {
  conversionFunnel: {
    ordersPlaced: 1250,
  },
  churnAnalysis: {
    activeCustomers: 8420,
  },
};

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  return render(<QueryClientProvider client={createQueryClient()}>{ui}</QueryClientProvider>);
}

describe('Super Admin analytics e2e flow', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'fetch', {
      configurable: true,
      value: jest.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(analyticsPayload),
      })),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads platform analytics and switches reporting period', async () => {
    renderWithProviders(<AnalyticsOverview />);

    expect(await screen.findByText(/Analytics Overview/i)).toBeInTheDocument();
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('₹0')).toBeInTheDocument();
      expect(screen.getByText('8420')).toBeInTheDocument();
    });

    const thirtyDayButton = screen.getByRole('button', { name: '30d' });
    const ninetyDayButton = screen.getByRole('button', { name: '90d' });
    fireEvent.click(ninetyDayButton);

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/analytics/platform?period=90d');
    expect(thirtyDayButton).toBeInTheDocument();
  });
});
