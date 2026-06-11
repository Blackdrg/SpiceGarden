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
const OffersPage = () => {
    const router = (0, router_1.useRouter)();
    const [offers] = (0, react_1.useState)([
        { id: 1, title: 'Flat 50% Off', description: 'On your first 3 orders', code: 'WELCOME50', validTill: '2026-06-30', type: 'percentage', value: 50, minOrder: 199 },
        { id: 2, title: '₹100 Off', description: 'On orders above ₹499', code: 'SAVE100', validTill: '2026-05-31', type: 'fixed', value: 100, minOrder: 499 },
        { id: 3, title: 'Buy 1 Get 1 Free', description: 'On selected pizzas', code: 'PIZZABOGO', validTill: '2026-06-15', type: 'bogo', value: 0, minOrder: 0 },
    ]);
    const [activeTab] = (0, react_1.useState)('offers');
    const copyCode = (code) => {
        navigator.clipboard.writeText(code).catch(() => null);
    };
    return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md, paddingBottom: 80 }}>
      <h2 style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.lg }}>Offers &amp; Promos</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.md }}>
        {offers.map((offer) => (<ui_1.Card key={offer.id} title={offer.title} isElevated>
            <p style={{ color: '#666', marginBottom: ui_1.DESIGN_TOKENS.spacing.sm }}>{offer.description}</p>
            <div style={{ backgroundColor: '#FFF3E0', borderRadius: 8, padding: '8px 12px', marginBottom: ui_1.DESIGN_TOKENS.spacing.sm }}>
              <span style={{ fontWeight: 'bold', color: '#E65100', fontSize: '15px' }}>
                {offer.type === 'percentage' ? `-${offer.value}%` : offer.type === 'fixed' ? `-₹${offer.value}` : 'BOGO'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: ui_1.DESIGN_TOKENS.spacing.sm }}>
              <div style={{ background: '#f5f5f5', padding: '6px 12px', borderRadius: 4, fontFamily: 'monospace', fontSize: '15px', fontWeight: 'bold' }}>{offer.code}</div>
              <span style={{ color: '#999', fontSize: '13px' }}>Valid till {offer.validTill}</span>
            </div>
            <div style={{ display: 'flex', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
              <ui_1.Button label="Copy Code" onClick={() => copyCode(offer.code)} variant="secondary"/>
              <ui_1.Button label="Use Now" onClick={() => router.push('/')}/>
            </div>
          </ui_1.Card>))}
      </div>

      <ui_1.Card title="Refer &amp; Earn" isElevated style={{ marginTop: ui_1.DESIGN_TOKENS.spacing.lg }}>
        <p style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.md }}>Share your code — earn &#8377;100 for every friend's first order.</p>
        <div style={{ display: 'flex', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
          <div style={{ flex: 1, background: '#f5f5f5', padding: '10px 12px', borderRadius: 8, fontFamily: 'monospace', fontWeight: 'bold', textAlign: 'center' }}>SPICE123</div>
          <ui_1.Button label="Share" onClick={() => null}/>
        </div>
      </ui_1.Card>

      {/* Bottom nav */}
      <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'white',
            borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        }}>
        {[
            { key: 'home', label: 'Home', icon: '🏠', path: '/' },
            { key: 'search', label: 'Search', icon: '🔍', path: '/search' },
            { key: 'offers', label: 'Offers', icon: '🎁' },
            { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
        ].map((tab) => (<div key={tab.key} onClick={() => tab.path && router.push(tab.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: activeTab === tab.key ? ui_1.DESIGN_TOKENS.colors.primary : '#999', fontSize: '11px' }}>
            <span style={{ fontSize: '22px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>))}
      </nav>
    </div>);
};
exports.default = OffersPage;
