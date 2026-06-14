import React, { createContext, useContext, useMemo } from 'react';
import { useNetworkStatus } from '../hooks/useOfflineQueue';

const NetworkStatusContext = createContext({
   isOnline: true,
   lastOnline: null as Date | null,
});

export const NetworkStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const { isOnline, lastOnline } = useNetworkStatus();

  const value = useMemo(() => ({ isOnline, lastOnline }), [isOnline, lastOnline]);

  return (
    <NetworkStatusContext.Provider value={value}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatusContext = () => {
  const context = useContext(NetworkStatusContext);
  if (!context) {
    throw new Error('useNetworkStatusContext must be used within NetworkStatusProvider');
  }
  return context;
};