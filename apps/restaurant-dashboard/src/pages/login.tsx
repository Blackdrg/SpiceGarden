import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import Head from 'next/head';
import { Button, Input, useToast } from '@spicegarden/ui';
import { setCredentials } from '../redux/slices/authSlice';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, deviceName: 'restaurant-dashboard', deviceType: 'browser' }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError((data as { error?: string }).error || 'Login failed');
        return;
      }

      if ((data as { mfaRequired?: boolean }).mfaRequired) {
        setError('MFA is required for this account. Please use the mobile app or contact support.');
        return;
      }

      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        setError('Session could not be established');
        return;
      }
      const me = await meRes.json();
      const user = (me as { user?: unknown }).user as { id?: string; email?: string; fullName?: string; role?: string; status?: string } | undefined;

      dispatch(setCredentials({ user: { id: user?.id, email: user?.email || email, fullName: user?.fullName, role: user?.role || 'restaurant', status: user?.status } }));
      router.push('/');
    } catch {
      setError('Unable to reach the authentication service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Restaurant Sign In - SpiceGarden</title>
      </Head>
      <div className={styles.card}>
        <h1 className={styles.heading}>Restaurant Dashboard</h1>
        <p className={styles.subtitle}>Sign in to manage orders and inventory</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@restaurant.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" disabled={loading} fullWidth onClick={() => undefined}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
