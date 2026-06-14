declare module 'react-native' {
  export * from 'react-native';
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
