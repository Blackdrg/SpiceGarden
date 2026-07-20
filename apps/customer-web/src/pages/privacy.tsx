import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/privacy-dashboard',
      permanent: false,
    },
  };
};

const PrivacyRedirect = () => null;

export default PrivacyRedirect;
