import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TextInput } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';

export const HomeScreen = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [todayStats] = useState({
    orders: 12,
    earnings: 1456,
    hours: 4.5,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const switchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: DESIGN_TOKENS.motion.page,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    Animated.timing(switchAnim, {
      toValue: isOnline ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [isOnline, switchAnim]);

  const switchThumbPosition = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Driver Dashboard</Text>
          <Text style={styles.headerSubtitle}>Ready to deliver?</Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusContent}>
            <Text style={styles.statusLabel}>Go Online</Text>
            <Text style={styles.statusHint}>
              {isOnline ? 'You are accepting orders' : 'You are offline'}
            </Text>
          </View>
          <View style={styles.switchContainer}>
            <View style={[styles.switchTrack, { backgroundColor: isOnline ? DESIGN_TOKENS.colors.success + '40' : DESIGN_TOKENS.colors.textSecondary + '40' }]}>
              <Animated.View style={[styles.switchThumb, { 
                backgroundColor: isOnline ? DESIGN_TOKENS.colors.success : DESIGN_TOKENS.colors.textSecondary,
                transform: [{ translateX: switchThumbPosition }] 
              }]} />
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statValue}>{todayStats.orders}</Text>
            <Text style={styles.statLabel}>Orders Today</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>₹{todayStats.earnings}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏱</Text>
            <Text style={styles.statValue}>{todayStats.hours}h</Text>
            <Text style={styles.statLabel}>Online Hours</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>Enable location for better order matching</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🔔</Text>
            <Text style={styles.infoText}>New orders available in your area</Text>
          </View>
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
  header: {
    padding: DESIGN_TOKENS.spacing.xl,
    backgroundColor: DESIGN_TOKENS.colors.surface,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  headerSubtitle: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.surface,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginTop: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
  },
  statusContent: {},
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statusHint: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  switchContainer: {},
  switchTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    marginTop: DESIGN_TOKENS.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statLabel: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  infoSection: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    margin: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: DESIGN_TOKENS.spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textPrimary,
    flex: 1,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default HomeScreen;
