import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DashboardCard } from '../components/DashboardCard';
import { IconAlertTriangle, IconUsers, IconShield, IconFileText, IconActivity, IconExternalLink } from '../components/icons/SGIcon';

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

const LegalHubLink: React.FC<{ href: string; label: string }> = ({ href, label }) => (
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

const ComplianceDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [gdpr, setGdpr] = useState<any[]>([]);
  const [dpdp, setDpdp] = useState<any[]>([]);
  const [deletion, setDeletion] = useState<any[]>([]);
  const [retention, setRetention] = useState<any>(null);
  const [consentLogs, setConsentLogs] = useState<any[]>([]);
  const [holds, setHolds] = useState<any[]>([]);
  const [merchantAgreements, setMerchantAgreements] = useState<any[]>([]);
  const [driverAgreements, setDriverAgreements] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, g, d, del, r, c, h, ma, da, se] = await Promise.all([
        fetch(API('compliance-admin/overview')).then((x) => x.ok ? x.json() : null),
        fetch(API('compliance-admin/gdpr-requests')).then((x) => x.ok ? x.json() : []),
        fetch(API('compliance-admin/dpdp-requests')).then((x) => x.ok ? x.json() : []),
        fetch(API('compliance-admin/deletion-queue')).then((x) => x.ok ? x.json() : []),
        fetch(API('compliance-admin/retention-status')).then((x) => x.ok ? x.json() : null),
        fetch(API('compliance-admin/consent-logs')).then((x) => x.ok ? x.json() : []),
        fetch(API('compliance-admin/legal-holds')).then((x) => x.ok ? x.json() : []),
        fetch(API('compliance-admin/merchant-agreements')).then((x) => x.ok ? x.json() : []),
        fetch(API('compliance-admin/driver-agreements')).then((x) => x.ok ? x.json() : []),
        fetch(API('compliance-admin/security-events')).then((x) => x.ok ? x.json() : []),
      ]);
      setOverview(o);
      setGdpr(Array.isArray(g) ? g : []);
      setDpdp(Array.isArray(d) ? d : []);
      setDeletion(Array.isArray(del) ? del : []);
      setRetention(r);
      setConsentLogs(Array.isArray(c) ? c : []);
      setHolds(Array.isArray(h) ? h : []);
      setMerchantAgreements(Array.isArray(ma) ? ma : []);
      setDriverAgreements(Array.isArray(da) ? da : []);
      setSecurityEvents(Array.isArray(se) ? se : []);
    } catch {
      // keep partial data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'requests', label: 'GDPR / DPDP' },
    { key: 'retention', label: 'Retention' },
    { key: 'agreements', label: 'Agreements' },
    { key: 'security', label: 'Security' },
  ];

  return (
    <div style={{ flex: 1, background: '#020617', color: '#f8fafc', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>Compliance Center</h1>
      <p style={{ color: '#94a3b8', marginTop: 0, marginBottom: 20, fontSize: 14 }}>
        GDPR, DPDP Act 2023, PCI DSS, and platform governance.
      </p>

      <Section title="Legal Hub" icon={<IconFileText size={18} />}>
        <p style={{ color: '#cbd5e1', fontSize: 14, marginTop: 0, marginBottom: 12 }}>
          The Compliance Center serves as the main legal hub for SpiceGarden. Review our published policies and security posture below.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <LegalHubLink href="/legal/privacy" label="Privacy Policy" />
          <LegalHubLink href="/legal/terms" label="Terms of Service" />
          <LegalHubLink href="/legal/cookies" label="Cookie Policy" />
          <LegalHubLink href="/security" label="Security Center" />
          <LegalHubLink href="/legal/accessibility" label="Accessibility Statement" />
        </div>
      </Section>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #1e293b',
              background: tab === t.key ? '#FF5A1F' : '#0f172a',
              color: tab === t.key ? '#fff' : '#cbd5e1',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <p style={{ color: '#94a3b8' }}>Loading compliance data…</p> : (
        <>
          {tab === 'overview' && (
            <>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                <Stat label="Documents" value={overview?.documents?.total ?? '—'} />
                <Stat label="Published" value={overview?.documents?.published ?? '—'} tone="#4ade80" />
                <Stat label="DSR Pending" value={overview?.dataSubjectRequests?.pending ?? 0} tone="#fbbf24" />
                <Stat label="SLA Breached" value={overview?.dataSubjectRequests?.breachedSla ?? 0} tone="#f87171" />
                <Stat label="Open Incidents" value={overview?.incidents?.open ?? 0} tone="#f87171" />
                <Stat label="Open Grievances" value={overview?.grievances?.open ?? 0} />
                <Stat label="Tampered Records" value={overview?.integrity?.tampered ?? 0} tone={(overview?.integrity?.tampered ?? 0) > 0 ? '#f87171' : '#4ade80'} />
              </div>
              <Section title="Quick Links" icon={<IconFileText size={18} />}>
                <ul style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1', fontSize: 14, lineHeight: 1.8 }}>
                  <li>GDPR / DPDP request queues and deletion queue</li>
                  <li>Retention policy status and legal holds</li>
                  <li>Merchant &amp; Driver agreement registries</li>
                  <li>Security event log and integrity scan</li>
                  <li><Link href="/security" style={{ color: '#FF5A1F', textDecoration: 'none', fontWeight: 600 }}>Security Center <IconExternalLink size={12} /></Link> — platform security posture and controls</li>
                </ul>
              </Section>
            </>
          )}

          {tab === 'requests' && (
            <>
              <Section title={`GDPR Requests (${gdpr.length})`} icon={<IconUsers size={18} />}>
                <RequestTable rows={gdpr} />
              </Section>
              <Section title={`DPDP Requests (${dpdp.length})`} icon={<IconUsers size={18} />}>
                <RequestTable rows={dpdp} />
              </Section>
              <Section title={`Deletion Queue (${deletion.length})`} icon={<IconAlertTriangle size={18} />}>
                <RequestTable rows={deletion} />
              </Section>
            </>
          )}

          {tab === 'retention' && (
            <>
              <Section title="Retention Policies" icon={<IconActivity size={18} />}>
                <PolicyTable rows={retention?.policies || []} />
              </Section>
              <Section title={`Legal Holds (${holds.length})`} icon={<IconShield size={18} />}>
                <PolicyTable rows={holds} />
              </Section>
            </>
          )}

          {tab === 'agreements' && (
            <>
              <Section title={`Merchant Agreements (${merchantAgreements.length})`} icon={<IconFileText size={18} />}>
                <AgreementTable rows={merchantAgreements} />
              </Section>
              <Section title={`Driver Agreements (${driverAgreements.length})`} icon={<IconFileText size={18} />}>
                <AgreementTable rows={driverAgreements} />
              </Section>
            </>
          )}

          {tab === 'security' && (
            <>
              <Section title={`Security Events (${securityEvents.length})`} icon={<IconShield size={18} />}>
                <EventTable rows={securityEvents} />
              </Section>
              <Section title={`Consent Logs (${consentLogs.length})`} icon={<IconActivity size={18} />}>
                <ConsentTable rows={consentLogs} />
              </Section>
            </>
          )}
        </>
      )}
    </div>
  );
};

const RequestTable: React.FC<{ rows: any[] }> = ({ rows }) => (
  <table style={tableStyle}>
    <thead>
      <tr>{['ID', 'User', 'Type', 'Regulation', 'Status', 'SLA'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
    </thead>
    <tbody>
      {rows.length === 0 ? <tr><td colSpan={6} style={tdStyle}>No records</td></tr> :
        rows.map((r) => (
          <tr key={r.id}>
            <td style={tdStyle}>{r.id?.slice(0, 8)}</td>
            <td style={tdStyle}>{r.userId?.slice(0, 8)}</td>
            <td style={tdStyle}>{r.type}</td>
            <td style={tdStyle}>{r.regulation}</td>
            <td style={tdStyle}>{r.status}</td>
            <td style={tdStyle}>{r.slaDeadline ? new Date(r.slaDeadline).toLocaleDateString() : '—'}</td>
          </tr>
        ))}
    </tbody>
  </table>
);

const PolicyTable: React.FC<{ rows: any[] }> = ({ rows }) => (
  <table style={tableStyle}>
    <thead>
      <tr>{['Label', 'Data Type', 'Retention Days', 'Action', 'Enabled', 'Legal Hold'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
    </thead>
    <tbody>
      {rows.length === 0 ? <tr><td colSpan={6} style={tdStyle}>No records</td></tr> :
        rows.map((r, i) => (
          <tr key={r.id || i}>
            <td style={tdStyle}>{r.label}</td>
            <td style={tdStyle}>{r.dataType}</td>
            <td style={tdStyle}>{r.retentionDays}</td>
            <td style={tdStyle}>{r.action}</td>
            <td style={tdStyle}>{String(r.enabled)}</td>
            <td style={tdStyle}>{String(r.legalHoldCapable)}</td>
          </tr>
        ))}
    </tbody>
  </table>
);

const AgreementTable: React.FC<{ rows: any[] }> = ({ rows }) => (
  <table style={tableStyle}>
    <thead>
      <tr>{['Title', 'Version', 'Party', 'Status', 'Effective'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
    </thead>
    <tbody>
      {rows.length === 0 ? <tr><td colSpan={5} style={tdStyle}>No records</td></tr> :
        rows.map((r, i) => (
          <tr key={r.id || i}>
            <td style={tdStyle}>{r.title}</td>
            <td style={tdStyle}>{r.version}</td>
            <td style={tdStyle}>{r.party}</td>
            <td style={tdStyle}>{r.status}</td>
            <td style={tdStyle}>{r.effectiveDate ? new Date(r.effectiveDate).toLocaleDateString() : '—'}</td>
          </tr>
        ))}
    </tbody>
  </table>
);

const EventTable: React.FC<{ rows: any[] }> = ({ rows }) => (
  <table style={tableStyle}>
    <thead>
      <tr>{['Title', 'Severity', 'Status', 'Reported'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
    </thead>
    <tbody>
      {rows.length === 0 ? <tr><td colSpan={4} style={tdStyle}>No records</td></tr> :
        rows.map((r, i) => (
          <tr key={r.id || i}>
            <td style={tdStyle}>{r.title}</td>
            <td style={tdStyle}>{r.severity}</td>
            <td style={tdStyle}>{r.status}</td>
            <td style={tdStyle}>{r.reportedAt ? new Date(r.reportedAt).toLocaleDateString() : '—'}</td>
          </tr>
        ))}
    </tbody>
  </table>
);

const ConsentTable: React.FC<{ rows: any[] }> = ({ rows }) => (
  <table style={tableStyle}>
    <thead>
      <tr>{['User', 'Category', 'Action', 'At'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
    </thead>
    <tbody>
      {rows.length === 0 ? <tr><td colSpan={4} style={tdStyle}>No records</td></tr> :
        rows.map((r, i) => (
          <tr key={r.id || i}>
            <td style={tdStyle}>{(r.userId || '').slice(0, 8)}</td>
            <td style={tdStyle}>{r.category}</td>
            <td style={tdStyle}>{r.action}</td>
            <td style={tdStyle}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
          </tr>
        ))}
    </tbody>
  </table>
);

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #0f172a', color: '#cbd5e1' };

export default ComplianceDashboardPage;
