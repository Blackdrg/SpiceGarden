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

  const preferenceGroups = [
    {
      title: 'Push Notifications',
      items: [
        { key: 'pushOrders' as const, label: 'Order Updates' },
        { key: 'pushPromotions' as const, label: 'Promotions & Offers' },
        { key: 'pushDeliveryUpdates' as const, label: 'Delivery Updates' },
      ]
    },
    {
      title: 'Email Notifications',
      items: [
        { key: 'emailOrders' as const, label: 'Order Confirmations' },
        { key: 'emailPromotions' as const, label: 'Promotional Emails' },
      ]
    },
    {
      title: 'SMS Notifications',
      items: [
        { key: 'smsDeliveryUpdates' as const, label: 'Delivery Updates' },
      ]
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Notification Preferences</h2>
        <p className={styles.pageSubtitle}>Manage how you receive updates</p>
      </div>

      {queryError && (
        <div className={styles.errorBanner}>
          {queryError}
        </div>
      )}

      {preferenceGroups.map((group) => (
        <Card key={group.title} title={group.title} variant="elevated">
          <div className={styles.cardContent}>
            {group.items.map((item) => (
              <div key={item.key} className={styles.preferenceRow}>
                <span className={styles.preferenceLabel}>{item.label}</span>
                <button
                  type="button"
                  onClick={() => togglePref(item.key)}
                  disabled={mutation.isPending}
                  aria-label={item.label}
                  className={`${styles.toggleButton} ${prefs[item.key] ? styles.toggleActive : styles.toggleInactive}`}
                >
                  {prefs[item.key] ? (
                    <Bell size={20} color={DESIGN_TOKENS.colors.primary} />
                  ) : (
                    <BellOff size={20} color={DESIGN_TOKENS.colors.textTertiary} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className={styles.saveActions}>
        <Button label={mutation.isPending ? 'Saving...' : 'Save Preferences'} onClick={() => {}} disabled={mutation.isPending} fullWidth />
      </div>
    </div>
  );
};

export default function Wrapped(props: any) {
  return <ProtectedRoute><NotificationsPage {...props} /></ProtectedRoute>;
}
