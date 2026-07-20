import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/auth',
      permanent: false,
    },
  };
};

const CallbackRedirect = () => null;

export default CallbackRedirect;
