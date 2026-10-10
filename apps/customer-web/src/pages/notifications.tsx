import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ChevronLeft, Bell, CheckCheck, Sparkles, ShoppingBag, Gift, ShieldAlert, Check } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'order' | 'promo' | 'wallet';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'order',
    title: 'Order #SG-849201 is Cooking!',
    message: 'Chef at SpiceGarden Signature Kitchen has started preparing your Butter Chicken Biryani Bowl.',
    time: '10 mins ago',
    read: false,
  },
  {
    id: 'notif-2',
    type: 'promo',
    title: '⚡ Flat 50% Off Flash Deal',
    message: 'Use code WELCOME50 on your dinner order tonight to get up to ₹150 off.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'wallet',
    title: '₹100 Cashback Credited',
    message: 'Your referral bonus for introducing a friend to SpiceGarden has been added to your wallet.',
    time: 'Yesterday',
    read: true,
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [prefs, setPrefs] = useState({
    pushOrders: true,
    pushPromos: true,
    whatsappUpdates: true,
    smsAlerts: false,
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: 60 }}>
      <Head>
        <title>Notifications &amp; Alerts | SpiceGarden</title>
      </Head>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 16px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronLeft size={20} />
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#0f172a' }}>Notifications</h1>
          </div>
          <button
            type="button"
            onClick={markAllRead}
            style={{ background: 'transparent', border: 'none', color: '#ff5a1f', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        </div>

        {/* Notifications Inbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                background: n.read ? '#fff' : '#fff7ed',
                border: n.read ? '1px solid #e2e8f0' : '1.5px solid #fed7aa',
                borderRadius: 16,
                padding: '16px 18px',
                display: 'flex',
                gap: 14,
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: n.type === 'order' ? '#ffedd5' : n.type === 'promo' ? '#fef3c7' : '#dcfce7',
                  color: n.type === 'order' ? '#ea580c' : n.type === 'promo' ? '#d97706' : '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {n.type === 'order' ? <ShoppingBag size={20} /> : n.type === 'promo' ? <Gift size={20} /> : <Sparkles size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>{n.title}</h2>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.4 }}>{n.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Preference Settings */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '18px 20px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
            Notification Channels
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'pushOrders' as const, label: 'Live Order Status Alerts', sub: 'Real-time kitchen & driver updates' },
              { key: 'pushPromos' as const, label: 'Offers & Discounts', sub: 'Daily flash deals and coupons' },
              { key: 'whatsappUpdates' as const, label: 'WhatsApp Live Tracking', sub: 'Receive invoice and tracking links' },
              { key: 'smsAlerts' as const, label: 'SMS Order Confirmations', sub: 'Critical delivery OTPs and receipts' },
            ].map((item) => (
              <div
                key={item.key}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}
              >
                <div>
                  <p style={{ margin: '0 0 2px 0', fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{item.sub}</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePref(item.key)}
                  style={{
                    width: 46,
                    height: 26,
                    borderRadius: 13,
                    background: prefs[item.key] ? '#ff5a1f' : '#cbd5e1',
                    border: 'none',
                    padding: 2,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: 2,
                      left: prefs[item.key] ? 22 : 2,
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}