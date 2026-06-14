/// <reference lib="dom" />
import { useState, useCallback, useEffect, useRef } from 'react';

interface QueuedRequest {
  id: string;
  endpoint: string;
  options: unknown;
  resolve: (_value?: unknown) => void;
  reject: (_reason?: unknown) => void;
}

export const useOfflineQueue = () => {
  const { isOnline } = useOfflineQueue.__useNetworkStatus();
  const [queue, setQueue] = useState<QueuedRequest[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);

  const enqueueRequest = useCallback(<T>(
    endpoint: string,
    options: unknown = {}
  ): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const id = Math.random().toString(36).substr(2, 9);
      const queuedRequest: QueuedRequest = {
        id,
        endpoint,
        options,
        resolve: resolve as (_value?: unknown) => void,
        reject,
      };

      setQueue(prev => [...prev, queuedRequest]);

      if (isOnline && !isProcessingRef.current) {
        processQueue();
      }
    });
  }, [isOnline]);

  const simulateApiCall = useCallback(async (
    endpoint: string,
    options: unknown = {}
  ): Promise<unknown> => {
    const optionsReceived = typeof options === 'object' && options !== null;
    const baseDelay = optionsReceived ? 600 : 400;
    await new Promise(resolve => setTimeout(resolve, baseDelay));

    if (Math.random() < 0.1) {
      throw new Error('Network error');
    }

    if (endpoint.includes('/restaurants')) {
      return [
        { id: 'rest1', name: 'Demo Restaurant', rating: 4.5 },
        { id: 'rest2', name: 'Another Restaurant', rating: 4.0 }
      ];
    }

    if (endpoint.includes('/orders')) {
      return [
        { id: 'order1', amount: 250, status: 'delivered' },
        { id: 'order2', amount: 120, status: 'preparing' }
      ];
    }

    return { message: 'Success' };
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || !isOnline || queue.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    setIsProcessing(true);

    try {
      const requestsToProcess = [...queue];
      setQueue([]);

      const results = await Promise.all(
        requestsToProcess.map(async (request) => {
          try {
            const result = await simulateApiCall(request.endpoint, request.options);
            request.resolve(result);
          } catch (error) {
            request.reject(error);
          }
        })
      );

      if (isOnline && queue.length > 0) {
        processQueue();
      }
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [isOnline, queue.length, simulateApiCall]);

  const retryFailedRequests = useCallback(() => {
    processQueue();
  }, [processQueue]);

  return {
    enqueueRequest,
    isOnline,
    queueLength: queue.length,
    retryFailedRequests,
  };
};

useOfflineQueue.__useNetworkStatus = () => {
  const getOnline = () => typeof navigator !== 'undefined' ? navigator.onLine : true;
  const [isOnline, setIsOnline] = useState(getOnline);
  const [lastOnline, setLastOnline] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, lastOnline };
};
