import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';

export const ShiftManagementScreen = ({ navigation }: { navigation: { goBack: () => void } }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [currentShift, setCurrentShift] = useState<{
    start: Date | null;
    end: Date | null;
    earnings: number;
    orders: number;
  }>({
    start: null,
    end: null,
    earnings: 0,
    orders: 0,
  });

  const mounted = true;

  const handleToggleShift = () => {
    if (!isOnline) {
      setCurrentShift({
        ...currentShift,
        start: new Date(),
      });
      Alert.alert('Shift Started', 'You are now accepting orders');
    } else {
      setCurrentShift({
        ...currentShift,
        end: new Date(),
      });
      Alert.alert('Shift Ended', `Shift completed! Orders delivered: ${currentShift.orders}`);
    }
    setIsOnline(!isOnline);
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={navigation.goBack}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Shift Management</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>
          {isOnline ? '🟢 Shift Active' : '⚪️ Shift Inactive'}
        </Text>
        {currentShift.start && (
          <Text style={styles.shiftTime}>
            Started: {currentShift.start.toLocaleTimeString()}
          </Text>
        )}
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Orders Today</Text>
          <Text style={styles.statValue}>{currentShift.orders}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Earnings</Text>
          <Text style={styles.statValue}>₹{currentShift.earnings}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Online Hours</Text>
          <Text style={styles.statValue}>
            {currentShift.start && mounted
              ? ((Date.now() - currentShift.start.getTime()) / (1000 * 60 * 60)).toFixed(1) + 'h'
              : '0h'}
          </Text>
        </View>
      </View>

      <Pressable 
        style={[styles.shiftButton, isOnline && styles.shiftButtonActive]}
        onPress={handleToggleShift}
      >
        <Text style={styles.shiftButtonText}>
          {isOnline ? 'END SHIFT' : 'START SHIFT'}
        </Text>
      </Pressable>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Peak Hours Bonus</Text>
        <Text style={styles.infoText}>
          Work during 12PM-2PM and 5PM-8PM for extra incentives!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
  },
  backButton: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginLeft: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statusCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    margin: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.lg,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  shiftTime: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statsCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  statLabel: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  shiftButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    margin: DESIGN_TOKENS.spacing.xl,
    paddingVertical: 16,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
  },
  shiftButtonActive: {
    backgroundColor: DESIGN_TOKENS.colors.danger,
  },
  shiftButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  infoSection: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    margin: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.primary,
    marginBottom: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  infoText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default ShiftManagementScreen;