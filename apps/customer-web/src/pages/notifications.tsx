import React, { useReducer } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { Bell, BellOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '@spicegarden/shared/constants';
import ProtectedRoute from '../components/ProtectedRoute';
import styles from './notifications.module.css';

interface NotificationPreferences {
  pushOrders: boolean;
  pushPromotions: boolean;
  pushDeliveryUpdates: boolean;
  emailOrders: boolean;
  emailPromotions: boolean;
  smsDeliveryUpdates: boolean;
}

const fetchPreferences = async (): Promise<NotificationPreferences> => {
  const res = await fetch(`${API_URL}/notification-preferences`, {
    headers: {},
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to load preferences');
  return res.json();
};

const savePreferences = async (prefs: NotificationPreferences): Promise<void> => {
  const res = await fetch(`${API_URL}/notification-preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to save preferences');
};

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: prefs = {
    pushOrders: true,
    pushPromotions: true,
    pushDeliveryUpdates: true,
    emailOrders: true,
    emailPromotions: false,
    smsDeliveryUpdates: true,
  }, isLoading, error } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: fetchPreferences,
  });

  const mutation = useMutation({
    mutationFn: (newPrefs: NotificationPreferences) => savePreferences(newPrefs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-preferences'] }),
  });

  const togglePref = (key: keyof NotificationPreferences) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    mutation.mutate(newPrefs);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <p>Loading preferences...</p>
      </div>
    );
  }

  const queryError = error instanceof Error ? error.message : (mutation.error instanceof Error ? mutation.error.message : null);

  return (
    <div className={styles.pageContainer}>
      {queryError && (
        <div className={styles.errorBanner}>
          {queryError}
        </div>
      )}

      <h2 className={styles.pageTitle}>Notification Preferences</h2>

      <Card title="Push Notifications">
        <div className={styles.cardContent}>
          <div className={styles.preferenceRow}>
            <span>Order Updates</span>
            <button type="button" onClick={() => togglePref('pushOrders')} disabled={mutation.isPending} aria-label="Order updates">
              {prefs.pushOrders ? <Bell color={DESIGN_TOKENS.colors.primary} /> : <BellOff color="#666" />}
            </button>
          </div>
          <div className={styles.preferenceRow}>
            <span>Promotions & Offers</span>
            <button type="button" onClick={() => togglePref('pushPromotions')} disabled={mutation.isPending} aria-label="Promotions and offers">
              {prefs.pushPromotions ? <Bell color={DESIGN_TOKENS.colors.primary} /> : <BellOff color="#666" />}
            </button>
          </div>
          <div className={styles.preferenceRow}>
            <span>Delivery Updates</span>
            <button type="button" onClick={() => togglePref('pushDeliveryUpdates')} disabled={mutation.isPending} aria-label="Delivery updates">
              {prefs.pushDeliveryUpdates ? <Bell color={DESIGN_TOKENS.colors.primary} /> : <BellOff color="#666" />}
            </button>
          </div>
        </div>
      </Card>

      <Card title="Email Notifications">
        <div className={styles.cardContent}>
          <div className={styles.preferenceRow}>
            <span>Order Confirmations</span>
            <button type="button" onClick={() => togglePref('emailOrders')} disabled={mutation.isPending} aria-label="Order confirmations">
              {prefs.emailOrders ? <Bell color={DESIGN_TOKENS.colors.primary} /> : <BellOff color="#666" />}
            </button>
          </div>
          <div className={styles.preferenceRow}>
            <span>Promotional Emails</span>
            <button type="button" onClick={() => togglePref('emailPromotions')} disabled={mutation.isPending} aria-label="Promotional emails">
              {prefs.emailPromotions ? <Bell color={DESIGN_TOKENS.colors.primary} /> : <BellOff color="#666" />}
            </button>
          </div>
        </div>
      </Card>

      <Card title="SMS Notifications">
        <div className={styles.preferenceRow}>
          <span>Delivery Updates</span>
          <button type="button" onClick={() => togglePref('smsDeliveryUpdates')} disabled={mutation.isPending} aria-label="SMS delivery updates">
            {prefs.smsDeliveryUpdates ? <Bell color={DESIGN_TOKENS.colors.primary} /> : <BellOff color="#666" />}
          </button>
        </div>
      </Card>

      <div className={styles.saveActions}>
        <Button label={mutation.isPending ? 'Saving...' : 'Save Preferences'} onClick={() => {}} disabled={mutation.isPending} />
      </div>
    </div>
  );
};

export default function Wrapped(props: any) {
  return <ProtectedRoute><NotificationsPage {...props} /></ProtectedRoute>;
}