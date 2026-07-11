import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { API_URL } from '@spicegarden/shared/constants';
import { api } from '@spicegarden/shared/api';
import styles from './auth.module.css';

const AuthPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });
  const [error, setError] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        
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
            const res = await api<{ user: { id: string; email: string; role?: string; fullName?: string; status?: string } }>(endpoint, {
                method: 'POST',
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    fullName: isLogin ? undefined : formData.name,
                    phone: isLogin ? undefined : formData.phone,
                    deviceName: 'web',
                    deviceType: 'browser',
                }),
            });

            if ((res.data as any).mfaRequired) {
              setMfaRequired(true);
              setFormData({ ...formData, password: '' }); // Clear password for security
              return;
            }

                const userData = {
                    id: (res.data as any).user?.id,
                    email: (res.data as any).user?.email || formData.email,
                    fullName: (res.data as any).user?.fullName,
                    role: (res.data as any).user?.role || 'customer',
                    status: (res.data as any).user?.status,
                };
                
                dispatch(setCredentials({ user: userData }));
                router.push('/');
        } catch (err: any) {
            setError(err.message || (isLogin ? 'Login failed' : 'Registration failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleMfaSubmit = async () => {
      setError('');
      if (!mfaCode) {
        setError('Please enter your verification code.');
        return;
      }

      setLoading(true);
      try {
        const res = await api<{ user: { id: string; email: string; role?: string; fullName?: string; status?: string } }>('/auth/login/verify-mfa', {
          method: 'POST',
          body: JSON.stringify({
            email: formData.email,
            code: mfaCode,
            deviceName: 'web',
            deviceType: 'browser',
          }),
        });

        const userData = {
          id: res.data.user?.id,
          email: res.data.user?.email,
          fullName: res.data.user?.fullName,
          role: res.data.user?.role,
          status: res.data.user?.status,
        };
        dispatch(setCredentials({ user: userData }));
        router.push('/');
      } catch (err: any) {
        setError(err.message || 'Invalid verification code.');
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <h1 className={styles.logo}>&#x1F35F; SpiceGarden</h1>
        <p className={styles.subtitle}>Order food from your favourite restaurants</p>
      </div>

      <Card title={mfaRequired ? 'Two-Factor Authentication' : isLogin ? 'Welcome Back' : 'Create Account'}>
        {error && (
          <div className={styles.errorMsg}>
            {error}
          </div>
        )}

        {mfaRequired ? (
          <>
            <p className={styles.subtitle} style={{ textAlign: 'center', marginBottom: '16px' }}>
              Enter the code from your authenticator app.
            </p>
            <div className={styles.fieldLg}>
              <label htmlFor="mfa-code" className={styles.label}>Verification Code</label>
              <input
                id="mfa-code"
                type="text"
                placeholder="6-digit code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength={6}
                className={styles.input}
              />
            </div>
            <Button
              label={loading ? 'Verifying...' : 'Verify'}
              onClick={handleMfaSubmit}
            />
            <button
              type="button"
              onClick={() => setMfaRequired(false)}
              className={styles.textButton}
              style={{ marginTop: '16px' }}
            >
              Back to login
            </button>
          </>
        ) : (
          <>
            {!isLogin && (
              <>
                <div className={styles.fieldMd}>
                  <label htmlFor="auth-name" className={styles.label}>Full Name</label>
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.fieldMd}>
                  <label htmlFor="auth-phone" className={styles.label}>Phone Number</label>
                  <input
                    id="auth-phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={styles.input}
                  />
                </div>
              </>
            )}

            <div className={styles.fieldMd}>
              <label htmlFor="auth-email" className={styles.label}>Email</label>
              <input
                id="auth-email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.fieldLg}>
              <label htmlFor="auth-password" className={styles.label}>Password</label>
              <input
                id="auth-password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={styles.input}
              />
            </div>

            <Button
              label={loading ? 'Loading…' : isLogin ? 'Sign In' : 'Sign Up'}
              onClick={handleSubmit}
            />

            <div className={styles.footer}>
                {isLogin && (
                    <button
                        type="button"
                        onClick={() => { router.push('/reset-password'); setError(''); }}
                        className={styles.textButton}
                    >
                        Forgot password?
                    </button>
                )}
                <div className={styles.socialSection}>
                    <div className={styles.socialLabel}>Or continue with</div>
                    <div className={styles.socialButtonsRow}>
                        <button
                            type="button"
                            onClick={() => { window.location.href = `${API_URL}/auth/google`; }}
                            className={styles.googleButton}
                        >
                            🔵 Google
                        </button>
                        <button
                            type="button"
                            onClick={() => { window.location.href = `${API_URL}/auth/facebook`; }}
                            className={styles.facebookButton}
                        >
                            𝔽 Facebook
                        </button>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className={styles.textButton}
                >
                    {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default AuthPage;
