import React from 'react';
import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { Screen, CardView } from '../components/Screen';
import type { ScreenProps } from '../types';

export default function EmergencyScreen(_props: ScreenProps): React.JSX.Element {
  return (
    <Screen title="Emergency" navigation={_props.navigation}>
      <CardView style={styles.emergencyCard}>
        <View style={styles.emergencyHeader}>
          <View style={styles.emergencyIconContainer}>
            <Ionicons name="alert-circle" size={32} color={DESIGN_TOKENS.colors.danger} />
          </View>
          <Text style={styles.emergencyTitle}>Emergency Assistance</Text>
          <Text style={styles.emergencyText}>If you are in danger or need immediate assistance, contact support or local authorities.</Text>
        </View>
        <Pressable style={styles.sosButton} onPress={() => Linking.openURL('tel:+919876543210')}>
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.sosText}>Call Support</Text>
        </Pressable>
      </CardView>

      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <CardView style={styles.quickActionCard}>
            <View style={[styles.quickActionIcon, { backgroundColor: DESIGN_TOKENS.colors.infoLight }]}>
              <Ionicons name="location-outline" size={22} color={DESIGN_TOKENS.colors.info} />
            </View>
            <Text style={styles.quickActionText}>Share Location</Text>
          </CardView>
          <CardView style={styles.quickActionCard}>
            <View style={[styles.quickActionIcon, { backgroundColor: DESIGN_TOKENS.colors.warningLight }]}>
              <Ionicons name="chatbubbles-outline" size={22} color={DESIGN_TOKENS.colors.warning} />
            </View>
            <Text style={styles.quickActionText}>Message Support</Text>
          </CardView>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emergencyCard: {
    backgroundColor: DESIGN_TOKENS.colors.dangerLight,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.lg,
    marginBottom: DESIGN_TOKENS.spacing.lg,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.danger + '30',
  },
  emergencyHeader: {
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  emergencyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: DESIGN_TOKENS.radius.full,
    backgroundColor: DESIGN_TOKENS.colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.dangerDark,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textAlign: 'center',
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  emergencyText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textAlign: 'center',
    lineHeight: 20,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
    backgroundColor: DESIGN_TOKENS.colors.danger,
    paddingVertical: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.button,
  },
  sosText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  quickActions: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  quickActionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: DESIGN_TOKENS.spacing.sm,
    paddingHorizontal: DESIGN_TOKENS.spacing.xs,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: DESIGN_TOKENS.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textAlign: 'center',
  },
});
