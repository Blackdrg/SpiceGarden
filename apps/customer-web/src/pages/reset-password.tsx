import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { API_URL } from '@spicegarden/shared/constants';
import styles from './reset-password.module.css';

const ResetPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [formData, setFormData] = useState({ email: '', code: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    try {
      setLoading(true);

      if (step === 'email') {
        if (!formData.email) {
          setError('Please enter your email');
          return;
        }

        const res = await fetch(`${API_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });

        if (res.ok) {
          setStep('code');
          setSuccessMessage('If your email exists in our system, we have sent a reset code to it.');
        } else {
          const errorData = await res.json();
          setError(errorData.message || 'Failed to send reset code');
        }
      } else if (step === 'code') {
        if (!formData.code) {
          setError('Please enter the reset code');
          return;
        }

        const res = await fetch(`${API_URL}/auth/verify-reset-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, code: formData.code }),
        });

        if (res.ok) {
          setStep('password');
        } else {
          const errorData = await res.json();
          setError(errorData.message || 'Invalid or expired code');
        }
      } else if (step === 'password') {
        if (!formData.password) {
          setError('Please enter a new password');
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters');
          return;
        }

        const res = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            code: formData.code,
            password: formData.password,
          }),
        });

        if (res.ok) {
          setSuccessMessage('Password reset successful! You can now log in with your new password.');
          setTimeout(() => {
            router.push('/auth');
          }, 2000);
        } else {
          const errorData = await res.json();
          setError(errorData.message || 'Failed to reset password');
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>&#x1F511; Reset Password</h1>
        <p className={styles.subtitle}>Enter your email to reset your password</p>
      </div>

      <Card title={step === 'email' ? 'Reset Password' : step === 'code' ? 'Verify Code' : 'Set New Password'}>
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        {successMessage && (
          <div className={styles.success}>
            {successMessage}
          </div>
        )}

        {step === 'email' && (
          <>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={styles.input}
              />
            </div>

            <Button
              label={loading ? 'Sending...' : 'Send Reset Code'}
              onClick={handleSubmit}
            />
          </>
        )}

        {step === 'code' && (
          <>
            <p className={styles.text}>
              We've sent a reset code to <strong>{formData.email}</strong>. Please check your email.
            </p>

            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Reset Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className={styles.input}
              />
            </div>

            <Button
              label={loading ? 'Verifying...' : 'Verify Code'}
              onClick={handleSubmit}
            />
          </>
        )}

        {step === 'password' && (
          <>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                placeholder="New Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.inputWrapper}>
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={styles.input}
              />
            </div>

            <Button
              label={loading ? 'Resetting...' : 'Reset Password'}
              onClick={handleSubmit}
            />
          </>
        )}
      </Card>

      <div className={styles.backWrapper}>
        <button
          type="button"
          onClick={() => router.push('/auth')}
          className={styles.backButton}
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
