import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { API_URL } from '@spicegarden/shared/constants';

const AuthPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
            const res = await fetch(`${API_URL}${endpoint}`, {
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
                dispatch(setCredentials({ user: userData, token: data.access_token }));
                
                router.push('/');
            } else {
                const errorData = await res.json();
                setError(errorData.message || (isLogin ? 'Login failed' : 'Registration failed'));
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.lg, minHeight: '100vh', backgroundColor: DESIGN_TOKENS.colors.neutral }}>
      <div style={{ textAlign: 'center', marginBottom: DESIGN_TOKENS.spacing.xl }}>
        <h1 style={{ color: DESIGN_TOKENS.colors.primary }}>&#x1F35F; SpiceGarden</h1>
        <p style={{ color: '#666', margin: 0 }}>Order food from your favourite restaurants</p>
      </div>

      <Card title={isLogin ? 'Welcome Back' : 'Create Account'}>
        {error && (
          <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: DESIGN_TOKENS.spacing.md, fontSize: '14px' }}>
            {error}
          </div>
        )}

        {!isLogin && (
          <>
            <div style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
              <label htmlFor="auth-name" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Full Name</label>
              <input
                id="auth-name"
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
              <label htmlFor="auth-phone" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Phone Number</label>
              <input
                id="auth-phone"
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
              />
            </div>
          </>
        )}

        <div style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
          <label htmlFor="auth-email" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Email</label>
          <input
            id="auth-email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
          <label htmlFor="auth-password" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Password</label>
          <input
            id="auth-password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
          />
        </div>

        <Button
          label={loading ? 'Loading…' : isLogin ? 'Sign In' : 'Sign Up'}
          onClick={handleSubmit}
        />

        <div style={{ textAlign: 'center', marginTop: DESIGN_TOKENS.spacing.lg }}>
            {isLogin && (
                <button
                    type="button"
                    onClick={() => { router.push('/reset-password'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: DESIGN_TOKENS.colors.primary, cursor: 'pointer', fontSize: 14 }}
                >
                    Forgot password?
                </button>
            )}
            <div style={{ marginTop: DESIGN_TOKENS.spacing.md }}>
                <div className={styles.socialLabel}>Or continue with</div>
                <div className={styles.socialButtonsRow}>
                    <button
                        type="button"
                        onClick={() => {/* TODO: Implement Google login */}}
                        className={styles.googleButton}
                    >
                        🔵 Google
                    </button>
                    <button
                        type="button"
                        onClick={() => {/* TODO: Implement Facebook login */}}
                        className={styles.facebookButton}
                    >
                        𝔽 Facebook
                    </button>
                </div>
            </div>
            <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                style={{ background: 'none', border: 'none', color: DESIGN_TOKENS.colors.primary, cursor: 'pointer', fontSize: 14 }}
            >
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;
