"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOrderHistory = void 0;
const react_1 = require("react");
const order_constants_1 = require("../constants/order.constants");
/**
 * Hook for managing order history state and logic
 */
const useOrderHistory = () => {
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [filter, setFilter] = (0, react_1.useState)('all');
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [refreshing, setRefreshing] = (0, react_1.useState)(false);
    const [loadingMore, setLoadingMore] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [page, setPage] = (0, react_1.useState)(1);
    const [hasMore, setHasMore] = (0, react_1.useState)(true);
    const [retryCount, setRetryCount] = (0, react_1.useState)(0);
    // Load orders from API/service
    const loadHistory = (0, react_1.useCallback)(async (pageNum = 1, append = false) => {
        try {
            if (pageNum === 1) {
                setLoading(true);
            }
            else {
                setLoadingMore(true);
            }
            setError(null);
            // Import here to avoid circular dependency
            const { orderService } = await Promise.resolve().then(() => __importStar(require('../services/order.service')));
            const response = await orderService.fetchOrders(pageNum, order_constants_1.ORDER_FILTER_CONSTANTS.DEFAULT_LIMIT);
            if (!response.orders || response.orders.length === 0) {
                if (pageNum === 1) {
                    setOrders([]);
                }
                setHasMore(false);
            }
            else {
                setOrders(prev => append ? [...prev, ...response.orders] : response.orders);
                setHasMore(response.hasMore);
            }
        }
        catch (err) {
            setError('Failed to load order history');
            console.error('Failed to load order history:', err);
        }
        finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, []);
    // Load initial data
    (0, react_1.useEffect)(() => {
        loadHistory();
    }, [loadHistory, retryCount]);
    // Filter orders based on selected status
    const filteredOrders = (0, react_1.useMemo)(() => {
        if (filter === 'all')
            return orders;
        return orders.filter(order => order.status === filter);
    }, [orders, filter]);
    // Refresh data
    const onRefresh = (0, react_1.useCallback)(async () => {
        setRefreshing(true);
        setPage(1);
        await loadHistory(1);
    }, [loadHistory]);
    // Load more data
    const loadMore = (0, react_1.useCallback)(() => {
        if (hasMore && !loadingMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadHistory(nextPage, true);
        }
    }, [hasMore, loadingMore, page, loadHistory]);
    // Retry failed load
    const handleRetry = (0, react_1.useCallback)(() => {
        setRetryCount(prev => prev + 1);
    }, []);
    // Handle filter change
    const handleFilterChange = (0, react_1.useCallback)((newFilter) => {
        setFilter(newFilter);
    }, []);
    return {
        orders,
        filteredOrders,
        filter,
        loading,
        refreshing,
        loadingMore,
        error,
        page,
        hasMore,
        loadHistory,
        onRefresh,
        loadMore,
        handleRetry,
        handleFilterChange,
    };
};
exports.useOrderHistory = useOrderHistory;
