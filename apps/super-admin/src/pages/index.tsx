import { useEffect, useMemo, useReducer } from 'react';
import styles from './Sidebar.module.css';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import type { Socket } from 'socket.io-client';
import {
  adminDashboardReducer,
  initialAdminDashboardState,
  type AdminTab,
  type BranchStatus,
  type DisputeTicket,
  type HeatmapPoint,
  type LiveOrder,
  type Stats,
  type TicketFilter,
} from '../components/types';
import { BranchesTab } from '../components/BranchesTab';
import { OrdersTab } from '../components/OrdersTab';
import { OverviewTab } from '../components/OverviewTab';
import { SupportTab } from '../components/SupportTab';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

async function fetchStats(): Promise<{ stats?: Stats; revenueData?: Record<string, unknown>[]; branches?: BranchStatus[]; tickets?: DisputeTicket[] } | null> {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('Failed to fetch stats:', e);
  }
  return null;
}

async function fetchOrders(): Promise<(LiveOrder & { createdAt?: string })[]> {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('Failed to fetch orders:', e);
  }
  return [];
}

export default function AdminDashboard() {
  const [state, dispatch] = useReducer(adminDashboardReducer, undefined, initialAdminDashboardState);

  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: 'client-tick' }), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchStats().then((data) => {
      if (data) dispatch({ type: 'stats-loaded', payload: data });
    });
    fetchOrders().then((orders) => {
      if (orders.length > 0) dispatch({ type: 'orders-loaded', orders });
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let socket: Socket | null = null;

    import('socket.io-client').then(({ io }) => {
      if (cancelled) return;
      socket = io(SOCKET_URL, { path: '/socket.io/' });
      socket.on('connect', () => console.log('[Admin] connected'));
      socket.on('disconnect', () => console.log('[Admin] disconnected'));
      socket.on('statsUpdate', (stats: Partial<Stats>) => dispatch({ type: 'stats-updated', stats }));
      socket.on('newOrderGlobal', (order: LiveOrder) => dispatch({ type: 'new-order-global', order }));
      socket.on('kitchenUpdate', (branches: BranchStatus[]) => dispatch({ type: 'branches-updated', branches }));
      socket.on('deliveryHeatmap', (data: HeatmapPoint[]) => dispatch({ type: 'heatmap-updated', data }));
      socket.on('revenueUpdate', (data: unknown[]) => dispatch({ type: 'revenue-updated', data: data as Record<string, unknown>[] }));
    });

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, []);

  const filteredTickets = useMemo(() => state.ticketFilter === 'all' ? state.tickets : state.tickets.filter((ticket) => ticket.type === state.ticketFilter), [state.tickets, state.ticketFilter]);
  const openTickets = useMemo(() => state.tickets.filter((ticket) => ticket.severity === 'high' || ticket.severity === 'critical'), [state.tickets]);
  const pendingRefunds = useMemo(() => state.tickets.filter((ticket) => ticket.type === 'refund'), [state.tickets]);
  const fraudTickets = useMemo(() => state.tickets.filter((ticket) => ticket.type === 'fraud'), [state.tickets]);

  const title = dashboardTitle(state.selectedTab);
  const subtitle = dashboardSubtitle(state.selectedTab, state.liveOrders, state.branches, state.tickets, openTickets.length);

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar selectedTab={state.selectedTab} onSelectTab={(tab) => dispatch({ type: 'tab-selected', tab })} />

      <main style={{ marginLeft: 220, padding: '24px 32px', paddingTop: 20 }}>
        <DashboardHeader title={title} subtitle={subtitle} />

        {state.selectedTab === 'overview' && (
          <OverviewTab
            stats={state.stats}
            revenueData={state.revenueData}
            liveOrders={state.liveOrders}
            branches={state.branches}
            tickets={state.tickets}
            heatmapData={state.heatmapData}
            DeliveryHeatmap={DeliveryHeatmap}
          />
        )}

        {state.selectedTab === 'orders' && (
          <OrdersTab liveOrders={state.liveOrders} stats={state.stats} clientNow={state.clientNow} />
        )}

        {state.selectedTab === 'branches' && (
          <BranchesTab branches={state.branches} />
        )}

        {state.selectedTab === 'support' && (
          <SupportTab
            stats={state.stats}
            filteredTickets={filteredTickets}
            pendingRefunds={pendingRefunds}
            fraudTickets={fraudTickets}
            ticketFilter={state.ticketFilter}
            onFilterChange={(filter) => dispatch({ type: 'ticket-filter-selected', filter })}
            onCloseTicket={(id) => dispatch({ type: 'ticket-closed', id })}
            onApproveRefund={(id) => dispatch({ type: 'refund-approved', id })}
          />
        )}
      </main>

      <style>{`
        * { box-sizing: border-box; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3; }
      `}</style>
    </div>
  );
}

const sidebarNavItems: { key: AdminTab; label: string; emoji: string }[] = [
  { key: 'overview', label: 'Dashboard', emoji: '📊' },
  { key: 'orders', label: 'Live Orders', emoji: '🛵' },
  { key: 'branches', label: 'Kitchen Monitor', emoji: '🏪' },
  { key: 'support', label: 'Support & Security', emoji: '🛡️' },
];

function Sidebar({ selectedTab, onSelectTab }: { selectedTab: AdminTab; onSelectTab: (tab: AdminTab) => void }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <div className={styles.logoText}>🌶️ SpiceGarden</div>
        <div className={styles.adminText}>Super Admin</div>
      </div>

      {sidebarNavItems.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onSelectTab(tab.key)}
          className={`${styles.navButton} ${selectedTab === tab.key ? styles.navButtonActive : styles.navButtonInactive}`}
        >
          <span className={styles.navEmoji}>{tab.emoji}</span> {tab.label}
        </button>
      ))}

      <div className={styles.footer}>
        <div className={styles.footerLabel}>Logged in as</div>
        <div className={styles.footerName}>Super Admin</div>
      </div>
    </aside>
  );
}

function DashboardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header style={{ marginBottom: 24 }}>
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>{title}</h1>
      <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>{subtitle}</p>
    </header>
  );
}

function dashboardTitle(tab: AdminTab) {
  const titles: Record<AdminTab, string> = {
    overview: '📊 Platform Overview',
    orders: '🛵 Live Orders',
    branches: '🏪 Kitchen Monitoring',
    support: '🛡️ Support & Security',
  };
  return titles[tab];
}

function dashboardSubtitle(tab: AdminTab, liveOrders: LiveOrder[], branches: BranchStatus[], tickets: DisputeTicket[], openTickets: number) {
  const subtitles: Record<AdminTab, string> = {
    overview: 'Real-time KPIs across all branches',
    orders: `${liveOrders.length} orders currently active`,
    branches: `${branches.length} kitchen outlets monitored`,
    support: `${tickets.length} total tickets · ${openTickets} active`,
  };
  return subtitles[tab];
}

function DeliveryHeatmap({ data }: { data: HeatmapPoint[] }) {
  const GRID = 40;
  const buckets: Record<string, { sum: number; count: number }> = {};
  data.forEach((point) => {
    const key = `${Math.round(point.x / GRID) * GRID},${Math.round(point.y / GRID) * GRID}`;
    const bucket = buckets[key] || { sum: 0, count: 0 };
    buckets[key] = { sum: bucket.sum + point.intensity, count: bucket.count + 1 };
  });

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${100 / GRID}, 1fr)`,
      gap: 1, aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
    }}>
      {Array.from({ length: (100 / GRID) * (100 / GRID) }, (_, i) => {
        const col = i % (100 / GRID);
        const row = Math.floor(i / (100 / GRID));
        const x = col * GRID;
        const y = row * GRID;
        const key = `${x},${y}`;
        const bucket = buckets[key];
        const avg = bucket ? bucket.sum / bucket.count : 0;
        const r = Math.round(220 + avg * 35);
        const g = Math.round(50 + avg * 20);
        const bv = Math.round(30);
        return (
          <div
            key={key}
            title={avg > 0.4 ? `High demand zone (intensity: ${avg.toFixed(2)})` : ''}
            style={{ backgroundColor: `rgba(${r},${g},${bv},${Math.max(0.06, avg)})`, borderRadius: 1 }}
          />
        );
      })}
    </div>
  );
}
