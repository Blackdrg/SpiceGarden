import { useState } from 'react';
import Head from 'next/head';
import { Button } from '@spicegarden/ui';
import styles from './gst.module.css';

export default function OnboardingGST() {
  const [form, setForm] = useState({
    gstin: '',
    legalName: '',
    tradeName: '',
    address: '',
    state: '',
    stateCode: '',
  });
  const [loading, setLoading] = useState(false);
  const RESTAURANT_ID = 'demo-restaurant';

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurant-onboarding/gst/${RESTAURANT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      alert('GST configuration saved');
    } catch (e) {
      alert('Failed to save GST details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head><title>GST Configuration - Onboarding</title></Head>
      <div className={styles.maxWidth}>
        <h1 className={styles.heading}>GST Configuration</h1>
        <p className={styles.subtitle}>Configure your GST details for billing and compliance.</p>

        <div className={styles.formGroup}>
          {(['gstin', 'legalName', 'tradeName', 'address', 'state'] as const).map((field) => (
            <div key={field}>
              <label className={styles.label}>{field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
              <input
                aria-label={field}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                placeholder={`Enter ${field}`}
                className={styles.input}
              />
            </div>
          ))}
          <div>
            <label htmlFor="gst-state-code" className={styles.label}>State Code</label>
            <input
              id="gst-state-code"
              aria-label="State Code"
              value={form.stateCode}
              onChange={(e) => setForm({ ...form, stateCode: e.target.value })}
              placeholder="27"
              maxLength={2}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => window.location.href = '/onboarding/documents'}
            className={styles.backButton}
          >
            Back
          </button>
          <Button
            label={loading ? 'Saving...' : 'Continue'}
            onClick={submit}
            disabled={loading}
            className={styles.flexGrow}
          />
        </div>
      </div>
    </div>
  );
}
