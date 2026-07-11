import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@spicegarden/ui';
import { useMfaManagement } from '../hooks/useMfaManagement';

const MfaSetupPage: React.FC = () => {
  const router = useRouter();
  const [mfaCode, setMfaCode] = useState<string>('');
  const {
    isMfaEnabled,
    qrCodeDataUrl,
    isLoading,
    error,
    message,
    generateQrCode,
    enableMfa,
  } = useMfaManagement();

  const handleEnableMfa = useCallback(async () => {
    const success = await enableMfa(mfaCode);
    if (success) {
      setTimeout(() => router.push('/profile'), 2000);
    }
  }, [mfaCode, router, enableMfa]);

  return (
    <div style={styles.container}>
      <h1>Multi-Factor Authentication Setup</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p style={styles.errorText}>Error: {error}</p>}
      {message && <p style={styles.messageText}>{message}</p>}

      {isMfaEnabled ? (
        <div>
          <p>MFA is already enabled. You are protected!</p>
          <Button label="Go to Profile" onClick={() => router.push('/profile')} />
        </div>
      ) : (
        <div>
          {!qrCodeDataUrl ? (
            <Button label="Setup MFA" onClick={generateQrCode} disabled={isLoading} />
          ) : (
            <div style={styles.qrContainer}>
              <img src={qrCodeDataUrl} alt="MFA QR Code" style={styles.qrCode} />
              <p>Enter the 6-digit code from your authenticator app:</p>
              <input
                id="mfa-setup-code"
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength={6}
                style={styles.codeInput}
                disabled={isLoading}
                aria-label="Enter the 6-digit code from your authenticator app"
              />
              <Button label="Enable MFA" onClick={handleEnableMfa} disabled={isLoading} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  qrContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    marginTop: '20px',
    border: '1px solid #ccc',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  qrCode: {
    width: '200px',
    height: '200px',
    marginBottom: '20px',
    border: '1px solid #eee',
  },
  codeInput: {
    padding: '10px',
    margin: '10px 0',
    fontSize: '18px',
    textAlign: 'center' as 'center',
    width: '150px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  errorText: {
    color: 'red',
    marginBottom: '10px',
  },
  messageText: {
    color: 'green',
    marginBottom: '10px',
  },
};

export default MfaSetupPage;