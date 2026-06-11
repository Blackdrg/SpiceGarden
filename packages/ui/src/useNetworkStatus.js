"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNetworkStatus = void 0;
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
        // Set initial state based on current navigator.onLine
        setIsOnline(navigator.onLine);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    return { isOnline, lastOnline };
};
exports.useNetworkStatus = useNetworkStatus;
