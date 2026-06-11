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
const router_1 = require("next/router");
const react_redux_1 = require("react-redux");
const api_1 = require("@spicegarden/shared/api");
const OrderDetailsPage = () => {
    const router = (0, router_1.useRouter)();
    const { user } = (0, react_redux_1.useSelector)((state) => state.auth);
    const [order, setOrder] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const loadOrderDetails = async () => {
            const orderId = router.query.id;
            if (!orderId) {
                router.push('/history');
                return;
            }
            if (!user?.token || user?.token === 'demo-token') {
                // Mock data for demo
                setTimeout(() => {
                    setOrder({
                        id: orderId,
                        restaurant: {
                            name: 'Burger King',
                            image: 'https://example.com/restaurant.jpg',
                        },
                        items: [
                            { id: 1, name: 'Whopper', quantity: 2, price: 149, image: 'https://example.com/whopper.jpg' },
                            { id: 2, name: 'Large Coke', quantity: 1, price: 79, image: 'https://example.com/coke.jpg' },
                        ],
                        status: 'delivered',
                        createdAt: '2026-05-20T19:30:00Z',
                        updatedAt: '2026-05-20T20:00:00Z',
                        subtotal: 377,
                        deliveryFee: 20,
                        tax: 19,
                        tip: 50,
                        grandTotal: 466,
                        deliveryAddress: {
                            street: 'Home - Sector 17',
                            city: 'Chandigarh',
                            state: 'Chandigarh',
                            pincode: '160017',
                        },
                        paymentMethod: 'card',
                    });
                }, 600);
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const data = await api_1.ordersApi.get(orderId, user.token);
                setOrder(data);
            }
            catch (err) {
                console.error('Failed to load order details:', err);
                setError('Failed to load order details. Please try again later.');
            }
            finally {
                setLoading(false);
            }
        };
        loadOrderDetails();
    }, [router.query.id, user?.token]);
    if (loading && !order) {
        return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: ui_1.DESIGN_TOKENS.colors.neutral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading order details...</p>
      </div>);
    }
    if (error) {
        return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: ui_1.DESIGN_TOKENS.colors.neutral }}>
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: ui_1.DESIGN_TOKENS.spacing.md, fontSize: '14px' }}>
          {error}
        </div>
        <ui_1.Button label="Back to Orders" onClick={() => router.push('/history')} variant="secondary"/>
      </div>);
    }
    if (!order) {
        return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: ui_1.DESIGN_TOKENS.colors.neutral, textAlign: 'center' }}>
        <p>Order not found</p>
        <ui_1.Button label="Back to Orders" onClick={() => router.push('/history')} variant="secondary"/>
      </div>);
    }
    const statusLabels = {
        placed: 'Order Placed',
        preparing: 'Preparing',
        ready: 'Ready for Pickup',
        pickedup: 'Picked Up',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
    };
    const statusColors = {
        placed: '#2196f3',
        preparing: '#ff9800',
        ready: '#ff9800',
        pickedup: '#ff9800',
        delivered: '#4caf50',
        cancelled: '#f44336',
    };
    return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: ui_1.DESIGN_TOKENS.colors.neutral }}>
      <ui_1.Button label="← Back" onClick={() => router.push('/history')} variant="secondary" style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.lg }}/>

       <h2 style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.lg }}>Order #{order.id}</h2>

      {order.restaurant && (<ui_1.Card title="Restaurant">
          <div style={{ display: 'flex', gap: ui_1.DESIGN_TOKENS.spacing.md, alignItems: 'center' }}>
            {order.restaurant.image ? (<img src={order.restaurant.image} alt={order.restaurant.name} style={{ width: '60px', height: '60px', borderRadius: ui_1.DESIGN_TOKENS.radius.md, objectFit: 'cover' }}/>) : (<div style={{ width: '60px', height: '60px', borderRadius: ui_1.DESIGN_TOKENS.radius.md, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🍽️</div>)}
            <div>
              <h3 style={{ margin: '0 0 4px 0' }}>{order.restaurant.name}</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Restaurant Partner</p>
            </div>
          </div>
        </ui_1.Card>)}

      <ui_1.Card title="Order Items">
        <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
          {order.items && order.items.length > 0 ? (order.items.map((item) => (<div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: ui_1.DESIGN_TOKENS.spacing.sm, borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', gap: ui_1.DESIGN_TOKENS.spacing.sm, alignItems: 'center' }}>
                  {item.image ? (<img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: ui_1.DESIGN_TOKENS.radius.sm, objectFit: 'cover' }}/>) : (<div style={{ width: '40px', height: '40px', borderRadius: ui_1.DESIGN_TOKENS.radius.sm, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍔</div>)}
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Quantity: {item.quantity}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 'bold' }}>&#8377;{item.price * item.quantity}</div>
              </div>))) : (<p style={{ textAlign: 'center', color: '#666', padding: ui_1.DESIGN_TOKENS.spacing.lg }}>No items in this order</p>)}
        </div>
      </ui_1.Card>

      <ui_1.Card title="Order Summary">
        <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.xs }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Item Total</span>
            <span>&#8377;{order.subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Delivery Fee</span>
            <span>&#8377;{order.deliveryFee}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Taxes</span>
            <span>&#8377;{order.tax}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tip</span>
            <span>&#8377;{order.tip}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: ui_1.DESIGN_TOKENS.spacing.sm }}>
            <span>Total</span>
            <span>&#8377;{order.grandTotal}</span>
          </div>
        </div>
      </ui_1.Card>

      <ui_1.Card title="Order Information">
        <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Status</span>
            <span style={{
            backgroundColor: statusColors[order.status] + '20',
            color: statusColors[order.status],
            padding: '2px 8px',
            borderRadius: ui_1.DESIGN_TOKENS.radius.sm,
            fontWeight: 'bold'
        }}>{statusLabels[order.status] || order.status}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Order Date</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Last Updated</span>
            <span>{new Date(order.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </ui_1.Card>

      <ui_1.Card title="Delivery Address">
        <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
          {order.deliveryAddress && (<>
              <div style={{ fontWeight: 'bold', marginBottom: ui_1.DESIGN_TOKENS.spacing.xs }}>Delivery Address</div>
              <div style={{ color: '#666' }}>{order.deliveryAddress.street}</div>
              <div style={{ color: '#666' }}>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</div>
            </>)}
        </div>
      </ui_1.Card>

      <ui_1.Card title="Payment Information">
        <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Payment Method</span>
            <span>{order.paymentMethod?.toUpperCase() || 'Not specified'}</span>
          </div>
        </div>
      </ui_1.Card>

      {order.status !== 'delivered' && order.status !== 'cancelled' && (<div style={{ marginTop: ui_1.DESIGN_TOKENS.spacing.lg, textAlign: 'center' }}>
          <ui_1.Button label="Contact Restaurant" onClick={() => { }} variant="secondary" style={{ marginRight: ui_1.DESIGN_TOKENS.spacing.md }}/>
          <ui_1.Button label="Reorder" onClick={() => { }}/>
        </div>)}

        {order.status === 'delivered' && (<div style={{ marginTop: ui_1.DESIGN_TOKENS.spacing.lg, textAlign: 'center' }}>
            <ui_1.Button label="Reorder" onClick={() => { }} variant="secondary" style={{ marginRight: ui_1.DESIGN_TOKENS.spacing.md }}/>
            <ui_1.Button label="Leave Review" onClick={() => { }}/>
          </div>)}
    </div>);
};
exports.default = OrderDetailsPage;
