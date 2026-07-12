import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TrackingScreen({ route }: any) {
  const navigation = useNavigation();
  const orderId = route?.params?.orderId;

  const steps = [
    { label: 'Order Confirmed', time: '2:30 PM', done: true, icon: 'checkmark-circle' },
    { label: 'Preparing', time: '2:35 PM', done: true, icon: 'restaurant' },
    { label: 'Picked Up', time: '2:50 PM', done: true, icon: 'car' },
    { label: 'Delivered', time: '', done: false, icon: 'home' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={DESIGN_TOKENS.colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Track Order</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: DESIGN_TOKENS.spacing.xl }}>
        <View style={styles.orderIdCard}>
          <Ionicons name="receipt-outline" size={18} color={DESIGN_TOKENS.colors.primary} />
          <Text style={styles.orderIdText}>{orderId ? `Order #${orderId}` : 'Your order'}</Text>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Delivery Progress</Text>
          {steps.map((step, index) => (
            <View key={step.label} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={[
                  styles.timelineDot,
                  step.done ? styles.timelineDotDone : {},
                ]}>
                  {step.done && (
                    <Ionicons name={step.icon as any} size={14} color="#fff" />
                  )}
                </View>
                {index < steps.length - 1 && (
                  <View style={[
                    styles.timelineLine,
                    step.done ? styles.timelineLineDone : {},
                  ]} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[
                  styles.timelineLabel,
                  step.done ? styles.timelineLabelDone : {},
                ]}>
                  {step.label}
                </Text>
                {step.time && (
                  <Text style={styles.timelineTime}>{step.time}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.mapCard}>
          <Ionicons name="map-outline" size={36} color={DESIGN_TOKENS.colors.textTertiary} />
          <Text style={styles.mapText}>Live map view</Text>
        </View>
      </ScrollView>
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
    paddingTop: DESIGN_TOKENS.spacing.lg,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  backButton: {
    padding: DESIGN_TOKENS.spacing.xs,
    marginRight: DESIGN_TOKENS.spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  orderIdCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.md,
    padding: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  timelineCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: DESIGN_TOKENS.radius.full,
    backgroundColor: DESIGN_TOKENS.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotDone: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.borderLight,
  },
  timelineLineDone: {
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: DESIGN_TOKENS.spacing.sm,
    paddingLeft: DESIGN_TOKENS.spacing.sm,
  },
  timelineLabel: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  timelineLabelDone: {
    color: DESIGN_TOKENS.colors.textPrimary,
    fontWeight: '600',
  },
  timelineTime: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textTertiary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: 2,
  },
  mapCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
    minHeight: 180,
    borderWidth: 2,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});