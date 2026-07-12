import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import type { Navigator } from '../types';

interface ScreenProps {
  title: string;
  navigation?: Navigator;
  showBack?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
}

export function Screen({ title, navigation, showBack = true, right, children }: ScreenProps): React.JSX.Element {
  return (
    <View style={{ flex: 1, backgroundColor: DESIGN_TOKENS.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={DESIGN_TOKENS.colors.surface} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 48,
          paddingHorizontal: DESIGN_TOKENS.spacing.md,
          paddingBottom: DESIGN_TOKENS.spacing.sm,
          backgroundColor: DESIGN_TOKENS.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: DESIGN_TOKENS.colors.border,
          ...DESIGN_TOKENS.shadows.small,
        }}
      >
        {showBack && navigation ? (
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{ padding: DESIGN_TOKENS.spacing.xs, marginRight: DESIGN_TOKENS.spacing.xs }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <View style={{
              width: 24,
              height: 24,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: DESIGN_TOKENS.colors.primary }}>←</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={{ flex: 1, fontSize: 20, fontWeight: '700', color: DESIGN_TOKENS.colors.textPrimary, fontFamily: DESIGN_TOKENS.typography.fontFamily }}>{title}</Text>
        {right}
      </View>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: DESIGN_TOKENS.spacing.md, paddingBottom: DESIGN_TOKENS.spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}): React.JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={{
        backgroundColor: disabled ? DESIGN_TOKENS.colors.border : DESIGN_TOKENS.colors.primary,
        paddingVertical: DESIGN_TOKENS.spacing.sm,
        paddingHorizontal: DESIGN_TOKENS.spacing.md,
        borderRadius: DESIGN_TOKENS.radius.button,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        ...(disabled ? {} : DESIGN_TOKENS.shadows.small),
      }}
    >
      <Text style={{ color: disabled ? DESIGN_TOKENS.colors.textTertiary : '#fff', fontSize: 16, fontWeight: '700', fontFamily: DESIGN_TOKENS.typography.fontFamily }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function CardView({ children, style }: { children: React.ReactNode; style?: object }): React.JSX.Element {
  return (
    <View
      style={[
        {
          backgroundColor: DESIGN_TOKENS.colors.surface,
          borderRadius: DESIGN_TOKENS.radius.card,
          padding: DESIGN_TOKENS.spacing.md,
          marginBottom: DESIGN_TOKENS.spacing.md,
          borderWidth: 1,
          borderColor: DESIGN_TOKENS.colors.borderLight,
          ...DESIGN_TOKENS.shadows.small,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
