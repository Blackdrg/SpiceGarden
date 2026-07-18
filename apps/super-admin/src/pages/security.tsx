import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DashboardCard } from '../components/DashboardCard';
import { IconShield, IconActivity, IconFileText, IconExternalLink } from '../components/icons/SGIcon';

const API = (path: string) => `/api/compliance/${path}`;

const Section: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
  <DashboardCard title={title} titleIcon={icon} style={{ marginBottom: 20 }}>
    {children}
  </DashboardCard>
);

const Stat: React.FC<{ label: string; value: React.ReactNode; tone?: string }> = ({ label, value, tone }) => (
  <div style={{ flex: '1 1 140px', minWidth: 140, background: '#0f172a', borderRadius: 10, padding: '14px 16px' }}>
    <div style={{ fontSize: 12, color: '#94a3b8' }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 700, color: tone || '#f8fafc', marginTop: 4 }}>{value}</div>
  </div>
);

const SecurityCenterPage: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [consentLogs, setConsentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [se, c] = await Promise.all([
        fetch(API('compliance-admin/security-events')).then((x) => x.ok ? x.json() : []),
        fetch(API('compliance-admin/consent-logs')).then((x) => x.ok ? x.json() : []),
      ]);
      setSecurityEvents(Array.isArray(se) ? se : []);
      setConsentLogs(Array.isArray(c) ? c : []);
    } catch {
      // keep partial data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div style={{ flex: 1, background: '#020617', color: '#f8fafc', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>Security Center</h1>
      <p style={{ color: '#94a3b8', marginTop: 0, marginBottom: 20, fontSize: 14 }}>
        Platform security posture, controls, and compliance monitoring.
      </p>

      <Section title="Legal Hub" icon={<IconFileText size={18} />}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <LegalLink href="/legal/privacy" label="Privacy Policy" />
          <LegalLink href="/legal/terms" label="Terms of Service" />
          <LegalLink href="/legal/cookies" label="Cookie Policy" />
          <LegalLink href="/compliance" label="Compliance Center" />
          <LegalLink href="/legal/accessibility" label="Accessibility Statement" />
        </div>
      </Section>

      {loading ? <p style={{ color: '#94a3b8' }}>Loading security data…</p> : (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <Stat label="Security Events" value={securityEvents.length} />
            <Stat label="Consent Logs" value={consentLogs.length} />
            <Stat label="Open Incidents" value={securityEvents.filter((e) => e.status === 'open' || e.status === 'investigating').length} tone="#f87171" />
          </div>

          <Section title={`Security Events (${securityEvents.length})`} icon={<IconShield size={18} />}>
            <table style={tableStyle}>
              <thead>
                <tr>{['Title', 'Severity', 'Status', 'Reported'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {securityEvents.length === 0 ? <tr><td colSpan={4} style={tdStyle}>No records</td></tr> :
                  securityEvents.map((r, i) => (
                    <tr key={r.id || i}>
                      <td style={tdStyle}>{r.title}</td>
                      <td style={tdStyle}>{r.severity}</td>
                      <td style={tdStyle}>{r.status}</td>
                      <td style={tdStyle}>{r.reportedAt ? new Date(r.reportedAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Section>

          <Section title={`Consent Logs (${consentLogs.length})`} icon={<IconActivity size={18} />}>
            <table style={tableStyle}>
              <thead>
                <tr>{['User', 'Category', 'Action', 'At'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {consentLogs.length === 0 ? <tr><td colSpan={4} style={tdStyle}>No records</td></tr> :
                  consentLogs.map((r, i) => (
                    <tr key={r.id || i}>
                      <td style={tdStyle}>{(r.userId || '').slice(0, 8)}</td>
                      <td style={tdStyle}>{r.category}</td>
                      <td style={tdStyle}>{r.action}</td>
                      <td style={tdStyle}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Section>
        </>
      )}
    </div>
  );
};

const LegalLink: React.FC<{ href: string; label: string }> = ({ href, label }) => (
  <Link
    href={href}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 14px',
      borderRadius: 8,
      border: '1px solid #1e293b',
      background: '#0f172a',
      color: '#cbd5e1',
      textDecoration: 'none',
      fontSize: 13,
      fontWeight: 600,
    }}
  >
    <IconExternalLink size={14} />
    {label}
  </Link>
);

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #0f172a', color: '#cbd5e1' };

export default SecurityCenterPage;
