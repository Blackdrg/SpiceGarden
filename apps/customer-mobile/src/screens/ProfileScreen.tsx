import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Easing } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { STRINGS } from '../constants/strings';
import Toast from 'react-native-root-toast';
import { safeParse } from '../utils/safe-parse';

const MENU_ITEMS = [
  { id: 'wallet', label: 'Wallet', icon: 'wallet-outline', screen: 'Wallet' },
  { id: 'orders', label: 'My Orders', icon: 'receipt-outline', screen: 'History' },
  { id: 'addresses', label: 'Addresses', icon: 'location-outline', screen: 'Addresses' },
  { id: 'payment', label: 'Payment Methods', icon: 'card-outline', screen: 'Payment' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications-outline', screen: 'Notifications' },
  { id: 'support', label: 'Help & Support', icon: 'help-circle-outline', screen: 'Support' },
] as const;

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const userJson = await AsyncStorage.getItem('sg_user');
        if (userJson) {
          const user = safeParse(userJson) as { name?: string; email?: string; phone?: string };
          if (!cancelled) {
            setUserData({
              fullName: user.name || '',
              email: user.email || '',
              phone: user.phone || '',
            });
            setEditFormData({
              fullName: user.name || '',
              email: user.email || '',
              phone: user.phone || '',
            });
          }
        }
      } catch (error) {
        if (!cancelled) console.error('Failed to load profile:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
          
          fadeAnim.value = withTiming(1, { duration: DESIGN_TOKENS.motion.page, easing: Easing.out(Easing.quad) });
        }
      }
    };

    loadProfile();
    return () => { cancelled = true; };
  }, [fadeAnim]);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateEmail(editFormData.email)) return;
    
    try {
      await AsyncStorage.setItem('sg_user', JSON.stringify({
        name: editFormData.fullName,
        email: editFormData.email,
        phone: editFormData.phone,
      }));
      
      setUserData({
        fullName: editFormData.fullName,
        email: editFormData.email,
        phone: editFormData.phone,
      });
      
      Toast.show(STRINGS.cart.profileSaveSuccess, {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.success,
        textColor: 'white',
      });
      
      setIsEditing(false);
    } catch (error) {
      Toast.show(STRINGS.cart.profileSaveError, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.danger,
        textColor: 'white',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('sg_token');
      await AsyncStorage.removeItem('sg_user');
      Toast.show(STRINGS.cart.logoutSuccess, {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.primary,
        textColor: 'white',
      });
      navigation.replace('Auth');
    } catch (error) {
      Toast.show(STRINGS.orderHistory.reorderError, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.danger,
        textColor: 'white',
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}
        accessible={true}
        accessibilityLabel="Loading profile"
        accessibilityRole="progressbar"
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </Animated.View>
      </View>
    );
  }

  const menuItems = MENU_ITEMS;

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>
              {isEditing ? 'Edit Profile' : 'Profile'}
            </Text>
          </View>
          {!isEditing && (
            <Pressable 
              onPress={() => setIsEditing(true)} 
              style={styles.editButton}
              accessibilityLabel="Edit profile"
              accessibilityRole="button"
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.content}>
          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  placeholder="Enter your full name"
                  value={editFormData.fullName}
                  onChangeText={(text) => setEditFormData({ ...editFormData, fullName: text })}
                  style={styles.input}
                  accessibilityLabel="Full name"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  placeholder="Enter your email"
                  value={editFormData.email}
                  onChangeText={(text) => {
                    setEditFormData({ ...editFormData, email: text });
                    if (errors.email) validateEmail(text);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                  accessibilityLabel="Email address"
                />
                {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  placeholder="Enter your phone number"
                  value={editFormData.phone}
                  onChangeText={(text) => setEditFormData({ ...editFormData, phone: text })}
                  keyboardType="phone-pad"
                  style={styles.input}
                  accessibilityLabel="Phone number"
                />
              </View>
              <Pressable 
                onPress={handleSaveProfile}
                style={styles.saveButton}
                accessibilityLabel="Save profile changes"
                accessibilityRole="button"
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </Pressable>
              <Pressable 
                onPress={() => setIsEditing(false)}
                style={styles.cancelButton}
                accessibilityLabel="Cancel editing"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.profileHeader}>
                <View style={styles.profileImageContainer}>
                  <Text style={styles.profileImage}>P</Text>
                </View>
                  <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{userData.fullName || 'User Name'}</Text>
                  <Text style={styles.profileEmail}>{userData.email || 'email@example.com'}</Text>
                  <View style={styles.profilePhoneContainer}>
                    <Ionicons name="call-outline" size={14} color={DESIGN_TOKENS.colors.textSecondary} />
                    <Text style={styles.profilePhone}>{userData.phone || '+91 XXXXX XXXXX'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>24</Text>
                  <Text style={styles.statLabel}>Orders</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>4.8</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>SPICE+</Text>
                  <Text style={styles.statLabel}>Member</Text>
                </View>
              </View>

              <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>Account</Text>
                {menuItems.map((item) => (
                  <Pressable 
                    key={item.id} 
                    style={styles.menuItem}
                    onPress={() => (navigation as any).navigate(item.screen)}
                    accessibilityLabel={`Go to ${item.label}`}
                    accessibilityRole="link"
                  >
                    <View style={styles.menuItemIconContainer}>
                      <Ionicons name={item.icon as any} size={22} color={DESIGN_TOKENS.colors.primary} />
                    </View>
                    <Text style={styles.menuItemText}>{item.label}</Text>
                    <View style={styles.menuItemArrowContainer}>
                      <Text style={styles.menuItemArrow}>›</Text>
                    </View>
                  </Pressable>
                ))}
              </View>

              <Pressable 
                onPress={handleLogout}
                style={styles.logoutButton}
                accessibilityLabel="Sign out of your account"
                accessibilityRole="button"
              >
                <Text style={styles.logoutButtonText}>Sign Out</Text>
              </Pressable>
            </>
          )}
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
  loadingSpinner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: DESIGN_TOKENS.colors.primary,
    borderTopColor: 'transparent',
  },
  loadingText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    paddingTop: DESIGN_TOKENS.spacing.lg,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  headerContent: {
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  editButton: {
    padding: DESIGN_TOKENS.spacing.sm,
  },
  editButtonText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.primary,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.xl,
    paddingTop: DESIGN_TOKENS.spacing.lg,
  },
  profileImageContainer: {
    width: 88,
    height: 88,
    backgroundColor: DESIGN_TOKENS.colors.primary,
    borderRadius: DESIGN_TOKENS.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
    ...DESIGN_TOKENS.shadows.medium,
  },
  profileImage: {
    fontSize: 40,
    color: 'white',
    fontWeight: '700',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: DESIGN_TOKENS.spacing.xs,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  profileEmail: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  profilePhoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
  },
  profilePhone: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: DESIGN_TOKENS.spacing.lg,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
  },
  statBox: {
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.md,
    minWidth: 80,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statLabel: {
    fontSize: 11,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuSection: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    padding: DESIGN_TOKENS.spacing.md,
    paddingBottom: DESIGN_TOKENS.spacing.xs,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  menuItemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: DESIGN_TOKENS.radius.sm,
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DESIGN_TOKENS.spacing.sm,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    fontWeight: '500',
  },
  menuItemArrowContainer: {
    padding: DESIGN_TOKENS.spacing.xs,
  },
  menuItemArrow: {
    fontSize: 18,
    color: DESIGN_TOKENS.colors.textTertiary,
    fontWeight: '300',
  },
  logoutButton: {
    margin: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.dangerLight,
    borderRadius: DESIGN_TOKENS.radius.button,
    paddingVertical: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.danger + '30',
  },
  logoutButtonText: {
    fontSize: 15,
    color: DESIGN_TOKENS.colors.dangerDark,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  editForm: {
    padding: DESIGN_TOKENS.spacing.md,
  },
  inputGroup: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    borderRadius: DESIGN_TOKENS.radius.lg,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    fontSize: 15,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    color: DESIGN_TOKENS.colors.textPrimary,
  },
  fieldError: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.danger,
    marginTop: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  saveButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
    marginVertical: DESIGN_TOKENS.spacing.xs,
    ...DESIGN_TOKENS.shadows.small,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  cancelButton: {
    paddingVertical: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
    marginVertical: DESIGN_TOKENS.spacing.xs,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.primary,
  },
  cancelButtonText: {
    color: DESIGN_TOKENS.colors.primary,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default ProfileScreen;
