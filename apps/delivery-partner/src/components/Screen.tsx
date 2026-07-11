import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 48,
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: DESIGN_TOKENS.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: DESIGN_TOKENS.colors.border,
        }}
      >
        {showBack && navigation ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 22, color: DESIGN_TOKENS.colors.primary }}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24, marginRight: 12 }} />
        )}
        <Text style={{ flex: 1, fontSize: 20, fontWeight: '700', color: DESIGN_TOKENS.colors.textPrimary }}>{title}</Text>
        {right}
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
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
      style={{
        backgroundColor: disabled ? DESIGN_TOKENS.colors.border : DESIGN_TOKENS.colors.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function CardView({ children, style }: { children: React.ReactNode; style?: object }): React.JSX.Element {
  return (
    <View
      style={[
        {
          backgroundColor: DESIGN_TOKENS.colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: DESIGN_TOKENS.colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
