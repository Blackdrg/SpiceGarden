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
              <div className={`${styles.kpiValue} ${styles.kpiValueOrange}`}>{counts.new}</div>
            </div>
            <div className={`${styles.kpiIconWrapper} ${styles.kpiIconOrange}`}>
              <AlertCircle size={20} />
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div>
              <div className={styles.kpiLabel}>ON STOVE / PREP</div>
              <div className={`${styles.kpiValue} ${styles.kpiValueBlue}`}>{counts.preparing}</div>
            </div>
            <div className={`${styles.kpiIconWrapper} ${styles.kpiIconBlue}`}>
              <Flame size={20} />
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div>
              <div className={styles.kpiLabel}>READY AT PASS</div>
              <div className={`${styles.kpiValue} ${styles.kpiValueGreen}`}>{counts.ready}</div>
            </div>
            <div className={`${styles.kpiIconWrapper} ${styles.kpiIconGreen}`}>
              <CheckCircle size={20} />
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div>
              <div className={styles.kpiLabel}>SERVED TODAY</div>
              <div className={`${styles.kpiValue} ${styles.kpiValueGray}`}>{counts.completed}</div>
            </div>
            <div className={`${styles.kpiIconWrapper} ${styles.kpiIconGray}`}>
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        {/* Live Orders View */}
        {activeTab !== 'inventory' && (
          <div className={styles.ordersGrid}>
            {filteredOrders.length === 0 ? (
              <div className={styles.emptyQueueCard}>
                <CheckCircle size={40} color="#10B981" className={styles.emptyQueueIcon} />
                <h3 className={styles.emptyQueueTitle}>No active orders in this queue</h3>
                <p className={styles.emptyQueueText}>All kitchen tickets are up to date and dispatched.</p>
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
                          <span className={isDelayed ? styles.timerTextDelayed : styles.timerTextActive}>
                            ⏱ Prep: {elapsed}m / ~{order.estPrepMins}m
                          </span>
                          {isDelayed ? (
                            <span className={styles.timerTextDelayed}>⚠️ DELAYED</span>
                          ) : (
                            <span className={styles.timerTextLeft}>{Math.max(0, order.estPrepMins - elapsed)}m left</span>
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
                  <th className={styles.thRight}>Quick Adjust</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const isLow = item.inStock <= item.threshold;
                  return (
                    <tr key={item.id}>
                      <td className={styles.tdName}>{item.name}</td>
                      <td className={styles.tdThreshold}>{item.threshold} {item.unit}</td>
                      <td>
                        <span className={`${styles.stockCountBadge} ${isLow ? styles.stockLow : styles.stockNormal}`}>
                          {item.inStock} {item.unit}
                        </span>
                      </td>
                      <td>
                        {isLow ? (
                          <span className={styles.badgeLowStock}>
                            ⚠️ LOW STOCK
                          </span>
                        ) : (
                          <span className={styles.badgeAdequateStock}>
                            ✓ Adequate
                          </span>
                        )}
                      </td>
                      <td className={styles.tdRight}>
                        <div className={styles.stockStepperWrap}>
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
                            className={`${styles.stockStepperBtn} ${styles.stockStepperBtnAdd}`}
                            onClick={() => handleAdjustStock(item.id, 5)}
                            title="Add 5 units"
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
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Create Offline / Dine-In Order</h3>
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                className={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Table / Customer Reference</label>
                <input
                  type="text"
                  required
                  value={newDiner}
                  onChange={(e) => setNewDiner(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Order Type</label>
                <div className={styles.serviceTypeGroup}>
                  {(['dine-in', 'takeaway', 'delivery'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewServiceType(type)}
                      className={`${styles.serviceTypeBtn} ${newServiceType === type ? styles.serviceTypeBtnActive : ''}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroupLarge}>
                <label className={styles.formLabel}>Dish Item</label>
                <select
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  className={styles.formInput}
                >
                  <option>Special Handi Chicken Biryani</option>
                  <option>Mughlai Butter Chicken Boneless</option>
                  <option>Dal Makhani Slow-Simmered</option>
                  <option>Artisan Burrata Truffle Pizza</option>
                  <option>Double Truffle Smash Burger</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className={styles.modalCancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.modalSubmitBtn}
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
