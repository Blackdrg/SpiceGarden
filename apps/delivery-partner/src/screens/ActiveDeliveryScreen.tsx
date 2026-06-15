import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, TextInput } from 'react-native';
import { Animated, Easing } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { deliveryApi, DeliveryOrder } from '../services/delivery-api.service';

type DeliveryStage = 'assigned' | 'pickedUp' | 'onTheWay' | 'delivered';

export const ActiveDeliveryScreen = ({ route, navigation }: { 
  route: { params: { order: DeliveryOrder } }; 
  navigation: { goBack: () => void } 
}) => {
  const { order } = route.params;
  const [currentOrder, setCurrentOrder] = useState(order);
  const [stage, setStage] = useState<DeliveryStage>('assigned');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  
  const slideAnim = useMemo(() => new Animated.Value(0), []);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: DESIGN_TOKENS.motion.page,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleStageChange = useCallback(async (newStage: 'pickedUp' | 'onTheWay' | 'delivered') => {
    try {
      const updatedOrder = await deliveryApi.updateOrderStatus(
        currentOrder.orderId,
        newStage
      );
      setCurrentOrder(updatedOrder);
      setStage(newStage);

      if (newStage === 'pickedUp') {
        Alert.alert(
          'Pickup Confirmed',
          'Navigate to customer location',
          [{ text: 'OK' }]
        );
      } else if (newStage === 'delivered') {
        Alert.alert(
          'Delivery Complete',
          'Order delivered successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  }, [currentOrder.orderId, navigation]);

  const handleVerifyOTP = useCallback(async () => {
    if (otp.length !== 4) {
      Alert.alert('Error', 'Please enter 4-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const isValid = await deliveryApi.verifyOTP(currentOrder.orderId, otp);
      if (isValid) {
        setStage('pickedUp');
        setOtp('');
        Alert.alert('OTP Verified', 'Pickup confirmed!');
      } else {
        Alert.alert('Invalid OTP', 'Please verify the code with customer');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP');
    } finally {
      setOtpLoading(false);
    }
  }, [currentOrder.orderId, otp]);

  const handleReportIssue = useCallback(() => {
    const reportedDetails = '';
    Alert.alert(
      'Report Issue',
      'Describe the issue',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit', 
          onPress: async () => {
            await deliveryApi.reportIssue(currentOrder.orderId, 'issue', 'No details provided');
            Alert.alert('Issue Reported', 'Support will contact you shortly');
          }
        },
      ]
    );
  }, [currentOrder.orderId]);

  const renderStageContent = () => {
    switch (stage) {
      case 'assigned':
        return (
          <View style={styles.stageContainer}>
            <Text style={styles.stageTitle}>Navigate to Restaurant</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressLabel}>Pickup Location</Text>
              <Text style={styles.addressName}>{currentOrder.restaurant.name}</Text>
              <Text style={styles.addressText}>{currentOrder.restaurant.address}</Text>
            </View>
            
            <View style={styles.otpSection}>
              <Text style={styles.otpLabel}>Enter OTP at pickup</Text>
              <TextInput
                style={styles.otpInput}
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={4}
                placeholder="Enter 4-digit OTP"
                placeholderTextColor={DESIGN_TOKENS.colors.textSecondary}
              />
              <Pressable 
                style={styles.otpButton}
                onPress={handleVerifyOTP}
                disabled={otpLoading}
              >
                <Text style={styles.otpButtonText}>Verify & Confirm Pickup</Text>
              </Pressable>
            </View>

            <Pressable 
              style={styles.navigationButton}
              onPress={() => {}}
            >
              <Text style={styles.navigationButtonText}>📍 Open Maps</Text>
            </Pressable>

            <Pressable 
              style={styles.rejectButton}
              onPress={handleReportIssue}
            >
              <Text style={styles.rejectButtonText}>Report Issue</Text>
            </Pressable>
          </View>
        );

      case 'pickedUp':
        return (
          <View style={styles.stageContainer}>
            <Text style={styles.stageTitle}>Deliver to Customer</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressLabel}>Delivery Location</Text>
              <Text style={styles.addressName}>{currentOrder.customer.name}</Text>
              <Text style={styles.addressText}>{currentOrder.customer.address}</Text>
            </View>

            <Pressable 
              style={styles.navigationButton}
              onPress={() => {}}
            >
              <Text style={styles.navigationButtonText}>📍 Open Maps</Text>
            </Pressable>

            <Pressable 
              style={styles.callButton}
              onPress={() => {}}
            >
              <Text style={styles.callButtonText}>📞 Call Customer</Text>
            </Pressable>

            <Pressable 
              style={styles.confirmButton}
              onPress={() => handleStageChange('onTheWay')}
            >
              <Text style={styles.confirmButtonText}>Start Delivery</Text>
            </Pressable>

            <Pressable 
              style={styles.rejectButton}
              onPress={handleReportIssue}
            >
              <Text style={styles.rejectButtonText}>Report Issue</Text>
            </Pressable>
          </View>
        );

      case 'onTheWay':
        return (
          <View style={styles.stageContainer}>
            <Text style={styles.stageTitle}>On the Way</Text>
            <View style={styles.customerCard}>
              <Text style={styles.customerName}>{currentOrder.customer.name}</Text>
              <Text style={styles.customerAddress}>{currentOrder.customer.address}</Text>
              <Text style={styles.customerPhone}>{currentOrder.customer.phone}</Text>
            </View>

            <View style={styles.etaContainer}>
              <Text style={styles.etaLabel}>Estimated Arrival</Text>
              <Text style={styles.etaTime}>{currentOrder.estimatedTimeMinutes} min</Text>
            </View>

            <Pressable 
              style={styles.navigationButton}
              onPress={() => {}}
            >
              <Text style={styles.navigationButtonText}>📍 Open Maps</Text>
            </Pressable>

            <Pressable 
              style={styles.confirmButton}
              onPress={() => handleStageChange('delivered')}
            >
              <Text style={styles.confirmButtonText}>Mark Delivered</Text>
            </Pressable>

            <Pressable 
              style={styles.rejectButton}
              onPress={handleReportIssue}
            >
              <Text style={styles.rejectButtonText}>Report Issue</Text>
            </Pressable>
          </View>
        );

      case 'delivered':
        return (
          <View style={styles.stageContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Delivery Complete!</Text>
            <Text style={styles.successAmount}>₹{currentOrder.amount} earned</Text>
            
            <Pressable 
              style={styles.doneButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Order #{currentOrder.orderId.slice(-4)}</Text>
        </View>

        {renderStageContent()}
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
  stageContainer: {
    flex: 1,
    padding: DESIGN_TOKENS.spacing.lg,
    justifyContent: 'center',
  },
  stageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textPrimary,
    textAlign: 'center',
    marginBottom: DESIGN_TOKENS.spacing.xl,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  addressCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.lg,
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  addressLabel: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  addressName: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  addressText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  otpSection: {
    alignItems: 'center',
    marginVertical: DESIGN_TOKENS.spacing.lg,
  },
  otpLabel: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  otpInput: {
    width: 120,
    padding: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  otpButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: DESIGN_TOKENS.radius.button,
  },
  otpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  navigationButton: {
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    paddingVertical: 14,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
    marginVertical: DESIGN_TOKENS.spacing.sm,
  },
  navigationButtonText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  callButton: {
    backgroundColor: DESIGN_TOKENS.colors.success,
    paddingVertical: 14,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
    marginVertical: DESIGN_TOKENS.spacing.sm,
  },
  callButtonText: {
    fontSize: 16,
    color: 'white',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  confirmButton: {
    backgroundColor: DESIGN_TOKENS.colors.success,
    paddingVertical: 14,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
    marginVertical: DESIGN_TOKENS.spacing.md,
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  rejectButton: {
    backgroundColor: DESIGN_TOKENS.colors.danger + '10',
    paddingVertical: 12,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.danger + '20',
  },
  rejectButtonText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.danger,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  customerCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.lg,
    marginBottom: DESIGN_TOKENS.spacing.lg,
    alignItems: 'center',
  },
  customerName: {
    fontSize: 20,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  customerAddress: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    textAlign: 'center',
    marginBottom: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  customerPhone: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  etaContainer: {
    alignItems: 'center',
    marginVertical: DESIGN_TOKENS.spacing.lg,
  },
  etaLabel: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  etaTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  successIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textPrimary,
    textAlign: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  successAmount: {
    fontSize: 20,
    color: DESIGN_TOKENS.colors.success,
    textAlign: 'center',
    marginBottom: DESIGN_TOKENS.spacing.xl,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  doneButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 14,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default ActiveDeliveryScreen;