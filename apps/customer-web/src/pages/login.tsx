import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/auth',
      permanent: false,
    },
  };
};

const LoginRedirect = () => null;

export default LoginRedirect;
