import { useState } from 'react';
import Head from 'next/head';
import { Button, useToast } from '@spicegarden/ui';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import styles from './gst.module.css';

export default function OnboardingGST() {
  const toast = useToast();
  const [form, setForm] = useState({
    gstin: '',
    legalName: '',
    tradeName: '',
    address: '',
    state: '',
    stateCode: '',
  });
  const [loading, setLoading] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const restaurantId = user?.id ?? null;

  const submit = async () => {
    if (!restaurantId) {
      toast.showToast({ message: 'Restaurant ID not found. Please log in again.', type: 'error', duration: 0 });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurant-onboarding/gst/${restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      toast.showToast({ message: 'GST configuration saved', type: 'success', duration: 0 });
    } catch (e) {
      toast.showToast({ message: 'Failed to save GST details', type: 'error', duration: 0 });
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
