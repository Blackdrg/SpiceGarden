import { useEffect, useState } from 'react';

export const useNetworkStatus = () => {
  // Initialize to `true` on both server and client first render so SSR and
  // hydration markup match. The real connectivity state is applied in the
  // effect below once the component mounts on the client.
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastOnline, setLastOnline] = useState<Date | null>(null);

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, lastOnline };
};