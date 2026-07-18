import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DESIGN_TOKENS } from '@spicegarden/ui';

const API = (path: string) => `/api/business/${path}`;

const DocumentPage: React.FC = () => {
  const router = useRouter();
  const { type } = router.query;
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!type) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(API(`legal/documents/${type}`));
      if (!res.ok) throw new Error('Document not found');
      setDoc(await res.json());
    } catch (e: any) {
      setError(e?.message || 'Document not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: DESIGN_TOKENS.colors.background, color: DESIGN_TOKENS.colors.textPrimary, padding: 24, fontFamily: DESIGN_TOKENS.typography.fontFamily, maxWidth: 900, margin: '0 auto' }}>
      {loading && <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>Loading…</p>}
      {error && <p style={{ color: '#EF4444' }}>{error}</p>}
      {doc && (
        <>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{doc.title}</h1>
          <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: 14 }}>
            Version {doc.version} · Effective {doc.effectiveDate ? new Date(doc.effectiveDate).toLocaleDateString() : '—'}
          </p>
          {doc.sections?.map((s: any) => (
            <section key={s.id} style={{ marginTop: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600 }}>{s.title}</h2>
              <div style={{ color: DESIGN_TOKENS.colors.textSecondary, whiteSpace: 'pre-wrap' }}>{s.content}</div>
            </section>
          ))}
        </>
      )}
    </div>
  );
};

export default DocumentPage;
