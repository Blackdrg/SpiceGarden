import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/legal/document/terms_of_service',
      permanent: false,
    },
  };
};

const TermsRedirect = () => null;

export default TermsRedirect;
