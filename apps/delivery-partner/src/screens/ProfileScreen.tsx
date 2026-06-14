import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing, Alert, ScrollView, Switch } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DriverProfile {
  name: string;
  phone: string;
  email: string;
  rating: number;
  totalDeliveries: number;
  vehicle: string;
  license: string;
}

export const ProfileScreen = () => {
  const [profile] = useState<DriverProfile>({
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.driver@example.com',
    rating: 4.8,
    totalDeliveries: 1247,
    vehicle: 'Honda Acty',
    license: 'PB-01-AB-1234',
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: DESIGN_TOKENS.motion.page,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('driver_token');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        },
      ]
    );
  }, []);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView style={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.ratingText}>{profile.rating}</Text>
            <Text style={styles.ratingCount}>({profile.totalDeliveries} deliveries)</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>₹{profile.totalDeliveries * 15}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.totalDeliveries}</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Info</Text>
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Vehicle</Text>
              <Text style={styles.vehicleValue}>{profile.vehicle}</Text>
            </View>
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>License</Text>
              <Text style={styles.vehicleValue}>{profile.license}</Text>
            </View>
            <View style={styles.verifyButton}>
              <Text style={styles.verifyIcon}>✓</Text>
              <Text style={styles.verifyText}>Verified</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <Text style={styles.preferenceIcon}>🔔</Text>
              <Text style={styles.preferenceLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <Text style={styles.preferenceIcon}>🌙</Text>
              <Text style={styles.preferenceLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>📄</Text>
              <Text style={styles.menuItemText}>Documents</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>
          
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>🏦</Text>
              <Text style={styles.menuItemText}>Bank Account</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>
        </View>

        <Pressable 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  profileHeader: {
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.xl,
    backgroundColor: DESIGN_TOKENS.colors.surface,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: DESIGN_TOKENS.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  avatarIcon: {
    fontSize: 40,
    color: 'white',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingIcon: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.warning,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  ratingCount: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginLeft: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statsContainer: {
    flexDirection: 'row',
    margin: DESIGN_TOKENS.spacing.md,
    gap: DESIGN_TOKENS.spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
    alignItems: 'center',
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
  section: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: DESIGN_TOKENS.spacing.md,
    color: DESIGN_TOKENS.colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  vehicleCard: {
    padding: DESIGN_TOKENS.spacing.md,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vehicleLabel: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  vehicleValue: {
    fontSize: 14,
    fontWeight: '500',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: DESIGN_TOKENS.colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DESIGN_TOKENS.radius.sm,
    gap: 4,
  },
  verifyIcon: {
    color: DESIGN_TOKENS.colors.success,
  },
  verifyText: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.success,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  preferenceIcon: {
    fontSize: 20,
  },
  preferenceLabel: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  menuArrow: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: DESIGN_TOKENS.colors.danger + '10',
    margin: DESIGN_TOKENS.spacing.md,
    paddingVertical: 14,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.danger + '20',
  },
  logoutButtonText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.danger,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default ProfileScreen;