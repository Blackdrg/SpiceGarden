import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Button, DESIGN_TOKENS } from '@spicegarden/ui';

const API = (path: string) => `/api/business/${path}`;

const linkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: DESIGN_TOKENS.colors.primary,
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: 'inherit',
  padding: 0,
};

const MerchantLegalPage: React.FC = () => {
  const router = useRouter();
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const a = await fetch(API('agreements?party=merchant')).then((x) => (x.ok ? x.json() : [])).catch(() => []);
      setAgreements(Array.isArray(a) ? a : []);
    } finally {
      setLoading(false);
    }
  };

  const openDoc = (type: string) => router.push(`/legal/document/${type}`);

  const policyTypes = [
    'merchant_agreement',
    'terms_of_service',
    'privacy_policy',
    'refund_policy',
    'cookie_policy',
    'cancellation_policy',
    'delivery_policy',
    'data_retention_policy',
    'acceptable_use_policy',
    'community_guidelines',
    'copyright_policy',
    'open_source_licenses',
  ];

  return (
    <div style={{ minHeight: '100vh', background: DESIGN_TOKENS.colors.background, color: DESIGN_TOKENS.colors.textPrimary, padding: 24, fontFamily: DESIGN_TOKENS.typography.fontFamily }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>Legal &amp; Agreements</h1>
      <p style={{ color: DESIGN_TOKENS.colors.textSecondary, marginTop: 0, marginBottom: 20, fontSize: 14 }}>
        Merchant agreements, policies, and compliance documents for your restaurant.
      </p>

      {loading ? <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>Loading…</p> : (
        <>
          <Card variant="elevated" style={{ marginBottom: 20, padding: 20 }}>
            <h2 style={sectionHeading}>Merchant Agreements</h2>
            {agreements.length === 0 ? (
              <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>No active agreements. Contact your account manager.</p>
            ) : (
              <ul style={{ lineHeight: 1.9 }}>
                {agreements.map((a) => (
                  <li key={a.id}>
                    {a.title} (v{a.version}, {a.status}) —{' '}
                    <button onClick={() => openDoc('merchant_agreement')} style={linkStyle}>View</button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card variant="elevated" style={{ marginBottom: 20, padding: 20 }}>
            <h2 style={sectionHeading}>Policies &amp; Disclosures</h2>
            <ul style={{ lineHeight: 1.9 }}>
              {policyTypes.map((t) => (
                <li key={t}>
                  <button onClick={() => openDoc(t)} style={linkStyle}>{t.replace(/_/g, ' ')}</button>
                </li>
              ))}
            </ul>
          </Card>

          <Card variant="elevated" style={{ marginBottom: 20, padding: 20 }}>
            <h2 style={sectionHeading}>Acceptance &amp; Consent</h2>
            <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: 14 }}>
              Accepted documents are recorded with timestamp and version. Open any document above to review and accept the latest version.
            </p>
            <Button label="Open Legal Center" variant="primary" onClick={() => openDoc('merchant_agreement')} />
          </Card>
        </>
      )}
    </div>
  );
};

const sectionHeading: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  margin: '0 0 12px',
};

export default MerchantLegalPage;
