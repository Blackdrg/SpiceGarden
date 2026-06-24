import React, { useReducer } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { API_URL } from '@spicegarden/shared/constants';
import styles from './reset-password.module.css';

interface ResetPasswordState {
  step: 'email' | 'code' | 'password';
  formData: { email: string; code: string; password: string; confirmPassword: string };
  error: string;
  loading: boolean;
  successMessage: string;
}

const initialResetPasswordState: ResetPasswordState = {
  step: 'email',
  formData: { email: '', code: '', password: '', confirmPassword: '' },
  error: '',
  loading: false,
  successMessage: '',
};

function resetPasswordReducer(state: ResetPasswordState, action: { type: string; payload?: unknown }): ResetPasswordState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload as 'email' | 'code' | 'password' };
    case 'SET_FORM_DATA':
      return { ...state, formData: action.payload as { email: string; code: string; password: string; confirmPassword: string } };
    case 'SET_ERROR':
      return { ...state, error: action.payload as string };
    case 'SET_LOADING':
      return { ...state, loading: action.payload as boolean };
    case 'SET_SUCCESS_MESSAGE':
      return { ...state, successMessage: action.payload as string };
    default:
      return state;
  }
}

const ResetPasswordPage = () => {
  const router = useRouter();
  const [state, dispatch] = useReducer(resetPasswordReducer, initialResetPasswordState);

  const handleSubmit = async () => {
    dispatch({ type: 'SET_ERROR', payload: '' });
    dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: '' });

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (state.step === 'email') {
        if (!state.formData.email) {
          dispatch({ type: 'SET_ERROR', payload: 'Please enter your email' });
          return;
        }

        const res = await fetch(`${API_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: state.formData.email }),
        });

        if (res.ok) {
          dispatch({ type: 'SET_STEP', payload: 'code' });
          dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: "If your email exists in our system, we have sent a reset code to it." });
        } else {
          const errorData = await res.json();
          dispatch({ type: 'SET_ERROR', payload: errorData.message || 'Failed to send reset code' });
        }
      } else if (state.step === 'code') {
        if (!state.formData.code) {
          dispatch({ type: 'SET_ERROR', payload: 'Please enter the reset code' });
          return;
        }

        const res = await fetch(`${API_URL}/auth/verify-reset-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: state.formData.email, code: state.formData.code }),
        });

        if (res.ok) {
          dispatch({ type: 'SET_STEP', payload: 'password' });
        } else {
          const errorData = await res.json();
          dispatch({ type: 'SET_ERROR', payload: errorData.message || 'Invalid or expired code' });
        }
      } else if (state.step === 'password') {
        if (!state.formData.password) {
          dispatch({ type: 'SET_ERROR', payload: 'Please enter a new password' });
          return;
        }

        if (state.formData.password !== state.formData.confirmPassword) {
          dispatch({ type: 'SET_ERROR', payload: 'Passwords do not match' });
          return;
        }

        if (state.formData.password.length < 8) {
          dispatch({ type: 'SET_ERROR', payload: 'Password must be at least 8 characters' });
          return;
        }

        const res = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: state.formData.email,
            code: state.formData.code,
            password: state.formData.password,
          }),
        });

        if (res.ok) {
          dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: 'Password reset successful! You can now log in with your new password.' });
          setTimeout(() => {
            router.push('/auth');
          }, 2000);
        } else {
          const errorData = await res.json();
          dispatch({ type: 'SET_ERROR', payload: errorData.message || 'Failed to reset password' });
        }
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Network error. Please check your connection and try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🔑 Reset Password</h1>
        <p className={styles.subtitle}>Enter your email to reset your password</p>
      </div>

      <Card title={state.step === 'email' ? 'Reset Password' : state.step === 'code' ? 'Verify Code' : 'Set New Password'}>
        {state.error && (
          <div className={styles.error}>
            {state.error}
          </div>
        )}
        {state.successMessage && (
          <div className={styles.success}>
            {state.successMessage}
          </div>
        )}

        {state.step === 'email' && (
          <>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                placeholder="Email Address"
                aria-label="Email address"
                value={state.formData.email}
                onChange={(e) => dispatch({ type: 'SET_FORM_DATA', payload: { ...state.formData, email: e.target.value } })}
                className={styles.input}
              />
            </div>

            <Button
              label={state.loading ? 'Sending...' : 'Send Reset Code'}
              onClick={handleSubmit}
            />
          </>
        )}

        {state.step === 'code' && (
          <>
            <p className={styles.text}>
              We've sent a reset code to <strong>{state.formData.email}</strong>. Please check your email.
            </p>

            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Reset Code"
                aria-label="Reset code"
                value={state.formData.code}
                onChange={(e) => dispatch({ type: 'SET_FORM_DATA', payload: { ...state.formData, code: e.target.value } })}
                className={styles.input}
              />
            </div>

            <Button
              label={state.loading ? 'Verifying...' : 'Verify Code'}
              onClick={handleSubmit}
            />
          </>
        )}

        {state.step === 'password' && (
          <>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                placeholder="New Password"
                aria-label="New password"
                value={state.formData.password}
                onChange={(e) => dispatch({ type: 'SET_FORM_DATA', payload: { ...state.formData, password: e.target.value } })}
                className={styles.input}
              />
            </div>

            <div className={styles.inputWrapper}>
              <input
                type="password"
                placeholder="Confirm Password"
                aria-label="Confirm password"
                value={state.formData.confirmPassword}
                onChange={(e) => dispatch({ type: 'SET_FORM_DATA', payload: { ...state.formData, confirmPassword: e.target.value } })}
                className={styles.input}
              />
            </div>

            <Button
              label={state.loading ? 'Resetting...' : 'Reset Password'}
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