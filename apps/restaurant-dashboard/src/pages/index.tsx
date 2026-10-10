import React, { useState, useEffect, useReducer, useMemo } from 'react';
import Head from 'next/head';
import {
  Flame,
  Volume2,
  VolumeX,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Layers,
  ShoppingBag,
  Utensils,
  ChevronRight,
  X,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import styles from './index.module.css';

type OrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
type ServiceType = 'delivery' | 'dine-in' | 'takeaway';

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  modifiers?: string[];
  note?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  diner: string;
  table?: string;
  serviceType: ServiceType;
  items: OrderItem[];
  createdAt: Date;
  status: OrderStatus;
  estPrepMins: number;
  prepStartedAt?: Date;
}

interface InventoryItem {
  id: string;
  name: string;
  inStock: number;
  threshold: number;
  unit: string;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'SG-849201',
    diner: 'Arjun Mehta',
    table: 'Sector 17 Delivery',
    serviceType: 'delivery',
    items: [
      { id: 'i1', name: 'Special Handi Chicken Biryani', qty: 2, modifiers: ['Extra Spicy', 'Mint Raita'] },
      { id: 'i2', name: 'Garlic Butter Naan (Clay Oven)', qty: 3 },
    ],
    createdAt: new Date(Date.now() - 4 * 60000),
    status: 'preparing',
    prepStartedAt: new Date(Date.now() - 4 * 60000),
    estPrepMins: 15,
  },
  {
    id: 'ord-102',
    orderNumber: 'SG-849202',
    diner: 'Table 4 (Dine-In)',
    table: 'Table 4',
    serviceType: 'dine-in',
    items: [
      { id: 'i3', name: 'Mughlai Butter Chicken Boneless', qty: 1, modifiers: ['Mild Spicy'] },
      { id: 'i4', name: 'Dal Makhani Slow-Simmered', qty: 1, note: 'Extra Butter on top' },
      { id: 'i5', name: 'Tandoori Roti', qty: 4 },
    ],
    createdAt: new Date(Date.now() - 1 * 60000),
    status: 'new',
    estPrepMins: 18,
  },
  {
    id: 'ord-103',
    orderNumber: 'SG-849199',
    diner: 'Simran Kaur (Pickup)',
    table: 'Takeaway Counter',
    serviceType: 'takeaway',
    items: [
      { id: 'i6', name: 'Artisan Burrata Truffle Pizza', qty: 1, note: 'Cut into 6 slices' },
      { id: 'i7', name: 'Kesar Pista Rasmalai Bowl', qty: 2 },
    ],
    createdAt: new Date(Date.now() - 14 * 60000),
    status: 'ready',
    estPrepMins: 12,
  },
  {
    id: 'ord-104',
    orderNumber: 'SG-849195',
    diner: 'Rohan Sharma',
    table: 'Phase 8 Mohali',
    serviceType: 'delivery',
    items: [
      { id: 'i8', name: 'Double Truffle Smash Burger', qty: 2, modifiers: ['Extra Cheese'] },
      { id: 'i9', name: 'Loaded Peri Peri Fries', qty: 1 },
    ],
    createdAt: new Date(Date.now() - 25 * 60000),
    status: 'completed',
    estPrepMins: 15,
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', name: 'Basmati Rice (Aged Biryani Grade)', inStock: 45, threshold: 20, unit: 'kg' },
  { id: 'inv-2', name: 'Fresh Boneless Chicken Thighs', inStock: 18, threshold: 15, unit: 'kg' },
  { id: 'inv-3', name: 'Pure White Amul Butter', inStock: 4, threshold: 10, unit: 'kg' },
  { id: 'inv-4', name: 'Fresh Dairy Paneer Blocks', inStock: 6, threshold: 12, unit: 'kg' },
  { id: 'inv-5', name: 'Sourdough Pizza Dough Balls', inStock: 28, threshold: 15, unit: 'pcs' },
  { id: 'inv-6', name: 'Saffron (Kesar) Strands', inStock: 12, threshold: 5, unit: 'gm' },
];

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'preparing' | 'ready' | 'inventory'>('all');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newDiner, setNewDiner] = useState('Table 2');
  const [newServiceType, setNewServiceType] = useState<ServiceType>('dine-in');
  const [newDishName, setNewDishName] = useState('Special Handi Chicken Biryani');
  const [newDishQty, setNewDishQty] = useState(1);

  // Digital live clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const counts = useMemo(() => {
    return {
      all: orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length,
      new: orders.filter((o) => o.status === 'new').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      ready: orders.filter((o) => o.status === 'ready').length,
      completed: orders.filter((o) => o.status === 'completed').length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
    if (activeTab === 'new') return orders.filter((o) => o.status === 'new');
    if (activeTab === 'preparing') return orders.filter((o) => o.status === 'preparing');
    if (activeTab === 'ready') return orders.filter((o) => o.status === 'ready');
    return [];
  }, [orders, activeTab]);

  const updateOrderStatus = (id: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const updated = { ...o, status: nextStatus };
        if (nextStatus === 'preparing') updated.prepStartedAt = new Date();
        return updated;
      })
    );
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrd: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `SG-${Math.floor(100000 + Math.random() * 900000)}`,
      diner: newDiner,
      table: newDiner,
      serviceType: newServiceType,
      items: [{ id: `i-${Date.now()}`, name: newDishName, qty: newDishQty }],
      createdAt: new Date(),
      status: 'new',
      estPrepMins: 15,
    };
    setOrders((prev) => [newOrd, ...prev]);
    setShowNewOrderModal(false);
  };

  const handleAdjustStock = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inStock: Math.max(0, item.inStock + delta) } : item))
    );
  };

  const getElapsedMins = (order: Order) => {
    const start = order.prepStartedAt || order.createdAt;
    return Math.max(0, Math.floor((Date.now() - new Date(start).getTime()) / 60000));
  };

  return (
    <div className={styles.rootContainer}>
      <Head>
        <title>SpiceGarden | Kitchen Display &amp; POS Station</title>
      </Head>

      {/* Top Header */}
      <header className={styles.headerBar}>
        <div className={styles.brandGroup}>
          <h1 className={styles.headerTitle}>
            <Flame size={22} color="#FF5A1F" />
            <span>KITCHEN COMMAND</span>
          </h1>
          <div className={styles.branchStatusBadge}>
            <div className={styles.statusDot} />
            <span>Kitchen #1 (Online)</span>
          </div>
        </div>

        <div className={styles.clockDisplay}>{currentTime || '12:00:00 PM'}</div>

        <div className={styles.headerControls}>
          <button
            type="button"
            className={styles.newOrderBtn}
            onClick={() => setShowNewOrderModal(true)}
          >
            <Plus size={16} /> + New Order
          </button>

          <button
            type="button"
            className={`${styles.controlBtn} ${audioEnabled ? styles.controlBtnActive : ''}`}
            onClick={() => setAudioEnabled((prev) => !prev)}
            title={audioEnabled ? 'Mute Kitchen Bell' : 'Unmute Kitchen Bell'}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{audioEnabled ? 'Sound ON' : 'Muted'}</span>
          </button>
        </div>
      </header>

      {/* Filter & Secondary Tabs */}
      <div className={styles.filterTabBar}>
        <div className={styles.tabGroup}>
          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'all' ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span>Live Kitchen</span>
            <span className={styles.tabCountBadge}>{counts.all}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'new' ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab('new')}
          >
            <span>New Incoming</span>
            <span className={styles.tabCountBadge}>{counts.new}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'preparing' ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab('preparing')}
          >
            <span>Cooking Now</span>
            <span className={styles.tabCountBadge}>{counts.preparing}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'ready' ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab('ready')}
          >
            <span>Ready for Pickup</span>
            <span className={styles.tabCountBadge}>{counts.ready}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'inventory' ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Package size={14} />
            <span>Pantry Inventory</span>
            <span className={styles.tabCountBadge}>{inventory.filter((i) => i.inStock <= i.threshold).length} low</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* KPI Overview Grid */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div>
              <div className={styles.kpiLabel}>INCOMING NEW</div>
              <div className={styles.kpiValue} style={{ color: '#FF5A1F' }}>{counts.new}</div>
            </div>
            <div className={styles.kpiIconWrapper} style={{ background: 'rgba(255,90,31,0.15)', color: '#FF5A1F' }}>
              <AlertCircle size={20} />
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div>
              <div className={styles.kpiLabel}>ON STOVE / PREP</div>
              <div className={styles.kpiValue} style={{ color: '#3B82F6' }}>{counts.preparing}</div>
            </div>
            <div className={styles.kpiIconWrapper} style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}>
              <Flame size={20} />
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div>
              <div className={styles.kpiLabel}>READY AT PASS</div>
              <div className={styles.kpiValue} style={{ color: '#10B981' }}>{counts.ready}</div>
            </div>
            <div className={styles.kpiIconWrapper} style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
              <CheckCircle size={20} />
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div>
              <div className={styles.kpiLabel}>SERVED TODAY</div>
              <div className={styles.kpiValue} style={{ color: '#94A3B8' }}>{counts.completed}</div>
            </div>
            <div className={styles.kpiIconWrapper} style={{ background: 'rgba(148,163,184,0.15)', color: '#94A3B8' }}>
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        {/* Live Orders View */}
        {activeTab !== 'inventory' && (
          <div className={styles.ordersGrid}>
            {filteredOrders.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', color: '#64748B' }}>
                <CheckCircle size={40} color="#10B981" style={{ marginBottom: 12 }} />
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: 18, fontWeight: 700 }}>No active orders in this queue</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13 }}>All kitchen tickets are up to date and dispatched.</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const elapsed = getElapsedMins(order);
                const isDelayed = order.status === 'preparing' && elapsed > order.estPrepMins;
                const progressPct = Math.min(100, Math.round((elapsed / order.estPrepMins) * 100));

                return (
                  <div
                    key={order.id}
                    className={`${styles.orderCard} ${
                      isDelayed
                        ? styles.orderCardDelayed
                        : order.status === 'new'
                        ? styles.orderCardNew
                        : order.status === 'preparing'
                        ? styles.orderCardCooking
                        : styles.orderCardReady
                    }`}
                  >
                    {/* Header */}
                    <div className={styles.orderCardHeader}>
                      <div>
                        <h2 className={styles.orderNumber}>#{order.orderNumber}</h2>
                        <p className={styles.orderTimeAgo}>
                          {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({elapsed}m ago)
                        </p>
                      </div>

                      <span
                        className={`${styles.serviceBadge} ${
                          order.serviceType === 'delivery'
                            ? styles.serviceDelivery
                            : order.serviceType === 'dine-in'
                            ? styles.serviceDineIn
                            : styles.serviceTakeaway
                        }`}
                      >
                        {order.serviceType === 'delivery' ? '🛵 DELIVERY' : order.serviceType === 'dine-in' ? '🍽️ DINE-IN' : '🛍️ TAKEAWAY'}
                      </span>
                    </div>

                    {/* Diner Info */}
                    <div className={styles.dinerRow}>
                      <Utensils size={14} color="#94A3B8" />
                      <span>{order.diner}</span>
                    </div>

                    {/* Items List */}
                    <div className={styles.itemsContainer}>
                      {order.items.map((item) => (
                        <div key={item.id} className={styles.itemRow}>
                          <div className={styles.itemTop}>
                            <span className={styles.itemName}>
                              <span className={styles.itemQty}>{item.qty}x</span> {item.name}
                            </span>
                          </div>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <p className={styles.itemModifier}>+ {item.modifiers.join(', ')}</p>
                          )}
                          {item.note && <p className={styles.itemNote}>📝 {item.note}</p>}
                        </div>
                      ))}
                    </div>

                    {/* Prep Progress */}
                    {order.status === 'preparing' && (
                      <div className={styles.timerSection}>
                        <div className={styles.timerHeader}>
                          <span style={{ color: isDelayed ? '#EF4444' : '#60A5FA' }}>
                            ⏱ Prep: {elapsed}m / ~{order.estPrepMins}m
                          </span>
                          {isDelayed ? (
                            <span style={{ color: '#EF4444' }}>⚠️ DELAYED</span>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>{Math.max(0, order.estPrepMins - elapsed)}m left</span>
                          )}
                        </div>
                        <div className={styles.timerProgressTrack}>
                          <div
                            className={`${styles.timerProgressBar} ${isDelayed ? styles.timerProgressBarDelayed : ''}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className={styles.actionBar}>
                      {order.status === 'new' && (
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.btnAccept}`}
                          onClick={() => updateOrderStatus(order.id, 'accepted')}
                        >
                          ✓ Accept Order
                        </button>
                      )}

                      {order.status === 'accepted' && (
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.btnStartPrep}`}
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                        >
                          ⏱ Start Cooking
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.btnReady}`}
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                          >
                            ✓ Mark Ready
                          </button>
                          {isDelayed && (
                            <button
                              type="button"
                              className={`${styles.actionBtn} ${styles.btnDelay}`}
                              onClick={() => {
                                setOrders((prev) =>
                                  prev.map((o) => (o.id === order.id ? { ...o, estPrepMins: o.estPrepMins + 5 } : o))
                                );
                              }}
                            >
                              +5m Delay
                            </button>
                          )}
                        </>
                      )}

                      {order.status === 'ready' && (
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.btnReady}`}
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                        >
                          ✅ Hand Over &amp; Clear
                        </button>
                      )}

                      {order.status === 'new' && (
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.btnPark}`}
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          title="Reject ticket"
                        >
                          ✕ Reject
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Inventory View Tab */}
        {activeTab === 'inventory' && (
          <div className={styles.inventoryCard}>
            <div className={styles.inventoryTopRow}>
              <h2 className={styles.inventoryTitle}>
                <Package size={20} color="#FF5A1F" />
                <span>Pantry &amp; Kitchen Raw Ingredients</span>
              </h2>
              <button
                type="button"
                className={styles.newOrderBtn}
                onClick={() => {
                  setInventory((prev) => prev.map((item) => ({ ...item, inStock: item.threshold + 20 })));
                  alert('⚡ Restocked all pantry items above safety threshold!');
                }}
              >
                Restock All Items
              </button>
            </div>

            <table className={styles.inventoryTable}>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th>Safety Threshold</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Quick Adjust</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const isLow = item.inStock <= item.threshold;
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700, color: '#0F172A' }}>{item.name}</td>
                      <td style={{ color: '#64748B' }}>{item.threshold} {item.unit}</td>
                      <td>
                        <span className={`${styles.stockCountBadge} ${isLow ? styles.stockLow : styles.stockNormal}`}>
                          {item.inStock} {item.unit}
                        </span>
                      </td>
                      <td>
                        {isLow ? (
                          <span style={{ color: '#EF4444', fontWeight: 700, fontSize: 12, background: 'rgba(239,68,68,0.12)', padding: '3px 8px', borderRadius: 6 }}>
                            ⚠️ LOW STOCK
                          </span>
                        ) : (
                          <span style={{ color: '#059669', fontWeight: 700, fontSize: 12, background: 'rgba(16,185,129,0.12)', padding: '3px 8px', borderRadius: 6 }}>
                            ✓ Adequate
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            className={styles.stockStepperBtn}
                            onClick={() => handleAdjustStock(item.id, -1)}
                            title="Deduct 1 unit"
                          >
                            −
                          </button>
                          <button
                            type="button"
                            className={styles.stockStepperBtn}
                            onClick={() => handleAdjustStock(item.id, 5)}
                            title="Add 5 units"
                            style={{ background: '#FF5A1F', borderColor: '#FF5A1F', color: '#FFF' }}
                          >
                            +5
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* New Order Creation Modal */}
      {showNewOrderModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>Create Offline / Dine-In Order</h3>
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Table / Customer Reference</label>
                <input
                  type="text"
                  required
                  value={newDiner}
                  onChange={(e) => setNewDiner(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Order Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['dine-in', 'takeaway', 'delivery'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewServiceType(type)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: newServiceType === type ? '1.5px solid #FF5A1F' : '1px solid #E2E8F0',
                        background: newServiceType === type ? '#FF5A1F' : '#F1F5F9',
                        color: newServiceType === type ? '#FFFFFF' : '#475569',
                        fontWeight: 700,
                        fontSize: 12,
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Dish Item</label>
                <select
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: 14 }}
                >
                  <option>Special Handi Chicken Biryani</option>
                  <option>Mughlai Butter Chicken Boneless</option>
                  <option>Dal Makhani Slow-Simmered</option>
                  <option>Artisan Burrata Truffle Pizza</option>
                  <option>Double Truffle Smash Burger</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: '#FF5A1F', border: 'none', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Send to Kitchen Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
