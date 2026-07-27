import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const formatCurrency = (value?: number) => {
  if (typeof value !== 'number') return '₹0';
  return `₹${value.toLocaleString('en-IN')}`;
};

interface PaymentStats {
  totalRevenue?: number;
  totalOrders?: number;
  avgOrderValue?: number;
  codOrders?: number;
  codRevenue?: number;
  codSuccessRate?: number;
  codCancellationRate?: number;
  prepaidOrders?: number;
  prepaidRevenue?: number;
  qrPayments?: number;
  qrRevenue?: number;
  walletPayments?: number;
  walletRevenue?: number;
  refunds?: number;
  refundAmount?: number;
  failedPayments?: number;
  paymentMethods?: Record<string, { count: number; revenue: number }>;
}

export default function PaymentAnalytics() {
  const [period, setPeriod] = useState('30d');

  const { data: stats = {}, isLoading } = useQuery<PaymentStats>({
    queryKey: ['payment-analytics', period],
    queryFn: async () => {
      const response = await fetch(`${API}/analytics/payments?period=${period}`);
      if (!response.ok) throw new Error('Failed to load payment analytics');
      return response.json() as Promise<PaymentStats>;
    },
    initialData: {},
  });

  const codSuccessColor = typeof stats.codSuccessRate === 'number' && stats.codSuccessRate < 70 ? '#f04e31' : '#4ade80';
  const refundColor = typeof stats.refundAmount === 'number' && stats.refundAmount > 0 ? '#f04e31' : '#4ade80';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: 24 }}>
      <Head><title>Payment Analytics - SpiceGarden</title></Head>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Payment Analytics</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 500,
                background: period === p ? '#f97316' : '#171717',
                color: period === p ? '#fff' : '#a1a1aa',
                border: '1px solid #27272a',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p style={{ color: '#71717a' }}>Loading...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue) },
              { label: 'Total Orders', value: stats.totalOrders || 0 },
              { label: 'Avg Order Value', value: formatCurrency(stats.avgOrderValue) },
              { label: 'COD Success Rate', value: `${stats.codSuccessRate || 0}%`, color: codSuccessColor },
            ].map((card) => (
              <div key={card.label} style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: card.color || '#f97316' }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
            <div style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Payment Methods</h2>
              {stats.paymentMethods && Object.keys(stats.paymentMethods).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Object.entries(stats.paymentMethods).map(([method, data]) => (
                    <div key={method} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #27272a' }}>
                      <span style={{ fontSize: 14, color: '#fff', textTransform: 'capitalize' }}>{method.replace('_', ' ')}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{data.count} orders</div>
                        <div style={{ fontSize: 13, color: '#a1a1aa' }}>{formatCurrency(data.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#71717a', fontSize: 14 }}>No payment method data available</p>
              )}
            </div>

            <div style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>COD Performance</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'COD Orders', value: stats.codOrders || 0 },
                  { label: 'COD Revenue', value: formatCurrency(stats.codRevenue) },
                  { label: 'Success Rate', value: `${stats.codSuccessRate || 0}%`, color: codSuccessColor },
                  { label: 'Cancellation Rate', value: `${stats.codCancellationRate || 0}%`, color: '#f04e31' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #27272a' }}>
                    <span style={{ fontSize: 14, color: '#a1a1aa' }}>{item.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: item.color || '#fff' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Financial Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { label: 'Prepaid Orders', value: stats.prepaidOrders || 0, sub: formatCurrency(stats.prepaidRevenue) },
                { label: 'QR Payments', value: stats.qrPayments || 0, sub: formatCurrency(stats.qrRevenue) },
                { label: 'Wallet Payments', value: stats.walletPayments || 0, sub: formatCurrency(stats.walletRevenue) },
              ].map((item) => (
                <div key={item.label} style={{ background: '#0a0a0a', borderRadius: 6, padding: 16, border: '1px solid #27272a' }}>
                  <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{item.value}</div>
                  <div style={{ fontSize: 13, color: '#a1a1aa', marginTop: 4 }}>{item.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 16 }}>
              {[
                { label: 'Refunds', value: stats.refunds || 0, sub: formatCurrency(stats.refundAmount), color: refundColor },
                { label: 'Failed Payments', value: stats.failedPayments || 0, sub: 'Requires attention', color: '#f04e31' },
              ].map((item) => (
                <div key={item.label} style={{ background: '#0a0a0a', borderRadius: 6, padding: 16, border: '1px solid #27272a' }}>
                  <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: item.color || '#fff' }}>{item.value}</div>
                  <div style={{ fontSize: 13, color: '#a1a1aa', marginTop: 4 }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}