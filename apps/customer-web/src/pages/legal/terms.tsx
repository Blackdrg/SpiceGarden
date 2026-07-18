import React from 'react';
import { useRouter } from 'next/router';

const TermsOfServicePage: React.FC = () => {
  const router = useRouter();
  React.useEffect(() => {
    router.replace('/legal/document/terms_of_service');
  }, [router]);
  return null;
};

export default TermsOfServicePage;
