import { DESIGN_TOKENS } from '@spicegarden/ui';

const AuthCallbackPage = () => {
  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.lg, minHeight: '100vh', backgroundColor: DESIGN_TOKENS.colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Signing you in...</p>
    </div>
  );
};

export const getServerSideProps = async (context: { query: { error?: string | string[] } }) => {
  const { error } = context.query;

  if (error) {
    return {
      redirect: {
        destination: `/auth?error=${encodeURIComponent(typeof error === 'string' ? error : 'Authentication failed')}`,
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
};

export default AuthCallbackPage;
