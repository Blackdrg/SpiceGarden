import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/legal/document/privacy_policy',
      permanent: false,
    },
  };
};

const PrivacyPolicyPage = () => {
  return null;
};

export default PrivacyPolicyPage;
