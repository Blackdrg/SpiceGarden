import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, DESIGN_TOKENS, ToastProvider, useToast } from '@spicegarden/ui';
import { legalApi, LegalDocument } from '@spicegarden/shared/api';
import { legalPageContainer, legalTitle, legalMeta, legalSectionHeading } from '../../../lib/legalStyles';
import styles from './document.module.css';

interface ToastWrapProps {
  doc: LegalDocument | null;
  accept: () => void;
  accepting: boolean;
  canAccept: boolean;
}

const DocumentActions: React.FC<ToastWrapProps> = ({ doc, accept, accepting, canAccept }) => {
  const { showToast } = useToast();
  const handleAccept = async () => {
    try {
      await accept();
      showToast({ message: 'You have accepted this document.', type: 'success', duration: 4000 });
    } catch {
      showToast({ message: 'Could not record acceptance.', type: 'error', duration: 4000 });
    }
  };
  if (!doc || !canAccept) return null;
  return (
    <div className={styles.acceptBar}>
      <Button label="Accept" variant="primary" isLoading={accepting} onClick={handleAccept} />
    </div>
  );
};

const DocumentPage: React.FC = () => {
  const router = useRouter();
  const { type } = router.query;
  const language = (router.query.language as string) || 'en';
  const [doc, setDoc] = useState<LegalDocument | null>(null);
  const [versions, setVersions] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [canAccept, setCanAccept] = useState(false);

  const load = useCallback(async () => {
    if (!type) return;
    setLoading(true);
    try {
      const res = await legalApi.document(type as string, language);
      setDoc(res.data);
      const v = await legalApi.versions(type as string, language).catch(() => null);
      setVersions(v?.data.versions || []);
      if (res.data?.id && res.data?.currentVersion) {
        setCanAccept(true);
      }
    } catch (e: any) {
      setError(e?.message || 'Document not found.');
    } finally {
      setLoading(false);
    }
  }, [type, language]);

  useEffect(() => {
    void load();
  }, [load]);

  const accept = async () => {
    if (!doc) return;
    setAccepting(true);
    try {
      await legalApi.accept(doc.id, doc.currentVersionId || doc.currentVersion.toString());
      setCanAccept(false);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div style={legalPageContainer}>
      {loading && <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>Loading…</p>}
      {error && <p style={{ color: DESIGN_TOKENS.colors.danger }}>{error}</p>}

      {doc && (
        <>
          <h1 style={legalTitle}>{doc.title}</h1>
          <p style={legalMeta}>
            <strong>Version:</strong> {doc.version} · <strong>Effective:</strong> {doc.effectiveDate ? new Date(doc.effectiveDate).toLocaleDateString() : '—'} · <strong>Last Updated:</strong> {new Date(doc.lastUpdated).toLocaleDateString()} · <strong>Language:</strong> {doc.language?.toUpperCase()}
          </p>

          {doc.summary && <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>{doc.summary}</p>}

          {doc.sections?.map((section) => (
            <section key={section.id}>
              <h2 style={legalSectionHeading}>{section.title}</h2>
              <div style={{ color: DESIGN_TOKENS.colors.textSecondary, whiteSpace: 'pre-wrap' }}>{section.content}</div>
            </section>
          ))}

          {versions.length > 0 && (
            <section className={styles.history}>
              <h2 style={legalSectionHeading}>Version History</h2>
              <ul>
                {versions.map((v: any) => (
                  <li key={v.id}>
                    v{v.version} — {v.approvalStatus} {v.effectiveDate ? `(${new Date(v.effectiveDate).toLocaleDateString()})` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <DocumentActions doc={doc} accept={accept} accepting={accepting} canAccept={canAccept} />
        </>
      )}
    </div>
  );
};

export default function DocumentPageWithToast() {
  return (
    <ToastProvider>
      <DocumentPage />
    </ToastProvider>
  );
}
