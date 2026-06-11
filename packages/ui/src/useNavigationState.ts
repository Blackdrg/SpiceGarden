import { useState, useEffect, useRef } from 'react';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
}

const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window === 'undefined') return;
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...event, timestamp: Date.now() }),
    keepalive: true,
  }).catch(() => {});
};

interface NavigationState {
  path: string;
  timestamp: number;
  params?: Record<string, string>;
}

const STORAGE_KEY = 'sg_navigation_state';

export const useNavigationPersistence = () => {
  const [navigationHistory, setNavigationHistory] = useState<NavigationState[]>([]);
  const currentPathRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNavigationHistory(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to restore navigation state', e);
      }
    }
  }, []);

  const pushState = (path: string, params?: Record<string, string>) => {
    const state: NavigationState = {
      path,
      timestamp: Date.now(),
      params,
    };

    setNavigationHistory(prev => {
      const updated = [...prev.slice(-49), state];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    currentPathRef.current = path;
    trackEvent({
      event: 'navigation_change',
      properties: { path, ...params },
    });
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      setNavigationHistory(newHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return navigationHistory[navigationHistory.length - 2]?.path || '/';
    }
    return '/';
  };

  const clearHistory = () => {
    setNavigationHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const canGoBack = navigationHistory.length > 1;

  return { pushState, goBack, clearHistory, canGoBack, history: navigationHistory };
};

export const useDeepLink = () => {
  const getDeepLink = (path: string, params?: Record<string, string>) => {
    if (!params || Object.keys(params).length === 0) {
      return path;
    }
    const search = new URLSearchParams(params).toString();
    return `${path}?${search}`;
  };

  const parseDeepLink = (url?: string) => {
    if (typeof window === 'undefined') return { path: '/', params: {} };
    const urlToParse = url || window.location.href;
    try {
      const parsed = new URL(urlToParse, 'http://localhost');
      const params: Record<string, string> = {};
      parsed.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return { path: parsed.pathname, params };
    } catch {
      return { path: '/', params: {} };
    }
  };

  return { getDeepLink, parseDeepLink };
};