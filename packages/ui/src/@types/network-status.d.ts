declare module './useNetworkStatus' {
  export interface NetworkStatus {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: string | null;
  }
  export function useNetworkStatus(): NetworkStatus;
}