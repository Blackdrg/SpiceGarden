import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { LiveOrder, OrderStatus, Stats } from './types';

const Area = dynamic<any>(async () => {
  const { Area } = await import('recharts');
  return Area as unknown as ComponentType<any>;
}, { ssr: false });

const AreaChart = dynamic<any>(async () => {
  const { AreaChart } = await import('recharts');
  return AreaChart as unknown as ComponentType<any>;
}, { ssr: false });

const Bar = dynamic<any>(async () => {
  const { Bar } = await import('recharts');
  return Bar as unknown as ComponentType<any>;
}, { ssr: false });

const BarChart = dynamic<any>(async () => {
  const { BarChart } = await import('recharts');
  return BarChart as unknown as ComponentType<any>;
}, { ssr: false });

const CartesianGrid = dynamic<any>(async () => {
  const { CartesianGrid } = await import('recharts');
  return CartesianGrid as unknown as ComponentType<any>;
}, { ssr: false });

const ResponsiveContainer = dynamic<any>(async () => {
  const { ResponsiveContainer } = await import('recharts');
  return ResponsiveContainer as unknown as ComponentType<any>;
}, { ssr: false });

const Tooltip = dynamic<any>(async () => {
  const { Tooltip } = await import('recharts');
  return Tooltip as unknown as ComponentType<any>;
}, { ssr: false });

const XAxis = dynamic<any>(async () => {
  const { XAxis } = await import('recharts');
  return XAxis as unknown as ComponentType<any>;
}, { ssr: false });

const YAxis = dynamic<any>(async () => {
  const { YAxis } = await import('recharts');
  return YAxis as unknown as ComponentType<any>;
}, { ssr: false });

const MOCK_REVENUE = [
  { t: '00:00', orders: 10 },
  { t: '04:00', orders: 15 },
  { t: '08:00', orders: 20 },
  { t: '12:00', orders: 25 },
  { t: '16:00', orders: 30 },
  { t: '20:00', orders: 22 },
  { t: '23:59', orders: 18 },
];

export default function OrdersCharts({ liveOrders, stats }: { liveOrders: LiveOrder[]; stats: Stats }) {
  const statusCounts = useMemo(() => ({
    received: countByStatus(liveOrders, 'received'),
    confirmed: countByStatus(liveOrders, 'confirmed'),
    preparing: countByStatus(liveOrders, 'preparing'),
    ready: countByStatus(liveOrders, 'ready'),
    delivered: Math.max(0, stats.orders - liveOrders.length),
  }), [liveOrders, stats.orders]);

  return (
    <>
      <DashboardCard title="Order Status Breakdown">
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { status: 'New', count: statusCounts.received },
              { status: 'Confirmed', count: statusCounts.confirmed },
              { status: 'Preparing', count: statusCounts.preparing },
              { status: 'Ready', count: statusCounts.ready },
              { status: 'Delivered', count: statusCounts.delivered },
              { status: 'Cancelled', count: 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#f04e31" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

      <DashboardCard title="Average Order Value" sub="By hour bucket">
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'AOV']} />
              <Area type="monotone" dataKey="orders" stroke="#9c27b0" fill="#e1bee7" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>
    </>
  );
}

function countByStatus(orders: LiveOrder[], status: OrderStatus) {
  return orders.filter((order) => order.status === status).length;
}

function DashboardCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      padding: 20,
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    }}>
      {title && <h3 style={{ margin: '0 0 4px 0', fontSize: 17, fontWeight: 700 }}>{title}</h3>}
      {sub && <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#888' }}>{sub}</p>}
      {children}
    </div>
  );
}
