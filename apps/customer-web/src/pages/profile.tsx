import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { api } from '@spicegarden/shared/api';
import { useMfaManagement } from '../hooks/useMfaManagement';
import { ShieldCheckIcon, ShieldOffIcon, QrCodeIcon } from 'lucide-react';
import styles from './profile.module.css';

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
      fetchUserProfile();
    }
  };

  const handleDisable = async () => {
    const success = await disableMfa(mfaCode);
    if (success) {
      setMfaCode('');
      fetchUserProfile();
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>My Profile</h2>
        </div>
        <Card variant="elevated">
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--color-border, #E5E7EB)', borderTopColor: 'var(--color-primary, #FF5A1F)', borderRadius: '50%', animation: 'sg-spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--color-textSecondary, #6B7280)' }}>Loading profile...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>My Profile</h2>
        </div>
        <Card variant="elevated">
          <p style={{ color: 'var(--color-danger, #EF4444)', textAlign: 'center' }}>{fetchError}</p>
          <Button label="Retry" onClick={fetchUserProfile} variant="secondary" />
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>My Profile</h2>
        </div>
        <Card variant="elevated">
          <p style={{ textAlign: 'center', color: 'var(--color-textSecondary, #6B7280)' }}>Could not load user data.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>My Profile</h2>
        <p className={styles.pageSubtitle}>Manage your account settings</p>
      </div>

      <Card variant="elevated">
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className={styles.profileName}>Welcome, {user.fullName}</h3>
            <p className={styles.profileEmail}>{user.email}</p>
          </div>
        </div>
      </Card>

      <div className={styles.sectionDivider} />

      <div className={styles.pageHeader}>
        <h3 className={styles.sectionTitle}>
          <ShieldCheckIcon size={20} color={DESIGN_TOKENS.colors.primary} />
          Security Settings
        </h3>
      </div>

      <Card variant="elevated">
        {mfaError && <div className={styles.errorText}>{mfaError}</div>}
        {mfaMessage && <div className={styles.messageText}>{mfaMessage}</div>}

        <div className={`${styles.mfaStatus} ${isMfaEnabled ? styles.mfaEnabled : styles.mfaDisabled}`}>
          <span className={`${styles.mfaIndicator} ${isMfaEnabled ? styles.mfaIndicatorEnabled : styles.mfaIndicatorDisabled}`} />
          {isMfaEnabled ? 'Two-Factor Authentication is Enabled' : 'Two-Factor Authentication is Disabled'}
        </div>

        {isMfaEnabled ? (
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-textSecondary, #6B7280)', marginBottom: '16px' }}>
              Enter the 6-digit code from your authenticator app to disable 2FA.
            </p>
            <div className={styles.formGroup}>
              <label htmlFor="mfa-disable-code" className={styles.formLabel}>Verification Code</label>
              <input
                id="mfa-disable-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength={6}
                className={styles.codeInput}
                disabled={isMfaLoading}
              />
            </div>
            <Button
              label={isMfaLoading ? 'Disabling...' : 'Disable 2FA'}
              onClick={handleDisable}
              disabled={isMfaLoading}
              variant="destructive"
              fullWidth
            />
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-textSecondary, #6B7280)', marginBottom: '16px' }}>
              Add an extra layer of security to your account with two-factor authentication.
            </p>
            {!qrCodeDataUrl ? (
              <Button label="Setup MFA" onClick={generateQrCode} disabled={isMfaLoading} fullWidth />
            ) : (
              <div className={styles.qrContainer}>
                <div className={styles.qrHeader}>
                  <QrCodeIcon size={24} color={DESIGN_TOKENS.colors.primary} />
                  <span style={{ fontWeight: 600 }}>Scan QR Code</span>
                </div>
                <Image src={qrCodeDataUrl} alt="MFA QR Code" className={styles.qrCode} width={200} height={200} />
                <p style={{ fontSize: '0.875rem', color: 'var(--color-textSecondary, #6B7280)', textAlign: 'center', marginBottom: '16px' }}>
                  Enter the 6-digit code from your authenticator app:
                </p>
                <input
                  id="mfa-enable-code"
                  type="text"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  maxLength={6}
                  className={styles.codeInput}
                  disabled={isMfaLoading}
                  aria-label="Enter the 6-digit code from your authenticator app"
                />
                <Button
                  label={isMfaLoading ? 'Enabling...' : 'Enable MFA'}
                  onClick={handleEnable}
                  disabled={isMfaLoading}
                  fullWidth
                />
              </div>
            )}
          </div>
        )}
      </Card>

      <div className={styles.sectionDivider} />

      <div className={styles.pageHeader}>
        <h3 className={styles.sectionTitle}>
          <ShieldCheckIcon size={20} color={DESIGN_TOKENS.colors.primary} />
          Privacy &amp; Legal
        </h3>
      </div>

      <Card variant="elevated">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/privacy-dashboard" className={styles.legalLink}>Privacy Dashboard &amp; Data Controls</Link>
          <Link href="/legal" className={styles.legalLink}>Legal Center (Policies &amp; Agreements)</Link>
          <Link href="/legal/document/cookie_policy" className={styles.legalLink}>Cookie Policy</Link>
          <Link href="/security" className={styles.legalLink}>Security Center</Link>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
