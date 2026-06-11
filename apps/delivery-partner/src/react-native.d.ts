declare module 'react-native' {
  import * as React from 'react';

  export const Animated: any;
  export const Easing: any;
  export const ActivityIndicator: React.FC<any>;
  export const FlatList: React.FC<any>;
  export const Linking: { openURL: (url: string) => Promise<void> };
  export const Switch: React.FC<any>;
  export const TextInput: React.FC<any>;
  export const TouchableOpacity: React.FC<any>;
  export const ScrollView: React.FC<any>;
  export const StyleSheet: { create: (styles: any) => any };
  export const Platform: { OS: string };
  export const Dimensions: { get: (dim: string) => { width: number; height: number } };
  export const Alert: {
    alert: (title: string, message?: string, buttons?: any[], options?: any) => void;
    prompt: (title: string, message?: string, callbackOrButtons?: any, type?: any, defaultValue?: string, keyboardType?: string, options?: any) => void;
  };
}

declare module 'react-native-maps' {
  import * as React from 'react';
  export const MapView: React.FC<{ children?: React.ReactNode; style?: any; initialRegion?: any }>;
  export const Marker: React.FC<{ coordinate: any; title?: string; children?: React.ReactNode }>;
  export const Polyline: React.FC<{ coordinates: any[]; strokeColor?: string; strokeWidth?: number }>;
}
