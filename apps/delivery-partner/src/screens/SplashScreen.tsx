import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import type { ScreenProps } from '../types';

export default function SplashScreen(_props: ScreenProps): React.JSX.Element {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: DESIGN_TOKENS.colors.background }}>
      <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
      <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '700', color: DESIGN_TOKENS.colors.textPrimary }}>
        SpiceGarden Partner
      </Text>
    </View>
  );
}
