import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';

interface OrderTimelineProps {
  status: string;
  restaurantName?: string;
  customerAddress?: string;
}

const STATUS_ORDER: Array<string> = ['placed', 'confirmed', 'preparing', 'ready', 'pickedUp', 'onTheWay', 'delivered'];

const STATUS_LABELS: Record<string, string> = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  pickedUp: 'Picked Up',
  onTheWay: 'On the Way',
  delivered: 'Delivered',
};

export const OrderTimeline = memo(function OrderTimeline({ status, restaurantName, customerAddress }: OrderTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(status);
  
  return (
    <View style={styles.timelineContainer}>
      {STATUS_ORDER.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;
        
        return (
          <View key={step} style={styles.timelineStep}>
            {index > 0 && (
              <View style={[
                styles.connector,
                { backgroundColor: isCompleted ? DESIGN_TOKENS.colors.success : DESIGN_TOKENS.colors.elevated }
              ]} />
            )}
            
            <View style={styles.stepContent}>
              <View style={[
                styles.stepDot,
                {
                  backgroundColor: isCompleted || isCurrent ? DESIGN_TOKENS.colors.primary : DESIGN_TOKENS.colors.elevated,
                  borderColor: isCompleted || isCurrent ? DESIGN_TOKENS.colors.primary : DESIGN_TOKENS.colors.border,
                }
              ]}>
                {isCompleted && (
                  <Ionicons name="checkmark" size={12} color="white" />
                )}
                {isCurrent && (
                  <View style={styles.currentDot} />
                )}
              </View>
              
              <Text style={[
                styles.stepLabel,
                { 
                  color: isPending ? DESIGN_TOKENS.colors.textSecondary : DESIGN_TOKENS.colors.textPrimary,
                  fontWeight: isCurrent ? '600' : '400',
                }
              ]}>
                {STATUS_LABELS[step]}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  timelineContainer: {
    paddingVertical: DESIGN_TOKENS.spacing.md,
  },
  timelineStep: {
    flexDirection: 'row',
  },
  connector: {
    width: 2,
    height: 30,
    marginLeft: 9,
    marginTop: -4,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DESIGN_TOKENS.spacing.sm,
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  stepLabel: {
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default OrderTimeline;