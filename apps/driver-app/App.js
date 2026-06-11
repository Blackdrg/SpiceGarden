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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_maps_1 = __importStar(require("react-native-maps"));
const geolocation_1 = __importDefault(require("@react-native-community/geolocation"));
const socket_io_client_1 = require("socket.io-client");
const DriverApp = () => {
    const [location, setLocation] = (0, react_1.useState)(null);
    const [isOnline, setIsOnline] = (0, react_1.useState)(false);
    const [isAvailable, setIsAvailable] = (0, react_1.useState)(true);
    const [order, setOrder] = (0, react_1.useState)(null);
    const [route, setRoute] = (0, react_1.useState)([]);
    const [watchId, setWatchId] = (0, react_1.useState)(null);
    const [socket, setSocket] = (0, react_1.useState)(null);
    const [eta, setEta] = (0, react_1.useState)(0);
    const mapRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        requestLocationPermission();
        const socketInstance = (0, socket_io_client_1.io)('http://localhost:3001', {
            transports: ['websocket'],
        });
        setSocket(socketInstance);
        socketInstance.on('connect', () => {
            console.log('Connected to tracking server');
        });
        socketInstance.on('orderAssigned', (data) => {
            setOrder(data);
            react_native_1.Alert.alert('New Order', `Order #${data.id} assigned. Tap to accept.`);
        });
        socketInstance.on('etaUpdate', (data) => {
            if (data.orderId === order?.id) {
                setEta(data.etaMinutes);
            }
        });
        return () => {
            socketInstance.disconnect();
            if (watchId !== null && react_native_1.Platform.OS === 'android') {
                geolocation_1.default.clearWatch(watchId);
            }
        };
    }, []);
    (0, react_1.useEffect)(() => {
        if (location && order && isOnline) {
            // Send location update every 5 seconds
            const interval = setInterval(() => {
                socket?.emit('updateLocation', {
                    driverId: 'driver-' + Date.now(), // In real app, use actual driver ID
                    lat: location.latitude,
                    lng: location.longitude,
                    speed: location.speed,
                    heading: location.heading,
                    timestamp: Date.now(),
                });
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [location, order, isOnline]);
    const requestLocationPermission = async () => {
        if (react_native_1.Platform.OS === 'android') {
            try {
                const granted = await react_native_1.PermissionsAndroid.request(react_native_1.PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
                    title: 'Location Permission',
                    message: 'SpiceGarden needs access to your location for delivery tracking.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                });
                if (granted === react_native_1.PermissionsAndroid.RESULTS.GRANTED) {
                    startLocationTracking();
                }
            }
            catch (err) {
                console.warn(err);
            }
        }
        else {
            startLocationTracking();
        }
    };
    const startLocationTracking = () => {
        geolocation_1.default.watchPosition((position) => {
            const { latitude, longitude, accuracy, speed, heading } = position.coords;
            setLocation({
                latitude,
                longitude,
                accuracy,
                speed,
                heading,
            });
        }, (error) => {
            console.error('Location error:', error);
            react_native_1.Alert.alert('Location Error', 'Could not get location. Please enable GPS.');
        }, {
            enableHighAccuracy: true,
            distanceFilter: 10,
            interval: 5000,
            fastestInterval: 2000,
        });
    };
    const goOnline = () => {
        setIsOnline(true);
        setIsAvailable(true);
        socket?.emit('driverOnline', { driverId: 'driver-' + Date.now() });
    };
    const goOffline = () => {
        setIsOnline(false);
        setIsAvailable(false);
        socket?.emit('driverOffline', { driverId: 'driver-' + Date.now() });
    };
    const acceptOrder = () => {
        if (order) {
            setOrder({ ...order, status: 'picked_up' });
            socket?.emit('orderAccepted', { orderId: order.id });
        }
    };
    const updateDeliveryStatus = (status) => {
        if (order) {
            setOrder({ ...order, status });
            socket?.emit('deliveryStatusUpdate', { orderId: order.id, status });
        }
    };
    const calculateDistance = (loc1, loc2) => {
        const R = 6371e3;
        const φ1 = loc1.latitude * Math.PI / 180;
        const φ2 = loc2.latitude * Math.PI / 180;
        const Δφ = (loc2.latitude - loc1.latitude) * Math.PI / 180;
        const Δλ = (loc2.longitude - loc1.longitude) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.header}>
        <react_native_1.Text style={styles.title}>Driver App</react_native_1.Text>
        <react_native_1.TouchableOpacity style={[styles.statusButton, isOnline ? styles.onlineButton : styles.offlineButton]} onPress={isOnline ? goOffline : goOnline}>
          <react_native_1.Text style={styles.statusButtonText}>
            {isOnline ? 'Online' : 'Go Online'}
          </react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>

      {location && (<react_native_maps_1.default ref={mapRef} style={styles.map} initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }} showsUserLocation followsUserLocation>
          {order && (<>
              <react_native_maps_1.Marker coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                }} title="Your Location"/>
              {route.length > 0 && (<react_native_maps_1.Polyline coordinates={route} strokeColor="#6366f1" strokeWidth={3}/>)}
              <react_native_maps_1.Circle center={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                }} radius={500} strokeColor="#6366f1" fillColor="rgba(99, 102, 241, 0.2)"/>
            </>)}
        </react_native_maps_1.default>)}

      {order && (<react_native_1.View style={styles.orderCard}>
          <react_native_1.Text style={styles.orderTitle}>Order #{order.id}</react_native_1.Text>
          <react_native_1.Text style={styles.orderCustomer}>{order.customerName}</react_native_1.Text>
          <react_native_1.Text style={styles.orderAddress}>{order.address}</react_native_1.Text>
          
          <react_native_1.Text style={styles.etaText}>ETA: {eta} minutes</react_native_1.Text>
          
          <react_native_1.View style={styles.orderActions}>
            {order.status === 'assigned' && (<react_native_1.TouchableOpacity style={styles.actionButton} onPress={acceptOrder}>
                <react_native_1.Text style={styles.actionButtonText}>Accept Order</react_native_1.Text>
              </react_native_1.TouchableOpacity>)}
            {order.status === 'picked_up' && (<react_native_1.TouchableOpacity style={styles.actionButton} onPress={() => updateDeliveryStatus('on_way')}>
                <react_native_1.Text style={styles.actionButtonText}>Start Delivery</react_native_1.Text>
              </react_native_1.TouchableOpacity>)}
            {order.status === 'on_way' && (<react_native_1.TouchableOpacity style={styles.actionButton} onPress={() => updateDeliveryStatus('delivered')}>
                <react_native_1.Text style={styles.actionButtonText}>Mark Delivered</react_native_1.Text>
              </react_native_1.TouchableOpacity>)}
          </react_native_1.View>
        </react_native_1.View>)}

      {!location && (<react_native_1.View style={styles.locationWarning}>
          <react_native_1.Text style={styles.locationWarningText}>
            Waiting for location permissions...
          </react_native_1.Text>
        </react_native_1.View>)}
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        zIndex: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    statusButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    onlineButton: {
        backgroundColor: '#22c55e',
    },
    offlineButton: {
        backgroundColor: '#6366f1',
    },
    statusButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    map: {
        flex: 1,
    },
    orderCard: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        elevation: 4,
    },
    orderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    orderCustomer: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    orderAddress: {
        fontSize: 12,
        color: '#999',
        marginBottom: 8,
    },
    etaText: {
        fontSize: 14,
        color: '#6366f1',
        fontWeight: '600',
        marginBottom: 12,
    },
    orderActions: {
        flexDirection: 'row',
    },
    actionButton: {
        backgroundColor: '#6366f1',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    locationWarning: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationWarningText: {
        fontSize: 16,
        color: '#666',
    },
});
exports.default = DriverApp;
