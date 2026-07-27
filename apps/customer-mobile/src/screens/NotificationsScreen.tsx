import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { Easing } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { STORAGE_KEYS } from '../constants/storage.keys';
import { API_BASE_URL } from '../constants/api';

interface NotificationPrefs {
  pushOrders: boolean;
  pushPromotions: boolean;
  pushDeliveryUpdates: boolean;
  emailOrders: boolean;
  emailPromotions: boolean;
  smsDeliveryUpdates: boolean;
}

const ToggleRow = ({ label, value, onToggle, disabled }: { label: string; value: boolean; onToggle: () => void; disabled: boolean }) => (
  <View style={styles.toggleRow}>
    <Text style={styles.toggleLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: DESIGN_TOKENS.colors.border, true: DESIGN_TOKENS.colors.primary }}
      thumbColor={value ? DESIGN_TOKENS.colors.primary : '#ccc'}
      disabled={disabled}
    />
  </View>
);

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    pushOrders: true,
    pushPromotions: true,
    pushDeliveryUpdates: true,
    emailOrders: true,
    emailPromotions: false,
    smsDeliveryUpdates: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const fadeAnim = useSharedValue(0);

  const loadPrefs = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        const res = await fetch(`${API_BASE_URL}/notification-preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setPrefs(await res.json());
        }
      }
    } catch (error) {
      console.error('Failed to load notification prefs:', error);
    } finally {
      setLoading(false);
      fadeAnim.value = withTiming(1, { duration: DESIGN_TOKENS.motion.page, easing: Easing.out(Easing.quad) });
    }
  }, [fadeAnim]);

  useEffect(() => {
    loadPrefs();
  }, [loadPrefs]);




  const savePrefs = useCallback(async (newPrefs: NotificationPrefs) => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        const res = await fetch(`${API_BASE_URL}/notification-preferences`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(newPrefs),
        });
        if (res.ok) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error('Failed to save prefs:', error);
    } finally {
      setSaving(false);
    }
  }, []);

  const togglePref = useCallback((key: keyof NotificationPrefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    savePrefs(newPrefs);
    Haptics.selectionAsync();
  }, [prefs, savePrefs]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={DESIGN_TOKENS.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerText}>Notifications</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          <ToggleRow label="Order Updates" value={prefs.pushOrders} onToggle={() => togglePref('pushOrders')} disabled={loading || saving} />
          <ToggleRow label="Promotions" value={prefs.pushPromotions} onToggle={() => togglePref('pushPromotions')} disabled={loading || saving} />
          <ToggleRow label="Delivery Updates" value={prefs.pushDeliveryUpdates} onToggle={() => togglePref('pushDeliveryUpdates')} disabled={loading || saving} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email</Text>
          <ToggleRow label="Order Confirmations" value={prefs.emailOrders} onToggle={() => togglePref('emailOrders')} disabled={loading || saving} />
          <ToggleRow label="Promotional Emails" value={prefs.emailPromotions} onToggle={() => togglePref('emailPromotions')} disabled={loading || saving} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SMS</Text>
          <ToggleRow label="Delivery Updates" value={prefs.smsDeliveryUpdates} onToggle={() => togglePref('smsDeliveryUpdates')} disabled={loading || saving} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    paddingTop: DESIGN_TOKENS.spacing.lg,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: DESIGN_TOKENS.radius.md,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.xs,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: DESIGN_TOKENS.spacing.md,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  section: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    margin: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
    ...DESIGN_TOKENS.shadows.small,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: DESIGN_TOKENS.spacing.md,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  toggleLabel: {
    fontSize: 15,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default NotificationsScreen;
