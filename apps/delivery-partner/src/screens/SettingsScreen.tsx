import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { Screen, CardView } from '../components/Screen';
import type { ScreenProps, ScreenName } from '../types';

type SettingsState = { notifications: boolean; sounds: boolean; location: boolean };
type SettingSection = { title: string; items: { label: string; icon: string; value?: string; toggle?: boolean; settingKey?: keyof SettingsState; navigate?: ScreenName; url?: string }[] };

const sections: SettingSection[] = [
  {
    title: 'Notifications',
    items: [
      { label: 'Push Notifications', icon: 'notifications-outline', toggle: true, settingKey: 'notifications' },
      { label: 'Sound Alerts', icon: 'volume-high-outline', toggle: true, settingKey: 'sounds' },
    ],
  },
  {
    title: 'Privacy & Location',
    items: [
      { label: 'Location Services', icon: 'location-outline', toggle: true, settingKey: 'location' },
    ],
  },
  {
    title: 'Legal & Privacy',
    items: [
      { label: 'Security Center', icon: 'shield-checkmark-outline', navigate: 'DriverLegal' as any },
      { label: 'Driver Agreement', icon: 'document-text-outline', navigate: 'DriverLegal' as any },
      { label: 'Privacy Policy', icon: 'lock-closed-outline', url: 'https://spicegarden.com/privacy' },
      { label: 'Terms of Service', icon: 'document-outline', url: 'https://spicegarden.com/terms' },
      { label: 'Cookie Policy', icon: 'cube-outline', url: 'https://spicegarden.com/cookies' },
      { label: 'Data Retention Policy', icon: 'time-outline', url: 'https://spicegarden.com/data-retention' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Legal & Agreements', icon: 'document-text-outline', navigate: 'DriverLegal' as any },
      { label: 'Change Password', icon: 'lock-closed-outline' },
      { label: 'Delete Account', icon: 'trash-outline' },
    ],
  },
];

export default function SettingsScreen(_props: ScreenProps): React.JSX.Element {
  const [settings, setSettings] = useState<{ notifications: boolean; sounds: boolean; location: boolean }>({
    notifications: true,
    sounds: true,
    location: true,
  });

  const toggleSetting = (key: keyof SettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Screen title="Settings" navigation={_props.navigation}>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <CardView style={styles.sectionCard}>
            {section.items.map((item, index) => (
              <Pressable
                key={item.label}
                style={[
                  styles.settingRow,
                  index < section.items.length - 1 && styles.settingRowBorder,
                ]}
                onPress={() => {
                  if (item.navigate) {
                    _props.navigation.navigate(item.navigate);
                  } else if (item.url) {
                    Linking.openURL(item.url);
                  } else if (item.toggle && item.settingKey) {
                    toggleSetting(item.settingKey);
                  }
                }}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons name={item.icon as any} size={18} color={DESIGN_TOKENS.colors.primary} />
                  </View>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                </View>
                {item.toggle && item.settingKey ? (
                  <View style={[styles.toggleTrack, settings[item.settingKey] && styles.toggleTrackActive]}>
                    <View style={[styles.toggleThumb, settings[item.settingKey] && styles.toggleThumbActive]} />
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={DESIGN_TOKENS.colors.textTertiary} />
                )}
              </Pressable>
            ))}
          </CardView>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: DESIGN_TOKENS.spacing.sm,
    paddingHorizontal: DESIGN_TOKENS.spacing.xs,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: DESIGN_TOKENS.spacing.md,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
    flex: 1,
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: DESIGN_TOKENS.radius.sm,
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 15,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: DESIGN_TOKENS.radius.full,
    backgroundColor: DESIGN_TOKENS.colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: DESIGN_TOKENS.radius.full,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});
