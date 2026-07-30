import { useEffect, useReducer, useMemo } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '@spicegarden/ui';
import { useQuery } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import styles from './index.module.css';

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
type Tab = 'kitchen' | 'inventory';

type DashboardState = {
  orders: Order[];
  batchMode: boolean;
  inventory: InventoryItem[];
  activeTab: Tab;
  audioEnabled: boolean;
  activeSounds: string[];
  lastAction: string;
};

type DashboardAction =
  | { type: 'order-received'; order: Order }
  | { type: 'orders-loaded'; orders: Order[] }
  | { type: 'order-transitioned'; orderId: string; status: OrderStatus }
  | { type: 'inventory-loaded'; inventory: InventoryItem[] }
  | { type: 'inventory-alert'; item: InventoryItem }
  | { type: 'inventory-stock-added'; amount: number }
  | { type: 'low-stock-used'; amount: number }
  | { type: 'active-tab-changed'; tab: Tab }
  | { type: 'batch-mode-toggled' }
  | { type: 'audio-toggled' }
  | { type: 'active-sound-added'; id: string }
  | { type: 'active-sound-dismissed'; id: string }
  | { type: 'last-action-set'; message: string }
  | { type: 'last-action-cleared' };

const statuses: OrderStatus[] = ['new', 'accepted', 'preparing', 'ready', 'delayed', 'completed'];
const statusLabels = {
  new: 'NEW', accepted: 'ACKD', preparing: 'COOKING', ready: 'READY', delayed: 'DELAYED', completed: 'DONE', pickedup: 'PICKED', delivered: 'DONE', cancelled: 'CANCELLED',
} as const satisfies Record<OrderStatus, string>;

const tryPlay = (base64: string) => {
  const el = new Audio(`data:audio/wav;base64,${base64}`);
  el.play().catch(() => null);
};

const now = () => new Date();

function createInitialState(): DashboardState {
  return {
    orders: [],
    batchMode: false,
    inventory: [],
    activeTab: 'kitchen',
    audioEnabled: true,
    activeSounds: [],
    lastAction: '',
  };
}

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'order-received': {
      const order = normalizeOrder(action.order);
      return {
        ...state,
        orders: [order, ...state.orders],
        lastAction: `New order #${order.orderNumber} received`,
      };
    }
    case 'orders-loaded':
      return { ...state, orders: action.orders.map(normalizeOrder) };
    case 'order-transitioned':
      return {
        ...state,
        orders: updateOrderStatus(state.orders, action.orderId, action.status),
        lastAction: `Order #${action.orderId.slice(-6)} → ${action.status.toUpperCase()}`,
      };
    case 'inventory-loaded':
      return { ...state, inventory: action.inventory };
    case 'inventory-alert':
      return {
        ...state,
        inventory: state.inventory.map((item) => item.id === action.item.id ? { ...item, inStock: Math.max(0, item.inStock - 1) } : item),
      };
    case 'inventory-stock-added':
      return { ...state, inventory: state.inventory.map((item) => ({ ...item, inStock: item.inStock + action.amount })) };
    case 'low-stock-used':
      return {
        ...state,
        inventory: state.inventory.map((item) => item.inStock <= item.threshold ? { ...item, inStock: Math.max(0, item.inStock - action.amount) } : item),
      };
    case 'active-tab-changed':
      return { ...state, activeTab: action.tab };
    case 'batch-mode-toggled':
      return { ...state, batchMode: !state.batchMode };
    case 'audio-toggled':
      return { ...state, audioEnabled: !state.audioEnabled };
    case 'active-sound-added':
      return { ...state, activeSounds: [...state.activeSounds, action.id] };
    case 'active-sound-dismissed':
      return { ...state, activeSounds: state.activeSounds.filter((x) => x !== action.id) };
    case 'last-action-set':
      return { ...state, lastAction: action.message };
    case 'last-action-cleared':
      return { ...state, lastAction: '' };
    default:
      return state;
  }
}

function elapsedMins(startedAt: Date) {
  return Math.max(0, Math.floor((+now() - +startedAt) / 60000));
}

function orderElapsed(order: Order) {
  return order.prepStartedAt ? elapsedMins(order.prepStartedAt) : 0;
}

function isDelayed(order: Order) {
  return order.status === 'preparing' && orderElapsed(order) > order.estPrepMins;
}

function normalizeOrder(order: Order): Order {
  const createdAt = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt as unknown as string | number);
  return {
    ...order,
    createdAt: Number.isNaN(+createdAt) ? now() : createdAt,
  };
}

function updateOrderStatus(orders: Order[], orderId: string, status: OrderStatus) {
  return orders.map((order) => {
    if (order.id !== orderId) return order;
    const updated: Order = { ...order, status };
    if (status === 'preparing') updated.prepStartedAt = now();
    if (status === 'ready') updated.prepStartedAt = undefined;
    return updated;
  });
}

export default function KitchenDashboard() {
  const [state, dispatch] = useReducer(dashboardReducer, undefined, createInitialState);

  const { data } = useQuery({
    queryKey: ['dashboard-initial'],
    queryFn: async () => {
      const [ordersRes, inventoryRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/inventory?lowStock=true'),
      ]);
      const orders = ordersRes.ok ? await ordersRes.json() : [];
      const inventory = inventoryRes.ok ? await inventoryRes.json() : [];
      return { orders, inventory };
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      dispatch({ type: 'orders-loaded', orders: data.orders });
      dispatch({ type: 'inventory-loaded', inventory: data.inventory });
    }
  }, [data, dispatch]);

  useEffect(() => {
    let cancelled = false;
    let socket: Socket | null = null;

    import('socket.io-client').then(({ io }) => {
      if (cancelled) return;
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
      socket = io(socketUrl, {
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {});
      socket.on('disconnect', () => {});
      socket.on('newOrder', (order: Order) => dispatch({ type: 'order-received', order }));
      socket.on('inventoryAlert', (item: InventoryItem) => dispatch({ type: 'inventory-alert', item }));
    });

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, []);

  const transition = (orderId: string, status: OrderStatus) => {
    dispatch({ type: 'order-transitioned', orderId, status });
  };

  const accept = (id: string) => transition(id, 'accepted');
  const startPrep = (id: string) => transition(id, 'preparing');
  const markReady = (id: string) => transition(id, 'ready');
  const markDelayed = (id: string) => transition(id, 'delayed');
  const served = (id: string) => transition(id, 'completed');

  const counts = useMemo(() => Object.fromEntries(statuses.map((s) => [s, state.orders.filter((order) => order.status === s).length])) as Record<OrderStatus, number>, [state.orders]);

  return (
    <div className={`${styles.kdsRoot} ${styles.rootContainer}`}>
      <DashboardHeader
        orderCount={state.orders.length}
        batchMode={state.batchMode}
        audioEnabled={state.audioEnabled}
        activeSoundCount={state.activeSounds.length}
        onToggleBatch={() => dispatch({ type: 'batch-mode-toggled' })}
        onToggleAudio={() => dispatch({ type: 'audio-toggled' })}
        onDismissSound={() => dispatch({ type: 'active-sound-dismissed', id: 'toggle' })}
        onUndo={() => dispatch({ type: 'last-action-cleared' })}
      />

      <StatusRibbon counts={counts} />

      <SoundOverlay activeSounds={state.activeSounds} />

      {state.lastAction && (
        <div className={styles.lastActionToast}>
          {state.lastAction}
        </div>
      )}

      <TabBar activeTab={state.activeTab} onTabChange={(tab) => dispatch({ type: 'active-tab-changed', tab })} />

      {state.activeTab === 'kitchen' && (
        <KitchenOrdersView
          orders={state.orders}
          batchMode={state.batchMode}
          counts={counts}
          onAccept={accept}
          onStartPrep={startPrep}
          onReady={markReady}
          onDelay={markDelayed}
          onServed={served}
          onPark={(orderNumber) => dispatch({ type: 'last-action-set', message: `#${orderNumber} parked` })}
        />
      )}

      {state.activeTab === 'inventory' && (
        <InventoryView
          inventory={state.inventory}
          onAddStock={() => dispatch({ type: 'inventory-stock-added', amount: 10 })}
          onUseLowStock={() => {
            if (confirm('Deduct 1 from all low-stock items?')) {
              dispatch({ type: 'low-stock-used', amount: 1 });
            }
          }}
        />
      )}

      <BottomNav activeTab={state.activeTab} onTabChange={(tab) => dispatch({ type: 'active-tab-changed', tab })} />

      <style>{`
        @keyframes kdsPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}

function DashboardHeader({
  orderCount,
  batchMode,
  audioEnabled,
  activeSoundCount,
  onToggleBatch,
  onToggleAudio,
  onDismissSound,
  onUndo,
}: {
  orderCount: number;
  batchMode: boolean;
  audioEnabled: boolean;
  activeSoundCount: number;
  onToggleBatch: () => void;
  onToggleAudio: () => void;
  onDismissSound: () => void;
  onUndo: () => void;
}) {
  return (
    <div className={styles.headerBar}>
      <h1 className={styles.headerTitle}>🔥 KITCHEN DISPLAY</h1>
      <div className={styles.headerControls}>
        <button
          type="button"
          onClick={() => audioEnabled ? onDismissSound() : onToggleAudio()}
          title={audioEnabled ? 'Mute alerts' : 'Unmute alerts'}
          className={`${styles.audioToggleButton} ${audioEnabled ? styles.unmutedButton : styles.mutedButton}`}
        >
          {audioEnabled ? '🔊' : '🔇'}
        </button>
        <div className={styles.orderCountBadge}>
          {orderCount} orders{activeSoundCount > 0 ? ` · ${activeSoundCount} alert${activeSoundCount === 1 ? '' : 's'}` : ''}
        </div>
        <Button label={batchMode ? '□ Batch' : '⊞ Batch'} onClick={onToggleBatch} className={styles.batchButton} />
        <Button label="↩ Undo" onClick={onUndo} variant="secondary" className={styles.undoButton} />
      </div>
    </div>
  );
}

function StatusRibbon({ counts }: { counts: Record<OrderStatus, number> }) {
  return (
    <div className={styles.statusRibbon}>
      {statuses.map((status) => (
        <span key={status} className={`${styles.statusBadge} ${styles[`statusBadge${statusClassSuffix(status)}`]}`}>
          {statusLabels[status]} ({counts[status]})
        </span>
      ))}
    </div>
  );
}

function SoundOverlay({ activeSounds }: { activeSounds: string[] }) {
  if (activeSounds.length === 0) return null;

  return (
    <div className={styles.soundContainer}>
      {activeSounds.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => { tryPlay('UklGRl9vT19XQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU9vT18='); }}
          className={styles.soundButton}
        >
          🚨 NEW ORDER — Tap to dismiss
        </button>
      ))}
    </div>
  );
}

function TabBar({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  return (
    <div className={styles.tabBar}>
      {(['kitchen', 'inventory'] as const).map((tab) => (
        <button
          type="button"
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`${styles.tabButton} ${activeTab === tab ? styles.tabActive : styles.tabInactive}`}
        >
          {tab === 'kitchen' ? '🔥 Kitchen' : '📦 Inventory'}
        </button>
      ))}
    </div>
  );
}

function KitchenOrdersView({
  orders,
  batchMode,
  counts,
  onAccept,
  onStartPrep,
  onReady,
  onDelay,
  onServed,
  onPark,
}: {
  orders: Order[];
  batchMode: boolean;
  counts: Record<OrderStatus, number>;
  onAccept: (id: string) => void;
  onStartPrep: (id: string) => void;
  onReady: (id: string) => void;
  onDelay: (id: string) => void;
  onServed: (id: string) => void;
  onPark: (orderNumber: string) => void;
}) {
  return (
    <>
      <StatsRow counts={counts} />
      {batchMode ? (
        <BatchOrderSections
          orders={orders}
          onAccept={onAccept}
          onStartPrep={onStartPrep}
          onReady={onReady}
          onDelay={onDelay}
          onServed={onServed}
          onPark={onPark}
        />
      ) : (
        <FlatOrderGrid orders={orders} onAccept={onAccept} onStartPrep={onStartPrep} onReady={onReady} onDelay={onDelay} onServed={onServed} onPark={onPark} />
      )}
    </>
  );
}

function StatsRow({ counts }: { counts: Record<OrderStatus, number> }) {
  return (
    <div className={styles.statsGrid}>
      {statuses.map((status) => (
        <div key={status} className={styles.statsCard}>
          <div className={`${styles.statsCount} ${styles[`statsCount${statusClassSuffix(status)}`]}`}>{counts[status]}</div>
          <div className={styles.statsLabel}>{statusLabels[status]}</div>
        </div>
      ))}
    </div>
  );
}

function BatchOrderSections({
  orders,
  onAccept,
  onStartPrep,
  onReady,
  onDelay,
  onServed,
  onPark,
}: {
  orders: Order[];
  onAccept: (id: string) => void;
  onStartPrep: (id: string) => void;
  onReady: (id: string) => void;
  onDelay: (id: string) => void;
  onServed: (id: string) => void;
  onPark: (orderNumber: string) => void;
}) {
  return (
    <>
      {statuses.map((status) => {
        const group = orders.filter((order) => order.status === status);
        if (group.length === 0) return null;
        const overdue = group.filter((order) => status === 'preparing' && isDelayed(order)).length;
        return (
          <div key={status} className={styles.batchSectionPadding}>
            <div className={`${styles.batchGroupHeader} ${styles[`batchGroupHeader${statusClassSuffix(status)}`]}`}>
              <span className={styles.statusIndicator} />
              <span>
                {statusLabels[status]} — {group.length} orders
              </span>
              {overdue > 0 && <span className={styles.delayedWarning}>&#9888; {overdue} DELAYED</span>}
            </div>
            <div className={styles.ordersGrid}>
              {group.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAccept={() => onAccept(order.id)}
                  onStartPrep={() => onStartPrep(order.id)}
                  onReady={() => onReady(order.id)}
                  onDelay={() => onDelay(order.id)}
                  onServed={() => onServed(order.id)}
                  onPark={() => onPark(order.orderNumber)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

function FlatOrderGrid({
  orders,
  onAccept,
  onStartPrep,
  onReady,
  onDelay,
  onServed,
  onPark,
}: {
  orders: Order[];
  onAccept: (id: string) => void;
  onStartPrep: (id: string) => void;
  onReady: (id: string) => void;
  onDelay: (id: string) => void;
  onServed: (id: string) => void;
  onPark: (orderNumber: string) => void;
}) {
  return (
    <div className={styles.ordersGridPadded}>
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onAccept={() => onAccept(order.id)}
          onStartPrep={() => onStartPrep(order.id)}
          onReady={() => onReady(order.id)}
          onDelay={() => onDelay(order.id)}
          onServed={() => onServed(order.id)}
          onPark={() => onPark(order.orderNumber)}
        />
      ))}
    </div>
  );
}

function InventoryView({
  inventory,
  onAddStock,
  onUseLowStock,
}: {
  inventory: InventoryItem[];
  onAddStock: () => void;
  onUseLowStock: () => void;
}) {
  return (
    <div className={styles.inventoryContainer}>
      <div className={styles.inventoryHeader}>
        <h3 className={styles.inventoryTitle}>📦 Stock Levels</h3>
        <span className={styles.lowStockCount}>{inventory.filter((item) => item.inStock <= item.threshold).length} low</span>
      </div>
      <div className={styles.inventoryGrid}>
        {inventory.map((item) => {
          const pct = Math.min(100, (item.inStock / item.threshold) * 100);
          const isLow = item.inStock <= item.threshold;
          const stockWidthClassName = stockWidthClass(pct);
          return (
            <div key={item.id} className={`${styles.inventoryItem} ${isLow ? styles.inventoryItemLow : styles.inventoryItemNormal}`}>
              <div className={styles.inventoryItemName}>{item.name}</div>
              <div className={`${styles.inventoryItemCount} ${isLow ? styles.inventoryItemCountLow : styles.inventoryItemCountNormal}`}>
                {item.inStock} <span className={styles.inventoryUnit}>units</span>
              </div>
              <div className={styles.inventoryThreshold}>
                Threshold: {item.threshold}
              </div>
              <div className={styles.stockProgressBar} />
              <div className={`${styles.stockProgressFill} ${stockWidthClassName}`} />
              {isLow && (
                <div className={styles.lowStockWarning}>
                  &#9888; LOW STOCK — Restock urgently
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.inventoryControls}>
        <Button label="+ Add Stock" onClick={onAddStock} />
        <Button label="− Use Stock" onClick={onUseLowStock} variant="secondary" />
      </div>
    </div>
  );
}

const bottomNavItems: { key: Tab; label: string; emoji: string }[] = [
  { key: 'kitchen', label: 'Kitchen', emoji: '🔥' },
  { key: 'inventory', label: 'Inventory', emoji: '📦' },
];

function BottomNav({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  return (
    <nav className={styles.navBar}>
      {bottomNavItems.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`${styles.navItem} ${activeTab === tab.key ? styles.navItemActive : styles.navItemInactive}`}
        >
          <span className={styles.navIcon}>{tab.emoji}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

interface OrderCardProps extends HTMLAttributes<HTMLDivElement> {
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

function statusClassSuffix(status: OrderStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function serviceClassSuffix(serviceType: ServiceType): string {
  if (serviceType === 'dine-in' || serviceType === 'dine_in') return 'DineIn';
  return serviceType.charAt(0).toUpperCase() + serviceType.slice(1);
}

function progressWidthClass(value: number): string {
  const bucket = Math.round(Math.min(value, 100) / 5) * 5;
  return styles[`progressFill${bucket}`];
}

function stockWidthClass(value: number): string {
  const bucket = Math.round(Math.min(value, 100) / 5) * 5;
  return styles[`stockProgressFill${bucket}`];
}

function OrderCard({ order, onAccept, onStartPrep, onReady, onDelay, onServed, onPark }: OrderCardProps) {
  const mins = orderElapsed(order);
  const ots = (order.estPrepMins * 60000) - (mins * 60000);
  const delay = !!(order.status === 'preparing' && mins > order.estPrepMins);
  const progress = Math.min(100, Math.round((mins / order.estPrepMins) * 100));

  const orderCardClassName = `${styles.orderCard} ${delay ? styles.orderCardDelayed : styles[`orderCard${statusClassSuffix(order.status)}`]}`;
  const serviceLabelClassName = `${styles.serviceLabel} ${styles[`serviceLabel${serviceClassSuffix(order.serviceType)}`]}`;
  const progressWidthClassName = progressWidthClass(progress);

  return (
    <div className={orderCardClassName}>
      <div className={styles.orderCardHeader}>
        <div>
          <div className={styles.orderNumber}>#{order.orderNumber}</div>
          <div className={styles.orderTime}>
            {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <span className={serviceLabelClassName}>
          {SERVICE_LABEL[order.serviceType]}
        </span>
      </div>

      {order.table && (
        <div className={styles.dinerInfo}>Guest: {order.diner} &middot; {order.table}</div>
      )}

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

      {(order.status === 'preparing' || order.status === 'delayed') && (
        <div>
          <div className={styles.timerSection}>
            <span className={delay ? styles.timerDelay : styles.timerNormal}>
              &#9200; {mins}m / ~{order.estPrepMins}m &nbsp;
              {delay && <span className={styles.delayBadge}>&#x26A0; DELAYED</span>}
              {!delay && <span>{ots > 0 ? `${Math.ceil(ots / 60000)}m left` : 'Nearing done'}</span>}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div className={`${styles.progressFill} ${delay ? styles.progressFillDelayed : styles.progressFillNormal} ${progressWidthClassName}`} />
          </div>
        </div>
      )}

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
            <Button label="✕ Park" onClick={onPark} variant="secondary" />
          </div>
        )}
      </div>
    </div>
  );
}
