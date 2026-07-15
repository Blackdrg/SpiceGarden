import { useState } from 'react';
import { Button, useToast } from '@spicegarden/ui';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Head from 'next/head';
import styles from './business.module.css';

export default function OnboardingBusiness() {
  const toast = useToast();
  const [form, setForm] = useState({
    legalName: '',
    tradeName: '',
    gstin: '',
    businessType: 'sole_proprietorship',
    registrationDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const user = useSelector((state: RootState) => state.auth.user);
  const restaurantId = user?.id ?? null;

  const submit = async () => {
    if (!restaurantId) {
      setError('Restaurant ID not found. Please log in again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/restaurant-onboarding/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          step: 'BUSINESS_REGISTRATION',
          data: form,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.showToast({ message: 'Business info submitted', type: 'success', duration: 0 });
    } catch (e) {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head><title>Business Registration - Onboarding</title></Head>
      <div className={styles.maxWidth}>
        <h1 className={styles.heading}>Business Registration</h1>
        <p className={styles.subtitle}>Enter your business details to get started.</p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.formGroup}>
          <div>
            <label htmlFor="biz-legal-name" className={styles.label}>Legal Business Name</label>
            <input
              id="biz-legal-name"
              aria-label="Legal Business Name"
              value={form.legalName}
              onChange={(e) => setForm({ ...form, legalName: e.target.value })}
              placeholder="ABC Foods Pvt Ltd"
              className={styles.input}
            />
          </div>
          <div>
            <label htmlFor="biz-trade-name" className={styles.label}>Trade Name</label>
            <input
              id="biz-trade-name"
              aria-label="Trade Name"
              value={form.tradeName}
              onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
              placeholder="Spice Garden"
              className={styles.input}
            />
          </div>
          <div>
            <label htmlFor="biz-gstin" className={styles.label}>GSTIN</label>
            <input
              id="biz-gstin"
              aria-label="GSTIN"
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              placeholder="27AADCB2230M1ZT"
              className={styles.input}
            />
          </div>
          <div>
            <label htmlFor="biz-business-type" className={styles.label}>Business Type</label>
            <select
              id="biz-business-type"
              aria-label="Business Type"
              value={form.businessType}
              onChange={(e) => setForm({ ...form, businessType: e.target.value })}
              className={styles.input}
            >
              <option value="sole_proprietorship">Sole Proprietorship</option>
              <option value="partnership">Partnership</option>
              <option value="llp">LLP</option>
              <option value="private_limited">Private Limited</option>
            </select>
          </div>
          <div>
            <label htmlFor="biz-reg-date" className={styles.label}>Registration Date</label>
            <input
              id="biz-reg-date"
              aria-label="Registration Date"
              type="date"
              value={form.registrationDate}
              onChange={(e) => setForm({ ...form, registrationDate: e.target.value })}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => window.location.href = '/onboarding'}
            className={styles.backButton}
          >
            Back
          </button>
          <Button
            label={loading ? 'Submitting...' : 'Continue'}
            onClick={submit}
            disabled={loading}
            className={styles.backButton}
          />
        </div>
      </div>
    </div>
  );
}


