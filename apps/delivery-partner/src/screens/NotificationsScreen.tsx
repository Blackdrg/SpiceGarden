import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { Screen, CardView } from '../components/Screen';
import { EmptyState, LoadingSpinner } from '../components/Indicators';
import { deliveryApi } from '../services/delivery-api.service';
import type { ScreenProps } from '../types';

const getTypeConfig = (type: string) => {
  switch (type) {
    case 'order':
      return { icon: 'receipt-outline', color: DESIGN_TOKENS.colors.primary, bg: DESIGN_TOKENS.colors.primaryLight };
    case 'system':
      return { icon: 'settings-outline', color: DESIGN_TOKENS.colors.info, bg: DESIGN_TOKENS.colors.infoLight };
    default:
      return { icon: 'notifications-outline', color: DESIGN_TOKENS.colors.primary, bg: DESIGN_TOKENS.colors.primaryLight };
  }
};

export default function NotificationsScreen(_props: ScreenProps): React.JSX.Element {
  const [notifications, setNotifications] = useState<{ id: string; title: string; body: string; time: string; type: 'order' | 'system' }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await deliveryApi.getNotifications();
        const mapped = data.map((n: any) => ({
          id: n.id,
          title: n.payload?.title || n.payload?.subject || 'Notification',
          body: n.payload?.body || n.payload?.message || '',
          time: n.createdAt ? new Date(n.createdAt).toLocaleString() : '',
          type: (n.notificationType === 'push' ? 'order' : 'system') as 'order' | 'system',
        }));
        setNotifications(mapped);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  if (loading) {
    return (
      <Screen title="Notifications" navigation={_props.navigation}>
        <LoadingSpinner label="Loading notifications…" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title="Notifications" navigation={_props.navigation}>
        <EmptyState title="Unable to load notifications" message={error} />
      </Screen>
    );
  }

  return (
    <Screen title="Notifications" navigation={_props.navigation}>
      {notifications.length === 0 ? (
        <EmptyState 
          title="No notifications" 
          message="Order updates and alerts will appear here."
        />
      ) : (
        notifications.map((notif) => {
          const typeConfig = getTypeConfig(notif.type);
          return (
            <CardView key={notif.id} style={styles.notifCard}>
              <View style={[styles.notifIconContainer, { backgroundColor: typeConfig.bg }]}>
                <Ionicons name={typeConfig.icon as any} size={20} color={typeConfig.color} />
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifBody}>{notif.body}</Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
            </CardView>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: DESIGN_TOKENS.spacing.md,
    padding: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  notifIconContainer: {
    width: 40,
    height: 40,
    borderRadius: DESIGN_TOKENS.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  notifBody: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: 2,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: DESIGN_TOKENS.colors.textTertiary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: 4,
  },
});
