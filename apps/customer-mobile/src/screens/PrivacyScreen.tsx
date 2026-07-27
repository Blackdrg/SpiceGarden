import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Easing } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';

const handleDataRequest = (type: 'access' | 'delete') => {
  Alert.alert(
    type === 'access' ? 'Request Data Access' : 'Request Data Deletion',
    type === 'access'
      ? 'We will send you a copy of all personal data we hold about you within 30 days.'
      : 'This will permanently delete all your personal data from our systems. This action cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: type === 'access' ? 'Request Access' : 'Delete My Data',
        style: type === 'delete' ? 'destructive' : 'default',
        onPress: () => {
          Toast.show(type === 'access' ? 'Data access request submitted' : 'Data deletion request submitted', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM,
            backgroundColor: DESIGN_TOKENS.colors.success,
            textColor: 'white',
          });
        },
      },
    ]
  );
};

const handleExport = (format: 'json' | 'csv') => {
  Alert.alert(
    'Export Data',
    `Your data will be exported in ${format.toUpperCase()} format. You will receive an email with the download link.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Export',
        onPress: () => {
          Toast.show(`Data export (${format.toUpperCase()}) initiated`, {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM,
            backgroundColor: DESIGN_TOKENS.colors.info,
            textColor: 'white',
          });
        },
      },
    ]
  );
};

interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  necessary: boolean;
}

interface PrivacyScreenProps {
  route?: {
    params?: {
      source?: string;
    };
  };
}

interface ConsentSectionProps {
  consent: ConsentState;
}

const ConsentSection = ({ consent }: ConsentSectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Consent Status</Text>
    <View style={styles.consentCard}>
      <View style={styles.consentSummary}>
        <View style={[styles.statusDot, { backgroundColor: DESIGN_TOKENS.colors.success }]} />
        <View>
          <Text style={styles.consentStatusText}>Your privacy settings are active</Text>
          <Text style={styles.consentSubtext}>
            {consent.analytics || consent.marketing ? 'Some optional cookies are enabled' : 'Only necessary cookies are enabled'}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

interface PreferenceItemProps {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

const PreferenceItem = ({ icon, title, description, value, disabled, onToggle }: PreferenceItemProps) => (
  <View style={styles.preferenceItem}>
    <View style={styles.preferenceInfo}>
      <View style={styles.preferenceHeader}>
        <Ionicons name={icon as any} size={20} color={DESIGN_TOKENS.colors.textSecondary} />
        <Text style={styles.preferenceTitle}>{title}</Text>
      </View>
      <Text style={styles.preferenceDescription}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{
        false: DESIGN_TOKENS.colors.border,
        true: DESIGN_TOKENS.colors.primary + '66',
      }}
      thumbColor={DESIGN_TOKENS.colors.primary}
      disabled={disabled}
      accessible={true}
      accessibilityLabel={`${title} cookies toggle`}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: disabled || false }}
    />
  </View>
);

interface CookiePreferencesProps {
  consent: ConsentState;
  saving: boolean;
  onToggle: (key: keyof ConsentState) => void;
}

const CookiePreferences = ({ consent, saving, onToggle }: CookiePreferencesProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Cookie Preferences</Text>
    <View style={styles.preferencesCard}>
      <PreferenceItem
        icon="shield-checkmark-outline"
        title="Necessary"
        description="Required for the app to function properly"
        value={consent.necessary}
        disabled={true}
        onToggle={() => onToggle('necessary')}
      />
      <View style={styles.preferenceDivider} />
      <PreferenceItem
        icon="bar-chart-outline"
        title="Analytics"
        description="Help us improve the app experience"
        value={consent.analytics}
        disabled={saving}
        onToggle={() => onToggle('analytics')}
      />
      <View style={styles.preferenceDivider} />
      <PreferenceItem
        icon="megaphone-outline"
        title="Marketing"
        description="Personalized offers and recommendations"
        value={consent.marketing}
        disabled={saving}
        onToggle={() => onToggle('marketing')}
      />
      <View style={styles.preferenceDivider} />
      <PreferenceItem
        icon="settings-outline"
        title="Functional"
        description="Enhanced functionality and personalization"
        value={consent.functional}
        disabled={saving}
        onToggle={() => onToggle('functional')}
      />
    </View>
  </View>
);

interface DataSubjectRequestProps {
  onRequestAccess: () => void;
  onRequestDelete: () => void;
}

const DataSubjectRequest = ({ onRequestAccess, onRequestDelete }: DataSubjectRequestProps) => (
  <Pressable
    style={styles.actionItem}
    onPress={onRequestAccess}
    accessibilityLabel="Request access to your data"
    accessibilityRole="button"
  >
    <View style={[styles.actionIconContainer, { backgroundColor: DESIGN_TOKENS.colors.infoLight }]}>
      <Ionicons name="download-outline" size={22} color={DESIGN_TOKENS.colors.info} />
    </View>
    <View style={styles.actionInfo}>
      <Text style={styles.actionTitle}>Request Access</Text>
      <Text style={styles.actionDescription}>Get a copy of your personal data</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={DESIGN_TOKENS.colors.textTertiary} />
  </Pressable>
);

const DataSubjectRequestsSection = ({ onRequestAccess, onRequestDelete }: DataSubjectRequestProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Data Subject Requests</Text>
    <View style={styles.actionsCard}>
      <DataSubjectRequest onRequestAccess={onRequestAccess} onRequestDelete={onRequestDelete} />
      <View style={styles.actionDivider} />
      <Pressable
        style={styles.actionItem}
        onPress={onRequestDelete}
        accessibilityLabel="Request deletion of your data"
        accessibilityRole="button"
      >
        <View style={[styles.actionIconContainer, { backgroundColor: DESIGN_TOKENS.colors.dangerLight }]}>
          <Ionicons name="trash-outline" size={22} color={DESIGN_TOKENS.colors.danger} />
        </View>
        <View style={styles.actionInfo}>
          <Text style={[styles.actionTitle, { color: DESIGN_TOKENS.colors.danger }]}>Delete My Data</Text>
          <Text style={styles.actionDescription}>Permanently remove all personal data</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={DESIGN_TOKENS.colors.textTertiary} />
      </Pressable>
    </View>
  </View>
);

interface ExportOptionsProps {
  onExportJson: () => void;
  onExportCsv: () => void;
}

const ExportOptions = ({ onExportJson, onExportCsv }: ExportOptionsProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Export Options</Text>
    <View style={styles.exportCard}>
      <Pressable
        style={styles.exportButton}
        onPress={onExportJson}
        accessibilityLabel="Export data as JSON"
        accessibilityRole="button"
      >
        <Ionicons name="document-outline" size={20} color={DESIGN_TOKENS.colors.primary} />
        <Text style={styles.exportButtonText}>Export as JSON</Text>
      </Pressable>
      <View style={styles.exportDivider} />
      <Pressable
        style={styles.exportButton}
        onPress={onExportCsv}
        accessibilityLabel="Export data as CSV"
        accessibilityRole="button"
      >
        <Ionicons name="grid-outline" size={20} color={DESIGN_TOKENS.colors.primary} />
        <Text style={styles.exportButtonText}>Export as CSV</Text>
      </Pressable>
    </View>
  </View>
);

const PrivacyScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState<ConsentState>({
    analytics: false,
    marketing: false,
    functional: true,
    necessary: true,
  });

  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;
    const loadConsent = async () => {
      try {
        const consentJson = await AsyncStorage.getItem('sg_consent');
        if (consentJson) {
          const savedConsent = JSON.parse(consentJson) as ConsentState;
          if (!cancelled) setConsent({
            analytics: savedConsent.analytics ?? false,
            marketing: savedConsent.marketing ?? false,
            functional: savedConsent.functional ?? true,
            necessary: true,
          });
        }
      } catch (err) {
        if (!cancelled) console.error('Failed to load consent:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
          fadeAnim.value = withTiming(1, { duration: DESIGN_TOKENS.motion.page, easing: Easing.out(Easing.quad) });
        }
      }
    };

    loadConsent();
    return () => { cancelled = true; };
  }, [fadeAnim]);

  const handleToggle = async (key: keyof ConsentState) => {
    if (key === 'necessary') {
      Toast.show('Necessary cookies cannot be disabled', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.warning,
        textColor: 'white',
      });
      return;
    }

    setSaving(true);
    const newConsent = { ...consent, [key]: !consent[key] };
    setConsent(newConsent);

    try {
      await AsyncStorage.setItem('sg_consent', JSON.stringify(newConsent));
      Toast.show('Preferences updated', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.success,
        textColor: 'white',
      });
    } catch {
      setConsent(consent);
      Toast.show('Failed to save preferences', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.danger,
        textColor: 'white',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}
        accessible={true}
        accessibilityLabel="Loading privacy settings"
        accessibilityRole="progressbar"
      >
        <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
        <Text style={styles.loadingText}>Loading privacy settings...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={DESIGN_TOKENS.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerText}>Privacy</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={20} color={DESIGN_TOKENS.colors.danger} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <ConsentSection consent={consent} />
          <CookiePreferences consent={consent} saving={saving} onToggle={handleToggle} />
          <DataSubjectRequestsSection onRequestAccess={() => handleDataRequest('access')} onRequestDelete={() => handleDataRequest('delete')} />
          <ExportOptions onExportJson={() => handleExport('json')} onExportCsv={() => handleExport('csv')} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Your privacy is important to us. For questions, contact our Data Protection Officer.
            </Text>
          </View>
        </ScrollView>
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
    gap: DESIGN_TOKENS.spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DESIGN_TOKENS.radius.sm,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: DESIGN_TOKENS.spacing.md,
    paddingBottom: DESIGN_TOKENS.spacing.xxl,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.dangerLight,
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.lg,
    gap: DESIGN_TOKENS.spacing.sm,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    color: DESIGN_TOKENS.colors.dangerDark,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  section: {
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: DESIGN_TOKENS.spacing.sm,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  consentCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  consentSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  consentStatusText: {
    fontSize: 15,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  consentSubtext: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: 2,
  },
  preferencesCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: DESIGN_TOKENS.spacing.md,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: DESIGN_TOKENS.spacing.md,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
    marginBottom: 4,
  },
  preferenceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  preferenceDescription: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    paddingLeft: 28,
  },
  preferenceDivider: {
    height: 1,
    backgroundColor: DESIGN_TOKENS.colors.borderLight,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
  },
  actionsCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: DESIGN_TOKENS.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DESIGN_TOKENS.spacing.sm,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  actionDescription: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: 2,
  },
  actionDivider: {
    height: 1,
    backgroundColor: DESIGN_TOKENS.colors.borderLight,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
  },
  exportCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
    ...DESIGN_TOKENS.shadows.small,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
    padding: DESIGN_TOKENS.spacing.md,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  exportDivider: {
    height: 1,
    backgroundColor: DESIGN_TOKENS.colors.borderLight,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
  },
  footer: {
    marginTop: DESIGN_TOKENS.spacing.md,
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
  },
  footerText: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textTertiary,
    textAlign: 'center',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    lineHeight: 18,
  },
});

export default PrivacyScreen;
