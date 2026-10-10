import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ChevronLeft, Phone, MessageSquare, Check, Sparkles, Navigation, Clock } from 'lucide-react';
import styles from './tracking.module.css';

type OrderStage = 'placed' | 'confirmed' | 'preparing' | 'pickedup' | 'delivered';

const STAGES: { key: OrderStage; label: string; icon: string }[] = [
  { key: 'placed', label: 'Placed', icon: '📝' },
  { key: 'confirmed', label: 'Accepted', icon: '👍' },
  { key: 'preparing', label: 'Cooking', icon: '🍳' },
  { key: 'pickedup', label: 'On Way', icon: '🛵' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

export default function TrackingPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>('SG-849201');
  const [stage, setStage] = useState<OrderStage>('preparing');
  const [etaMins, setEtaMins] = useState(18);
  const [restaurantName, setRestaurantName] = useState('SpiceGarden Signature Kitchen');
  const [items, setItems] = useState<{ name: string; quantity: number; price: number }[]>([
    { name: 'Butter Chicken Biryani Bowl', quantity: 2, price: 299 },
    { name: 'Garlic Butter Naan', quantity: 3, price: 65 },
  ]);
  const [total, setTotal] = useState(828);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const qOrder = router.query.order as string;
      const effectiveId = qOrder || sessionStorage.getItem('lastOrderId') || 'SG-849201';
      setOrderId(effectiveId);

      const stored = sessionStorage.getItem(`order_${effectiveId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.restaurant) setRestaurantName(parsed.restaurant);
          if (parsed.items) setItems(parsed.items);
          if (parsed.total) setTotal(parsed.total);
        } catch {
          // ignore fallback
        }
      }
    }
  }, [router.query]);

  // Auto-tick ETA
  useEffect(() => {
    const timer = setInterval(() => {
      setEtaMins((prev) => (prev > 1 ? prev - 1 : 1));
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  const getStageIndex = (s: OrderStage) => STAGES.findIndex((st) => st.key === s);
  const currentIdx = getStageIndex(stage);
  const progressPercent = Math.min(100, Math.max(0, (currentIdx / (STAGES.length - 1)) * 100));

  const handleCallDriver = () => {
    alert('📞 Calling Delivery Partner: Vikram Singh (+91 98123 45678)');
  };

  const handleMessageDriver = () => {
    const msg = prompt('Send message to Vikram Singh:', 'Please leave the order with security guard.');
    if (msg) {
      alert(`Message sent to driver: "${msg}"`);
    }
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>Live Order Tracking | {orderId}</title>
      </Head>

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button type="button" className={styles.backBtn} onClick={() => router.push('/')}>
            <ChevronLeft size={18} /> Home
          </button>
          <span className={styles.orderBadge}>Order #{orderId}</span>
        </div>

        {/* Hero Banner */}
        <div className={styles.statusHero}>
          <h1 className={styles.statusHeroTitle}>
            {stage === 'placed' && '📝 Order Placed'}
            {stage === 'confirmed' && '👍 Restaurant Confirmed'}
            {stage === 'preparing' && '🍳 Preparing Fresh in Kitchen'}
            {stage === 'pickedup' && '🛵 Partner Out for Delivery'}
            {stage === 'delivered' && '🎉 Order Delivered Enjoy!'}
          </h1>
          <p className={styles.statusHeroEta}>
            {stage === 'delivered' ? (
              'Delivered at your doorstep'
            ) : (
              <>
                Estimated Delivery in <span className={styles.etaHighlight}>{etaMins} mins</span> · {restaurantName}
              </>
            )}
          </p>

          {/* Stepper */}
          <div className={styles.stepper}>
            <div className={styles.stepperLine} />
            <div className={styles.stepperProgress} style={{ width: `${progressPercent}%` }} />
            {STAGES.map((st, idx) => {
              const isDone = idx < currentIdx;
              const isActive = idx === currentIdx;
              return (
                <div key={st.key} className={styles.stepNode} onClick={() => setStage(st.key)} style={{ cursor: 'pointer' }}>
                  <div
                    className={`${styles.stepIcon} ${isActive ? styles.stepIconActive : ''} ${isDone ? styles.stepIconDone : ''}`}
                  >
                    {isDone ? <Check size={14} /> : st.icon}
                  </div>
                  <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Stage Simulator for pair-programming & QA */}
        <div className={styles.stageControls} style={{ marginBottom: 20 }}>
          <span className={styles.stageLabel}>🎮 Fast-Forward Order State:</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {STAGES.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`${styles.stageBtn} ${stage === s.key ? styles.stageBtnActive : ''}`}
                onClick={() => setStage(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simulated Map Visual */}
        <div className={styles.mapCard}>
          <div className={styles.mapVisual}>
            <div className={styles.mapPulsePin}>
              <div className={styles.mapPinInner}>
                <Navigation size={18} />
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 12, left: 16, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600 }}>
              📍 1.4 km away from your location
            </div>
          </div>
        </div>

        {/* Driver Card */}
        <div className={styles.driverCard}>
          <div className={styles.driverDetails}>
            <div className={styles.driverAvatar}>VS</div>
            <div>
              <h2 className={styles.driverName}>Vikram Singh ⭐ 4.9</h2>
              <p className={styles.driverVehicle}>Hero Splendor • PB65 AC 4392</p>
            </div>
          </div>
          <div className={styles.driverActions}>
            <button type="button" className={styles.driverCallBtn} onClick={handleCallDriver} aria-label="Call driver">
              <Phone size={15} /> Call
            </button>
            <button
              type="button"
              className={styles.backBtn}
              onClick={handleMessageDriver}
              aria-label="Message driver"
            >
              <MessageSquare size={15} />
            </button>
          </div>
        </div>

        {/* Order Details Card */}
        <div className={styles.summaryCard}>
          <h2 className={styles.summaryTitle}>
            <Sparkles size={16} color="#ff5a1f" /> Order Summary
          </h2>
          {items.map((item, i) => (
            <div key={i} className={styles.summaryItem}>
              <span>{item.quantity}x {item.name}</span>
              <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px dashed #cbd5e1', fontWeight: 700, fontSize: 15 }}>
            <span>Total Paid</span>
            <span style={{ color: '#ff5a1f' }}>₹{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}