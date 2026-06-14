"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOfflineQueue = exports.useNetworkStatus = void 0;
/// <reference lib="dom" />
const react_1 = require("react");
const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = (0, react_1.useState)(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [lastOnline, setLastOnline] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
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
    // Add a request to the queue
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
            // Try to process the queue immediately if we're online
            if (isOnline && !isProcessing) {
                processQueue();
            }
        });
    }, [isOnline, isProcessing, queue, processQueue]);
    // Process the queue
    const processQueue = (0, react_1.useCallback)(async () => {
        if (isProcessing || !isOnline || queue.length === 0) {
            return;
        }
        setIsProcessing(true);
        try {
            // Process all queued requests
            const requestsToProcess = [...queue];
            setQueue([]);
            await Promise.all(requestsToProcess.map(async (request) => {
                try {
                    // In a real implementation, we would make the actual API call here
                    // For now, we'll simulate it with a resolved promise
                    // This would be replaced with actual API calls using the shared API
                    const result = await simulateApiCall(request.endpoint, request.options);
                    request.resolve(result);
                }
                catch (error) {
                    // If a request fails, we could retry it or give up
                    // For simplicity, we'll reject it
                    request.reject(error);
                }
            }));
        }
        finally {
            setIsProcessing(false);
            // If there are still items in the queue (added during processing), process them
            if (!isOnline && queue.length > 0) {
                // We're still offline, so we'll keep them queued
            }
            else if (isOnline && queue.length > 0) {
                // We're online and there are new items, process them
                processQueue();
            }
        }
    }, [isOnline, queue, simulateApiCall]);
    // Simulate API call - replace with actual API calls in real implementation
    const simulateApiCall = (0, react_1.useCallback)(async (endpoint, options = {}) => {
        // In a real implementation, options would contain method, headers, body, etc.
        // For simulation, we'll just acknowledge we received it
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
    // Retry failed requests
    const retryFailedRequests = (0, react_1.useCallback)(() => {
        // In a more sophisticated implementation, we would track failed requests
        // and retry them with exponential backoff
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
