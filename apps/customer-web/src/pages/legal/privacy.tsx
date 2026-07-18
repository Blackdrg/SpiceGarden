import React from 'react';
import { useRouter } from 'next/router';

const PrivacyPolicyPage: React.FC = () => {
  const router = useRouter();
  React.useEffect(() => {
    router.replace('/legal/document/privacy_policy');
  }, [router]);
  return null;
};

export default PrivacyPolicyPage;
