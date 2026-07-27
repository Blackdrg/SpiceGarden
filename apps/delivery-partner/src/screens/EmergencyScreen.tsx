import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, Linking, StyleSheet, ScrollView } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { Screen, CardView } from '../components/Screen';
import type { ScreenProps } from '../types';

interface RiskAlert {
  id: string;
  zoneName: string;
  riskScore: number;
  severity: string;
  reason: string;
  crimeCategory?: string;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return DESIGN_TOKENS.colors.danger;
    case 'high': return '#F97316';
    case 'medium': return '#F59E0B';
    default: return DESIGN_TOKENS.colors.warning;
  }
};

async function fetchRiskAlerts(): Promise<RiskAlert[]> {
  try {
    const response = await fetch('/api/risk/driver/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId: 'current_driver', lat: 0, lng: 0 }),
    });
    if (response.ok) {
      const data = await response.json();
      return [{
        id: data.zone.id,
        zoneName: data.zone.name,
        riskScore: data.zone.riskScore,
        severity: data.zone.severity,
        reason: data.zone.reason || 'High risk area',
        crimeCategory: data.zone.crimeCategory,
      }];
    }
    return [];
  } catch {
    return [];
  }
}

export default function EmergencyScreen(_props: ScreenProps): React.JSX.Element {
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const loadingRef = useRef(true);

  const loadRiskAlerts = useCallback(async (signal: { active: boolean }) => {
    const alerts = await fetchRiskAlerts();
    if (!signal.active) return;
    setRiskAlerts(alerts);
    loadingRef.current = false;
  }, []);

  useEffect(() => {
    const signal = { active: true };
    loadRiskAlerts(signal);
    return () => {
      signal.active = false;
    };
  }, [loadRiskAlerts]);

  return (
    <Screen title="Emergency & Safety" navigation={_props.navigation}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {riskAlerts.length > 0 && (
          <CardView style={styles.riskAlertCard}>
            <View style={styles.riskAlertHeader}>
              <Ionicons name="warning" size={24} color={DESIGN_TOKENS.colors.danger} />
              <Text style={styles.riskAlertTitle}>Safety Alert</Text>
            </View>
            {riskAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertItem}>
                <Text style={[styles.alertSeverity, { color: getSeverityColor(alert.severity) }]}>
                  {alert.severity.toUpperCase()}
                </Text>
                <Text style={styles.alertZoneName}>{alert.zoneName}</Text>
                <Text style={styles.alertReason}>{alert.reason}</Text>
                {alert.crimeCategory && (
                  <Text style={styles.alertCategory}>Category: {alert.crimeCategory}</Text>
                )}
                <View style={styles.alertScoreRow}>
                  <Text style={styles.alertScoreLabel}>Risk Score:</Text>
                  <View style={styles.scoreBarContainer}>
                    <View style={[
                      styles.scoreBar,
                      { width: `${alert.riskScore}%`, backgroundColor: getSeverityColor(alert.severity) }
                    ]} />
                  </View>
                  <Text style={[styles.alertScoreValue, { color: getSeverityColor(alert.severity) }]}>
                    {alert.riskScore}/100
                  </Text>
                </View>
              </View>
            ))}
          </CardView>
        )}

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
            <Text style={styles.sosText}>Call Support (24/7)</Text>
          </Pressable>
        </CardView>

        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Emergency Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <CardView style={styles.quickActionCard}>
              <Pressable style={styles.quickActionPress} onPress={() => Linking.openURL('tel:100')}>
                <View style={[styles.quickActionIcon, { backgroundColor: DESIGN_TOKENS.colors.dangerLight }]}>
                  <Ionicons name="shield-checkmark" size={22} color={DESIGN_TOKENS.colors.danger} />
                </View>
                <Text style={styles.quickActionText}>Police (100)</Text>
              </Pressable>
            </CardView>
            <CardView style={styles.quickActionCard}>
              <Pressable style={styles.quickActionPress} onPress={() => Linking.openURL('tel:108')}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="medkit" size={22} color="#EF4444" />
                </View>
                <Text style={styles.quickActionText}>Ambulance (108)</Text>
              </Pressable>
            </CardView>
            <CardView style={styles.quickActionCard}>
              <Pressable style={styles.quickActionPress} onPress={() => Linking.openURL('tel:181')}>
                <View style={[styles.quickActionIcon, { backgroundColor: DESIGN_TOKENS.colors.infoLight }]}>
                  <Ionicons name="location-outline" size={22} color={DESIGN_TOKENS.colors.info} />
                </View>
                <Text style={styles.quickActionText}>Share Location</Text>
              </Pressable>
            </CardView>
            <CardView style={styles.quickActionCard}>
              <Pressable style={styles.quickActionPress} onPress={() => Linking.openURL('sms:1091')}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="chatbubbles-outline" size={22} color="#D97706" />
                </View>
                <Text style={styles.quickActionText}>Women Helpline</Text>
              </Pressable>
            </CardView>
          </View>
        </View>

        <CardView style={styles.safetyTipsCard}>
          <Text style={styles.safetyTipsTitle}>Safety Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={DESIGN_TOKENS.colors.success} />
            <Text style={styles.tipText}>Verify customer identity before handing over order</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={DESIGN_TOKENS.colors.success} />
            <Text style={styles.tipText}>Keep your phone charged and accessible</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={DESIGN_TOKENS.colors.success} />
            <Text style={styles.tipText}>Avoid isolated areas after midnight</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={DESIGN_TOKENS.colors.success} />
            <Text style={styles.tipText}>Report suspicious activity immediately</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={DESIGN_TOKENS.colors.success} />
            <Text style={styles.tipText}>Use the SOS button in case of emergency</Text>
          </View>
        </CardView>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  riskAlertCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.lg,
    marginBottom: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.danger + '40',
  },
  riskAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  riskAlertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.danger,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  alertItem: {
    backgroundColor: '#fff',
    borderRadius: DESIGN_TOKENS.radius.md,
    padding: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  alertSeverity: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  alertZoneName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  alertReason: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  alertCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  alertScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertScoreLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  scoreBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 3,
  },
  alertScoreValue: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
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
    flexWrap: 'wrap',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
  },
  quickActionPress: {
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
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
    fontSize: 12,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textAlign: 'center',
  },
  safetyTipsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.lg,
    marginBottom: DESIGN_TOKENS.spacing.lg,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
  },
  safetyTipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: DESIGN_TOKENS.spacing.sm,
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
});

