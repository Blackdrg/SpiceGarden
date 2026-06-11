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
const SubscriptionsPage = () => {
    const router = (0, router_1.useRouter)();
    const [subscriptions, setSubscriptions] = (0, react_1.useState)([
        { id: 1, name: 'SpiceGarden Prime', price: 99, benefits: ['Free Delivery on All Orders', 'Priority Customer Support', 'Extra 5% Off Every Order'], active: true, nextBilling: '2026-06-15' },
        { id: 2, name: 'Weekly Meal Plan', price: 199, benefits: ['4 Chef-Selected Meals/Week', 'Skip Any Week', 'Partner Restaurant Priority'], active: false, nextBilling: '2026-06-01' },
    ]);
    const [activeTab] = (0, react_1.useState)('subs');
    const toggleSubscription = (id) => {
        setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
    };
    return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md, paddingBottom: 80 }}>
      <h2 style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.lg }}>My Subscriptions</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.md }}>
        {subscriptions.map((sub) => (<ui_1.Card key={sub.id} title={sub.name} isElevated>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: ui_1.DESIGN_TOKENS.spacing.md }}>
              <div>
                <span style={{ fontSize: '22px', fontWeight: 'bold', color: ui_1.DESIGN_TOKENS.colors.primary }}>&#8377;{sub.price}</span>
                <span style={{ color: '#999', fontSize: '14px' }}> / month</span>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: 16, fontSize: '12px', fontWeight: 'bold',
                backgroundColor: sub.active ? '#e8f5e8' : '#f5f5f5',
                color: sub.active ? ui_1.DESIGN_TOKENS.colors.success : '#999',
            }}>{sub.active ? 'ACTIVE' : 'INACTIVE'}</span>
            </div>
            <ul style={{ margin: '0 0 16px 20px', padding: 0, color: '#555', fontSize: '14px' }}>
              {sub.benefits.map((b, i) => <li key={i} style={{ marginBottom: 4 }}>{b}</li>)}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#999', fontSize: '13px' }}>Next billing: {sub.nextBilling}</span>
              <ui_1.Button label={sub.active ? 'Cancel' : 'Activate'} onClick={() => toggleSubscription(sub.id)} variant={sub.active ? 'secondary' : 'primary'}/>
            </div>
          </ui_1.Card>))}
      </div>

      <ui_1.Card title="Explore More Plans" isElevated style={{ marginTop: ui_1.DESIGN_TOKENS.spacing.lg }}>
        <p style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.md }}>Save on every order. Gold, Premium, Family options available.</p>
        <ui_1.Button label="View All Plans" onClick={() => null}/>
      </ui_1.Card>

      {/* Bottom nav */}
      <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'white',
            borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        }}>
        {[
            { key: 'home', label: 'Home', icon: '🏠', path: '/' },
            { key: 'search', label: 'Search', icon: '🔍', path: '/search' },
            { key: 'subs', label: 'Subs', icon: '⭐' },
            { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
        ].map((tab) => (<div key={tab.key} onClick={() => tab.path && router.push(tab.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: activeTab === tab.key ? ui_1.DESIGN_TOKENS.colors.primary : '#999', fontSize: '11px' }}>
            <span style={{ fontSize: '22px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>))}
      </nav>
    </div>);
};
exports.default = SubscriptionsPage;
