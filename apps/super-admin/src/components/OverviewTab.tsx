import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { BranchStatus, DisputeTicket, HeatmapPoint, LiveOrder, Stats } from './types';
import type { RevenueDatum } from './RevenueChart';
import styles from './OverviewTab.module.css';
import { DashboardCard } from './DashboardCard';
import { KPICard } from './KPICard';
import {
  IconDollarSign,
  IconShoppingBag,
  IconUsers,
  IconReceipt,
  IconAlertCircle,
  IconBan,
  IconTrendingUp,
  IconMapPin,
  IconActivity,
  IconAlertTriangle,
} from './icons/SGIcon';

const RevenueChart = dynamic<RevenueChartProps>(() => import('./RevenueChart'), { ssr: false });
import revenueChartStyles from './RevenueChart.module.css';

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
      <div className={styles.kpiGrid}>
        <KPICard label="Revenue Today" value={`₹${stats.revenue.toLocaleString()}`} upColor="#10B981" delta="+12%" icon={<IconDollarSign size={20} color="#10B981" />} />
        <KPICard label="Total Orders" value={String(stats.orders)} upColor="#3B82F6" delta="Today" icon={<IconShoppingBag size={20} color="#3B82F6" />} />
        <KPICard label="Drivers Online" value={String(stats.driversOnline)} upColor="#10B981" delta="92% util" icon={<IconUsers size={20} color="#10B981" />} />
        <KPICard label="Refunds" value={String(stats.refunds)} upColor="#F59E0B" delta="Processed" icon={<IconReceipt size={20} color="#F59E0B" />} />
        <KPICard label="Open Disputes" value={String(openTickets.length)} upColor="#EF4444" delta="Action req" icon={<IconAlertCircle size={20} color="#EF4444" />} />
        <KPICard label="Fraud Blocks" value={String(stats.fraudAlerts)} upColor="#8B5CF6" delta="Today" icon={<IconBan size={20} color="#8B5CF6" />} />
      </div>

      <div className={styles.chartsRow}>
        <DashboardCard title="Revenue — 24h Trend" sub="Hourly revenue and order volume" iconVariant="primary" titleIcon={<IconTrendingUp size={16} color="#FF5A1F" />}>
          <div className={revenueChartStyles.chartContainer}>
            <RevenueChart data={revenueData as RevenueDatum[]} />
          </div>
        </DashboardCard>

        <DashboardCard title="Live Order Feed" sub={`${liveOrders.length} active orders`} iconVariant="info" titleIcon={<IconActivity size={16} color="#3B82F6" />}>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {liveOrders.length === 0 && <p className={styles.emptyState}>Waiting for orders…</p>}
            {liveOrders.map((order) => (
              <div key={order.id + order.timestamp} className={styles.liveOrderItem}>
                <div className={styles.liveOrderLeft}>
                  <span className={styles.liveOrderId}>#{order.id}</span>
                  <span className={styles.liveOrderMeta}>{order.branch} · ETA {order.eta}m</span>
                </div>
                <span className={styles.liveOrderAmount}>₹{order.amount}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <div className={styles.alertsCard}>
        <DashboardCard title="System Alerts" iconVariant="warning" titleIcon={<IconAlertTriangle size={16} color="#F59E0B" />}>
          <div className={styles.alertsRow}>
            {nonOperationalBranches.map((branch) => (
              <div key={branch.name} className={`${styles.alertItem} ${branch.status === 'critical' ? styles.alertDanger : styles.alertWarning}`}>
                <div className={styles.alertTitle}>{branch.name} Kitchen</div>
                <div className={styles.alertBody}>
                  {branch.status === 'delayed' ? `Avg prep ${branch.avgPrepMins}m (target 18m)` : 'CRITICAL — all drivers exhausted'}
                </div>
              </div>
            ))}
            {normalBranches.length > 0 && (
              <div className={`${styles.alertItem} ${styles.alertSuccess}`}>
                <div className={styles.alertTitle}>All Systems Normal</div>
                <div className={styles.alertBody}>All other {normalBranches.length} branches are within normal SLA targets.</div>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      <div className={styles.heatmapRow}>
        <DashboardCard title="Delivery Heatmap" sub={`SpiceGarden service area — ${heatmapData.length > 0 ? `${heatmapData.length} data points` : 'computing…'}`} iconVariant="primary" titleIcon={<IconMapPin size={16} color="#FF5A1F" />}>
          {heatmapData.length > 0 ? (
            <div>
              <DeliveryHeatmap data={heatmapData} />
              <div className={styles.heatmapLegend}>
                {Array.from(new Set(heatmapData.map((point) => point.label))).map((label) => {
                  const points = heatmapData.filter((point) => point.label === label);
                  const avg = points.reduce((sum, point) => sum + point.intensity, 0) / points.length;
                  return (
                    <div key={label} className={styles.heatmapLegendItem}>
                      <div className={styles.heatmapLegendColor} style={{ background: `rgba(220,70,30,${avg})` }} />
                      {label} <strong className={styles.heatmapLegendValue}>{Math.round(avg * 100)}%</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>Initializing heatmap…</div>
          )}
        </DashboardCard>
      </div>
    </>
  );
}
