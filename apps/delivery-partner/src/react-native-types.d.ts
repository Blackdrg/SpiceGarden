declare module 'react-native' {
  export * from 'react-native/Libraries/Animated/Animated';
  export * from 'react-native/Libraries/Animated/Easing';
  export * from 'react-native/Libraries/Components/ActivityIndicator/ActivityIndicator';
  export * from 'react-native/Libraries/Components/FlatList/FlatList';
  export * from 'react-native/Libraries/Components/Linking/Linking';
  export * from 'react-native/Libraries/Components/Switch/Switch';
  export * from 'react-native/Libraries/Components/TextInput/TextInput';
  export * from 'react-native/Libraries/Components/Touchable/TouchableOpacity';
  export * from 'react-native/Libraries/StyleSheet/StyleSheet';
  export * from 'react-native/Libraries/Utilities/Platform';
}

declare module 'react-native-maps' {
  const MapView: any;
  const Marker: any;
  const Polyline: any;
  export { MapView, Marker, Polyline };
}

declare module '@testing-library/react-native' {
  export const render: any;
  export const fireEvent: any;
  export const waitFor: any;
}
