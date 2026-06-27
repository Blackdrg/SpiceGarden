import { useState } from 'react';
import { Button } from '@spicegarden/ui';
import Head from 'next/head';
import styles from './pricing.module.css';

export default function OnboardingPricing() {
  const [form, setForm] = useState({
    deliveryFee: 40,
    packagingFee: 10,
    minimumOrder: 199,
    commissionRate: 12,
  });
  const [loading, setLoading] = useState(false);
  const RESTAURANT_ID = 'demo-restaurant';

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurant-onboarding/pricing/${RESTAURANT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      window.location.href = '/onboarding/payout';
    } catch (e) {
      alert('Failed to save pricing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head><title>Pricing Setup - Onboarding</title></Head>
      <div className={styles.maxWidth}>
        <h1 className={styles.heading}>Pricing Setup</h1>
        <p className={styles.subtitle}>Configure your delivery fees and commission structure.</p>

        <div className={styles.formGroup}>
          {[
            { key: 'deliveryFee', label: 'Delivery Fee (₹)', placeholder: '40' },
            { key: 'packagingFee', label: 'Packaging Fee (₹)', placeholder: '10' },
            { key: 'minimumOrder', label: 'Minimum Order (₹)', placeholder: '199' },
            { key: 'commissionRate', label: 'Commission Rate (%)', placeholder: '12' },
          ].map((field) => (
            <div key={field.key}>
              <label htmlFor={field.key} className={styles.label}>{field.label}</label>
              <input
                id={field.key}
                aria-label={field.label}
                type="number"
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.key]: parseFloat(e.target.value) || 0 })}
                placeholder={field.placeholder}
                className={styles.input}
              />
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => window.location.href = '/onboarding/menu'}
            className={styles.backButton}
          >
            Back
          </button>
          <Button label={loading ? 'Saving...' : 'Continue'} onClick={submit} disabled={loading} className={styles.continueButton} />
        </div>
      </div>
    </div>
  );
}
