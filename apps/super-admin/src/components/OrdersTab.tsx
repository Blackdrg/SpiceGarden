import dynamic from 'next/dynamic';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import type { LiveOrder, Stats } from './types';
import { DashboardCard } from './DashboardCard';
import { KPICard } from './KPICard';

type OrdersChartsProps = { liveOrders: LiveOrder[]; stats: Stats };
const OrdersCharts = dynamic<OrdersChartsProps>(() => import('./OrdersCharts'), { ssr: false });

export function OrdersTab({ liveOrders, stats, clientNow }: { liveOrders: LiveOrder[]; stats: Stats; clientNow: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
      <KPICard label="New" value={String(countStatus(liveOrders, 'received'))} upColor="#f04e31" />
      <KPICard label="Confirmed" value={String(countStatus(liveOrders, 'confirmed'))} upColor="#ff9800" />
      <KPICard label="Preparing" value={String(countStatus(liveOrders, 'preparing'))} upColor="#2196f3" />
      <KPICard label="Ready for Pickup" value={String(countStatus(liveOrders, 'ready'))} upColor="#4caf50" />
      <KPICard label="Delivered (today)" value={String(Math.max(0, stats.orders - liveOrders.length))} upColor="#9c27b0" />
      <KPICard label="Cancelled (today)" value="0" upColor="#999" />

      <div style={{ gridColumn: '1 / -1' }}>
        <DashboardCard title="Active Orders — live socket stream" sub={`${liveOrders.length} items`}>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  {['Order #', 'Branch', 'Amount', 'ETA', 'Status', 'Age'].map((header) => (
                    <th key={header} style={{ textAlign: 'left', padding: '8px 12px', color: '#888', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {liveOrders.map((order) => (
                  <tr key={order.id + order.timestamp} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>#{order.id}</td>
                    <td style={{ padding: '10px 12px', color: '#666' }}>{order.branch}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold', color: DESIGN_TOKENS.colors.primary }}>₹{order.amount}</td>
                    <td style={{ padding: '10px 12px', color: '#888' }}>{order.eta}m</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 'bold',
                        background: order.status === 'delivered' ? '#e8f5e8' :
                          order.status === 'ready' ? '#e8f5e8' :
                            order.status === 'preparing' ? '#fff3e0' : '#f5f5f5',
                        color: order.status === 'received' ? '#f04e31' : '#555',
                      }}>{order.status.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#999', fontSize: 12 }}>
                      {clientNow && order.timestamp ? `${Math.floor((clientNow - order.timestamp) / 60000)}m` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {liveOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No orders yet — new ones arrive via socket</div>
            )}
          </div>
        </DashboardCard>
      </div>

      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <OrdersCharts liveOrders={liveOrders} stats={stats} />
      </div>
    </div>
  );
}

function countStatus(orders: LiveOrder[], status: LiveOrder['status']) {
  return orders.filter((order) => order.status === status).length;
}
