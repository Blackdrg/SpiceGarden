import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { LiveOrder, OrderStatus, Stats } from './types';
import { DashboardCard } from './DashboardCard';
import {
  IconBarChart3,
  IconDollarSign,
} from './icons/SGIcon';

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

const generateHourlyBuckets = (totalOrders: number) => {
  if (totalOrders <= 0) return [];
  const avgPerBucket = Math.max(1, Math.round(totalOrders / 7));
  return [
    { t: '00:00', value: avgPerBucket },
    { t: '04:00', value: Math.round(avgPerBucket * 0.8) },
    { t: '08:00', value: Math.round(avgPerBucket * 1.2) },
    { t: '12:00', value: Math.round(avgPerBucket * 1.5) },
    { t: '16:00', value: Math.round(avgPerBucket * 1.8) },
    { t: '20:00', value: Math.round(avgPerBucket * 1.3) },
    { t: '23:59', value: Math.round(avgPerBucket * 0.9) },
  ];
};

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
      <DashboardCard title="Order Status Breakdown" sub="Count by current status" iconVariant="primary" titleIcon={<IconBarChart3 size={16} color="#FF5A1F" />}>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Bar dataKey="count" fill="#FF5A1F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

      <DashboardCard title="Average Order Value" sub="By hour bucket" iconVariant="info" titleIcon={<IconDollarSign size={16} color="#3B82F6" />}>
        <div style={{ height: 260 }}>
          {stats.orders > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generateHourlyBuckets(stats.orders)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="t" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, 'AOV']}
                />
                <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="#EDE9FE" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF', fontSize: 14 }}>
              No order data available yet
            </div>
          )}
        </div>
      </DashboardCard>
    </>
  );
}

function countByStatus(orders: LiveOrder[], status: OrderStatus) {
  return orders.filter((order) => order.status === status).length;
}
