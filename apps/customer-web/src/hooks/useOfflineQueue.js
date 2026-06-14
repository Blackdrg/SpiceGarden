"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOfflineQueue = exports.useNetworkStatus = void 0;
/// <reference lib="dom" />
const react_1 = require("react");
const useNetworkStatus = () => {
    const getOnline = () => typeof navigator !== 'undefined' ? navigator.onLine : true;
    const [isOnline, setIsOnline] = (0, react_1.useState)(getOnline);
    const [lastOnline, setLastOnline] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (typeof window === 'undefined') {
            return;
        }
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
exports.useNetworkStatus = useNetworkStatus;
const useOfflineQueue = () => {
    const { isOnline } = (0, exports.useNetworkStatus)();
    const [queue, setQueue] = (0, react_1.useState)([]);
    const [isProcessing, setIsProcessing] = (0, react_1.useState)(false);
    const simulateApiCall = (0, react_1.useCallback)(async (endpoint, options = {}) => {
        const optionsReceived = typeof options === 'object' && options !== null;
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
        const baseDelay = optionsReceived ? 600 : 400;
        if (Math.random() < 0.1) {
            throw new Error('Network error');
        }
        await new Promise(resolve => setTimeout(resolve, baseDelay));
        return { message: 'Success' };
    }, []);
    const processQueue = (0, react_1.useCallback)(async () => {
        if (isProcessing || !isOnline || queue.length === 0) {
            return;
        }
        setIsProcessing(true);
        try {
            const requestsToProcess = [...queue];
            setQueue([]);
            await Promise.all(requestsToProcess.map(async (request) => {
                try {
                    const result = await simulateApiCall(request.endpoint, request.options);
                    request.resolve(result);
                }
                catch (error) {
                    request.reject(error);
                }
            }));
            if (isOnline && queue.length > 0) {
                await processQueue();
            }
        }
        finally {
            setIsProcessing(false);
        }
    }, [isOnline, isProcessing, queue, simulateApiCall]);
    const enqueueRequest = (0, react_1.useCallback)((endpoint, options = {}) => {
        return new Promise((resolve, reject) => {
            const id = Math.random().toString(36).substr(2, 9);
            const queuedRequest = {
                id,
                endpoint,
                options,
                resolve,
                reject
            };
            setQueue(prev => [...prev, queuedRequest]);
            if (isOnline && !isProcessing) {
                processQueue();
            }
        });
    }, [isOnline, isProcessing, processQueue]);
    const retryFailedRequests = (0, react_1.useCallback)(() => {
        processQueue();
    }, [processQueue]);
    return {
        enqueueRequest,
        isOnline,
        queueLength: queue.length,
        retryFailedRequests
    };
};
exports.useOfflineQueue = useOfflineQueue;
