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
const WalletPage = () => {
    const router = (0, router_1.useRouter)();
    const [balance, setBalance] = (0, react_1.useState)(500);
    const [transactionHistory] = (0, react_1.useState)([
        { id: 1, type: 'credit', amount: 500, description: 'Welcome Bonus', date: '2026-05-20' },
        { id: 2, type: 'debit', amount: 347, description: 'Order #SG12345', date: '2026-05-21' },
        { id: 3, type: 'credit', amount: 100, description: 'Referral Bonus', date: '2026-05-22' },
        { id: 4, type: 'debit', amount: 30, description: 'Order #SG12344', date: '2026-05-18' },
        { id: 5, type: 'credit', amount: 200, description: 'Top-up', date: '2026-05-15' },
    ]);
    const [activeTab] = (0, react_1.useState)('wallet');
    const addMoney = () => {
        setBalance((prev) => prev + 100);
    };
    const handleWithdraw = () => {
        alert('Withdrawal feature coming soon');
    };
    return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md, paddingBottom: 80 }}>
      <h2 style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.lg }}>My Wallet</h2>

      <ui_1.Card title="Wallet Balance" isElevated>
        <div style={{
            textAlign: 'center', padding: `${ui_1.DESIGN_TOKENS.spacing.lg}px 0`,
            backgroundColor: '#f0f8ff', borderRadius: ui_1.DESIGN_TOKENS.radius.md,
        }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', color: ui_1.DESIGN_TOKENS.colors.primary }}>&#8377;{balance}</h1>
          <p style={{ margin: 0, color: '#666' }}>Available balance</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: ui_1.DESIGN_TOKENS.spacing.md, marginTop: ui_1.DESIGN_TOKENS.spacing.lg }}>
          <ui_1.Button label="Add Money" onClick={addMoney}/>
          <ui_1.Button label="Withdraw" onClick={handleWithdraw} variant="secondary"/>
        </div>
      </ui_1.Card>

      <ui_1.Card title="Transaction History" style={{ marginTop: ui_1.DESIGN_TOKENS.spacing.lg }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {transactionHistory.map((txn) => (<div key={txn.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: `${ui_1.DESIGN_TOKENS.spacing.sm}px 0`,
                borderBottom: '1px solid #f0f0f0',
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px' }}>{txn.description}</h4>
                <p style={{ margin: '4px 0 0 0', color: '#999', fontSize: '12px' }}>{txn.date}</p>
              </div>
              <span style={{
                fontWeight: 'bold',
                color: txn.type === 'credit' ? ui_1.DESIGN_TOKENS.colors.success : ui_1.DESIGN_TOKENS.colors.danger,
            }}>
                {txn.type === 'credit' ? '+' : '-'}&#8377;{txn.amount}
              </span>
            </div>))}
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
            { key: 'wallet', label: 'Wallet', icon: '💰' },
            { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
        ].map((tab) => (<div key={tab.key} onClick={() => tab.path && router.push(tab.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: activeTab === tab.key ? ui_1.DESIGN_TOKENS.colors.primary : '#999', fontSize: '11px' }}>
            <span style={{ fontSize: '22px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>))}
      </nav>
    </div>);
};
exports.default = WalletPage;
