import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing, Switch, ActivityIndicator } from 'react-native';
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
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: DESIGN_TOKENS.motion.page,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
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

  const renderToggleRow = useCallback((label: string, value: boolean, key: keyof NotificationPrefs) => (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={() => togglePref(key)}
        trackColor={{ false: DESIGN_TOKENS.colors.border, true: DESIGN_TOKENS.colors.primary }}
        thumbColor={value ? DESIGN_TOKENS.colors.primary : '#ccc'}
        disabled={loading || saving}
      />
    </View>
  ), [loading, saving, togglePref]);

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
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerText}>Notifications</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          {renderToggleRow('Order Updates', prefs.pushOrders, 'pushOrders')}
          {renderToggleRow('Promotions', prefs.pushPromotions, 'pushPromotions')}
          {renderToggleRow('Delivery Updates', prefs.pushDeliveryUpdates, 'pushDeliveryUpdates')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email</Text>
          {renderToggleRow('Order Confirmations', prefs.emailOrders, 'emailOrders')}
          {renderToggleRow('Promotional Emails', prefs.emailPromotions, 'emailPromotions')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SMS</Text>
          {renderToggleRow('Delivery Updates', prefs.smsDeliveryUpdates, 'smsDeliveryUpdates')}
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
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  backButton: {
    padding: DESIGN_TOKENS.spacing.xs,
  },
  backButtonText: {
    fontSize: 20,
    color: DESIGN_TOKENS.colors.textPrimary,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: DESIGN_TOKENS.spacing.md,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  section: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    margin: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: DESIGN_TOKENS.spacing.md,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DESIGN_TOKENS.spacing.sm,
  },
  toggleLabel: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default NotificationsScreen;
