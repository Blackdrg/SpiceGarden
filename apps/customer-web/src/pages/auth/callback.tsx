import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import useAuth from '../../hooks/useAuth';

const AuthCallbackPage = ({ error }: { error?: string }) => {
  const dispatch = useDispatch();
  const auth = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userData = {
        email: payload.email,
        fullName: payload.fullName || payload.name,
        role: payload.role,
      };
      dispatch(setCredentials({ user: userData, token }));
      auth.handleTokenRefresh(token);
      window.location.replace('/');
    } catch {
      window.location.replace('/auth?error=Invalid%20token%20received');
    }
  }, [auth, dispatch]);

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.lg, minHeight: '100vh', backgroundColor: DESIGN_TOKENS.colors.neutral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {error ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: DESIGN_TOKENS.colors.danger }}>Authentication error: {error}</p>
          <button type="button" onClick={() => { window.location.href = '/auth'; }} style={{ marginTop: DESIGN_TOKENS.spacing.md }}>
            Back to Login
          </button>
        </div>
      ) : (
        <p>Signing you in...</p>
      )}
    </div>
  );
};

export const getServerSideProps = async (context: { query: { token?: string | string[]; error?: string | string[] } }) => {
  const { token, error } = context.query;

  if (error) {
    return { props: { error: typeof error === 'string' ? error : 'Authentication failed' } };
  }

  if (!token || Array.isArray(token)) {
    return { redirect: { destination: '/auth', permanent: false } };
  }

  return { props: {} };
};

export default AuthCallbackPage;
