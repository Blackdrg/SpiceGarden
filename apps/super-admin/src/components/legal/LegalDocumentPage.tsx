import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export type LegalSection = { id: string; title: string; content: string; order: number };

export type LegalDocument = {
  type: string;
  title: string;
  version: number;
  effectiveDate: string;
  lastUpdated: string;
  language: string;
  sections: LegalSection[];
  summary?: string;
};

const API = (type: string) => `/api/compliance/legal/documents/${type}`;

function formatDate(value?: string) {
  return value
    ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';
}

export const LegalDocumentPage: React.FC<{ docType: string; heading: string }> = ({ docType, heading }) => {
  const [doc, setLegalDoc] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API(docType));
      if (!res.ok) throw new Error(res.status === 404 ? 'Document not found' : `Failed to load document (${res.status})`);
      const data = (await res.json()) as LegalDocument;
      setLegalDoc(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load document');
    } finally {
      setLoading(false);
    }
  }, [docType]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <Shell heading={heading}>
        <p style={{ color: '#94a3b8' }} role="status" aria-live="polite">Loading {heading.toLowerCase()}…</p>
      </Shell>
    );
  }

  if (error || !doc) {
    return (
      <Shell heading={heading}>
        <div
          role="alert"
          style={{ background: '#0f172a', border: '1px solid #7f1d1d', borderRadius: 10, padding: 20, color: '#fca5a5' }}
        >
          <p style={{ margin: '0 0 12px' }}>{error || 'Unable to load this document.'}</p>
          <button
            type="button"
            onClick={() => void load()}
            style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </Shell>
    );
  }

  const sections = Array.isArray(doc.sections)
    ? [...doc.sections].sort((a, b) => a.order - b.order)
    : [];

  return (
    <Shell heading={heading}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, color: '#94a3b8', fontSize: 13, marginBottom: 24 }}>
        <span><strong style={{ color: '#cbd5e1' }}>Version:</strong> {doc.version}</span>
        <span><strong style={{ color: '#cbd5e1' }}>Effective:</strong> {formatDate(doc.effectiveDate)}</span>
        <span><strong style={{ color: '#cbd5e1' }}>Last updated:</strong> {formatDate(doc.lastUpdated)}</span>
        {doc.language && <span><strong style={{ color: '#cbd5e1' }}>Language:</strong> {doc.language.toUpperCase()}</span>}
      </div>

      {doc.summary && (
        <p style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.6, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 16 }}>
          {doc.summary}
        </p>
      )}

      <article style={{ marginTop: 24 }}>
        {sections.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No content available for this document.</p>
        ) : (
          sections.map((s) => (
            <section key={s.id} style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#f8fafc', margin: '0 0 8px', borderLeft: '3px solid #334155', paddingLeft: 12 }}>
                {s.title}
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{s.content}</p>
            </section>
          ))
        )}
      </article>
    </Shell>
  );
};

const Shell: React.FC<{ heading: string; children: React.ReactNode }> = ({ heading, children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#020617', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
    <main style={{ flex: 1, maxWidth: 880, margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      <Link href="/security" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13, textDecoration: 'none', marginBottom: 16 }}>
        ← Back to Security Center
      </Link>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>{heading}</h1>
      {children}
    </main>
  </div>
);
