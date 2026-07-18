import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Button, Card, DESIGN_TOKENS, ToastProvider, useToast } from '@spicegarden/ui';
import { legalApi } from '@spicegarden/shared/api';
import { legalPageContainer, legalTitle, legalMeta, legalSectionHeading } from '../lib/legalStyles';
import { useCookieConsent } from '../hooks/useCookieConsent';
import styles from './privacy-dashboard.module.css';

const CONSENT_KEYS = [
  { key: 'analytics', label: 'Analytics' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'performance', label: 'Performance' },
  { key: 'functional', label: 'Functional' },
  { key: 'preference', label: 'Preferences' },
] as const;

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card variant="default" className={styles.card}>
    <h2 style={legalSectionHeading}>{title}</h2>
    {children}
  </Card>
);

const PrivacyDashboardInner: React.FC = () => {
  const user = useSelector((s: any) => s.auth.user);
  const { showToast } = useToast();
  const { prefs, saveConsent, withdraw } = useCookieConsent();
  const [dashboard, setDashboard] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [exports, setExports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const userId = user?.id;

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [d, r, e] = await Promise.all([
        legalApi.dashboard(userId),
        legalApi.listRequests(`?userId=${userId}`),
        legalApi.listExports(userId),
      ]);
      setDashboard(d.data);
      setRequests(r.data as any[]);
      setExports(e.data as any[]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleConsent = async (key: string) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key as keyof typeof prefs] } as any;
    await saveConsent(next, userId);
    showToast({ message: 'Consent preferences updated.', type: 'success', duration: 4000 });
    void load();
  };

  const submitRequest = async (type: string, regulation: string) => {
    if (!userId) return;
    setBusy(true);
    try {
      await legalApi.createRequest({ userId, type, regulation });
      showToast({ message: `Your ${type} request has been submitted.`, type: 'success', duration: 4000 });
      void load();
    } finally {
      setBusy(false);
    }
  };

  const createExport = async (format: string) => {
    if (!userId) return;
    setBusy(true);
    try {
      await legalApi.createExport({ userId, regulation: 'gdpr', format });
      showToast({ message: `Export (${format}) requested. You'll be notified when ready.`, type: 'success', duration: 4000 });
      void load();
    } finally {
      setBusy(false);
    }
  };

  if (!userId) {
    return (
      <div style={legalPageContainer}>
        <h1 style={legalTitle}>Privacy Dashboard</h1>
        <p style={legalMeta}>Please sign in to manage your privacy settings.</p>
      </div>
    );
  }

  return (
    <div style={legalPageContainer}>
      <h1 style={legalTitle}>Privacy Dashboard</h1>
      <p style={legalMeta}>Manage your data, consent, and privacy rights in one place.</p>

      {loading ? <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>Loading…</p> : (
        <>
          <Section title="Your Data">
            <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: 14 }}>
              We store account, order, location, device, and payment metadata needed to operate the service. Payment card numbers are processed by Stripe/Razorpay and never stored by us (PCI DSS).
            </p>
            <div className={styles.row}>
              <Button label="Export as JSON" variant="outline" isLoading={busy} onClick={() => createExport('json')} />
              <Button label="Export as CSV" variant="outline" isLoading={busy} onClick={() => createExport('csv')} />
              <Button label="Export as PDF" variant="outline" isLoading={busy} onClick={() => createExport('pdf')} />
            </div>
            {exports.length > 0 && (
              <ul className={styles.list}>
                {exports.map((ex: any) => (
                  <li key={ex.id}>
                    {ex.format.toUpperCase()} — {ex.status}{' '}
                    {ex.status === 'completed' ? (
                      <a href={legalApi.downloadExport(ex.id)}>Download</a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Consent & Cookies">
            <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: 14 }}>
              Consent version: {dashboard?.consent?.version || '—'}
            </p>
            <div className={styles.toggles}>
              {CONSENT_KEYS.map((c) => (
                <label key={c.key} className={styles.toggle}>
                  <input type="checkbox" checked={!!prefs?.[c.key as keyof typeof prefs]} onChange={() => toggleConsent(c.key)} />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
            <div className={styles.row}>
              <Button label="Withdraw All Non-Essential" variant="secondary" onClick={() => { void withdraw(); void load(); }} />
            </div>
          </Section>

          <Section title="Data Subject Requests">
            <div className={styles.row}>
              <Button label="Request Access" variant="outline" isLoading={busy} onClick={() => submitRequest('access', 'gdpr')} />
              <Button label="Request Correction" variant="outline" isLoading={busy} onClick={() => submitRequest('correct', 'gdpr')} />
              <Button label="Restrict Processing" variant="outline" isLoading={busy} onClick={() => submitRequest('restrict', 'gdpr')} />
              <Button label="Object" variant="outline" isLoading={busy} onClick={() => submitRequest('object', 'gdpr')} />
            </div>
            <div className={styles.row}>
              <Button label="Delete My Account (GDPR)" variant="destructive" isLoading={busy} onClick={() => submitRequest('delete', 'gdpr')} />
              <Button label="Delete My Data (DPDP)" variant="destructive" isLoading={busy} onClick={() => submitRequest('delete', 'dpdp')} />
            </div>
            {requests.length > 0 && (
              <ul className={styles.list}>
                {requests.map((r: any) => (
                  <li key={r.id}>{r.type} · {r.regulation} · {r.status}</li>
                ))}
              </ul>
            )}
          </Section>

          {dashboard?.dpdpOfficer && (
            <Section title="Grievance Officer (DPDP Act, 2023)">
              <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: 14 }}>
                <strong>{dashboard.dpdpOfficer.name}</strong><br />
                Email: {dashboard.dpdpOfficer.email}<br />
                Phone: {dashboard.dpdpOfficer.phone}
              </p>
            </Section>
          )}
        </>
      )}
    </div>
  );
};

const PrivacyDashboardPage: React.FC = () => (
  <ToastProvider>
    <PrivacyDashboardInner />
  </ToastProvider>
);

export default PrivacyDashboardPage;
