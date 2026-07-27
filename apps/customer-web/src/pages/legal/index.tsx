import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { legalApi, LegalDocument } from '@spicegarden/shared/api';
import { legalPageContainer, legalTitle, legalMeta, legalSectionHeading } from '../../lib/legalStyles';
import styles from './legal-center.module.css';

const CATEGORY_LABELS: Record<string, string> = {
  policies: 'Policies',
  agreements: 'Agreements',
  security: 'Security & Transparency',
  transparency: 'Transparency',
};

const LegalCenterPage: React.FC = () => {
  const router = useRouter();
  const language = (router.query.language as string) || 'en';
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await legalApi.center(language);
      setDocuments(res.data.documents || []);
    } catch {
      setError('Unable to load the Legal Center. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = documents.reduce<Record<string, LegalDocument[]>>((acc, doc) => {
    const cat = doc.type.includes('agreement') ? 'agreements' :
      doc.type.includes('security') || doc.type.includes('disclosure') ? 'security' :
      'policies';
    (acc[cat] = acc[cat] || []).push(doc);
    return acc;
  }, {});

  return (
    <div style={legalPageContainer}>
      <h1 style={legalTitle}>Legal Center</h1>
      <p style={legalMeta}>
        SpiceGarden&apos;s policies, agreements, and transparency documents. All documents are versioned, effective-dated, and auditable.
      </p>

      {loading && <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>Loading…</p>}
      {error && <p style={{ color: DESIGN_TOKENS.colors.danger }}>{error}</p>}

      {!loading && !error && Object.entries(grouped).map(([category, docs]) => (
        <section key={category} className={styles.section}>
          <h2 style={legalSectionHeading}>{CATEGORY_LABELS[category] || category}</h2>
          <div className={styles.grid}>
            {docs.map((doc) => (
              <Link key={doc.type} href={`/legal/document/${doc.type}?language=${language}`} legacyBehavior passHref>
                <a className={styles.cardLink} href={`/legal/document/${doc.type}?language=${language}`}>
                  <Card variant="default" className={styles.card}>
                    <h3 className={styles.cardTitle}>{doc.title}</h3>
                    <p className={styles.cardMeta}>Version {doc.currentVersion} · Updated {new Date(doc.lastUpdated).toLocaleDateString()}</p>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default LegalCenterPage;
