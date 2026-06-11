import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';
import { DESIGN_TOKENS } from '@spicegarden/ui';

const AuthCallbackPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const { token, error: authError } = router.query;

      if (authError) {
        setError(typeof authError === 'string' ? authError : 'Authentication failed');
        return;
      }

      if (token && typeof token === 'string') {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userData = {
            email: payload.email,
            fullName: payload.fullName || payload.name,
            role: payload.role,
          };
          dispatch(setCredentials({ user: userData, token }));
          router.push('/');
        } catch (err) {
          setError('Invalid token received');
        }
      }
    };

    if (Object.keys(router.query).length > 0) {
      handleCallback();
    }
  }, [router, dispatch]);

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.lg, minHeight: '100vh', backgroundColor: DESIGN_TOKENS.colors.neutral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {error ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: DESIGN_TOKENS.colors.danger }}>Authentication error: {error}</p>
          <button onClick={() => router.push('/auth')} style={{ marginTop: DESIGN_TOKENS.spacing.md }}>
            Back to Login
          </button>
        </div>
      ) : (
        <p>Signing you in...</p>
      )}
    </div>
  );
};

export default AuthCallbackPage;