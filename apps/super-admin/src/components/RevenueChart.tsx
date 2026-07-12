import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

const Area = dynamic<any>(async () => {
  const { Area } = await import('recharts');
  return Area as unknown as ComponentType<any>;
}, { ssr: false });

const AreaChart = dynamic<any>(async () => {
  const { AreaChart } = await import('recharts');
  return AreaChart as unknown as ComponentType<any>;
}, { ssr: false });

const CartesianGrid = dynamic<any>(async () => {
  const { CartesianGrid } = await import('recharts');
  return CartesianGrid as unknown as ComponentType<any>;
}, { ssr: false });

const Line = dynamic<any>(async () => {
  const { Line } = await import('recharts');
  return Line;
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

export type RevenueDatum = {
  t: string;
  revenue: number;
  orders: number;
};

export default function RevenueChart({ data }: { data: RevenueDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF5A1F" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#FF5A1F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="t" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          formatter={(val: number, name: string) => [name === 'revenue' ? `₹${val.toLocaleString()}` : val, name === 'revenue' ? 'Revenue' : 'Orders']}
        />
        <Area type="monotone" dataKey="revenue" stroke="#FF5A1F" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: '#FF5A1F' }} />
        <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={1.5} dot={false} strokeDasharray="4 4" yAxisId={0} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
