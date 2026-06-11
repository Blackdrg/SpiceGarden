"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTracking = void 0;
const react_1 = require("react");
const socket_io_client_1 = require("socket.io-client");
const constants_1 = require("@spicegarden/shared/constants");
const useTracking = (driverId) => {
    const [location, setLocation] = (0, react_1.useState)(null);
    const [connected, setConnected] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!driverId)
            return;
        const newSocket = (0, socket_io_client_1.io)(constants_1.SOCKET_URL, {
            path: '/socket.io/',
            transports: ['websocket', 'polling'],
        });
        setError(null);
        const onConnect = () => { setConnected(true); setError(null); };
        const onDisconnect = () => setConnected(false);
        const onConnectError = () => {
            setConnected(false);
            setError('Socket disconnected — tracking may be unavailable');
        };
        newSocket.on('connect', onConnect);
        newSocket.on('disconnect', onDisconnect);
        newSocket.on('connect_error', onConnectError);
        // Listen on the tracking namespace
        newSocket.on(`tracking:${driverId}`, (data) => {
            setLocation(data);
        });
        return () => {
            newSocket.off('connect', onConnect);
            newSocket.off('disconnect', onDisconnect);
            newSocket.off('connect_error', onConnectError);
            newSocket.off(`tracking:${driverId}`);
            newSocket.disconnect();
        };
    }, [driverId]);
    return { location, connected, error };
};
exports.useTracking = useTracking;
