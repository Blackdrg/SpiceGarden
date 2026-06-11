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
const MenuPage = () => {
    const router = (0, router_1.useRouter)();
    const [activeCategory, setActiveCategory] = (0, react_1.useState)('all');
    const [cart, setCart] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false); // Added loading state
    // Simulate loading effect for demo purposes
    // In a real app, this would be set when fetching data from API
    (0, react_1.useEffect)(() => {
        // Simulate API call delay
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        // Set loading to true initially
        setLoading(true);
        return () => clearTimeout(timer);
    }, []);
    const categories = [
        { id: 'all', name: 'All', count: 24 },
        { id: 'burgers', name: 'Burgers', count: 8 },
        { id: 'pizza', name: 'Pizza', count: 6 },
        { id: 'sides', name: 'Sides', count: 4 },
        { id: 'drinks', name: 'Drinks', count: 6 },
    ];
    const menuItems = [
        { id: 1, name: 'Classic Burger', desc: 'Lettuce, tomato, onion', price: 129, image: '🍔', category: 'burgers' },
        { id: 2, name: 'Cheese Burger', desc: 'With extra cheese', price: 149, image: '🍔', category: 'burgers' },
        { id: 3, name: 'Veggie Burger', desc: 'Plant-based patty', price: 139, image: '🍔', category: 'burgers' },
        { id: 4, name: 'Margherita Pizza', desc: 'Tomato, mozzarella, basil', price: 249, image: '🍕', category: 'pizza' },
        { id: 5, name: 'Pepperoni Pizza', desc: 'With spicy pepperoni', price: 279, image: '🍕', category: 'pizza' },
        { id: 6, name: 'Veggie Pizza', desc: 'Bell peppers, olives, onions', price: 259, image: '🍕', category: 'pizza' },
        { id: 7, name: 'French Fries', desc: 'Crispy golden fries', price: 99, image: '🍟', category: 'sides' },
        { id: 8, name: 'Onion Rings', desc: 'Battered and fried', price: 109, image: '🧅', category: 'sides' },
        { id: 9, name: 'Garlic Bread', desc: 'With herbs and cheese', price: 119, image: '🥖', category: 'sides' },
        { id: 10, name: 'Coca Cola', desc: '500ml Bottle', price: 49, image: '🥤', category: 'drinks' },
        { id: 11, name: 'Sprite', desc: '500ml Bottle', price: 49, image: '🥤', category: 'drinks' },
        { id: 12, name: 'Iced Tea', desc: 'Lemon flavored', price: 39, image: '🧃', category: 'drinks' },
    ];
    const filteredItems = activeCategory === 'all'
        ? menuItems
        : menuItems.filter(item => item.category === activeCategory);
    const addToCart = (item) => {
        setCart(prev => [...prev, { ...item, quantity: 1 }]);
    };
    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const handleCheckout = () => {
        const items = JSON.stringify(cart);
        router.push({ pathname: '/checkout', query: { items, total: cartTotal } });
    };
    return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md, paddingBottom: 80 }}>
      <div style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.lg, textAlign: 'center' }}>
        <h2>Menu</h2>
        <p style={{ color: '#666' }}>Select items to add to your order</p>
      </div>

      <div style={{ display: 'flex', gap: ui_1.DESIGN_TOKENS.spacing.sm, overflowX: 'auto', marginBottom: ui_1.DESIGN_TOKENS.spacing.lg }}>
        {categories.map((c) => (<ui_1.Button key={c.id} label={`${c.name} (${c.count})`} onClick={() => setActiveCategory(c.id)} variant={activeCategory === c.id ? 'primary' : 'secondary'}/>))}
      </div>

       <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.md }}>
         {loading ? (<div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.md }}>
             {Array.from({ length: 6 }).map((_, index) => (<div key={index} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: ui_1.DESIGN_TOKENS.spacing.sm,
                    marginBottom: ui_1.DESIGN_TOKENS.spacing.md
                }}>
                 <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                   <ui_1.Skeleton width={48} height={48} variant="circular"/>
                   <div>
                     <ui_1.Skeleton height={16} width="70%" style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.xs }}/>
                     <ui_1.Skeleton height={14} width="40%"/>
                   </div>
                 </div>
                 <ui_1.Skeleton height={12} style={{ marginTop: ui_1.DESIGN_TOKENS.spacing.sm }}/>
                 <ui_1.Skeleton height={12} width="80%"/>
                 <ui_1.Skeleton height={12} width="60%"/>
               </div>))}
           </div>) : filteredItems.length === 0 ? (<div style={{ textAlign: 'center', padding: ui_1.DESIGN_TOKENS.spacing.lg }}>
             <p style={{ fontSize: '20px', marginBottom: ui_1.DESIGN_TOKENS.spacing.md }}>🍽️</p>
             <p style={{ color: ui_1.DESIGN_TOKENS.colors.textSecondary, marginBottom: ui_1.DESIGN_TOKENS.spacing.sm }}>No items found</p>
             <p style={{ color: ui_1.DESIGN_TOKENS.colors.textSecondary, fontSize: '14px' }}>
               Try selecting a different category or check back later for new items.
             </p>
             <ui_1.Button label="Explore More" onClick={() => setActiveCategory('all')} variant="outline"/>
           </div>) : filteredItems.map((item) => (<div key={item.id} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: ui_1.DESIGN_TOKENS.spacing.sm,
                marginBottom: ui_1.DESIGN_TOKENS.spacing.md
            }}>
             <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
               <div style={{ fontSize: '24px' }}>{item.image}</div>
               <div>
                 <span style={{ fontWeight: 'bold', color: ui_1.DESIGN_TOKENS.colors.primary }}>₹{item.price}</span>
                 <ui_1.Button label="Add" onClick={() => addToCart(item)} variant="secondary"/>
               </div>
             </div>
             <div style={{ marginTop: ui_1.DESIGN_TOKENS.spacing.sm, fontSize: '14px', color: '#666' }}>
               {item.desc}
             </div>
           </div>))}
       </div>

      {cart.length > 0 && (<div style={{ marginTop: ui_1.DESIGN_TOKENS.spacing.lg }}>
          <ui_1.Card title="Your Cart">
            <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
              {cart.map((item) => (<div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{item.name}</h4>
                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>×{item.quantity}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: ui_1.DESIGN_TOKENS.colors.primary }}>
                      ₹{item.price * item.quantity}
                    </div>
                    <ui_1.Button label="Remove" onClick={() => removeFromCart(item.id)} variant="secondary"/>
                  </div>
                </div>))}
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: ui_1.DESIGN_TOKENS.spacing.lg,
                paddingTop: ui_1.DESIGN_TOKENS.spacing.md,
                borderTop: '1px solid #eee'
            }}>
              <span>Total:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: ui_1.DESIGN_TOKENS.colors.primary }}>₹{cartTotal}</span>
              <ui_1.Button label="Checkout" onClick={handleCheckout} variant="secondary"/>
            </div>
          </ui_1.Card>
        </div>)}

      {/* Bottom nav */}
      <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'white',
            borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        }}>
        {[
            { key: 'home', label: 'Home', icon: '🏠', path: '/' },
            { key: 'search', label: 'Search', icon: '🔍', path: '/search' },
            { key: 'menu', label: 'Menu', icon: '📋' },
            { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
        ].map((tab) => (<div key={tab.key} onClick={() => tab.path && router.push(tab.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: tab.key === 'menu' ? ui_1.DESIGN_TOKENS.colors.primary : '#999', fontSize: '11px' }}>
            <span style={{ fontSize: '22px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>))}
      </nav>
    </div>);
};
exports.default = MenuPage;
