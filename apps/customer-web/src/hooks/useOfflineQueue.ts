/// <reference lib="dom" />
import { useState, useCallback, useEffect } from 'react';

const API_BASE_URL =
  (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_API_URL || process.env?.API_URL)) ||
  'http://localhost:3001';

interface QueuedRequest {
  id: string;
  endpoint: string;
  options: RequestInit;
  resolve: (_value?: unknown) => void;
  reject: (_reason?: unknown) => void;
}

async function sendRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [queue, setQueue] = useState<QueuedRequest[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessing || !isOnline) return;

    setIsProcessing(true);
    try {
      const requestsToProcess = [...queue];
      setQueue([]);

      await Promise.all(
        requestsToProcess.map(async (request) => {
          try {
            const result = await sendRequest(request.endpoint, request.options);
            request.resolve(result);
          } catch (error) {
            request.reject(error);
          }
        })
      );
    } finally {
      setIsProcessing(false);
    }
  }, [isOnline, isProcessing, queue]);

  useEffect(() => {
    if (isOnline && !isProcessing && queue.length > 0) {
      void processQueue();
    }
  }, [isOnline, isProcessing, queue, processQueue]);

  const enqueueRequest = useCallback(
    <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      return new Promise<T>((resolve, reject) => {
        const id = Math.random().toString(36).substr(2, 9);
        const queuedRequest: QueuedRequest = {
          id,
          endpoint,
          options,
          resolve: resolve as (_value?: unknown) => void,
          reject,
        };
        setQueue((prev) => [...prev, queuedRequest]);
      });
    },
    []
  );

  const retryFailedRequests = useCallback(() => {
    if (isOnline && !isProcessing && queue.length > 0) {
      void processQueue();
    }
  }, [isOnline, isProcessing, queue, processQueue]);

  return {
    enqueueRequest,
    isOnline,
    queueLength: queue.length,
    retryFailedRequests,
  };
};
