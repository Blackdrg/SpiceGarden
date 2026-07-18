import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Button, DESIGN_TOKENS, ToastProvider, useToast } from '@spicegarden/ui';
import { legalApi, ConsentRecord } from '@spicegarden/shared/api';
import { legalPageContainer, legalTitle, legalMeta, legalSectionHeading } from '../lib/legalStyles';
import styles from './consent-dashboard.module.css';

interface ConsentLogEntry {
  id: string;
  createdAt: string;
  region: string;
  consentVersion: string;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  performance: boolean;
  functional: boolean;
  preference: boolean;
  withdrawnAt?: string;
}

const ConsentDashboardInner: React.FC = () => {
  const user = useSelector((s: any) => s.auth.user);
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<any>(null);
  const [consentLog, setConsentLog] = useState<ConsentLogEntry[]>([]);
  const [dpdpInfo, setDpdpInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const userId = user?.id;

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [d, p, g] = await Promise.all([
        legalApi.dashboard(userId),
        legalApi.myAcceptances(),
        legalApi.dpdpInfo(),
      ]);
      setDashboard(d.data);
      setConsentLog((p.data as ConsentLogEntry[]) || []);
      setDpdpInfo(g.data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleWithdraw = async () => {
    if (!userId) return;
    setBusy(true);
    try {
      await legalApi.withdrawConsent('current', userId);
      showToast({ message: 'Consent withdrawn successfully.', type: 'success', duration: 4000 });
      void load();
    } catch {
      showToast({ message: 'Failed to withdraw consent. Please try again.', type: 'error', duration: 4000 });
    } finally {
      setBusy(false);
    }
  };

  if (!userId) {
    return (
      <div style={legalPageContainer}>
        <h1 style={legalTitle}>Consent Dashboard</h1>
        <p style={legalMeta}>Please sign in to manage your consent.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={legalPageContainer}>
        <h1 style={legalTitle}>Consent Dashboard</h1>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>Loading…</p>
      </div>
    );
  }

  const consent = dashboard?.consent;
  const officer = dashboard?.dpdpOfficer || dpdpInfo?.officer;
  const manager = dashboard?.consentManager || dpdpInfo?.consentManager;

  return (
    <div style={legalPageContainer}>
      <h1 style={legalTitle}>Consent Dashboard</h1>
      <p style={legalMeta}>Review and manage your cookie consent and privacy settings.</p>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>
          Current Consent Status
          {consent?.version ? <span className={styles.versionBadge}>v{consent.version}</span> : null}
        </h2>
        {consent ? (
          <>
            <p className={styles.description}>
              You have granted consent for the following cookie categories:
            </p>
            <ul className={styles.historyList}>
              {(['necessary', 'functional', 'preference', 'performance', 'analytics', 'marketing'] as const).map((key) => (
                <li key={key} className={styles.historyItem}>
                  <span>
                    <strong style={{ textTransform: 'capitalize' }}>{key}</strong>
                  </span>
                  <span className={styles.historyDate}>
                    {consent[key] ? 'Granted' : 'Denied'}
                  </span>
                </li>
              ))}
            </ul>
            <div className={styles.actions}>
              <Button label="Withdraw All Non-Essential" variant="secondary" isLoading={busy} onClick={handleWithdraw} />
            </div>
          </>
        ) : (
          <p className={styles.emptyState}>No active consent record found.</p>
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>
          Consent History
        </h2>
        {consentLog.length > 0 ? (
          <ul className={styles.historyList}>
            {consentLog.map((entry) => (
              <li key={entry.id} className={styles.historyItem}>
                <span>
                  <strong>Consent Update</strong>
                  {entry.withdrawnAt ? ' (withdrawn)' : ''}
                </span>
                <span className={styles.historyDate}>
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyState}>No consent history available yet.</p>
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Regulatory Compliance</h2>
        <div className={styles.infoRow}>
          <span className={styles.gdprBadge}>GDPR</span>
          <span className={styles.dpdpBadge}>DPDP Act 2023</span>
        </div>
        <p className={styles.description}>
          Your consent preferences are governed by the General Data Protection Regulation (GDPR) for EU/UK users
          and the Digital Personal Data Protection (DPDP) Act for Indian users. You have the right to withdraw
          consent at any time, request access to your data, and request deletion of your account or data.
        </p>
        {officer && (
          <div className={styles.infoRow}>
            <span className={styles.infoItem}>
              <strong>Grievance Officer:</strong> {officer.name} &lt;{officer.email}&gt;
            </span>
          </div>
        )}
        {manager && (
          <div className={styles.infoRow}>
            <span className={styles.infoItem}>
              <strong>Consent Manager:</strong> {manager.name} &lt;{manager.email}&gt;
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const ConsentDashboardPage: React.FC = () => (
  <ToastProvider>
    <ConsentDashboardInner />
  </ToastProvider>
);

export default ConsentDashboardPage;
