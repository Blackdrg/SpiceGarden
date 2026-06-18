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
            <stop offset="5%" stopColor="#f04e31" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f04e31" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
        <XAxis dataKey="t" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          formatter={(val: number, name: string) => [name === 'revenue' ? `₹${val.toLocaleString()}` : val, name === 'revenue' ? 'Revenue' : 'Orders']}
        />
        <Area type="monotone" dataKey="revenue" stroke="#f04e31" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: '#f04e31' }} />
        <Line type="monotone" dataKey="orders" stroke="#2196f3" strokeWidth={1.5} dot={false} strokeDasharray="4 4" yAxisId={0} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
