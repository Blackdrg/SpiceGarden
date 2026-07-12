import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { LiveOrder, Stats } from './types';
import styles from './OrdersTab.module.css';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { DashboardCard } from './DashboardCard';
import { KPICard } from './KPICard';
import {
  IconPackage,
  IconCheck,
  IconClock,
  IconTruck,
  IconX,
  IconActivity,
} from './icons/SGIcon';

type OrdersChartsProps = { liveOrders: LiveOrder[]; stats: Stats };
const OrdersCharts = dynamic<OrdersChartsProps>(() => import('./OrdersCharts'), { ssr: false });

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  received: { label: 'New', className: styles.statusReceived, icon: <IconPackage size={12} /> },
  confirmed: { label: 'Confirmed', className: styles.statusConfirmed, icon: <IconCheck size={12} /> },
  preparing: { label: 'Preparing', className: styles.statusPreparing, icon: <IconClock size={12} /> },
  ready: { label: 'Ready', className: styles.statusReady, icon: <IconCheck size={12} /> },
  delivered: { label: 'Delivered', className: styles.statusDelivered, icon: <IconCheck size={12} /> },
  cancelled: { label: 'Cancelled', className: styles.statusDefault, icon: <IconX size={12} /> },
};

export function OrdersTab({ liveOrders, stats, clientNow }: { liveOrders: LiveOrder[]; stats: Stats; clientNow: number }) {
  const statusCounts = useMemo(() => ({
    received: countStatus(liveOrders, 'received'),
    confirmed: countStatus(liveOrders, 'confirmed'),
    preparing: countStatus(liveOrders, 'preparing'),
    ready: countStatus(liveOrders, 'ready'),
    delivered: Math.max(0, stats.orders - liveOrders.length),
    cancelled: 0,
  }), [liveOrders, stats.orders]);

  return (
    <div className={styles.ordersGrid}>
      <KPICard label="New" value={String(statusCounts.received)} upColor="#EF4444" delta="received" icon={<IconPackage size={18} color="#EF4444" />} />
      <KPICard label="Confirmed" value={String(statusCounts.confirmed)} upColor="#F59E0B" delta="confirmed" icon={<IconCheck size={18} color="#F59E0B" />} />
      <KPICard label="Preparing" value={String(statusCounts.preparing)} upColor="#3B82F6" delta="in kitchen" icon={<IconClock size={18} color="#3B82F6" />} />
      <KPICard label="Ready" value={String(statusCounts.ready)} upColor="#10B981" delta="for pickup" icon={<IconTruck size={18} color="#10B981" />} />
      <KPICard label="Delivered" value={String(statusCounts.delivered)} upColor="#8B5CF6" delta="today" icon={<IconCheck size={18} color="#8B5CF6" />} />
      <KPICard label="Cancelled" value={String(statusCounts.cancelled)} upColor="#9CA3AF" delta="today" icon={<IconX size={18} color="#9CA3AF" />} />

      <div className={`${styles.fullWidth} ${styles.chartsSubGrid}`}>
        <DashboardCard title="Active Orders — live socket stream" sub={`${liveOrders.length} items`} iconVariant="primary" titleIcon={<IconActivity size={16} color="#FF5A1F" />}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  {['Order #', 'Branch', 'Amount', 'ETA', 'Status', 'Age'].map((header) => (
                    <th key={header} className={styles.tableHeadCell}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {liveOrders.map((order) => {
                  const config = statusConfig[order.status] || statusConfig.received;
                  return (
                    <tr key={order.id + order.timestamp} className={styles.tableRow}>
                      <td className={styles.cellBold}>#{order.id}</td>
                      <td className={styles.cellMuted}>{order.branch}</td>
                      <td className={styles.cellAmount}>₹{order.amount}</td>
                      <td className={styles.cellEta}>{order.eta}m</td>
                      <td className={styles.cell}>
                        <span className={`${styles.statusBadge} ${config.className}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className={styles.cellAge}>
                        {clientNow && order.timestamp ? `${Math.floor((clientNow - order.timestamp) / 60000)}m` : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {liveOrders.length === 0 && (
              <div className={styles.emptyState}>No orders yet — new ones arrive via socket</div>
            )}
          </div>
        </DashboardCard>

        <OrdersCharts liveOrders={liveOrders} stats={stats} />
      </div>
    </div>
  );
}

function countStatus(orders: LiveOrder[], status: string) {
  return orders.filter((order) => order.status === status).length;
}
