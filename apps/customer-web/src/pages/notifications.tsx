import React, { useState, useEffect } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { Bell, BellOff, AlertCircle } from 'lucide-react';
import { API_URL } from '@spicegarden/shared/constants';

interface NotificationPreferences {
  pushOrders: boolean;
  pushPromotions: boolean;
  pushDeliveryUpdates: boolean;
  emailOrders: boolean;
  emailPromotions: boolean;
  smsDeliveryUpdates: boolean;
}

const NotificationsPage = () => {
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    pushOrders: true,
    pushPromotions: true,
    pushDeliveryUpdates: true,
    emailOrders: true,
    emailPromotions: false,
    smsDeliveryUpdates: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const token = localStorage.getItem('sg_token:v1');
        if (!token || token === 'demo-token') {
          router.push('/auth');
          return;
        }
        
        const res = await fetch(`${API_URL}/notification-preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth');
            return;
          }
          throw new Error('Failed to load preferences');
        }
        setPrefs(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };
    loadPrefs();
  }, [router]);

  const handleSave = async () => {
    const token = localStorage.getItem('sg_token:v1');
    if (!token || token === 'demo-token') return;
    
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/notification-preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(prefs),
      });
      
      if (!res.ok) throw new Error('Failed to save preferences');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const togglePref = (key: keyof NotificationPreferences) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  if (loading) {
    return (
      <div style={{ padding: DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: DESIGN_TOKENS.colors.neutral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading preferences...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: DESIGN_TOKENS.colors.neutral }}>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing.sm, backgroundColor: '#ffebee', color: '#c62828', padding: DESIGN_TOKENS.spacing.md, borderRadius: 4, marginBottom: DESIGN_TOKENS.spacing.md }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <h2 style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>Notification Preferences</h2>

      <Card title="Push Notifications">
        <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Order Updates</span>
            <button onClick={() => togglePref('pushOrders')} disabled={saving}>
              {prefs.pushOrders ? <Bell color={DESIGN_TOKENS.colors.primary} /> : <BellOff color="#666" />}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Promotions & Offers</span>
            <button onClick={() => togglePref('pushPromotions')} disabled={saving}>
              {prefs.pushPromotions ? <Bell color={DESIGN_TOKENS.colors.primary} /> : <BellOff color="#666" />}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Delivery Updates</span>
            <button onClick={() => togglePref('pushDeliveryUpdates')} disabled={saving}>
              {prefs.pushDeliveryUpdates ? <Bell color={DESIGN_TOKENS.colors.primary} /> : <BellOff color="#666" />}
            </button>
          </div>
        </div>
      </Card>

      <Card title="Email Notifications">
        <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Order Confirmations</span>
            <button onClick={() => togglePref('emailOrders')} disabled={saving}>
              {prefs.emailOrders ? <Bell color={DESIGN_TOKENS.colors.primary} /> : <BellOff color="#666" />}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Promotional Emails</span>
            <button onClick={() => togglePref('emailPromotions')} disabled={saving}>
              {prefs.emailPromotions ? <Bell color={DESIGN_TOKENS.colors.primary} /> : <BellOff color="#666" />}
            </button>
          </div>
        </div>
      </Card>

      <Card title="SMS Notifications">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Delivery Updates</span>
          <button onClick={() => togglePref('smsDeliveryUpdates')} disabled={saving}>
            {prefs.smsDeliveryUpdates ? <Bell color={DESIGN_TOKENS.colors.primary} /> : <BellOff color="#666" />}
          </button>
        </div>
      </Card>

      <div style={{ marginTop: DESIGN_TOKENS.spacing.xl }}>
        <Button label={saving ? 'Saving...' : 'Save Preferences'} onClick={handleSave} disabled={saving} />
      </div>
    </div>
  );
};

export default NotificationsPage;