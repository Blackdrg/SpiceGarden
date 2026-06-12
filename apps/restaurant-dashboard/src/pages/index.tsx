import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@spicegarden/ui';
import { io, Socket } from 'socket.io-client';
import styles from './index.module.css';

// ── Types ──────────────────────────────────────────────────────────────────
type OrderItem = {
  id: string;
  name: string;
  qty: number;
  modifiers?: string[];
  note?: string;
};

type InventoryItem = {
  id: string;
  name: string;
  inStock: number;
  threshold: number;
};

type Order = {
  id: string;
  orderNumber: string;
  diner: string;
  table: string;
  serviceType: ServiceType;
  items: OrderItem[];
  createdAt: Date;
  status: OrderStatus;
  estPrepMins: number;
  prepStartedAt?: Date;
};

type OrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'pickedup' | 'delivered' | 'cancelled' | 'delayed' | 'completed';
type ServiceType = 'delivery' | 'dine-in' | 'dine_in' | 'takeaway';

// ── Pre-seeded demo data ────────────────────────────────────────────────────

const DEMO_ITEMS: OrderItem[] = [
  { id: 'i1', name: 'Zinger Burger', qty: 1, modifiers: ['Extra Spicy'], note: 'Less onions' },
  { id: 'i2', name: 'Large Fries', qty: 1 },
  { id: 'i3', name: 'Coke', qty: 1, modifiers: ['Less Ice'] },
];

const seedInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'Burger Buns', inStock: 3, threshold: 20 },
  { id: 'inv-2', name: 'Cheese Slices', inStock: 8, threshold: 50 },
  { id: 'inv-3', name: 'Tomato', inStock: 2, threshold: 15 },
  { id: 'inv-4', name: 'Ice Cream', inStock: 1, threshold: 10 },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

const now = () => new Date();
const elapsedMins = (startedAt: Date) => Math.max(0, Math.floor((+now() - +startedAt) / 60000));

function orderElapsed(order: Order) {
  return order.prepStartedAt ? elapsedMins(order.prepStartedAt) : 0;
}

function isDelayed(order: Order) {
  return order.status === 'preparing' && orderElapsed(order) > order.estPrepMins;
}

function demoOrder(id: string, overrides: Partial<Order> = {}): Order {
  return {
    id,
    orderNumber: `SG-${id.slice(-6).toUpperCase()}`,
    diner: 'Guest',
    table: 'T-0' + id.length,
    serviceType: 'delivery',
    items: DEMO_ITEMS.map((i) => ({ ...i, id: `${id}-${i.id}` })),
    createdAt: now(),
    status: 'new',
    estPrepMins: 14,
    ...overrides,
  };
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function KitchenDashboard() {
   const [orders, setOrders] = useState<Order[]>(() =>
      [
        demoOrder('a1', { status: 'preparing', prepStartedAt: new Date(+now() - 17 * 60000), estPrepMins: 14 }),
        demoOrder('b2', { status: 'accepted', estPrepMins: 10 }),
        demoOrder('c3', { status: 'ready', estPrepMins: 8 }),
        demoOrder('d4', { status: 'new', estPrepMins: 12 }),
      ]
    );
    const [batchMode, setBatchMode] = useState(false);
    const [inventory, setInventory] = useState<InventoryItem[]>(seedInventory);
    const [activeTab, setActiveTab] = useState<'kitchen' | 'inventory'>('kitchen');
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [activeSounds, setActiveSounds] = useState<string[]>([]);
    const [lastAction, setLastAction] = useState<string>('');

  // ── Sound / new-order alert ────────────────────────────────────────────────

  const playNewOrderSound = useCallback(() => {
    if (!audioEnabled) return;
    // Browser cannot reliably auto-play without user interaction;
    // store id so user can click "play" when browser allows.
    const id = Date.now().toString();
    setActiveSounds((prev) => [id, ...prev]);
  }, [audioEnabled]);

  function squashSound(id: string) {
    setActiveSounds((prev) => prev.filter((x) => x !== id));
  }

   // ── Socket connection ─────────────────────────────────────────────────────

    useEffect(() => {
      const socket: Socket = io('http://localhost:3001', {
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => console.log('[KDS] connected:', socket.id));
      socket.on('disconnect', () => console.log('[KDS] disconnected'));
      socket.on('newOrder', (order: Order) => {
        setOrders((prev) => [{ ...order, createdAt: new Date(order.createdAt || Date.now()) }, ...prev]);
        setLastAction(`New order #${order.orderNumber} received`);
        playNewOrderSound();
      });
      socket.on('inventoryAlert', (item: InventoryItem) => {
        setInventory((prev) => {
          const found = prev.find((i) => i.id === item.id);
          if (found) found.inStock = Math.max(0, found.inStock - 1);
          return [...prev];
        });
      });

      return () => { socket.disconnect(); };
    }, [playNewOrderSound]);

    // Seed inventory on mount too

  // ── Status transitions ─────────────────────────────────────────────────────

  const transition = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updated: Order = { ...o, status };
        if (status === 'preparing') updated.prepStartedAt = new Date();
        if (status === 'ready') updated.prepStartedAt = undefined;
        return updated;
      })
    );
    setLastAction(`Order #${orderId.slice(-6)} → ${status.toUpperCase()}`);
  };

  const accept = (id: string) => transition(id, 'accepted');
  const startPrep = (id: string) => transition(id, 'preparing');
  const markReady = (id: string) => transition(id, 'ready');
  const markDelayed = (id: string) => transition(id, 'delayed');
  const served = (id: string) => transition(id, 'completed');

  // ── Dedup undo / reorder helper ────────────────────────────────────────────

  const undoLast = () => setLastAction('');

  // ── Prep timer (side-effect: auto-flag delay) ──────────────────────────────

  // ── Derived data ──────────────────────────────────────────────────────────

  const statuses: OrderStatus[] = ['new', 'accepted', 'preparing', 'ready', 'delayed', 'completed'];
  const statusLabels = {
    new: 'NEW', accepted: 'ACKD', preparing: 'COOKING', ready: 'READY', delayed: 'DELAYED', completed: 'DONE', pickedup: 'PICKED', delivered: 'DONE', cancelled: 'CANCELLED',
  } as const satisfies Record<OrderStatus, string>;
  const statusColors = {
    new: '#f04e31', accepted: '#ff9800', preparing: '#2196f3',
    ready: '#4caf50', delayed: '#ff4444', completed: '#999', pickedup: '#ff9800', delivered: '#4caf50',
    cancelled: '#888',
  } as const satisfies Record<OrderStatus, string>;

  const counts = Object.fromEntries(statuses.map((s) => [s, orders.filter((o) => o.status === s).length])) as Record<OrderStatus, number>;

  const groupedOrders = batchMode
    ? statuses.reduce((acc, s) => { acc[s] = orders.filter((o) => o.status === s); return acc; }, {} as Record<OrderStatus, Order[]>)
    : null;

  // ── Alert sound player (for pre-played sounds) ──────────────────────────────

  const tryPlay = (base64: string) => {
    const el = new Audio(`data:audio/wav;base64,${base64}`);
    el.play().catch(() => null);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.rootContainer}>
{/* ── Header ────────────────────────────────────────────────────────── */}
      <div className={styles.headerBar}>
        <h1 className={styles.headerTitle}>&#x1F525; KITCHEN DISPLAY</h1>
        <div className={styles.headerControls}>
          <button
            onClick={() => !audioEnabled ? setAudioEnabled(true) : squashSound('toggle')}
            title={audioEnabled ? 'Mute alerts' : 'Unmute alerts'}
            className={`${styles.audioToggleButton} ${audioEnabled ? styles.unmutedButton : styles.mutedButton}`}
          >
            {audioEnabled ? '🔊' : '🔇'}</button>
          <div className={styles.orderCountBadge}>
            {orders.length} orders
          </div>
          <Button
            label={batchMode ? '□ Batch' : '⊞ Batch'}
            onClick={() => setBatchMode(!batchMode)}
            className={styles.batchButton}
          />
          <Button
            label="↩ Undo"
            onClick={undoLast}
            variant="secondary"
            className={styles.undoButton}
          />
        </div>
      </div>

      {/* ── Status bar strip ───────────────────────────────────────────────── */}
      <div className={styles.statusRibbon}>
        {statuses.map((s) => (
          <span
            key={s}
            style={{
              backgroundColor: `${statusColors[s]}22`,
              border: `1px solid ${statusColors[s]}66`,
              color: statusColors[s],
            }}
            className={styles.statusBadge}
          >
            {statusLabels[s]} ({counts[s]})
          </span>
        ))}
      </div>

      {/* ── New-order sound overlay (fires immediately) ────────────────────── */}
      {activeSounds.length > 0 && (
        <div
          className={styles.soundContainer}
        >
          {activeSounds.map((id) => (
            <div
              key={id}
              role="button"
              tabIndex={0}
              onClick={() => { tryPlay('UklGRl9vT19XQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU9vT18='); squashSound(id); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { tryPlay(''); squashSound(id); } }}
              className={styles.soundButton}
            >
              🚨 NEW ORDER — Tap to dismiss
            </div>
          ))}
        </div>
      )}

      {/* ── Last action toast ───────────────────────────────────────────────── */}
      {lastAction && (
        <div className={styles.lastActionToast}>
          {lastAction}
        </div>
      )}

      {/* ── Tab bar ────────────────────────────────────────────────────────── */}
      <div className={styles.tabBar}>
        {(['kitchen', 'inventory'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`${styles.tabButton} ${activeTab === t ? styles.tabActive : styles.tabInactive}`}
          >
            {t === 'kitchen' ? '🔥 Kitchen' : '📦 Inventory'}
          </button>
        ))}
      </div>

      {/* ── KITCHEN TAB ───────────────────────────────────────────────────── */}
      {activeTab === 'kitchen' && (
        <>
          {/* Stats row */}
          <div className={styles.statsGrid}>
            {statuses.map((s) => (
              <div key={s} className={styles.statsCard}>
                <div style={{ color: statusColors[s] }} className={styles.statsCount}>{counts[s]}</div>
                <div className={styles.statsLabel}>{statusLabels[s]}</div>
              </div>
            ))}
          </div>

          {/* Batch grouping or flat list */}
          {groupedOrders ? (
            <>
              {statuses.map((s) => {
                const group = groupedOrders[s];
                if (!group?.length) return null;
                const overdue = group.filter((o) => s === 'preparing' && isDelayed(o)).length;
                return (
                  <div key={s} className={styles.batchSectionPadding}>
                    <div style={{ color: statusColors[s] }} className={styles.batchGroupHeader}>
                      <span style={{ backgroundColor: statusColors[s] }} className={styles.statusIndicator} />
                      {statusLabels[s]} — {group.length} orders
                      {overdue > 0 && <span className={styles.delayedWarning}>&#9888; {overdue} DELAYED</span>}
                    </div>
                    <div className={styles.ordersGrid}>
                      {group.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onAccept={() => accept(order.id)}
                          onStartPrep={() => startPrep(order.id)}
                          onReady={() => markReady(order.id)}
                          onDelay={() => markDelayed(order.id)}
                          onServed={() => served(order.id)}
                          onPark={() => setLastAction(`#${order.orderNumber} parked`)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className={styles.ordersGridPadded}>
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAccept={() => accept(order.id)}
                  onStartPrep={() => startPrep(order.id)}
                  onReady={() => markReady(order.id)}
                  onDelay={() => markDelayed(order.id)}
                  onServed={() => served(order.id)}
                  onPark={() => setLastAction(`#${order.orderNumber} parked`)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── INVENTORY TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'inventory' && (
        <div className={styles.inventoryContainer}>
          <div className={styles.inventoryHeader}>
            <h3 className={styles.inventoryTitle}>&#x1F4E6; Stock Levels</h3>
            <span className={styles.lowStockCount}>{inventory.filter((i) => i.inStock <= i.threshold).length} low</span>
          </div>
          <div className={styles.inventoryGrid}>
            {inventory.map((item) => {
              const pct = Math.min(100, (item.inStock / item.threshold) * 100);
              const isLow = item.inStock <= item.threshold;
              return (
                <div key={item.id} style={{ border: isLow ? '2px solid #ff4444' : '2px solid #333' }} className={styles.inventoryItem}>
                  <div className={styles.inventoryItemName}>{item.name}</div>
                  <div style={{ color: isLow ? '#ff4444' : '#4caf50' }} className={styles.inventoryItemCount}>
                    {item.inStock} <span className={styles.inventoryUnit}>units</span>
                  </div>
                  <div className={styles.inventoryThreshold}>
                    Threshold: {item.threshold}
                  </div>
                  <div style={{ background: isLow ? '#ff4444' : '#4caf50', opacity: 0.3 }} className={styles.stockProgressBar} />
                  <div style={{ width: `${pct}%`, background: isLow ? '#ff4444' : '#4caf50' }} className={styles.stockProgressFill} />
                  {isLow && (
                    <div className={styles.lowStockWarning}>
                      &#9888; LOW STOCK — Restock urgently
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add / deduct stock buttons */}
          <div className={styles.inventoryControls}>
            <Button
              label="+ Add Stock"
              onClick={() => setInventory((prev) => prev.map((i) => ({ ...i, inStock: i.inStock + 10 })))}
            />
            <Button
              label="− Use Stock"
              onClick={() => !confirm('Deduct 1 from all low-stock items?') || setInventory((prev) => prev.map((i) => ({ ...i, inStock: Math.max(0, i.inStock - 1) })))}
              variant="secondary"
            />
          </div>
        </div>
      )}

      {/* ── Bottom nav ─────────────────────────────────────────────────── */}
      <nav className={styles.navBar}>
           {[
              { key: 'kitchen', label: 'Kitchen', emoji: '🔥' },
              { key: 'inventory', label: 'Inventory', emoji: '📦' },
            ].map((t) => (
                 <div
                 key={t.key}
                  onClick={() => setActiveTab(t.key as 'kitchen' | 'inventory')}
                className={`${styles.navItem} ${activeTab === t.key ? styles.navItemActive : styles.navItemInactive}`}
               >
                <span className={styles.navIcon}>{t.emoji}</span>
                <span>{t.label}</span>
              </div>
            ))}
      </nav>

      {/* ── Pulse keyframes injected via style tag ── */}
      <style>{`
        @keyframes kdsPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}

// ── Order Card sub-component ─────────────────────────────────────────────────

interface OrderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  order: Order;
  onAccept: () => void;
  onStartPrep: () => void;
  onReady: () => void;
  onDelay: () => void;
  onServed: () => void;
  onPark: () => void;
}

const SERVICE_LABEL: Record<ServiceType, string> = {
  dine_in: 'DINE IN', 'dine-in': 'DINE IN', takeaway: 'TAKEAWAY', delivery: 'DELIVERY',
};
const SERVICE_COLOR: Record<ServiceType, string> = {
  dine_in: '#9c27b0', 'dine-in': '#9c27b0', takeaway: '#ff9800', delivery: '#2196f3',
};

function OrderCard({ order, onAccept, onStartPrep, onReady, onDelay, onServed, onPark }: OrderCardProps) {
  const mins = orderElapsed(order);
  const ots = (order.estPrepMins * 60000) - (mins * 60000);
  const delay = !!(order.status === 'preparing' && mins > order.estPrepMins);
  const progress = Math.min(100, Math.round((mins / order.estPrepMins) * 100));

  const serviceColor = SERVICE_COLOR[order.serviceType];
  const statusColorValue = getStatusColor(order.status);

  return (
    <div style={{ backgroundColor: delay ? '#3b1a1a' : '#2a2a4a', border: `2px solid ${delay ? '#ff4444' : statusColorValue}` }} className={styles.orderCard}>
      {/* Header */}
      <div className={styles.orderCardHeader}>
        <div>
          <div className={styles.orderNumber}>#{order.orderNumber}</div>
          <div className={styles.orderTime}>
            {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <span style={{ background: `${serviceColor}33`, color: serviceColor, border: `1px solid ${serviceColor}66` }} className={styles.serviceLabel}>
          {SERVICE_LABEL[order.serviceType]}
        </span>
      </div>

      {/* Diner / table */}
      {order.table && (
        <div className={styles.dinerInfo}>Guest: {order.diner} &middot; {order.table}</div>
      )}

      {/* Items */}
      <div className={styles.itemsList}>
        {order.items.map((item) => (
          <div key={item.id} className={styles.itemRow}>
            <span className={styles.itemQty}>{item.qty}x</span>
            <span className={styles.itemName}>{item.name}</span>
            {item.modifiers?.length ? (
              <span className={styles.itemModifiers}>&#x2022; {item.modifiers.join(', ')}</span>
            ) : null}
            {item.note && (
              <span className={styles.itemNote}>&#x1F4DD; {item.note}</span>
            )}
          </div>
        ))}
      </div>

      {/* Timer + delay ──── only when preparing or delayed */}
      {(order.status === 'preparing' || order.status === 'delayed') && (
        <div>
          <div className={styles.timerSection}>
            <span style={{ color: delay ? '#ff4444' : '#aaaaaa' }}>
              &#9200; {mins}m / ~{order.estPrepMins}m &nbsp;
              {delay && <span className={styles.delayBadge}>&#x26A0; DELAYED</span>}
              {!delay && <span>{ots > 0 ? `${Math.ceil(ots / 60000)}m left` : 'Nearing done'}</span>}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              style={{ width: `${Math.min(progress, 100)}%` }}
              className={`${styles.progressFill} ${delay ? styles.progressFillDelayed : styles.progressFillNormal}`}
            />
          </div>
        </div>
      )}

      {/* Action buttons ── transition through the workflow */}
      <div className={styles.actionButtons}>
        {order.status === 'new' && (
          <div className={styles.fullWidthButton}>
            <Button label="✓ Accept" onClick={onAccept} />
          </div>
        )}
        {order.status === 'accepted' && (
          <div className={styles.wideButton}>
            <Button label="⏱ Start Prep" onClick={onStartPrep} />
          </div>
        )}
        {order.status === 'preparing' && (
          <>
            {delay && <div className={styles.wideButton}><Button label="⏰ Still Cooking" onClick={onDelay} variant="secondary" /></div>}
            <div className={styles.fullWidthButton}><Button label="✓ Ready" onClick={onReady} /></div>
          </>
        )}
        {order.status === 'ready' && (
          <div className={styles.fullWidthButton}>
            <Button label="✅ Served" onClick={onServed} />
          </div>
        )}
        {(order.status === 'new' || order.status === 'accepted') && (
          <div className={styles.parkButton}>
            <Button
              label="✕ Park"
              onClick={onPark}
              variant="secondary"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusColor(s: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    new: '#f04e31', accepted: '#ff9800', preparing: '#2196f3',
    ready: '#4caf50', delayed: '#ff4444', completed: '#444', pickedup: '#ff9800', delivered: '#4caf50',
    cancelled: '#888',
  };
  return colors[s];
}