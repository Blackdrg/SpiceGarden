import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { Screen, CardView } from '../components/Screen';
import { LoadingSpinner, ErrorState } from '../components/Indicators';
import { deliveryApi } from '../services/delivery-api.service';
import type { ScreenProps } from '../types';

type TrackingStep = { label: string; time: string; done: boolean; current: boolean };

export default function TrackingScreen({ navigation, route }: ScreenProps): React.JSX.Element {
  const order = route.params.order;
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<TrackingStep[]>([
    { label: 'Order Confirmed', time: '2:30 PM', done: true, current: false },
    { label: 'Preparing', time: '2:35 PM', done: true, current: false },
    { label: 'Picked Up', time: '2:50 PM', done: true, current: true },
    { label: 'Delivered', time: '', done: false, current: false },
  ]);

  return (
    <Screen title="Live Tracking" navigation={navigation}>
      {order ? (
        <>
          <CardView style={styles.trackingHero}>
            <View style={styles.trackingHeroTop}>
              <Ionicons name="navigate" size={24} color={DESIGN_TOKENS.colors.primary} />
              <Text style={styles.trackingHeroTitle}>Delivery in Progress</Text>
            </View>
            <Text style={styles.trackingOrderId}>Order #{order.orderId.slice(0, 8)}</Text>
            <View style={styles.trackingProgressTime}>
              <Ionicons name="time-outline" size={16} color={DESIGN_TOKENS.colors.textSecondary} />
              <Text style={styles.trackingTimeText}>Est. {order.estimatedTimeMinutes} mins remaining</Text>
            </View>
          </CardView>

          <View style={styles.timelineContainer}>
            <Text style={styles.timelineTitle}>Delivery Progress</Text>
            {steps.map((step, index) => (
              <View key={step.label} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                    step.done && styles.timelineDotDone,
                    step.current && styles.timelineDotCurrent,
                  ]}>
                    {step.done && !step.current && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                  </View>
                  {index < steps.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      step.done && styles.timelineLineDone,
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineLabel,
                    step.current && styles.timelineLabelCurrent,
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

          <CardView style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={32} color={DESIGN_TOKENS.colors.textTertiary} />
            <Text style={styles.mapPlaceholderText}>Map view will appear here</Text>
          </CardView>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="navigate-outline" size={48} color={DESIGN_TOKENS.colors.textTertiary} />
          <Text style={styles.emptyText}>No active order to track</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DESIGN_TOKENS.spacing.xxl,
    gap: DESIGN_TOKENS.spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  trackingHero: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.lg,
    marginBottom: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
  },
  trackingHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  trackingHeroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  trackingOrderId: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  trackingProgressTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
  },
  trackingTimeText: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  timelineContainer: {
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
    width: 12,
    height: 12,
    borderRadius: DESIGN_TOKENS.radius.full,
    backgroundColor: DESIGN_TOKENS.colors.border,
  },
  timelineDotDone: {
    backgroundColor: DESIGN_TOKENS.colors.success,
  },
  timelineDotCurrent: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    ...DESIGN_TOKENS.shadows.small,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.border,
  },
  timelineLineDone: {
    backgroundColor: DESIGN_TOKENS.colors.success,
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
  timelineLabelCurrent: {
    color: DESIGN_TOKENS.colors.textPrimary,
    fontWeight: '700',
  },
  timelineTime: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textTertiary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: 2,
  },
  mapPlaceholder: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
    minHeight: 180,
    borderWidth: 2,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

