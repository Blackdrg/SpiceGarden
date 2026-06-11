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
const authSlice_1 = require("../redux/slices/authSlice");
const constants_1 = require("@spicegarden/shared/constants");
const AuthPage = () => {
    const router = (0, router_1.useRouter)();
    const dispatch = (0, react_redux_1.useDispatch)();
    const [isLogin, setIsLogin] = (0, react_1.useState)(true);
    const [formData, setFormData] = (0, react_1.useState)({ email: '', password: '', name: '', phone: '' });
    const [error, setError] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const handleSubmit = async () => {
        setError('');
        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Please enter email and password');
            return;
        }
        if (!isLogin && (!formData.name || !formData.phone)) {
            setError('Please fill in all required fields');
            return;
        }
        setLoading(true);
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const res = await fetch(`${constants_1.API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: isLogin ? undefined : formData.name,
                    phone: isLogin ? undefined : formData.phone,
                    deviceName: 'web',
                    deviceType: 'browser',
                }),
            });
            if (res.ok) {
                const data = await res.json();
                const userData = { email: formData.email, role: 'customer' };
                // Update Redux store
                dispatch((0, authSlice_1.setCredentials)({ user: userData, token: data.access_token }));
                router.push('/');
            }
            else {
                const errorData = await res.json();
                setError(errorData.message || (isLogin ? 'Login failed' : 'Registration failed'));
            }
        }
        catch (err) {
            setError('Network error. Please check your connection and try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.lg, minHeight: '100vh', backgroundColor: ui_1.DESIGN_TOKENS.colors.neutral }}>
      <div style={{ textAlign: 'center', marginBottom: ui_1.DESIGN_TOKENS.spacing.xl }}>
        <h1 style={{ color: ui_1.DESIGN_TOKENS.colors.primary }}>&#x1F35F; SpiceGarden</h1>
        <p style={{ color: '#666', margin: 0 }}>Order food from your favourite restaurants</p>
      </div>

      <ui_1.Card title={isLogin ? 'Welcome Back' : 'Create Account'}>
        {error && (<div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: ui_1.DESIGN_TOKENS.spacing.md, fontSize: '14px' }}>
            {error}
          </div>)}

        {!isLogin && (<>
            <div style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.md }}>
              <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: ui_1.DESIGN_TOKENS.spacing.sm, borderRadius: ui_1.DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}/>
            </div>
            <div style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.md }}>
              <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: ui_1.DESIGN_TOKENS.spacing.sm, borderRadius: ui_1.DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}/>
            </div>
          </>)}

        <div style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.md }}>
          <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: ui_1.DESIGN_TOKENS.spacing.sm, borderRadius: ui_1.DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}/>
        </div>

        <div style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.lg }}>
          <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ width: '100%', padding: ui_1.DESIGN_TOKENS.spacing.sm, borderRadius: ui_1.DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}/>
        </div>

        <ui_1.Button label={loading ? 'Loading…' : isLogin ? 'Sign In' : 'Sign Up'} onClick={handleSubmit}/>

        <div style={{ textAlign: 'center', marginTop: ui_1.DESIGN_TOKENS.spacing.lg }}>
            {isLogin && (<button type="button" onClick={() => { router.push('/reset-password'); setError(''); }} style={{ background: 'none', border: 'none', color: ui_1.DESIGN_TOKENS.colors.primary, cursor: 'pointer', fontSize: 14 }}>
                    Forgot password?
                </button>)}
            <div style={{ marginTop: ui_1.DESIGN_TOKENS.spacing.md }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: ui_1.DESIGN_TOKENS.spacing.sm }}>Or continue with</div>
                <div style={{ display: 'flex', gap: ui_1.DESIGN_TOKENS.spacing.sm, justifyContent: 'center' }}>
                    <button type="button" onClick={() => { }} style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: 4,
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer'
        }}>
                        🔵 Google
                    </button>
                    <button type="button" onClick={() => { }} style={{
            background: '#1877f2',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer'
        }}>
                        𝔽 Facebook
                    </button>
                </div>
            </div>
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ background: 'none', border: 'none', color: ui_1.DESIGN_TOKENS.colors.primary, cursor: 'pointer', fontSize: 14 }}>
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
        </div>
      </ui_1.Card>
    </div>);
};
exports.default = AuthPage;
