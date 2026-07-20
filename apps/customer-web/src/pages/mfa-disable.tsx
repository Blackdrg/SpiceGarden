import { useRouter } from 'next/router';
import MfaDisable from '../components/MfaDisable';

const MfaDisablePage = () => {
  const router = useRouter();
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
      <MfaDisable onMfaDisabled={() => router.push('/profile')} />
    </main>
  );
};

export default MfaDisablePage;
