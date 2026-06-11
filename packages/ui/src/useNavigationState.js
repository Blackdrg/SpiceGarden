"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDeepLink = exports.useNavigationPersistence = void 0;
const react_1 = require("react");
const trackEvent = (event) => {
    if (typeof window === 'undefined')
        return;
    fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...event, timestamp: Date.now() }),
        keepalive: true,
    }).catch(() => { });
};
const STORAGE_KEY = 'sg_navigation_state';
const useNavigationPersistence = () => {
    const [navigationHistory, setNavigationHistory] = (0, react_1.useState)([]);
    const currentPathRef = (0, react_1.useRef)('');
    (0, react_1.useEffect)(() => {
        if (typeof window === 'undefined')
            return;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setNavigationHistory(JSON.parse(saved));
            }
            catch (e) {
                console.warn('Failed to restore navigation state', e);
            }
        }
    }, []);
    const pushState = (path, params) => {
        const state = {
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
exports.useNavigationPersistence = useNavigationPersistence;
const useDeepLink = () => {
    const getDeepLink = (path, params) => {
        if (!params || Object.keys(params).length === 0) {
            return path;
        }
        const search = new URLSearchParams(params).toString();
        return `${path}?${search}`;
    };
    const parseDeepLink = (url) => {
        if (typeof window === 'undefined')
            return { path: '/', params: {} };
        const urlToParse = url || window.location.href;
        try {
            const parsed = new URL(urlToParse, 'http://localhost');
            const params = {};
            parsed.searchParams.forEach((value, key) => {
                params[key] = value;
            });
            return { path: parsed.pathname, params };
        }
        catch {
            return { path: '/', params: {} };
        }
    };
    return { getDeepLink, parseDeepLink };
};
exports.useDeepLink = useDeepLink;
