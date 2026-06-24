import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { BranchStatus, DisputeTicket, HeatmapPoint, LiveOrder, Stats } from './types';
import type { RevenueDatum } from './RevenueChart';
import { DashboardCard } from './DashboardCard';
import { KPICard } from './KPICard';

const RevenueChart = dynamic<RevenueChartProps>(() => import('./RevenueChart'), { ssr: false });

type RevenueChartProps = { data: RevenueDatum[] };

export function OverviewTab({
  stats,
  revenueData,
  liveOrders,
  branches,
  tickets,
  heatmapData,
  DeliveryHeatmap,
}: {
  stats: Stats;
  revenueData: Record<string, unknown>[];
  liveOrders: LiveOrder[];
  branches: BranchStatus[];
  tickets: DisputeTicket[];
  heatmapData: HeatmapPoint[];
  DeliveryHeatmap: ComponentType<{ data: HeatmapPoint[] }>;
}) {
  const openTickets = tickets.filter((ticket) => ticket.severity === 'high' || ticket.severity === 'critical');
  const nonOperationalBranches = branches.filter((branch) => branch.status !== 'operational');
  const normalBranches = branches.filter((branch) => branch.status === 'operational');

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard label="Revenue Today" value={`₹${stats.revenue.toLocaleString()}`} delta="+12%" upColor="#4caf50" />
        <KPICard label="Total Orders" value={String(stats.orders)} delta="Today" upColor="#2196f3" />
        <KPICard label="Drivers Online" value={String(stats.driversOnline)} delta="92% util" upColor="#4caf50" />
        <KPICard label="Refunds" value={String(stats.refunds)} delta="Processed" upColor="#ff9800" />
        <KPICard label="Open Disputes" value={String(openTickets.length)} delta="Action req" upColor="#ff4444" />
        <KPICard label="Fraud Blocks" value={String(stats.fraudAlerts)} delta="Today" upColor="#9c27b0" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        <DashboardCard title="Revenue — 24h Trend">
          <div style={{ height: 280 }}>
            <RevenueChart data={revenueData as RevenueDatum[]} />
          </div>
        </DashboardCard>

        <DashboardCard title="Live Order Feed">
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {liveOrders.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', padding: 20 }}>Waiting for orders…</p>}
            {liveOrders.map((order) => (
              <div key={order.id + order.timestamp} style={{ padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>#{order.id}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{order.branch} · ETA {order.eta}m</div>
                </div>
                <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: 14 }}>₹{order.amount}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="🚨 System Alerts">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {nonOperationalBranches.map((branch) => (
            <div key={branch.name} style={{ flex: 1, padding: '12px 16px', background: '#fff5f5', borderLeft: `4px solid ${branchColor(branch.status)}`, borderRadius: 6, minWidth: 220 }}>
              <strong>{branch.name} Kitchen</strong> — {branch.status === 'delayed' ? `Avg prep ${branch.avgPrepMins}m (target 18m)` : 'CRITICAL — all drivers exhausted'}
            </div>
          ))}
          {normalBranches.length > 0 && (
            <div style={{ flex: 1, padding: '12px 16px', background: '#f5fff5', borderLeft: '4px solid #4caf50', borderRadius: 6, minWidth: 220 }}>
              All other {normalBranches.length} branches are within normal SLA targets.
            </div>
          )}
        </div>
      </DashboardCard>

      <div style={{ marginTop: 24 }}>
        <DashboardCard title="📍 Delivery Heatmap" sub={`SpiceGarden service area — ${heatmapData.length > 0 ? `${heatmapData.length} data points` : 'computing…'}`}>
          {heatmapData.length > 0 ? (
            <div>
              <DeliveryHeatmap data={heatmapData} />
              <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 13, color: '#666' }}>
                {Array.from(new Set(heatmapData.map((point) => point.label))).map((label) => {
                  const points = heatmapData.filter((point) => point.label === label);
                  const avg = points.reduce((sum, point) => sum + point.intensity, 0) / points.length;
                  return (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 14, height: 14, borderRadius: 3, background: `rgba(220,70,30,${avg})` }} />
                      {label} <strong style={{ color: '#f04e31' }}>{Math.round(avg * 100)}%</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Initializing heatmap…</div>
          )}
        </DashboardCard>
      </div>
    </>
  );
}

function branchColor(status: BranchStatus['status']) {
  const colors: Record<BranchStatus['status'], string> = {
    operational: '#4caf50',
    delayed: '#ff4444',
    critical: '#9c27b0',
  };
  return colors[status];
}
