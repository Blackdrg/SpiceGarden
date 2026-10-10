import React, { useReducer, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Switch, Alert, useWindowDimensions, TextInput, AppState as RNAppState, AppStateStatus } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import * as Location from 'expo-location';
import { getCurrentLocation, requestLocationPermission, watchLocation, type LocationPoint } from './src/services/location.service';

const BackgroundTimer = { start: () => {}, stopBackgroundTimer: () => {} };

type GeoError = {
  code: number;
  message: string;
};

type GeoPosition = {
  coords: {
    latitude: number;
    longitude: number;
    altitude?: number | null;
    accuracy: number;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  timestamp: number;
};

const STATUS_LABEL: Record<string, string> = {
  idle: 'IDLE',
  assigned: 'ASSIGNED',
  navigating_to_pickup: 'TO PICKUP',
  at_pickup: 'AT PICKUP',
  navigating_to_drop: 'TO CUSTOMER',
  completed: 'DONE',
  failed: 'FAILED',
  delayed: 'DELAYED',
};

type DeliveryStatus = 'idle' | 'assigned' | 'navigating_to_pickup' | 'at_pickup' | 'navigating_to_drop' | 'completed' | 'failed' | 'delayed';

interface Order {
  id: string;
  orderNumber: string;
  restaurant: { name: string; address: string; phone: string; location?: { lat: number; lng: number } };
  customer: { name: string; address: string; phone: string; location?: { lat: number; lng: number } };
  amount: number;
  distanceKm: number;
  otp: string;
  status: DeliveryStatus;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  createdAt?: Date;
  etaMinutes?: number;
  surgeMultiplier?: number;
  incentiveAmount?: number;
}

interface DailyEarnings {
  today: number;
  pending: number;
  bonus: number;
  ordersToday: number;
}

interface ShiftInfo {
  isActive: boolean;
  type: string;
  endTime: string;
}

type AppState = {
  isOnline: boolean;
  incomingOrder: Order | null;
  activeDelivery: Order | null;
  earnings: DailyEarnings;
  shift: ShiftInfo | null;
  deliveryOtp: string;
  otpError: string;
  log: string[];
  expandedIssue: boolean;
  activeScreen: 'home' | 'earnings';
  locationPermission: 'granted' | 'denied' | 'pending';
};

type AppAction =
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'SET_INCOMING_ORDER'; payload: Order | null }
  | { type: 'SET_ACTIVE_DELIVERY'; payload: Order | null }
  | { type: 'ADD_EARNINGS'; payload: { amount: number; incentive?: number } }
  | { type: 'SET_SHIFT'; payload: ShiftInfo | null }
  | { type: 'SET_DELIVERY_OTP'; payload: string }
  | { type: 'SET_OTP_ERROR'; payload: string }
  | { type: 'ADD_LOG'; payload: string }
  | { type: 'SET_EXPANDED_ISSUE'; payload: boolean }
  | { type: 'SET_ACTIVE_SCREEN'; payload: 'home' | 'earnings' }
  | { type: 'SET_LOCATION_PERMISSION'; payload: 'granted' | 'denied' | 'pending' }
  | { type: 'COMPLETE_DELIVERY'; payload: { amount: number; incentive?: number; orderNumber: string } }
  | { type: 'ACCEPT_ORDER'; payload: Order };

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomColor: '#f1f5f9', borderBottomWidth: 1 }}>
      <Text style={{ color: '#64748b', fontSize: 13, flex: 1 }}>{label}</Text>
      <Text style={{ color: '#0f172a', fontSize: 13, fontWeight: '600', flex: 2, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

interface EarnRowProps {
  label: string;
  value: string;
  pct: number;
}

function EarnRow({ label, value, pct }: EarnRowProps) {
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ color: '#64748b', fontSize: 13 }}>{label}</Text>
        <Text style={{ color: '#0f172a', fontSize: 13, fontWeight: '600' }}>{value}</Text>
      </View>
      <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: DESIGN_TOKENS.colors.success, borderRadius: 3 }} />
      </View>
    </View>
  );
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    case 'SET_INCOMING_ORDER':
      return { ...state, incomingOrder: action.payload };
    case 'SET_ACTIVE_DELIVERY':
      return { ...state, activeDelivery: action.payload };
    case 'ADD_EARNINGS':
      return {
        ...state,
        earnings: {
          ...state.earnings,
          pending: state.earnings.pending + action.payload.amount,
        },
      };
    case 'SET_SHIFT':
      return { ...state, shift: action.payload };
    case 'SET_DELIVERY_OTP':
      return { ...state, deliveryOtp: action.payload };
    case 'SET_OTP_ERROR':
      return { ...state, otpError: action.payload };
    case 'ADD_LOG':
      return { ...state, log: [action.payload, ...state.log.slice(0, 9)] };
    case 'SET_EXPANDED_ISSUE':
      return { ...state, expandedIssue: action.payload };
    case 'SET_ACTIVE_SCREEN':
      return { ...state, activeScreen: action.payload };
    case 'SET_LOCATION_PERMISSION':
      return { ...state, locationPermission: action.payload };
    case 'COMPLETE_DELIVERY':
      return {
        ...state,
        earnings: {
          ...state.earnings,
          today: state.earnings.today + action.payload.amount + (action.payload.incentive || 0),
          ordersToday: state.earnings.ordersToday + 1,
          pending: state.earnings.pending - action.payload.amount,
          bonus: state.earnings.bonus + (action.payload.incentive ? action.payload.amount * 0.1 : 0),
        },
        activeDelivery: null,
        deliveryOtp: '',
      };
    case 'ACCEPT_ORDER':
      return {
        ...state,
        activeDelivery: { ...action.payload, status: 'assigned' as const, acceptedAt: new Date() },
        incomingOrder: null,
        earnings: { ...state.earnings, pending: state.earnings.pending + action.payload.amount },
      };
    default:
      return state;
  }
}

const DRIVER_NAME = 'Raj Kumar';
const VEHICLE = 'Bajaj Dominar 400 | DL8CAB 7890';
const DEFAULT_OTP = '234567';

const issueTypes = [
  { icon: '!', label: 'Road Blocked', color: DESIGN_TOKENS.colors.warning },
  { icon: '!', label: 'No Response', color: DESIGN_TOKENS.colors.danger },
  { icon: '!', label: 'Battery Low', color: DESIGN_TOKENS.colors.warning },
  { icon: '!', label: 'Food Stuck', color: DESIGN_TOKENS.colors.warning },
  { icon: '!', label: 'Running Late', color: DESIGN_TOKENS.colors.warning },
  { icon: '!', label: 'Wrong Location', color: DESIGN_TOKENS.colors.danger },
];

function fmtTime(d?: Date) {
  return d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
}

function timeAgo(d?: Date) {
  if (!d) return '';
  const mins = Math.floor((+new Date() - +d) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function demoIncoming(): Order {
  return {
    id: `ord-${Date.now()}`,
    orderNumber: `SG-${Date.now().toString(36).toUpperCase()}`,
    restaurant: { name: 'Burger King — Mohali', address: 'Phase 5, Mohali', phone: '+91 98765 43210', location: { lat: 30.7333, lng: 76.7794 } },
    customer: { name: 'Amit Verma', address: 'Sector 71, Mohali', phone: '+91 91234 56789', location: { lat: 30.71, lng: 76.78 } },
    amount: 68,
    distanceKm: 4.2,
    otp: DEFAULT_OTP,
    status: 'assigned',
  };
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

function DriverHeader({ isOnline, onToggleOnline }: { isOnline: boolean; onToggleOnline: (value: boolean) => void }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>SpiceGarden Driver</Text>
        <Text style={styles.subtitle}>{DRIVER_NAME}</Text>
        <Text style={styles.vehicleTag}>{VEHICLE}</Text>
      </View>
    <View style={styles.onlineToggle}>
      <Text style={isOnline ? styles.onlineText : styles.offlineText}>
        {isOnline ? '● ONLINE' : '● OFFLINE'}
      </Text>
      <Switch
        value={isOnline}
        onValueChange={onToggleOnline}
        trackColor={{ false: '#555', true: DESIGN_TOKENS.colors.success }}
        thumbColor="white"
        accessibilityLabel="Toggle online status"
      />
    </View>
    </View>
  );
}

function DriverStats({ earnings }: { earnings: DailyEarnings }) {
  return (
    <View style={styles.statsRow}>
      <StatCard label="Today" value={`₹${earnings.today}`} sub={`${earnings.ordersToday} orders`} />
      <StatCard label="Pending" value={`₹${earnings.pending}`} sub="to be credited" />
      <StatCard label="Bonus" value={`₹${earnings.bonus}`} sub="weekly" />
    </View>
  );
}

function DriverTabBar({ activeScreen, onChange }: { activeScreen: 'home' | 'earnings'; onChange: (screen: 'home' | 'earnings') => void }) {
  return (
    <View style={styles.tabRow}>
      {(['home', 'earnings'] as const).map((t) => (
        <Pressable
          key={t}
          onPress={() => onChange(t)}
          style={[styles.tab, activeScreen === t && styles.tabActive]}
          accessibilityLabel={`Switch to ${t} screen`}
          accessibilityRole="tab"
        >
          <Text style={[styles.tabLabel, activeScreen === t && styles.tabLabelActive]}>
            {t === 'home' ? 'Active' : 'Earnings'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function HomeScreen({ incomingOrder, activeDelivery, locationPermission, isOnline, deliveryOtp, otpError, log, expandedIssue, dispatch, socketRef, SCREEN_W }: {
  incomingOrder: Order | null;
  activeDelivery: Order | null;
  locationPermission: 'granted' | 'denied' | 'pending';
  isOnline: boolean;
  deliveryOtp: string;
  otpError: string;
  log: string[];
  expandedIssue: boolean;
  dispatch: React.Dispatch<AppAction>;
  socketRef: React.RefObject<Socket | null>;
  SCREEN_W: number;
}) {
  const rejectOrder = () => {
    if (!incomingOrder) return;
    dispatch({ type: 'SET_INCOMING_ORDER', payload: null });
    dispatch({ type: 'ADD_LOG', payload: `Rejected #${incomingOrder.orderNumber}` });
    socketRef.current?.emit('orderRejected', { orderId: incomingOrder.id, reason: 'declined_by_driver' });
  };

  const acceptOrder = () => {
    if (!incomingOrder) return;
    dispatch({ type: 'ACCEPT_ORDER', payload: incomingOrder });
    Alert.alert('Order Accepted', `Heading to ${incomingOrder.restaurant.name}`);
  };

  const navigateTo = (destination: string, addr: string, location?: { lat: number; lng: number }) => {
    if (location) {
      Alert.alert('Navigation', `Opening maps to ${destination}: ${addr}.\n(In production, this opens Google Maps.)`);
      dispatch({ type: 'ADD_LOG', payload: `Navigating → ${destination}` });
    } else {
      Alert.alert('Navigation', `Opening maps to ${destination}: ${addr}`);
    }
  };

  const confirmPickup = () => {
    if (!activeDelivery) return;
    dispatch({ type: 'SET_DELIVERY_OTP', payload: DEFAULT_OTP });
    dispatch({ type: 'ADD_LOG', payload: `Arrived at pickup: ${activeDelivery.restaurant.name}` });
  };

  const verifyOtpAndPickup = () => {
    if (!activeDelivery) return;
    if (deliveryOtp !== activeDelivery.otp) {
      dispatch({ type: 'SET_OTP_ERROR', payload: 'Invalid OTP — ask the customer' });
      dispatch({ type: 'ADD_LOG', payload: 'OTP verification failed' });
      return;
    }
    dispatch({ type: 'SET_OTP_ERROR', payload: '' });
    dispatch({ type: 'SET_ACTIVE_DELIVERY', payload: { ...activeDelivery, status: 'navigating_to_drop' as const, pickedUpAt: new Date() }});
    dispatch({ type: 'ADD_LOG', payload: `OTP verified — picked up #${activeDelivery.orderNumber}` });
    Alert.alert('Pickup Confirmed', 'Navigate to customer now!');
  };

  const completeDelivery = () => {
    if (!activeDelivery) return;
    dispatch({ type: 'COMPLETE_DELIVERY', payload: { amount: activeDelivery.amount, incentive: activeDelivery.incentiveAmount, orderNumber: activeDelivery.orderNumber }});
    Alert.alert('Delivered!', `+₹${activeDelivery.amount + (activeDelivery.incentiveAmount || 0)} added to today's earnings`);
  };

  const handleFailedDelivery = (reason: string) => {
    dispatch({ type: 'ADD_LOG', payload: `Delivery failed: ${reason}` });
    Alert.alert('Delivery Failed', `Marked as ${reason}`, [
      { text: 'OK', onPress: () => dispatch({ type: 'SET_ACTIVE_DELIVERY', payload: null }) }
    ]);
  };

  const reportIssue = (label: string) => {
    dispatch({ type: 'ADD_LOG', payload: `Issue reported: ${label}` });
    socketRef.current?.emit('driverIssue', { orderId: activeDelivery?.id, issue: label });
    Alert.alert('Issue Reported', `${label} — Support has been notified.`);
    dispatch({ type: 'SET_EXPANDED_ISSUE', payload: false });
  };

  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {incomingOrder ? (
        <View style={styles.incomingCard}>
          <View style={styles.alertBanner}>
            <Text style={styles.alertBannerText}>🚨 NEW ORDER ARRIVED</Text>
          </View>

          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>#{incomingOrder.orderNumber}</Text>
            <Text style={styles.amountBadge}>+₹{incomingOrder.amount}</Text>
            <Text style={styles.timeInfo}>{fmtTime(incomingOrder.createdAt)} ({timeAgo(incomingOrder.createdAt)})</Text>
          </View>

          <DetailRow label="Pick up from:" value={`${incomingOrder.restaurant.name} (${incomingOrder.restaurant.address})`} />
          <DetailRow label="Deliver to:" value={`${incomingOrder.customer.address}`} />
          <DetailRow label="Distance:" value={`${incomingOrder.distanceKm} km`} />
          <DetailRow label="Order OTP:" value={`${incomingOrder.otp}`} />
          {incomingOrder.surgeMultiplier && incomingOrder.surgeMultiplier > 1 && (
            <DetailRow label="Surge:" value={`${incomingOrder.surgeMultiplier}x`} />
          )}

          <View style={styles.actionRow}>
            <Pressable
              style={[styles.btnSecondary, styles.btnReject]}
              onPress={rejectOrder}
              accessibilityLabel="Reject order"
              accessibilityRole="button"
            >
              <Text style={styles.btnText}>Reject</Text>
            </Pressable>
            <Pressable
              style={[styles.btnSecondary, styles.btnAccept]}
              onPress={acceptOrder}
              accessibilityLabel="Accept order"
              accessibilityRole="button"
            >
              <Text style={styles.btnText}>✅ Accept</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {!incomingOrder && activeDelivery ? (
        <View style={styles.activeCard}>
          <Text style={styles.cardTitle}>🚚 Active Delivery</Text>

          <View style={styles.progressContainer}>
            {['assigned','navigating_to_pickup','at_pickup','navigating_to_drop','completed'].map((s, i) => {
              const currentStatus = activeDelivery.status;
              const steps = ['assigned','navigating_to_pickup','at_pickup','navigating_to_drop','completed'];
              const activeIdx = steps.indexOf(currentStatus);
              const past = i <= activeIdx;
              return (
                <React.Fragment key={s}>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <View style={[styles.progressDot, past ? styles.progressDotActive : styles.progressDotInactive]}>
                      {past ? <Text style={styles.progressDotText}>✓</Text> : <Text style={[styles.progressDotText, { color: '#666' }]}>{i + 1}</Text>}
                    </View>
                    <Text style={[styles.progressLabel, past && { color: '#fff', fontWeight: 'bold' }]}>
                      {s === 'navigating_to_pickup' ? '→Pickup' : s === 'navigating_to_drop' ? '→Drop' : s.replace('_', ' ')}
                    </Text>
                  </View>
                  {i < 4 && <View style={[styles.progressLine, activeIdx >= i && styles.progressLineActive]} />}
                </React.Fragment>
              );
            })}
          </View>

          <View style={styles.contextCards}>
            <View style={styles.contextCard}>
              <Text style={styles.contextLabel}>🏪 PICKUP</Text>
              <Text style={styles.contextName}>{activeDelivery.restaurant.name}</Text>
              <Text style={styles.contextAddr}>{activeDelivery.restaurant.address}</Text>
              <Pressable
                style={styles.navInlineBtn}
                onPress={() => navigateTo('restaurant', activeDelivery.restaurant.address, activeDelivery.restaurant.location)}
                accessibilityLabel="Navigate to pickup"
              >
                <Text style={styles.navInlineText}>📍</Text>
              </Pressable>
            </View>
            <View style={styles.contextCard}>
              <Text style={styles.contextLabel}>📍 DROP</Text>
              <Text style={styles.contextName}>{activeDelivery.customer.name}</Text>
              <Text style={styles.contextAddr}>{activeDelivery.customer.address}</Text>
              <Text style={styles.contextPhone}>📞 {activeDelivery.customer.phone}</Text>
              <Pressable
                style={styles.navInlineBtn}
                onPress={() => navigateTo('customer', activeDelivery.customer.address, activeDelivery.customer.location)}
                accessibilityLabel="Navigate to customer"
              >
                <Text style={styles.navInlineText}>📍</Text>
              </Pressable>
            </View>
          </View>

          {activeDelivery.status === 'assigned' && (
            <Pressable
              style={styles.navBtn}
              onPress={() => navigateTo('restaurant', activeDelivery.restaurant.address, activeDelivery.restaurant.location)}
              accessibilityLabel="Navigate to pickup location"
              accessibilityRole="button"
            >
              <Text style={styles.navBtnText}>📍 Navigate to Pickup</Text>
            </Pressable>
          )}

          {activeDelivery.status === 'navigating_to_pickup' && (
            <>
              <Pressable style={styles.arriveBtn} onPress={confirmPickup}>
                <Text style={styles.navBtnText}>🏪 I'm at Restaurant</Text>
              </Pressable>
              <Pressable
                style={styles.navBtn}
                onPress={() => navigateTo('restaurant', activeDelivery.restaurant.address, activeDelivery.restaurant.location)}
              >
                <Text style={styles.navBtnText}>📍 Open Navigation</Text>
              </Pressable>
            </>
          )}

          {activeDelivery.status === 'at_pickup' && (
            <View style={{ gap: 10 }}>
              <Text style={{ color: '#aaa', fontSize: 13, textAlign: 'center' }}>
                Verify OTP with staff / customer before leaving
              </Text>
              <View style={styles.otpRow}>
                {Array.from({ length: 6 }, (_, i) => (
                  <View key={i} style={styles.otpSlot}>
                    <Text style={styles.otpChar}>({deliveryOtp[i] || '—'})</Text>
                  </View>
                ))}
              </View>
              <Pressable style={[styles.btnSecondary, { backgroundColor: DESIGN_TOKENS.colors.warning, flex: 1 }]} onPress={() => dispatch({ type: 'SET_DELIVERY_OTP', payload: activeDelivery.otp })}>
                <Text style={styles.btnText}>📋 Auto-fill OTP</Text>
              </Pressable>
              {otpError ? <Text style={styles.otpError}>{otpError}</Text> : null}

              <View style={styles.actionRow}>
                <Pressable style={[styles.btnSecondary, styles.btnReject]} onPress={() => dispatch({ type: 'SET_OTP_ERROR', payload: '' })}>
                  <Text style={styles.btnText}>Clear</Text>
                </Pressable>
                <Pressable style={[styles.btnSecondary, styles.btnAccept]} onPress={verifyOtpAndPickup}>
                  <Text style={styles.btnText}>✅ Confirm OTP</Text>
                </Pressable>
              </View>
            </View>
          )}

          {activeDelivery.status === 'navigating_to_drop' && (
            <View style={{ gap: 10 }}>
              <Text style={styles.etaText}>ETA: {activeDelivery.etaMinutes || 15} mins</Text>
              <Pressable
                style={styles.navBtn}
                onPress={() => navigateTo('customer', activeDelivery.customer.address, activeDelivery.customer.location)}
              >
                <Text style={styles.navBtnText}>📍 Navigate to Customer</Text>
              </Pressable>
              <DetailRow label="Customer:" value={`${activeDelivery.customer.name}`} />
              <DetailRow label="Address:" value={`${activeDelivery.customer.address}`} />
              <DetailRow label="Phone:" value={`${activeDelivery.customer.phone}`} />
              <Pressable style={styles.completeBtn} onPress={completeDelivery}>
                <Text style={styles.navBtnText}>🏁 Mark Delivered</Text>
              </Pressable>
              <Pressable
                style={styles.failBtn}
                onPress={() => handleFailedDelivery('customer_unavailable')}
              >
                <Text style={styles.failBtnText}>❗ Mark Failed</Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : null}

      {!incomingOrder && !activeDelivery && (
        <View style={styles.idleCard}>
          <Text style={styles.idleIcon}>⏳</Text>
          <Text style={styles.idleText}>
            {isOnline ? 'Waiting for orders…' : 'Go online to receive orders'}
          </Text>
          {isOnline && locationPermission === 'denied' && (
            <Text style={styles.locationWarning}>Location permission required for delivery</Text>
          )}
          {isOnline && (
            <Pressable
              style={styles.btnAccept}
              onPress={() => {
                const demo = demoIncoming();
                dispatch({ type: 'SET_INCOMING_ORDER', payload: demo });
                dispatch({ type: 'ADD_LOG', payload: 'Demo order injected' });
              }}
            >
              <Text style={styles.btnText}>⚡ Demo Incoming Order</Text>
            </Pressable>
          )}
        </View>
      )}

      {activeDelivery && (
        <View style={styles.issueSection}>
          <Pressable
            onPress={() => dispatch({ type: 'SET_EXPANDED_ISSUE', payload: !expandedIssue })}
            style={styles.issueToggle}
            accessibilityLabel="Report an issue"
            accessibilityRole="button"
          >
            <Text style={styles.issueToggleText}>⚠️ Report an Issue</Text>
            <Text style={styles.issueChevron}>{expandedIssue ? '▲' : '▼'}</Text>
          </Pressable>
          {expandedIssue && (
            <View style={styles.issueGrid}>
              {issueTypes.map((issue) => (
                <Pressable
                  key={issue.label}
                  style={[styles.issueBtn, { width: (SCREEN_W - 52) / 4 }]}
                  onPress={() => reportIssue(issue.label)}
                >
                  <Text style={{ fontSize: 22 }}>{issue.icon}</Text>
                  <Text style={styles.issueLabel}>{issue.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}

      {log.length > 0 && (
        <View style={styles.logCard}>
          <Text style={styles.logTitle}>📋 Recent Activity</Text>
          {log.map((entry, i) => (
            <Text key={`${entry}-${i}`} style={[styles.logEntry, i === 0 && styles.logEntryNew]}>
              {entry}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function EarningsScreen({ earnings, shift }: { earnings: DailyEarnings; shift: ShiftInfo | null }) {
  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.earnBigCard}>
        <Text style={styles.earnLabel}>Today's Earnings</Text>
        <Text style={styles.earnAmount}>₹{earnings.today}</Text>
        <Text style={styles.earnSub}>{earnings.ordersToday} deliveries completed</Text>
      </View>

      <View style={styles.earnGrid}>
        <StatCard label="Pending" value={`₹${earnings.pending}`} sub="yet to credit" />
        <StatCard label="Weekly Bonus" value={`₹${earnings.bonus}`} sub="on-time reward" />
        <StatCard label="Rating" value="⭐ 4.8" sub="lifetime" />
        <StatCard label="Acceptance" value="97%" sub="this month" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Performance</Text>
        <Text style={styles.cardSubtitle}>This week</Text>
        <View style={{ gap: 8 }}>
          <EarnRow label="On-time deliveries" value="184 / 190" pct={97} />
          <EarnRow label="Customer rating" value="4.8 / 5.0" pct={96} />
          <EarnRow label="Acceptance rate" value="97%" pct={97} />
          <EarnRow label="Completed orders" value="42 / week" pct={88} />
        </View>
      </View>

      {shift && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Shift Schedule</Text>
          <Text style={styles.cardSubtitle}>Current shift</Text>
          <View style={styles.shiftInfo}>
            <Text style={styles.shiftInfoText}>Type: {shift.type}</Text>
            <Text style={styles.shiftInfoText}>Ends: {shift.endTime}</Text>
            <Pressable style={styles.shiftEndBtn}>
              <Text style={styles.shiftEndText}>End Shift Early</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: DESIGN_TOKENS.colors.primary },
  subtitle: { color: '#64748b', fontSize: 13, marginTop: 2 },
  vehicleTag: { color: '#94a3b8', fontSize: 11, marginTop: 1 },
  shiftTag: { color: DESIGN_TOKENS.colors.warning, fontSize: 11, marginTop: 4 },
  STATUS_LABEL: { color: '#0f172a', fontSize: 14, marginTop: 4 },
  onlineToggle: { flexDirection: 'row', alignItems: 'center' },
  onlineText: { color: DESIGN_TOKENS.colors.success, marginRight: 8, fontWeight: 'bold', fontSize: 14 },
  offlineText: { color: DESIGN_TOKENS.colors.danger, marginRight: 8, fontWeight: 'bold', fontSize: 14 },

  statsRow: { flexDirection: 'row', padding: 12, gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  statLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: '600' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginVertical: 2 },
  statSub: { fontSize: 11, color: '#94a3b8' },

  tabRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: 'rgba(255, 90, 31, 0.08)', borderBottomWidth: 2, borderBottomColor: DESIGN_TOKENS.colors.primary },
  tabLabel: { color: '#64748b', fontSize: 13 },
  tabLabelActive: { color: DESIGN_TOKENS.colors.primary, fontWeight: 'bold' },

  content: { flex: 1 },

  incomingCard: {
    margin: 14, backgroundColor: '#ffffff', borderRadius: 16,
    borderWidth: 1.5, borderColor: DESIGN_TOKENS.colors.primary, overflow: 'hidden',
    shadowColor: '#ff5a1f', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },
  alertBanner: {
    backgroundColor: DESIGN_TOKENS.colors.primary, paddingVertical: 8, alignItems: 'center',
  },
  alertBannerText: { color: 'white', fontWeight: 'bold', fontSize: 13, letterSpacing: 1.5 },

  activeCard: {
    margin: 14, backgroundColor: '#ffffff', borderRadius: 16,
    borderWidth: 1.5, borderColor: DESIGN_TOKENS.colors.success, padding: 16,
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },

  idleCard: {
    margin: 20, backgroundColor: '#ffffff', borderRadius: 16,
    borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', padding: 32,
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  idleIcon: { fontSize: 48, marginBottom: 12 },
  idleText: { color: '#64748b', marginBottom: 20, fontSize: 15 },
  locationWarning: { color: DESIGN_TOKENS.colors.danger, fontSize: 12, marginTop: 8 },

  progressContainer: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    justifyContent: 'space-between',
  },
  progressDot: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 2,
  },
  progressDotActive: { backgroundColor: DESIGN_TOKENS.colors.success },
  progressDotInactive: { backgroundColor: '#e2e8f0' },
  progressDotText: { fontSize: 11, color: 'white', fontWeight: 'bold' },
  progressLine: { flex: 1, height: 3, backgroundColor: '#e2e8f0', marginHorizontal: 4 },
  progressLineActive: { backgroundColor: DESIGN_TOKENS.colors.success },
  progressLabel: { fontSize: 10, textAlign: 'center', color: '#64748b', marginTop: 3, maxWidth: 50 },
  etaText: { color: '#059669', fontSize: 14, textAlign: 'center', marginBottom: 8, fontWeight: 'bold' },

  contextCards: { flexDirection: 'row', gap: 10, marginVertical: 12 },
  contextCard: {
    flex: 1, backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e2e8f0',
  },
  contextLabel: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, fontWeight: '700' },
  contextName: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 2 },
  contextAddr: { fontSize: 12, color: '#64748b' },
  contextPhone: { fontSize: 12, color: '#059669', marginTop: 4, fontWeight: '600' },
  navInlineBtn: { position: 'absolute', right: 8, top: 8 },
  navInlineText: { fontSize: 16 },

  btnSecondary: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', marginVertical: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  btnText: { color: '#0f172a', fontSize: 14, fontWeight: 'bold' },
  navBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  navBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  arriveBtn: { backgroundColor: DESIGN_TOKENS.colors.warning, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  completeBtn: { backgroundColor: DESIGN_TOKENS.colors.success, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  failBtn: { backgroundColor: DESIGN_TOKENS.colors.danger, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  failBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },

  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 12 },
  otpSlot: {
    width: 40, height: 48, borderRadius: 8, backgroundColor: '#f8fafc',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#cbd5e1',
  },
  otpChar: { fontSize: 18, fontWeight: 'bold', color: DESIGN_TOKENS.colors.primary },
  otpError: { color: DESIGN_TOKENS.colors.danger, textAlign: 'center', fontSize: 13 },

  issueSection: {
    marginHorizontal: 14, marginBottom: 14, backgroundColor: '#ffffff',
    borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0',
  },
  issueToggle: {
    flexDirection: 'row', justifyContent: 'space-between', padding: 14,
    alignItems: 'center', backgroundColor: '#fff7ed',
    borderTopLeftRadius: 12, borderTopRightRadius: 12,
    borderBottomWidth: 1, borderBottomColor: '#ffedd5',
  },
  issueToggleText: { color: '#ea580c', fontWeight: 'bold', fontSize: 14 },
  issueChevron: { color: '#ea580c', fontSize: 12, marginLeft: 8 },
  issueGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 8 },
  issueBtn: {
    backgroundColor: '#f8fafc', borderRadius: 8,
    alignItems: 'center', paddingVertical: 10, borderWidth: 1, borderColor: '#e2e8f0',
  },
  issueLabel: { color: '#475569', fontSize: 11, marginTop: 4, textAlign: 'center', fontWeight: '500' },

  logCard: {
    margin: 14, padding: 14, backgroundColor: '#ffffff',
    borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0',
  },
  logTitle: { color: '#64748b', fontSize: 12, marginBottom: 8, fontWeight: 'bold', textTransform: 'uppercase' },
  logEntry: { color: '#64748b', fontSize: 11, fontFamily: 'monospace', paddingVertical: 1 },
  logEntryNew: { color: DESIGN_TOKENS.colors.success, fontWeight: 'bold' },

  earnBigCard: {
    margin: 14, padding: 24, borderRadius: 16, alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1.5, borderColor: '#a7f3d0',
  },
  earnLabel: { color: '#047857', fontSize: 14, textTransform: 'uppercase', fontWeight: '700' },
  earnAmount: { fontSize: 48, fontWeight: 'bold', color: '#059669', marginVertical: 8 },
  earnSub: { color: '#065f46', fontSize: 14 },
  earnGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 10, paddingBottom: 14 },

  card: {
    margin: 14, padding: 16, backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  cardSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  shiftInfo: { gap: 8 },
  shiftInfoText: { color: '#475569', fontSize: 14 },
  shiftEndBtn: { backgroundColor: DESIGN_TOKENS.colors.warning, padding: 8, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  shiftEndText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountBadge: {
    backgroundColor: '#ecfdf5', color: '#059669',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 16, fontWeight: 'bold',
    borderWidth: 1, borderColor: '#a7f3d0',
  },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btnAccept: { backgroundColor: DESIGN_TOKENS.colors.primary, flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnReject: { backgroundColor: DESIGN_TOKENS.colors.danger, flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  timeInfo: { color: '#64748b', fontSize: 12, marginTop: 4 },

});

const INITIAL_STATE: AppState = {
  isOnline: false,
  incomingOrder: null,
  activeDelivery: null,
  earnings: { today: 0, pending: 0, bonus: 0, ordersToday: 0 },
  shift: null,
  deliveryOtp: '',
  otpError: '',
  log: [],
  expandedIssue: false,
  activeScreen: 'home',
  locationPermission: 'pending',
};

export default function App() {
  const SCREEN_W = useWindowDimensions().width;
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    async function initLocation() {
      const { status } = await requestLocationPermission();
      dispatch({ type: 'SET_LOCATION_PERMISSION', payload: status === 'granted' ? 'granted' : 'denied' });
    }
    initLocation();
  }, []);

  useEffect(() => {
    const appState = RNAppState.getStatus();
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/) && socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    const subscription = RNAppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const { isOnline, incomingOrder, activeDelivery, earnings, shift, deliveryOtp, otpError, log, expandedIssue, activeScreen, locationPermission } = state;

  return (
    <View style={styles.container}>
      <DriverHeader isOnline={isOnline} onToggleOnline={(v) => dispatch({ type: 'SET_ONLINE', payload: v })} />
      <DriverStats earnings={earnings} />
      <DriverTabBar activeScreen={activeScreen} onChange={(s) => dispatch({ type: 'SET_ACTIVE_SCREEN', payload: s })} />
      {activeScreen === 'home' ? (
        <HomeScreen
          incomingOrder={incomingOrder}
          activeDelivery={activeDelivery}
          locationPermission={locationPermission}
          isOnline={isOnline}
          deliveryOtp={deliveryOtp}
          otpError={otpError}
          log={log}
          expandedIssue={expandedIssue}
          dispatch={dispatch}
          socketRef={socketRef}
          SCREEN_W={SCREEN_W}
        />
      ) : (
        <EarningsScreen earnings={earnings} shift={shift} />
      )}
    </View>
  );
}