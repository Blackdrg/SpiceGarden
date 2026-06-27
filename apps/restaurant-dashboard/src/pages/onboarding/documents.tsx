import { useState } from 'react';
import { Button } from '@spicegarden/ui';
import Head from 'next/head';
import styles from './documents.module.css';

const DOCUMENTS = [
  { key: 'fssai', label: 'FSSAI License', required: true },
  { key: 'gstCertificate', label: 'GST Certificate', required: true },
  { key: 'businessLicense', label: 'Business License', required: true },
  { key: 'bankStatement', label: 'Bank Statement', required: false },
  { key: 'cancelledCheque', label: 'Cancelled Cheque', required: false },
] as const;

type DocKey = typeof DOCUMENTS[number]['key'];

export default function OnboardingDocuments() {
  const [docs, setDocs] = useState<Record<DocKey, { uploaded: boolean; verified: boolean; file?: File }>>({
    fssai: { uploaded: false, verified: false },
    gstCertificate: { uploaded: false, verified: false },
    businessLicense: { uploaded: false, verified: false },
    bankStatement: { uploaded: false, verified: false },
    cancelledCheque: { uploaded: false, verified: false },
  });
  const [loading, setLoading] = useState(false);

  const handleUpload = (key: DocKey, file: File | null) => {
    if (!file) return;
    setDocs({ ...docs, [key]: { uploaded: true, verified: false, file } });
  };

  const submit = async () => {
    setLoading(true);
    const payload = {
      step: 'DOCUMENT_UPLOAD',
      data: Object.fromEntries(DOCUMENTS.map(d => [d.key, docs[d.key].uploaded])),
    };
    try {
      const res = await fetch('/api/restaurant-onboarding/step/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) alert('Documents saved');
    } catch (e) {
      alert('Failed to save documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head><title>Documents - Onboarding</title></Head>
      <div className={styles.maxWidth}>
        <h1 className={styles.heading}>Upload Documents</h1>
        <p className={styles.subtitle}>Upload your business documents for verification.</p>

        <div className={styles.formGroup}>
          {DOCUMENTS.map((doc) => (
            <div key={doc.key} className={styles.docCard}>
              <div className={styles.docCardHeader}>
                <div>
                  <span className={styles.docLabel}>{doc.label}</span>
                  {doc.required && <span className={styles.requiredMark}>*</span>}
                </div>
                <span className={
                  docs[doc.key].verified ? styles.statusVerified : docs[doc.key].uploaded ? styles.statusUploaded : styles.statusPending
                }>
                  {docs[doc.key].verified ? '✓ Verified' : docs[doc.key].uploaded ? '⏳ Uploaded' : 'Pending'}
                </span>
              </div>
              <input
                type="file"
                id={`doc-${doc.key}`}
                aria-label={`Upload ${doc.label}`}
                onChange={(e) => handleUpload(doc.key, e.target.files?.[0] || null)}
                className={styles.fileInput}
              />
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => window.location.href = '/onboarding/business'}
            className={styles.backButton}
          >
            Back
          </button>
          <Button
            label={loading ? 'Saving...' : 'Continue'}
            onClick={submit}
            disabled={loading}
            className={styles.continueButton}
          />
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  primary: {
    padding: '10px 20px',
    background: '#f97316',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
  secondary: {
    padding: '10px 20px',
    background: 'transparent',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
};
