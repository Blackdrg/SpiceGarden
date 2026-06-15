import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import Link from 'next/link';

const API = 'http://localhost:3001/api';

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0a0a0a',
  color: '#fff',
  padding: 24,
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 24,
};

const titleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
};

const periods = ['7d', '30d', '90d'];

const periodButtonStyle = (active: boolean): React.CSSProperties => ({
  padding: '6px 14px',
  borderRadius: 6,
  fontSize: 13,
  cursor: 'pointer',
  fontWeight: 500,
  background: active ? '#f97316' : '#171717',
  color: active ? '#fff' : '#a1a1aa',
  border: '1px solid #27272a',
});

interface ConversionFunnel {
  funnel?: { ordersPlaced?: number };
  avgOrderValue?: number;
}

interface ChurnAnalysis {
  activeCustomers?: number;
}

interface AnalyticsData {
  conversionFunnel?: ConversionFunnel;
  churnAnalysis?: ChurnAnalysis;
}

export default function AnalyticsOverview() {
  const [period, setPeriod] = useState('30');
  const { data, isLoading: loading } = useQuery<AnalyticsData>({
    queryKey: ['analytics-platform', period],
    queryFn: async () => {
      const response = await fetch(`${API}/analytics/platform?period=${period}`);
      if (!response.ok) throw new Error('Failed to load analytics');
      return response.json() as Promise<AnalyticsData>;
    },
    placeholderData: undefined,
  });

  return (
    <div style={pageStyle}>
      <Head><title>Analytics Overview - SpiceGarden</title></Head>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Analytics Overview</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {periods.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setPeriod(p)}
              style={periodButtonStyle(period === p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#71717a' }}>Loading analytics...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Orders', value: data?.conversionFunnel?.funnel?.ordersPlaced || '—' },
              { label: 'Revenue', value: `₹${((data?.conversionFunnel?.avgOrderValue ?? 0) * (data?.conversionFunnel?.funnel?.ordersPlaced || 0) || 0).toFixed(0)}` },
              { label: 'Avg Order Value', value: `₹${data?.conversionFunnel?.avgOrderValue?.toFixed(0) || '—'}` },
              { label: 'Active Customers', value: data?.churnAnalysis?.activeCustomers || '—' },
            ].map((card) => (
              <div key={card.label} style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#f97316' }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <Link href="/analytics/top-dishes" style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20, textDecoration: 'none', color: '#fff' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Top Dishes</h3>
              <p style={{ fontSize: 13, color: '#71717a' }}>Best selling items</p>
            </Link>
            <Link href="/analytics/customers" style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20, textDecoration: 'none', color: '#fff' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Customers</h3>
              <p style={{ fontSize: 13, color: '#71717a' }}>Churn & repeat analysis</p>
            </Link>
            <Link href="/analytics/conversion" style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20, textDecoration: 'none', color: '#fff' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Conversion</h3>
              <p style={{ fontSize: 13, color: '#71717a' }}>Funnel analysis</p>
            </Link>
          </div>
        </>
      )}
      <Link href="/" style={{ color: '#f97316', textDecoration: 'none', marginTop: 24, display: 'inline-block' }}>← Back to Dashboard</Link>
    </div>
  );
}
