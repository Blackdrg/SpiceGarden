import { createContext, ReactNode, use, useMemo } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const NetworkStatusContext = createContext({
   isOnline: true,
   lastOnline: null as Date | null,
});

export const NetworkStatusProvider = ({ children }: { children: ReactNode }) => {
  const { isOnline, lastOnline } = useNetworkStatus();

  const value = useMemo(() => ({ isOnline, lastOnline }), [isOnline, lastOnline]);

  return (
    <NetworkStatusContext.Provider value={value}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatusContext = () => {
  const context = use(NetworkStatusContext);
  if (!context) {
    throw new Error('useNetworkStatusContext must be used within NetworkStatusProvider');
  }
  return context;
};