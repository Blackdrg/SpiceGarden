import React, { useState, useEffect } from 'react';
import { Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { legalPageContainer, legalTitle, legalMeta, legalSectionHeading } from '../lib/legalStyles';
import styles from './security.module.css';

interface FaqItem { q: string; a: string; }

const FAQS: FaqItem[] = [
  { q: 'How do I report a vulnerability?', a: 'Email security@spicegarden.com with details, or use the responsible disclosure process. PGP is available on this page.' },
  { q: 'Is card data stored?', a: 'No. Card data is tokenized by Stripe and Razorpay. SpiceGarden never stores full PANs (PCI DSS).' },
  { q: 'What encryption is used?', a: 'AES-256 for data at rest, TLS 1.2+ in transit. Key rotation is automated.' },
  { q: 'Where are incident reports published?', a: 'Material incidents are disclosed here and via email to affected users per our Incident Response Policy.' },
];

const SecurityCenterPage: React.FC = () => {
  const [soc, setSoc] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/legal/security-center')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setSoc(d);
        setIncidents(d?.incidents || []);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={legalPageContainer}>
      <h1 style={legalTitle}>Security Center</h1>
      <p style={legalMeta}>How SpiceGarden protects your data and how to report security issues responsibly.</p>

      <Card variant="default" className={styles.card}>
        <h2 style={legalSectionHeading}>Responsible Disclosure</h2>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: 14 }}>
          We welcome responsible disclosure of security vulnerabilities. Please report to <a href="mailto:security@spicegarden.com">security@spicegarden.com</a>.
          Do not disclose publicly until a fix is released.
        </p>
        <ul className={styles.list}>
          <li><strong>Bug Bounty:</strong> Eligible submissions may receive a bounty per our Bug Bounty Program.</li>
          <li><strong>PGP Key:</strong> Available on request for encrypted reports.</li>
          <li><strong>SLA:</strong> Initial triage within 72 hours; critical issues addressed with priority.</li>
        </ul>
      </Card>

      <Card variant="default" className={styles.card}>
        <h2 style={legalSectionHeading}>Policies</h2>
        <ul className={styles.list}>
          <li>Incident Response Policy</li>
          <li>Patch Management Policy (critical patches within 7 days)</li>
          <li>Encryption & Key Rotation Policy</li>
          <li>Vulnerability Management Policy</li>
        </ul>
      </Card>

      <Card variant="default" className={styles.card}>
        <h2 style={legalSectionHeading}>Compliance Reports</h2>
        <ul className={styles.list}>
          <li>SOC 2 Type II — available under NDA</li>
          <li>PCI DSS — Attestation of Compliance available under NDA</li>
          <li>ISO 27001 — certification in progress</li>
        </ul>
      </Card>

      <Card variant="default" className={styles.card}>
        <h2 style={legalSectionHeading}>Security Changelog</h2>
        <ul className={styles.list}>
          <li>2026-06 — Enabled encrypted legal-record storage & tamper-evident audit logs.</li>
          <li>2026-05 — Automated key rotation for payment tokens.</li>
          <li>2026-04 — CSP, HSTS, and hardened CORS allow-list deployed.</li>
        </ul>
      </Card>

      <Card variant="default" className={styles.card}>
        <h2 style={legalSectionHeading}>Security FAQs</h2>
        {FAQS.map((f) => (
          <div key={f.q} className={styles.faq}>
            <strong>{f.q}</strong>
            <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: 14 }}>{f.a}</p>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default SecurityCenterPage;
