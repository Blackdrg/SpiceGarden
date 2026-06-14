declare module 'react-native-maps' {
  import * as React from 'react';
  export const MapView: React.FC<{ children?: React.ReactNode; style?: any; initialRegion?: any; showsUserLocation?: boolean; followsUserLocation?: boolean }>;
  export const Marker: React.FC<{ coordinate: any; title?: string; children?: React.ReactNode; pinColor?: string }>;
  export const Polyline: React.FC<{ coordinates: any[]; strokeColor?: string; strokeWidth?: number }>;
}

