"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ui_1 = require("@spicegarden/ui");
const react_redux_1 = require("react-redux");
const cartSlice_1 = require("../redux/slices/cartSlice");
const router_1 = require("next/router");
const CartPage = () => {
    const router = (0, router_1.useRouter)();
    const cartItems = (0, react_redux_1.useSelector)((state) => state.cart.items);
    const dispatch = (0, react_redux_1.useDispatch)();
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 20;
    const taxes = total * 0.05;
    const grandTotal = total + deliveryFee + taxes;
    const handleCheckout = () => {
        const items = JSON.stringify(cartItems);
        router.push({ pathname: '/checkout', query: { items, total: grandTotal, deliveryFee, taxes } });
    };
    if (cartItems.length === 0) {
        return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.lg, textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: ui_1.DESIGN_TOKENS.spacing.lg }}>&#x1F6D2;</div>
        <h2>Your cart is empty</h2>
        <p style={{ color: '#666' }}>Add items from restaurants</p>
        <ui_1.Button label="Browse Restaurants" onClick={() => router.push('/')} variant="secondary"/>
      </div>);
    }
    return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: ui_1.DESIGN_TOKENS.colors.neutral }}>
      <h2 style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.md }}>Your Cart</h2>

       <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.sm, marginBottom: ui_1.DESIGN_TOKENS.spacing.lg }}>
         {cartItems.map((item) => (<ui_1.Card key={item.id} title={item.name}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ui_1.Button label="-" onClick={() => {
                dispatch((0, cartSlice_1.updateQuantity)({ id: item.id, quantity: item.quantity - 1 }));
            }} variant="secondary" style={{ width: 30, height: 30, padding: 0 }}/>
                    <span style={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                    <ui_1.Button label="+" onClick={() => {
                dispatch((0, cartSlice_1.updateQuantity)({ id: item.id, quantity: item.quantity + 1 }));
            }} variant="secondary" style={{ width: 30, height: 30, padding: 0 }}/>
                  </div>
                  <span style={{ marginLeft: ui_1.DESIGN_TOKENS.spacing.md, fontWeight: 'bold', color: ui_1.DESIGN_TOKENS.colors.primary }}>
                    &#8377;{item.price * item.quantity}
                  </span>
                </div>
               <ui_1.Button label="Remove" onClick={() => dispatch((0, cartSlice_1.removeFromCart)(item.id))} variant="secondary"/>
             </div>
           </ui_1.Card>))}
       </div>

      <ui_1.Card title="Bill Details">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: ui_1.DESIGN_TOKENS.spacing.xs }}>
          <span>Item Total</span>
          <span>&#8377;{total}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: ui_1.DESIGN_TOKENS.spacing.xs }}>
          <span>Delivery Fee</span>
          <span>&#8377;{deliveryFee}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: ui_1.DESIGN_TOKENS.spacing.md }}>
          <span>Taxes</span>
          <span>&#8377;{taxes.toFixed(0)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
          <span>Grand Total</span>
          <span>&#8377;{grandTotal.toFixed(0)}</span>
        </div>
      </ui_1.Card>

      <div style={{ marginTop: ui_1.DESIGN_TOKENS.spacing.lg }}>
        <ui_1.Button label="Proceed to Checkout" onClick={handleCheckout}/>
      </div>
    </div>);
};
exports.default = CartPage;
