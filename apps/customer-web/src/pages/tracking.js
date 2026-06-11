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
const react_1 = __importStar(require("react"));
const ui_1 = require("@spicegarden/ui");
const useTracking_1 = require("../hooks/useTracking");
const router_1 = require("next/router");
const react_redux_1 = require("react-redux");
const api_1 = require("@spicegarden/shared/api");
const TrackingPage = () => {
    const router = (0, router_1.useRouter)();
    const { user } = (0, react_redux_1.useSelector)((state) => state.auth);
    const [orderId, setOrderId] = (0, react_1.useState)(null);
    const { location } = (0, useTracking_1.useTracking)(orderId || 'driver-123');
    const [orderStatus, setOrderStatus] = (0, react_1.useState)('preparing');
    const [estimatedTime, setEstimatedTime] = (0, react_1.useState)(15);
    const [orderDetails, setOrderDetails] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        // Get order ID from query params or local storage
        const queryOrderId = router.query.order;
        if (queryOrderId) {
            setOrderId(queryOrderId);
        }
        else {
            // Try to get from localStorage as fallback
            const storedOrderId = localStorage.getItem('lastOrderId');
            if (storedOrderId) {
                setOrderId(storedOrderId);
            }
        }
    }, [router.query]);
    (0, react_1.useEffect)(() => {
        if (orderId) {
            const loadOrderDetails = async () => {
                try {
                    setLoading(true);
                    const response = await api_1.ordersApi.get(orderId, user?.token || localStorage.getItem('sg_token') || '');
                    const order = response.data;
                    setOrderDetails(order);
                    setOrderStatus(order.status || 'preparing');
                    // Update estimated time based on order status
                    switch (order.status) {
                        case 'preparing':
                            setEstimatedTime(10 + Math.floor(Math.random() * 10));
                            break;
                        case 'ready':
                            setEstimatedTime(5 + Math.floor(Math.random() * 5));
                            break;
                        case 'pickedup':
                            setEstimatedTime(8 + Math.floor(Math.random() * 12));
                            break;
                        case 'delivered':
                            setEstimatedTime(0);
                            break;
                        default:
                            setEstimatedTime(15);
                    }
                }
                catch (error) {
                    console.error('Failed to load order details:', error);
                    // Use mock data for demo
                    setOrderDetails({
                        id: orderId,
                        status: 'preparing',
                        items: [],
                        total: 0
                    });
                }
                finally {
                    setLoading(false);
                }
            };
            loadOrderDetails();
        }
    }, [orderId, user?.token]);
    const statusSteps = [
        { id: 'placed', label: 'Order Placed', done: true },
        { id: 'preparing', label: 'Preparing', done: orderStatus === 'preparing' || orderStatus === 'ready' || orderStatus === 'pickedup' || orderStatus === 'delivered' },
        { id: 'ready', label: 'Ready for Pickup', done: orderStatus === 'ready' || orderStatus === 'pickedup' || orderStatus === 'delivered' },
        { id: 'pickedup', label: 'Picked Up', done: orderStatus === 'pickedup' || orderStatus === 'delivered' },
        { id: 'delivered', label: 'Delivered', done: orderStatus === 'delivered' },
    ];
    if (loading && !orderDetails) {
        return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: ui_1.DESIGN_TOKENS.colors.neutral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading order details...</p>
      </div>);
    }
    return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: ui_1.DESIGN_TOKENS.colors.neutral }}>
      <h2 style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.lg }}>Track Order #{orderDetails?.id?.toUpperCase() || 'SG12345'}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.xs, marginBottom: ui_1.DESIGN_TOKENS.spacing.xl }}>
        {statusSteps.map((step, idx) => (<div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: step.done ? ui_1.DESIGN_TOKENS.colors.success : '#ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
            }}>
              {step.done ? '✓' : idx + 1}
            </div>
            <span style={{ marginLeft: ui_1.DESIGN_TOKENS.spacing.sm }}>{step.label}</span>
          </div>))}
      </div>

      {location && (<ui_1.Card title="Live Tracking">
          <div style={{ textAlign: 'center', marginBottom: ui_1.DESIGN_TOKENS.spacing.lg }}>
            <div style={{ fontSize: '64px' }}>🛵</div>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Driver: Raj Kumar</p>
            <p style={{ color: ui_1.DESIGN_TOKENS.colors.primary, fontWeight: 'bold' }}>ETA: {estimatedTime} mins</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: ui_1.DESIGN_TOKENS.spacing.sm }}>
            <span>Current Location</span>
            <span>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
          </div>
          <div style={{ marginTop: ui_1.DESIGN_TOKENS.spacing.md }}>
            <ui_1.Button label="Call Driver" onClick={() => { }} style={{ width: '100%' }}/>
            <ui_1.Button label="Contact Support" onClick={() => { }} variant="secondary" style={{ width: '100%', marginTop: ui_1.DESIGN_TOKENS.spacing.sm }}/>
          </div>
        </ui_1.Card>)}

      {orderDetails && (<ui_1.Card title="Order Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
            {orderDetails.items && orderDetails.items.length > 0 ? (orderDetails.items.map((item) => (<div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: ui_1.DESIGN_TOKENS.spacing.sm, borderBottom: '1px solid #eee' }}>
                  <span>{item.name} x{item.quantity}</span>
                  <span>&#8377;{item.price * item.quantity}</span>
                </div>))) : (<p>No item details available</p>)}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: ui_1.DESIGN_TOKENS.spacing.sm }}>
              <span>Total:</span>
              <span>&#8377;{orderDetails.total || 0}</span>
            </div>
          </div>
        </ui_1.Card>)}

      {orderStatus !== 'delivered' && (<div style={{ marginTop: ui_1.DESIGN_TOKENS.spacing.lg, textAlign: 'center' }}>
          <ui_1.Button label="Contact Restaurant" onClick={() => { }} variant="secondary"/>
        </div>)}
    </div>);
};
exports.default = TrackingPage;
