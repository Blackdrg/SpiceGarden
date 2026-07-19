import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { DESIGN_TOKENS } from '@spicegarden/ui';

const API = (path: string) => `/api/business/${path}`;

const fetchDocument = async (type: string) => {
  const res = await fetch(API(`legal/documents/${type}`));
  if (!res.ok) throw new Error('Document not found');
  return res.json();
};

const formatEffectiveDate = (value?: string) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

const DocumentPage: React.FC = () => {
  const router = useRouter();
  const { type } = router.query;
  const docType = typeof type === 'string' ? type : '';

  const { data: doc, isLoading, isError, error } = useQuery({
    queryKey: ['business-legal-document', docType],
    queryFn: () => fetchDocument(docType),
    enabled: Boolean(docType),
    retry: 1,
  });

  return (
    <div style={{ minHeight: '100vh', background: DESIGN_TOKENS.colors.background, color: DESIGN_TOKENS.colors.textPrimary, padding: 24, fontFamily: DESIGN_TOKENS.typography.fontFamily, maxWidth: 900, margin: '0 auto' }}>
      {isLoading && <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>Loading…</p>}
      {isError && <p style={{ color: '#EF4444' }}>{(error as Error)?.message || 'Document not found'}</p>}
      {doc && (
        <>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{doc.title}</h1>
          <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: 14 }}>
            Version {doc.version} · Effective {formatEffectiveDate(doc.effectiveDate)}
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
