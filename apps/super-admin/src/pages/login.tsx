import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Button, Input, useToast } from '@spicegarden/ui';
import { useAuth } from '../auth/AuthContext';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
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
      const result = await login(email, password);
      if (!result.ok) {
        setError(result.error || 'Login failed');
        return;
      }
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
        <title>Super Admin Sign In - SpiceGarden</title>
      </Head>
      <div className={styles.card}>
        <h1 className={styles.heading}>SpiceGarden Admin</h1>
        <p className={styles.subtitle}>Sign in to the control center</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="admin@spicegarden.com"
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
