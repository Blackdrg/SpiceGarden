import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { HomeIcon, SearchIcon, OrderIcon, ProfileIcon } from '@spicegarden/ui';
import { RotateCw, Star, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import styles from './history.module.css';

interface Order {
  id: string;
  restaurant: string;
  itemsSummary: string;
  itemsList: { id: string; name: string; price: number; quantity: number }[];
  date: string;
  amount: number;
  status: 'delivered' | 'preparing' | 'cancelled';
  rating: number;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 'SG-849201',
    restaurant: 'SpiceGarden Signature Kitchen',
    itemsSummary: '2x Butter Chicken Biryani Bowl, 3x Garlic Butter Naan',
    itemsList: [
      { id: 'item-1', name: 'Butter Chicken Biryani Bowl', price: 299, quantity: 2 },
      { id: 'item-2', name: 'Garlic Butter Naan', price: 65, quantity: 3 },
    ],
    date: 'Today, 1:45 PM',
    amount: 828,
    status: 'preparing',
    rating: 0,
  },
  {
    id: 'SG-729104',
    restaurant: 'Punjabi Dhaba Express',
    itemsSummary: '1x Paneer Tikka Masala, 2x Tandoori Roti, 1x Dal Makhani',
    itemsList: [
      { id: 'item-3', name: 'Paneer Tikka Masala', price: 260, quantity: 1 },
      { id: 'item-4', name: 'Tandoori Roti', price: 20, quantity: 2 },
      { id: 'item-5', name: 'Dal Makhani', price: 220, quantity: 1 },
    ],
    date: 'Yesterday, 8:20 PM',
    amount: 520,
    status: 'delivered',
    rating: 5,
  },
  {
    id: 'SG-618290',
    restaurant: 'Mughlai Treat',
    itemsSummary: '1x Chicken Dum Biryani, 1x Gulab Jamun (2 pcs)',
    itemsList: [
      { id: 'item-6', name: 'Chicken Dum Biryani', price: 340, quantity: 1 },
      { id: 'item-7', name: 'Gulab Jamun (2 pcs)', price: 90, quantity: 1 },
    ],
    date: 'Oct 04, 2026',
    amount: 430,
    status: 'delivered',
    rating: 4,
  },
  {
    id: 'SG-509122',
    restaurant: 'The Tandoor Story',
    itemsSummary: '2x Crispy Veg Burger, 1x Masala Fries',
    itemsList: [
      { id: 'item-8', name: 'Crispy Veg Burger', price: 120, quantity: 2 },
      { id: 'item-9', name: 'Masala Fries', price: 99, quantity: 1 },
    ],
    date: 'Sep 28, 2026',
    amount: 339,
    status: 'cancelled',
    rating: 0,
  },
];

export default function HistoryPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [filter, setFilter] = useState<'all' | 'delivered' | 'preparing' | 'cancelled'>('all');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  const filteredOrders = orders.filter((o) => (filter === 'all' ? true : o.status === filter));

  const handleReorder = (order: Order) => {
    order.itemsList.forEach((item) => {
      dispatch(
        addToCart({
          item: {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          },
          restaurantId: 'rest-001',
        })
      );
    });
    alert(`✅ Added ${order.itemsList.length} items from ${order.restaurant} to your cart!`);
    router.push('/cart');
  };

  const handleRate = (orderId: string, star: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, rating: star } : o))
    );
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>Order History | SpiceGarden</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Orders</h1>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{orders.length} total</span>
        </div>

        {/* Filter Chips */}
        <div className={styles.filterBar}>
          {(['all', 'preparing', 'delivered', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`${styles.filterChip} ${filter === f ? styles.filterChipActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' && 'All Orders'}
              {f === 'preparing' && 'Active / Cooking'}
              {f === 'delivered' && 'Delivered'}
              {f === 'cancelled' && 'Cancelled'}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className={styles.ordersList}>
          {filteredOrders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderCardTop}>
                <div>
                  <h2 className={styles.restaurantName}>{order.restaurant}</h2>
                  <p className={styles.orderMeta}>#{order.id} · {order.date}</p>
                </div>
                <span
                  className={`${styles.statusBadge} ${
                    order.status === 'delivered'
                      ? styles.statusDelivered
                      : order.status === 'preparing'
                      ? styles.statusActive
                      : styles.statusCancelled
                  }`}
                >
                  {order.status === 'delivered' && '✓ Delivered'}
                  {order.status === 'preparing' && '🍳 In Kitchen'}
                  {order.status === 'cancelled' && '✕ Cancelled'}
                </span>
              </div>

              <div className={styles.itemsSummary}>
                {order.itemsSummary}
              </div>

              <div className={styles.orderCardBottom}>
                <div>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Total Paid</span>
                  <div className={styles.orderPrice}>₹{order.amount}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {order.status === 'delivered' && (
                    <div className={styles.starRating} title="Rate your food">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          fill={s <= order.rating ? '#eab308' : 'none'}
                          color={s <= order.rating ? '#eab308' : '#cbd5e1'}
                          onClick={() => handleRate(order.id, s)}
                        />
                      ))}
                    </div>
                  )}

                  {order.status === 'preparing' ? (
                    <button
                      type="button"
                      className={styles.reorderBtn}
                      onClick={() => router.push(`/tracking?order=${order.id}`)}
                    >
                      Track Order →
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.reorderBtn}
                      onClick={() => handleReorder(order)}
                    >
                      <RotateCw size={14} /> Reorder
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className={styles.bottomNav}>
        {[
          { key: 'home', label: 'Home', Icon: HomeIcon, path: '/' },
          { key: 'search', label: 'Search', Icon: SearchIcon, path: '/search' },
          { key: 'orders', label: 'Orders', Icon: OrderIcon, path: '/history' },
          { key: 'account', label: 'Profile', Icon: ProfileIcon, path: '/profile' },
        ].map((tab) => {
          const Icon = tab.Icon;
          const isActive = tab.key === 'orders';
          return (
            <button
              key={tab.key}
              type="button"
              className={`${styles.navButton} ${isActive ? styles.navActive : styles.navInactive}`}
              onClick={() => router.push(tab.path)}
            >
              <Icon size={22} color={isActive ? '#ff5a1f' : '#64748b'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
