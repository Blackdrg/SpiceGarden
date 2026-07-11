import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Button, Card } from '@spicegarden/ui';
import { api } from '@spicegarden/shared/api';
import { useMfaManagement } from '../hooks/useMfaManagement';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  isMfaEnabled: boolean;
}

const ProfilePage: React.FC = () => {
  const reduxUser = useSelector((state: any) => state.auth.user);
  const [user, setUser] = useState<UserProfile | null>(reduxUser);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const {
    isMfaEnabled,
    qrCodeDataUrl,
    isLoading: isMfaLoading,
    error: mfaError,
    message: mfaMessage,
    generateQrCode,
    enableMfa,
    disableMfa,
    setIsMfaEnabled,
  } = useMfaManagement();

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api<{ user: UserProfile }>('/auth/me');
      setUser(response.data.user);
    } catch (err: any) {
      setFetchError('Failed to fetch user profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setIsMfaEnabled(user.isMfaEnabled);
    }
  }, [user, setIsMfaEnabled]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleEnable = async () => {
    const success = await enableMfa(mfaCode);
    if (success) {
      setMfaCode('');
      fetchUserProfile(); // Refetch user to update JWT and profile status
    }
  };

  const handleDisable = async () => {
    const success = await disableMfa(mfaCode);
    if (success) {
      setMfaCode('');
      fetchUserProfile(); // Refetch user to update JWT and profile status
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h1>My Profile</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={styles.container}>
        <h1>My Profile</h1>
        <p style={styles.errorText}>{fetchError}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <h1>My Profile</h1>
        <p>Could not load user data.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>Welcome, {user.fullName}</h1>
      <p>Email: {user.email}</p>

      <Card title="Security Settings" style={styles.card}>
        {mfaError && <p style={styles.errorText}>{mfaError}</p>}
        {mfaMessage && <p style={styles.messageText}>{mfaMessage}</p>}

        {isMfaEnabled ? (
          <div>
            <p style={styles.mfaStatusText}>
              <span style={styles.mfaEnabledIndicator}>●</span>
              Two-Factor Authentication is <strong>Enabled</strong>.
            </p>
            <div style={styles.formGroup}>
              <label htmlFor="mfa-disable-code" style={styles.label}>Enter code to disable</label>
              <input
                id="mfa-disable-code"
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
                style={styles.codeInput}
                disabled={isMfaLoading}
              />
            </div>
            <Button label={isMfaLoading ? 'Disabling...' : 'Disable 2FA'} onClick={handleDisable} disabled={isMfaLoading} variant="destructive" />
          </div>
        ) : (
          <div>
            <p style={styles.mfaStatusText}>
              <span style={styles.mfaDisabledIndicator}>●</span>
              Two-Factor Authentication is <strong>Disabled</strong>.
            </p>
            {!qrCodeDataUrl ? (
              <Button label="Setup MFA" onClick={generateQrCode} disabled={isMfaLoading} />
            ) : (
              <div style={styles.qrContainer}>
                <img src={qrCodeDataUrl} alt="MFA QR Code" style={styles.qrCode} />
                <p>Enter the 6-digit code from your authenticator app:</p>
                <input
                  id="mfa-enable-code"
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  maxLength={6}
                  style={styles.codeInput}
                  disabled={isMfaLoading}
                  aria-label="Enter the 6-digit code from your authenticator app"
                />
                <Button label={isMfaLoading ? 'Enabling...' : 'Enable MFA'} onClick={handleEnable} disabled={isMfaLoading} />
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
  card: { marginTop: '20px' },
  qrContainer: { display: 'flex', flexDirection: 'column' as 'column', alignItems: 'center', marginTop: '20px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' },
  qrCode: { width: '200px', height: '200px', marginBottom: '20px', border: '1px solid #eee' },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
  codeInput: {
    padding: '10px',
    margin: '10px 0',
    fontSize: '18px',
    textAlign: 'center' as 'center',
    width: '150px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  errorText: { color: 'red' },
  messageText: { color: 'green' },
  mfaStatusText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  mfaEnabledIndicator: {
    color: 'green',
  },
  mfaDisabledIndicator: {
    color: 'red',
  },
};

export default ProfilePage;